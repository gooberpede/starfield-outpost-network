import assert from 'node:assert/strict'
import test from 'node:test'
import { createDefaultNetwork, createDefaultOutpost } from '../src/domain/defaults.ts'
import type { CargoLinkEndpoint, OutpostNetwork } from '../src/domain/models.ts'
import { analyzeCargoConnections, classifyCargoDestination, connectCargoPads, createRemoteCargoPadAndConnect, selectCargoDestination, removeCargoPairing } from '../src/domain/cargoConnections.ts'
import { cargoPadLinkedMultipleTimesRule } from '../src/domain/validation/rules/cargoPadLinkedMultipleTimes.ts'
import { incompleteCargoDestinationRule } from '../src/domain/validation/rules/incompleteCargoDestination.ts'
import { missingCargoLinkEndpointRule } from '../src/domain/validation/rules/missingCargoLinkEndpoint.ts'
import { getActuallyAvailableItemsAtOutpost, retireFulfilledPlannedSupply } from '../src/domain/availability.ts'
import { getImportSummariesAtOutpost, getRoutedExportedItemKeysAtOutpost } from '../src/domain/logistics.ts'
import { getItemProvenanceAtOutpost } from '../src/domain/provenance.ts'
import { deserializeNetworkCollection } from '../src/data/serialization.ts'
import { validateStoredSource } from '../src/data/storageCoherence.ts'
import { createCollectionEditingSession, collectionEditingSessionReducer } from '../src/domain/collectionEditingSession.ts'
import { formatCargoDestination } from '../src/localization/cargoDestination.ts'
import { supportedLocaleIds } from '../src/localization/types.ts'
import { encodeCargoOption, decodeCargoOption } from '../src/ui/cargoDestinationOptions.ts'

const e = (outpostId: string): CargoLinkEndpoint => ({ outpostId, cargoPadId: 'pad' })
function fixture(): OutpostNetwork {
  return { ...createDefaultNetwork(), outposts: ['A','B','C','D'].map((id) => ({
    ...createDefaultOutpost([], id, id), cargoPads: [{ id: 'pad', label: 'Pad 1', type: 'regular', outboundItems: [{ type: 'resource', id: 'iron' }] }],
  })) }
}
const collection = (network: OutpostNetwork) => ({ schemaVersion: 1, networks: [{ id: 'n', network }], activeNetworkId: 'n' })

test('unfinished selection and fresh remote Add are separate reversible edits', () => {
  const base = fixture(); base.outposts[1].cargoPads = []
  const choice = selectCargoDestination(base,e('A'),'B')
  assert.equal(choice.cargoLinks.length,0)
  assert.equal(incompleteCargoDestinationRule.validate(choice).length,1)
  const added = createRemoteCargoPadAndConnect(choice,e('A'),'B','new','AB')
  assert.equal(added.outposts[1].cargoPads.length,1)
  assert.deepEqual(added.outposts[1].cargoPads[0].outboundItems,[])
  assert.equal(added.outposts[0].cargoPads[0].destinationIntent,undefined)
  assert.equal(classifyCargoDestination(added,e('A')).kind,'connected')
  assert.equal(createRemoteCargoPadAndConnect(added,e('A'),'B','new','AB'),added)
  const again = createRemoteCargoPadAndConnect(added,e('A'),'B','newer','AB2')
  assert.equal(again.outposts[1].cargoPads.length,2)
  assert.equal(classifyCargoDestination(again,{outpostId:'B',cargoPadId:'new'}).kind,'unlinked')
  let session = createCollectionEditingSession(collection(base))
  for (const next of [choice,added]) session = collectionEditingSessionReducer(session,{type:'apply-active-network',timestamp:1,label:{key:'history.cargoRemoteAdd'},update:()=>next})
  assert.equal(session.history.past.length,2)
  session = collectionEditingSessionReducer(session,{type:'undo'})
  assert.equal(session.collection.networks[0].network,choice)
  session = collectionEditingSessionReducer(session,{type:'redo'})
  assert.equal(session.collection.networks[0].network,added)
})

test('occupied replacement and unlink leave former partners clean with configuration intact', () => {
  let n=connectCargoPads(fixture(),e('A'),e('B'),'AB')
  n=connectCargoPads(n,e('C'),e('D'),'CD')
  const before=n
  n=connectCargoPads(n,e('A'),e('C'),'AC')
  assert.equal(n.cargoLinks.length,1)
  for(const id of ['B','D']) {
    assert.equal(classifyCargoDestination(n,e(id)).kind,'unlinked')
    assert.deepEqual(n.outposts.find(o=>o.id===id)?.cargoPads,before.outposts.find(o=>o.id===id)?.cargoPads)
  }
  assert.equal(selectCargoDestination(n,e('A'),'C'),n)
  assert.equal(connectCargoPads(n,e('A'),e('C'),'unused'),n)
  n=selectCargoDestination(n,e('A'),'')
  assert.equal(n.cargoLinks.length,0)
  assert.equal(incompleteCargoDestinationRule.validate(n).length,0)
})

test('AB plus AC reports exactly three participants; explicit repair enables remaining supply atomically',()=>{
 const n=fixture(); n.cargoLinks=[{id:'AB',endpointA:e('A'),endpointB:e('B')},{id:'AC',endpointA:e('A'),endpointB:e('C')}]
 n.outposts[2].plannedSupply=[{type:'resource',id:'iron'}]
 const issues=cargoPadLinkedMultipleTimesRule.validate(n)
 assert.deepEqual(issues.map(i=>i.outpostId),['A','B','C'])
 assert.deepEqual(issues,cargoPadLinkedMultipleTimesRule.validate({...n,cargoLinks:[...n.cargoLinks].reverse()}))
 for(const id of ['A','B','C']) {
   assert.equal(classifyCargoDestination(n,e(id)).kind,'conflict')
   assert.equal(getActuallyAvailableItemsAtOutpost(id,n).length,0)
   assert.equal(getImportSummariesAtOutpost(id,n).length,0)
   assert.equal(getRoutedExportedItemKeysAtOutpost(id,n).size,0)
   assert.deepEqual(getItemProvenanceAtOutpost(id,{type:'resource',id:'iron'},n).remoteOutpostIds,[])
   assert.equal(selectCargoDestination(n,e(id),''),n)
   assert.equal(connectCargoPads(n,e(id),e('D'),'new'),n)
 }
 for(const owner of ['A','B']) {
   const repaired=retireFulfilledPlannedSupply(removeCargoPairing(n,e(owner),n.cargoLinks[0]))
   assert.deepEqual(repaired.cargoLinks,[n.cargoLinks[1]])
   assert.equal(cargoPadLinkedMultipleTimesRule.validate(repaired).length,0)
   assert.equal(repaired.outposts[2].plannedSupply.length,0)
   assert.equal(classifyCargoDestination(repaired,e('B')).kind,'unlinked')
   assert.equal(selectCargoDestination(repaired,e('A'),'').outposts[2].plannedSupply.length,0)
 }
 assert.equal(removeCargoPairing(n,e('D'),n.cargoLinks[0]),n)
})

test('missing endpoints in either direction, self claims and broken competitors never route',()=>{
 for(const missing of [e('A'),e('B')]) {
   const n=connectCargoPads(fixture(),e('A'),e('B'),'AB')
   n.outposts.find(o=>o.id===missing.outpostId)!.cargoPads=[]
   assert.equal(analyzeCargoConnections(n).eligible.length,0)
   for(const id of ['A','B'])assert.equal(getActuallyAvailableItemsAtOutpost(id,n).length,0)
   const issues=missingCargoLinkEndpointRule.validate(n)
   assert.equal(issues.length,1)
   assert.notEqual(issues[0].outpostId,missing.outpostId)
   assert.deepEqual(issues[0].cargoTarget,missing)
 }
 const n=fixture();n.cargoLinks=[{id:'self',endpointA:e('A'),endpointB:e('A')}]
 assert.equal(cargoPadLinkedMultipleTimesRule.validate(n).length,0)
 assert.equal(analyzeCargoConnections(n).eligible.length,0)
 n.cargoLinks.push({id:'broken',endpointA:e('A'),endpointB:{outpostId:'absent',cargoPadId:''}})
 assert.equal(cargoPadLinkedMultipleTimesRule.validate(n).length,1)
 assert.equal(analyzeCargoConnections(n).eligible.length,0)
})

test('schema five round trips choices and raw conflicts; old storage version four remains readable',()=>{
 const n=selectCargoDestination(fixture(),e('A'),'B')
 n.outposts=n.outposts.filter(o=>o.id!=='B')
 assert.equal(missingCargoLinkEndpointRule.validate(n)[0].cargoTarget?.outpostId,'B')
 assert.equal(incompleteCargoDestinationRule.validate(n).length,0)
 assert.deepEqual(deserializeNetworkCollection(JSON.stringify(collection(n))),collection(n))
 const old={...fixture(),schemaVersion:4};validateStoredSource(collection(old))
 assert.equal(deserializeNetworkCollection(JSON.stringify(collection(old))).networks[0].network.schemaVersion,5)
 for(const bad of [null,[],{}, {outpostId:''},{outpostId:4},{outpostId:'B',kind:'outpost'},{outpostId:'B',cargoPadId:'pad'}]) {
   const raw=JSON.parse(JSON.stringify(collection(fixture())))
   raw.networks[0].network.outposts[0].cargoPads[0].destinationIntent=bad
   assert.throws(()=>deserializeNetworkCollection(JSON.stringify(raw)))
   assert.throws(()=>validateStoredSource(raw))
 }
 const dual=selectCargoDestination(fixture(),e('A'),'B');dual.cargoLinks=[{id:'broken',endpointA:e('A'),endpointB:{outpostId:'absent',cargoPadId:''}}]
 assert.throws(()=>deserializeNetworkCollection(JSON.stringify(collection(dual))))
 assert.throws(()=>validateStoredSource(collection(dual)))
})

test('expected network guard rejects reused identities without history',()=>{
 const c=collection(fixture());c.networks.push({id:'other',network:fixture()})
 const session=createCollectionEditingSession(c)
 const rejected=collectionEditingSessionReducer(session,{type:'apply-active-network',expectedNetworkId:'other',timestamp:1,label:{key:'history.cargoRemoteAdd'},update:()=>{throw Error('must not run')}})
 assert.equal(rejected,session)
})

test('localized counts cover zero and Polish forms; all UI IDs stay disjoint from actions',()=>{
 for(const locale of supportedLocaleIds) for(const count of [0,1,2,5,12,22]) {
   const text=formatCargoDestination(locale,'Target',count)
   assert.ok(text.includes('Target'));assert.ok(!text.includes('{'))
 }
 assert.match(formatCargoDestination('pl-PL','X',1),/połączenie towarowe/)
 assert.match(formatCargoDestination('pl-PL','X',2),/połączenia towarowe/)
 assert.match(formatCargoDestination('pl-PL','X',5),/połączeń towarowych/)
 assert.match(formatCargoDestination('pl-PL','X',22),/połączenia towarowe/)
 for(const id of ['__add__','["add"]','', 'a:b|c']) {
   assert.deepEqual(decodeCargoOption(encodeCargoOption({kind:'id',id})),{kind:'id',id})
   assert.notEqual(encodeCargoOption({kind:'id',id}),encodeCargoOption({kind:'add'}))
 }
})

import type { ReferenceData } from '../src/domain/referenceData.ts'
import { validateStorageEnvelope } from '../src/data/storageEnvelope.ts'
import { getValidationIssueIdentity } from '../src/ui/validationInteraction.ts'
const references: ReferenceData = { systems: [{ id:'one',name:'One' },{id:'two',name:'Two'}], bodies:[],bodyResources:[],resources:[],products:[],productRecipes:[],biomes:[],bodyBiomes:[],inorganicOccurrences:[],species:[],planetSpecies:[],organicOccurrences:[],organicFarmingProfiles:[] }

test('new remote type resolves known system IDs and otherwise preserves either local type',()=>{
 for(const type of ['regular','interstellar'] as const) for(const [a,b,expected] of [
   ['one','one','regular'],['one','two','interstellar'],['','','fallback'],['one','','fallback'],['unknown','unknown','fallback'],['unknown','another','fallback'],
 ]) for(const ref of [references,undefined]) {
   const n=fixture();n.outposts[0].systemId=a;n.outposts[1].systemId=b;n.outposts[0].cargoPads[0].type=type
   const chosen=selectCargoDestination(n,e('A'),'B')
   const added=createRemoteCargoPadAndConnect(chosen,e('A'),'B','new','new-link',ref)
   assert.equal(added.outposts[1].cargoPads.at(-1)?.type,!ref||expected==='fallback'?type:expected)
   assert.equal(added.outposts[0].cargoPads[0].type,type)
   assert.deepEqual(added.outposts[1].cargoPads.at(-1)?.outboundItems,[])
 }
})

test('qualified delimiter-like identities and direct overlapping conflict contexts do not alias',()=>{
 const n=fixture()
 n.outposts[0].id='a:b';n.outposts[0].cargoPads[0].id='c'
 n.outposts[1].id='a';n.outposts[1].cargoPads[0].id='b:c'
 const a={outpostId:'a:b',cargoPadId:'c'},b={outpostId:'a',cargoPadId:'b:c'}
 n.cargoLinks=[{id:'ab',endpointA:a,endpointB:b},{id:'ac',endpointA:a,endpointB:e('C')},{id:'cd',endpointA:e('C'),endpointB:e('D')}]
 const issues=cargoPadLinkedMultipleTimesRule.validate(n)
 assert.equal(issues.length,4)
 const atB=issues.find(i=>i.outpostId==='a')!
 assert.deepEqual(atB.cargoRecords?.map(r=>r.id),['ab','ac'])
 const reversed=cargoPadLinkedMultipleTimesRule.validate({...n,cargoLinks:[...n.cargoLinks].reverse()})
 assert.deepEqual(issues.map(getValidationIssueIdentity),reversed.map(getValidationIssueIdentity))
 assert.deepEqual(deserializeNetworkCollection(JSON.stringify(collection(n))).networks[0].network,n)
})

test('raw reference collisions, stale record endpoints and absent targets reject without partial mutation',()=>{
 const n=selectCargoDestination(fixture(),e('A'),'B')
 n.cargoLinks=[{id:'broken',endpointA:e('C'),endpointB:{outpostId:'B',cargoPadId:'reserved'}}]
 assert.equal(createRemoteCargoPadAndConnect(n,e('A'),'B','reserved','new'),n)
 assert.equal(createRemoteCargoPadAndConnect(n,e('A'),'missing','new','new'),n)
 assert.equal(createRemoteCargoPadAndConnect(n,e('A'),'B','new','broken'),n)
 assert.equal(removeCargoPairing(n,e('C'),{...n.cargoLinks[0],endpointB:e('D')}),n)
 assert.equal(createRemoteCargoPadAndConnect(n,{outpostId:'A',cargoPadId:'gone'},'B','new','new'),n)
})

test('intent strings obey the distinct exact and one-over external and storage bounds',()=>{
 for(const size of [4096,4097,16384,16385]){
   const n=fixture();n.outposts[0].cargoPads[0].destinationIntent={outpostId:'x'.repeat(size)}
   const c=collection(n)
   if(size<=4096)assert.doesNotThrow(()=>deserializeNetworkCollection(JSON.stringify(c)))
   else assert.throws(()=>deserializeNetworkCollection(JSON.stringify(c)))
   if(size<=16384)assert.doesNotThrow(()=>validateStorageEnvelope(c))
   else assert.throws(()=>validateStorageEnvelope(c))
 }
})

test('missing parent diagnostics suppress missing pads, and orphans retain exact record context',()=>{
 const n=fixture();n.cargoLinks=[{id:'gone',endpointA:e('A'),endpointB:{outpostId:'absent',cargoPadId:'absent-pad'}}]
 const issue=missingCargoLinkEndpointRule.validate(n)
 assert.equal(issue.length,1);assert.deepEqual(issue[0].cargoTarget,{outpostId:'absent'})
 assert.equal(issue[0].outpostId,'A')
 n.outposts=[]
 const orphan=missingCargoLinkEndpointRule.validate(n)
 assert.equal(orphan.length,2)
 assert.ok(orphan.every(i=>!i.outpostId&&i.messageKey==='validation.cargoOrphan'&&i.cargoRecords?.[0].id==='gone'))
})

test('an empty retained endpoint reference can be explicitly unlinked without losing historical identity',()=>{
 const n=fixture();n.cargoLinks=[{id:'empty-target',endpointA:e('A'),endpointB:{outpostId:'',cargoPadId:''}}]
 const next=selectCargoDestination(n,e('A'),'')
 assert.notEqual(next,n);assert.equal(next.cargoLinks.length,0)
 assert.equal(n.cargoLinks[0].endpointB.outpostId,'')
 assert.equal(classifyCargoDestination(next,e('A')).kind,'unlinked')
})

test('captured before-state rejects repeated and stale commands before reconciliation or history',()=>{
 const before=selectCargoDestination(fixture(),e('A'),'B')
 let reconciliations=0
 const command={type:'apply-active-network' as const,expectedNetworkId:'n',timestamp:1,label:{key:'history.cargoRemoteAdd' as const},update:(current:OutpostNetwork)=>{
   if(current!==before)return current
   const result=createRemoteCargoPadAndConnect(current,e('A'),'B','new','pair')
   if(result===current)return current
   reconciliations++
   return retireFulfilledPlannedSupply(result)
 }}
 const initial=createCollectionEditingSession(collection(before))
 const applied=collectionEditingSessionReducer(initial,command)
 assert.equal(collectionEditingSessionReducer(applied,command),applied)
 assert.equal(applied.history.past.length,1);assert.equal(reconciliations,1)
 const changed=collectionEditingSessionReducer(initial,{...command,update:current=>selectCargoDestination(current,e('A'),'C')})
 assert.equal(collectionEditingSessionReducer(changed,command),changed)
 assert.equal(reconciliations,1)
})
