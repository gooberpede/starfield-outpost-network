import { createHash } from 'node:crypto'
import { parse } from 'csv-parse/sync'

import { enUSMessages } from './locales/en-US.ts'
import type { MessageCatalogue, MessageKey } from './types.ts'

export type ReviewRisk = 'LOW' | 'MEDIUM' | 'HIGH'
export type ReviewComparisonStatus =
  | 'IDENTICAL'
  | 'TYPOGRAPHIC_ONLY'
  | 'SUBSTANTIVE'
  | 'MISSING'
  | 'INVALID_TOKENS'
export type ReviewDecision =
  | ''
  | 'AGREED'
  | 'CODEX'
  | 'DEEPL'
  | 'CUSTOM'
  | 'INVALID_DEEPL_REPAIRED'

export interface ReviewRow {
  Key: MessageKey
  Locale: string
  EnglishSource: string
  EnglishSourceSha256: string
  Context: string
  Risk: ReviewRisk
  Parameters: string
  ProtectedTokens: string
  OfficialTermConstraints: string
  CodexTranslation: string
  DeepLTranslation: string
  ComparisonStatus: ReviewComparisonStatus
  AdjudicationDecision: ReviewDecision
  FinalTranslation: string
  ReviewerNote: string
}

export const REVIEW_COLUMNS = [
  'Key', 'Locale', 'EnglishSource', 'EnglishSourceSha256', 'Context', 'Risk',
  'Parameters', 'ProtectedTokens', 'OfficialTermConstraints', 'CodexTranslation',
  'DeepLTranslation', 'ComparisonStatus', 'AdjudicationDecision', 'FinalTranslation', 'ReviewerNote',
] as const satisfies readonly (keyof ReviewRow)[]

const contextByNamespace: Record<string, string> = {
  locale: 'Language selector and effective-locale presentation.', common: 'Shared visible or accessible UI action.',
  about: 'About dialog content or accessible control.', character: 'Character details field or Starfield skill label.',
  network: 'Network navigation, creation, reset, or deletion UI.', outpost: 'Outpost navigation or details UI.',
  power: 'Power quality label or explanatory tooltip.', matrix: 'Resource Matrix label, action, state, or tooltip.',
  production: 'Active Production section.', plannedSupply: 'Planned Supply planning UI; virtual supply, not inventory.',
  cargo: 'Cargo Link, destination, or export UI.', validation: 'Validation severity, diagnostic, context, or remediation.',
  status: 'Status bar, import/export feedback, or reference-data feedback.', transfer: 'Whole-collection JSON import/export control.',
  history: 'Relocalizable Undo/Redo action description.', help: 'Contextual help, tooltip, or explanatory guidance.',
  search: 'Item search control, result, state flag, or accessibility instruction.',
}

const contextByKey: Partial<Record<MessageKey, string>> = {
  'matrix.heading': 'Heading for the Resource Matrix, a tabular view of resource presence, active production, recipe inputs, and routed logistics.',
  'matrix.column.present': 'Compact Resource Matrix column label meaning the item/resource exists or can exist at this outpost/location; not temporal “currently”.',
  'matrix.column.producing': 'Compact Resource Matrix state meaning this outpost is configured to extract, harvest, or manufacture the item; no throughput is implied.',
  'matrix.column.inputs': 'Compact Resource Matrix column for items required by configured recipes or organic production; not data-entry fields.',
  'matrix.column.logistics': 'Compact Resource Matrix column for items actually assigned to routed cargo exports; not merely items that could be exported.',
  'matrix.section.inorganic': 'Resource Matrix section heading for mineral/inorganic resources.',
  'matrix.section.organic': 'Resource Matrix section heading for resources obtained from flora or fauna.',
  'matrix.section.manufacturing': 'Resource Matrix section heading for configured product manufacturing; no throughput is modeled.',
  'plannedSupply.heading': 'Feature heading for virtual future supply intent. It is not current inventory, a reservation, or an actual delivery.',
  'outpost.navigation.lockOrder': 'Button that exits outpost reordering mode and prevents further reordering; “lock” is an ordering action, not security or login.',
  'outpost.navigation.reshuffleButton': 'Button that enters manual outpost reordering mode; it does not randomize the order.',
  'cargo.lockOrder': 'Button that exits cargo-link reordering mode and prevents further reordering; “lock” is an ordering action, not security or login.',
  'cargo.reshuffleButton': 'Button that enters manual cargo-link reordering mode; it does not randomize the order.',
  'validation.heading': 'Heading for domain validation results containing errors, warnings, and informational findings; not form submission validation alone.',
  'search.results.flag.present': 'Search-result state flag meaning the item/resource exists or can exist at the outpost; not temporal “currently”.',
  'search.results.flag.producing': 'Search-result state flag meaning configured active production, without a throughput claim.',
  'search.results.flag.missingInputs': 'Search-result state flag meaning required recipe or organic-production inputs are unavailable.',
  'shortcuts.action.focusFirstInorganic': 'Keyboard-shortcut action label that focuses the first inorganic-resource control.',
  'shortcuts.action.focusFirstOrganic': 'Keyboard-shortcut action label that focuses the first organic-resource control.',
  'shortcuts.action.focusManufacturingAction': 'Keyboard-shortcut action label that focuses the manufacturing action control.',
}

type ConstraintMatcher = (key: MessageKey, source: string) => boolean
type Constraint = { id: string; matches: ConstraintMatcher }
type ConstraintStrategy = 'phrase' | 'key-scoped' | 'semantic-concept'
type ConstraintValue = string | {
  value: string
  strategy: ConstraintStrategy
  variants?: readonly string[]
}

const constraintValuesByLocale: Readonly<Record<string, Readonly<Record<string, ConstraintValue>>>> = {
  // Polish is registered for staged review plumbing, but values remain intentionally absent
  // until the terminology/glossary batch supplies reviewed contextual constraints.
  'pl-PL': {},
  'fr-FR': {
    'term.inter-system-cargo-link': 'Liaison intersystème', 'term.cargo-link': 'Liaison',
    'term.outpost': 'Avant-poste', 'term.biome': 'Biome', 'term.planet': 'Planète',
    'term.planetary-body': 'Corps céleste', 'term.star-system': 'Système stellaire',
    'skill.outpost-management': "Gestion d'avant-poste", 'skill.outpost-engineering': 'Ingénierie avant-poste',
    'skill.planetary-habitation': 'Habitat planétaire', 'skill.research-methods': 'Méthodologie',
    'skill.special-projects': 'Projets spéciaux', 'term.x-tech-power-core': "Noyau d'énergie X-Tech",
    'term.x-tech': 'X-Tech', 'product.starfield': 'Starfield',
    'glossary.planned-supply': 'Approvisionnement planifié', 'glossary.present': 'Présence',
    'glossary.producing': 'En production', 'glossary.inputs': 'Intrants',
    'glossary.logistics': 'Logistique', 'glossary.manufacturing': 'Fabrication',
    'glossary.validation': 'Validation', 'glossary.resource-matrix': 'Matrice des ressources',
    'glossary.reshuffle': 'Réorganiser', 'glossary.lock-order': "Verrouiller l'ordre",
    'glossary.inorganic': 'Inorganique', 'glossary.organic': 'Organique', 'glossary.network': 'Réseau',
    'glossary.active-production': 'Production active', 'glossary.source': 'Source',
    'glossary.destination': 'Destination', 'glossary.file-import-export': 'Importer / Exporter',
    'glossary.undo-redo': 'Annuler / Rétablir', 'glossary.validation-error': 'Erreur',
    'glossary.validation-warning': 'Avertissement', 'glossary.validation-info': 'Information',
  },
  'de-DE': {
    'term.inter-system-cargo-link': 'Intersystem-Frachtlink', 'term.cargo-link': 'Frachtlink',
    'term.outpost': 'Außenposten', 'term.biome': 'Biom', 'term.planet': 'Planet',
    'term.planetary-body': 'Himmelskörper', 'term.star-system': 'Sternsystem',
    'skill.outpost-management': 'Außenposten-Verwaltung', 'skill.outpost-engineering': 'Außenposten-Technik',
    'skill.planetary-habitation': 'Planetenbesiedlung', 'skill.research-methods': 'Forschungsmethoden',
    'skill.special-projects': 'Spezialprojekte', 'term.x-tech-power-core': 'X-Tech-Energiekern',
    'term.x-tech': 'X-Tech', 'product.starfield': 'Starfield',
    'glossary.planned-supply': 'Geplante Versorgung', 'glossary.present': 'Vorhanden',
    'glossary.producing': 'In Produktion', 'glossary.inputs': 'Einsatzstoffe',
    'glossary.logistics': 'Logistik', 'glossary.manufacturing': 'Fertigung',
    'glossary.validation': 'Validierung', 'glossary.resource-matrix': 'Ressourcenmatrix',
    'glossary.reshuffle': 'Neu anordnen', 'glossary.lock-order': 'Reihenfolge sperren',
    'glossary.inorganic': 'Anorganisch', 'glossary.organic': 'Organisch', 'glossary.network': 'Netzwerk',
    'glossary.active-production': 'Aktive Produktion', 'glossary.source': 'Quelle',
    'glossary.destination': 'Ziel', 'glossary.file-import-export': 'Importieren / Exportieren',
    'glossary.undo-redo': 'Rückgängig / Wiederholen', 'glossary.validation-error': 'Fehler',
    'glossary.validation-warning': 'Warnung', 'glossary.validation-info': 'Information',
  },
  'es-ES': {
    'term.inter-system-cargo-link': { value: 'Enlace de cargamento intersistema', strategy: 'phrase' },
    'term.cargo-link': { value: 'Enlace de cargamento', strategy: 'phrase' },
    'term.outpost': { value: 'Puesto', strategy: 'semantic-concept', variants: ['puesto', 'puestos'] },
    'term.biome': { value: 'Bioma', strategy: 'semantic-concept', variants: ['bioma', 'biomas'] },
    'term.planet': { value: 'Planeta', strategy: 'semantic-concept', variants: ['planeta', 'planetas'] },
    'term.planetary-body': { value: 'Cuerpo celeste', strategy: 'semantic-concept', variants: ['cuerpo celeste', 'cuerpos celestes'] },
    'term.star-system': { value: 'Sistema estelar', strategy: 'semantic-concept', variants: ['sistema estelar', 'sistemas estelares'] },
    'skill.outpost-management': { value: 'Gestión de puestos', strategy: 'phrase' },
    'skill.outpost-engineering': { value: 'Ingeniería de puestos', strategy: 'phrase' },
    'skill.planetary-habitation': { value: 'Asentamiento planetario', strategy: 'phrase' },
    'skill.research-methods': { value: 'Mét. de investigación', strategy: 'phrase' },
    'skill.special-projects': { value: 'Proyectos especiales', strategy: 'phrase' },
    'term.x-tech-power-core': { value: 'Núcleo de energía de X-Tech', strategy: 'semantic-concept', variants: ['núcleo de energía de X-Tech', 'núcleo de X-Tech'] },
    'term.x-tech': { value: 'X-Tech', strategy: 'phrase' }, 'product.starfield': { value: 'Starfield', strategy: 'phrase' },
    'glossary.planned-supply': { value: 'Suministro planificado', strategy: 'semantic-concept' },
    'glossary.present': { value: 'Presencia', strategy: 'key-scoped', variants: ['presencia', 'disponible', 'presente'] },
    'glossary.producing': { value: 'En producción', strategy: 'key-scoped', variants: ['en producción', 'producir', 'dejar de producir'] },
    'glossary.inputs': { value: 'Materiales de entrada', strategy: 'semantic-concept', variants: ['materiales de entrada', 'materiales necesarios', 'recursos necesarios'] },
    'glossary.logistics': { value: 'Logística', strategy: 'key-scoped' }, 'glossary.manufacturing': { value: 'Fabricación', strategy: 'semantic-concept' },
    'glossary.validation': { value: 'Validación', strategy: 'semantic-concept' }, 'glossary.resource-matrix': { value: 'Matriz de recursos', strategy: 'phrase' },
    'glossary.reshuffle': { value: 'Reordenar', strategy: 'key-scoped', variants: ['reordenar', 'terminar de reordenar'] },
    'glossary.lock-order': { value: 'Bloquear el orden', strategy: 'key-scoped' },
    'glossary.inorganic': { value: 'Inorgánico', strategy: 'semantic-concept', variants: ['inorgánico', 'inorgánica', 'inorgánicos', 'inorgánicas'] },
    'glossary.organic': { value: 'Orgánico', strategy: 'semantic-concept', variants: ['orgánico', 'orgánica', 'orgánicos', 'orgánicas'] },
    'glossary.network': { value: 'Red', strategy: 'semantic-concept' }, 'glossary.active-production': { value: 'Producción activa', strategy: 'semantic-concept' },
    'glossary.source': { value: 'Origen', strategy: 'semantic-concept' }, 'glossary.destination': { value: 'Destino', strategy: 'semantic-concept' },
    'glossary.file-import-export': { value: 'Importar / Exportar', strategy: 'key-scoped' }, 'glossary.undo-redo': { value: 'Deshacer / Rehacer', strategy: 'key-scoped' },
    'glossary.validation-error': { value: 'Error', strategy: 'semantic-concept' }, 'glossary.validation-warning': { value: 'Advertencia', strategy: 'semantic-concept' },
    'glossary.validation-info': { value: 'Información', strategy: 'semantic-concept' },
  },
  'it-IT': {
    'term.inter-system-cargo-link': { value: 'Collegamento merci intersistema', strategy: 'phrase' }, 'term.cargo-link': { value: 'Collegamento merci', strategy: 'phrase' },
    'term.outpost': { value: 'Avamposto', strategy: 'semantic-concept', variants: ['avamposto', 'avamposti'] }, 'term.biome': { value: 'Bioma', strategy: 'semantic-concept', variants: ['bioma', 'biomi'] },
    'term.planet': { value: 'Pianeta', strategy: 'semantic-concept', variants: ['pianeta', 'pianeti'] }, 'term.planetary-body': { value: 'Corpo celeste', strategy: 'semantic-concept', variants: ['corpo celeste', 'corpi celesti'] },
    'term.star-system': { value: 'Sistema stellare', strategy: 'semantic-concept', variants: ['sistema stellare', 'sistemi stellari'] },
    'skill.outpost-management': { value: 'Gestione avamposto', strategy: 'phrase' }, 'skill.outpost-engineering': { value: 'Ingegneria avamposti', strategy: 'phrase' },
    'skill.planetary-habitation': { value: 'Insediamento planetario', strategy: 'phrase' }, 'skill.research-methods': { value: 'Metodi di ricerca', strategy: 'phrase' },
    'skill.special-projects': { value: 'Progetti speciali', strategy: 'phrase' }, 'term.x-tech-power-core': { value: 'Nucleo energetico di X-Tech', strategy: 'semantic-concept', variants: ['nucleo energetico di X-Tech', 'nucleo energetico X-Tech'] },
    'term.x-tech': { value: 'X-Tech', strategy: 'phrase' }, 'product.starfield': { value: 'Starfield', strategy: 'phrase' },
    'glossary.planned-supply': { value: 'Fornitura pianificata', strategy: 'semantic-concept' }, 'glossary.present': { value: 'Presenza', strategy: 'key-scoped', variants: ['presenza', 'presente', 'disponibile'] },
    'glossary.producing': { value: 'In produzione', strategy: 'key-scoped', variants: ['in produzione', 'produrre', 'interrompere la produzione'] },
    'glossary.inputs': { value: 'Materiali richiesti', strategy: 'semantic-concept', variants: ['materiali richiesti', 'risorse richieste', 'materiali necessari'] },
    'glossary.logistics': { value: 'Logistica', strategy: 'key-scoped' }, 'glossary.manufacturing': { value: 'Fabbricazione', strategy: 'semantic-concept' },
    'glossary.validation': { value: 'Convalida', strategy: 'semantic-concept' }, 'glossary.resource-matrix': { value: 'Matrice delle risorse', strategy: 'phrase' },
    'glossary.reshuffle': { value: 'Riordina', strategy: 'key-scoped', variants: ['riordina', 'termina riordino'] }, 'glossary.lock-order': { value: "Blocca l'ordine", strategy: 'key-scoped' },
    'glossary.inorganic': { value: 'Inorganico', strategy: 'semantic-concept', variants: ['inorganico', 'inorganica', 'inorganici', 'inorganiche'] },
    'glossary.organic': { value: 'Organico', strategy: 'semantic-concept', variants: ['organico', 'organica', 'organici', 'organiche'] },
    'glossary.network': { value: 'Rete', strategy: 'semantic-concept' }, 'glossary.active-production': { value: 'Produzione attiva', strategy: 'semantic-concept' },
    'glossary.source': { value: 'Origine', strategy: 'semantic-concept' }, 'glossary.destination': { value: 'Destinazione', strategy: 'semantic-concept' },
    'glossary.file-import-export': { value: 'Importa / Esporta', strategy: 'key-scoped' }, 'glossary.undo-redo': { value: 'Annulla / Ripeti', strategy: 'key-scoped' },
    'glossary.validation-error': { value: 'Errore', strategy: 'semantic-concept' }, 'glossary.validation-warning': { value: 'Avviso', strategy: 'semantic-concept' },
    'glossary.validation-info': { value: 'Informazione', strategy: 'semantic-concept' },
  },
  'pt-BR': {
    'term.inter-system-cargo-link': { value: 'Vínculo de carga entre sistemas', strategy: 'phrase' }, 'term.cargo-link': { value: 'Vínculo de carga', strategy: 'phrase' },
    'term.outpost': { value: 'Entreposto', strategy: 'semantic-concept', variants: ['entreposto', 'entrepostos'] }, 'term.biome': { value: 'Bioma', strategy: 'semantic-concept', variants: ['bioma', 'biomas'] },
    'term.planet': { value: 'Planeta', strategy: 'semantic-concept', variants: ['planeta', 'planetas'] }, 'term.planetary-body': { value: 'Corpo celeste', strategy: 'semantic-concept', variants: ['corpo celeste', 'corpos celestes'] },
    'term.star-system': { value: 'Sistema estelar', strategy: 'semantic-concept', variants: ['sistema estelar', 'sistemas estelares'] },
    'skill.outpost-management': { value: 'Gestão de Entrepostos', strategy: 'phrase' }, 'skill.outpost-engineering': { value: 'Engenh. de Entrepostos', strategy: 'phrase' },
    'skill.planetary-habitation': { value: 'Habitação Planetária', strategy: 'phrase' }, 'skill.research-methods': { value: 'Métodos de Pesquisa', strategy: 'phrase' },
    'skill.special-projects': { value: 'Projetos Especiais', strategy: 'phrase' }, 'term.x-tech-power-core': { value: 'Núcleo de energia Tec-X', strategy: 'semantic-concept' },
    'term.x-tech': { value: 'Tec-X', strategy: 'phrase' }, 'product.starfield': { value: 'Starfield', strategy: 'phrase' },
    'glossary.planned-supply': { value: 'Suprimento planejado', strategy: 'semantic-concept' }, 'glossary.present': { value: 'Presença', strategy: 'key-scoped', variants: ['presença', 'presente', 'disponível'] },
    'glossary.producing': { value: 'Em produção', strategy: 'key-scoped', variants: ['em produção', 'produzir', 'parar de produzir'] },
    'glossary.inputs': { value: 'Insumos', strategy: 'semantic-concept', variants: ['insumos', 'recursos necessários', 'materiais necessários'] },
    'glossary.logistics': { value: 'Logística', strategy: 'key-scoped' }, 'glossary.manufacturing': { value: 'Fabricação', strategy: 'semantic-concept' },
    'glossary.validation': { value: 'Validação', strategy: 'semantic-concept' }, 'glossary.resource-matrix': { value: 'Matriz de recursos', strategy: 'phrase' },
    'glossary.reshuffle': { value: 'Reordenar', strategy: 'key-scoped', variants: ['reordenar', 'concluir reordenação'] }, 'glossary.lock-order': { value: 'Bloquear a ordem', strategy: 'key-scoped' },
    'glossary.inorganic': { value: 'Inorgânico', strategy: 'semantic-concept', variants: ['inorgânico', 'inorgânica', 'inorgânicos', 'inorgânicas'] },
    'glossary.organic': { value: 'Orgânico', strategy: 'semantic-concept', variants: ['orgânico', 'orgânica', 'orgânicos', 'orgânicas'] },
    'glossary.network': { value: 'Rede', strategy: 'semantic-concept' }, 'glossary.active-production': { value: 'Produção ativa', strategy: 'semantic-concept' },
    'glossary.source': { value: 'Origem', strategy: 'semantic-concept' }, 'glossary.destination': { value: 'Destino', strategy: 'semantic-concept' },
    'glossary.file-import-export': { value: 'Importar / Exportar', strategy: 'key-scoped' }, 'glossary.undo-redo': { value: 'Desfazer / Refazer', strategy: 'key-scoped' },
    'glossary.validation-error': { value: 'Erro', strategy: 'semantic-concept' }, 'glossary.validation-warning': { value: 'Aviso', strategy: 'semantic-concept' },
    'glossary.validation-info': { value: 'Informação', strategy: 'semantic-concept' },
  },
}
const constraintExemptLocales = new Set(['ja-JP'])

function sourceHas(...terms: string[]): ConstraintMatcher {
  const patterns = terms.map((term) => new RegExp(`(^|[^A-Za-z])${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:s)?(?=$|[^A-Za-z])`, 'i'))
  return (_key, source) => patterns.some((pattern) => pattern.test(source))
}

function keyIs(...keys: MessageKey[]): ConstraintMatcher {
  const expected = new Set<MessageKey>(keys)
  return (key) => expected.has(key)
}

function keyStarts(...prefixes: string[]): ConstraintMatcher {
  return (key) => prefixes.some((prefix) => key.startsWith(prefix))
}

function anyOf(...matchers: ConstraintMatcher[]): ConstraintMatcher {
  return (key, source) => matchers.some((matches) => matches(key, source))
}

const planetaryBodyKeys: readonly MessageKey[] = [
  'outpost.body.label', 'outpost.body.select', 'outpost.referenceData.empty',
  'history.changeBody', 'history.clearBody', 'validation.bodySystemMismatch',
  'validation.outpostBodyNotEligible', 'validation.selectedBiomeInvalid',
  'validation.unknownBody', 'validation.unknownBiome', 'status.referenceData.loaded',
]

const terminologyConstraints: readonly Constraint[] = [
  { id: 'term.inter-system-cargo-link', matches: sourceHas('Inter-System Cargo Link') },
  { id: 'term.cargo-link', matches: sourceHas('Cargo Link') },
  { id: 'term.outpost', matches: sourceHas('Outpost') },
  { id: 'term.biome', matches: sourceHas('Biome') },
  { id: 'term.planet', matches: keyIs(
    'help.organic.unavailablePlanet', 'help.organic.availablePlanet',
  ) },
  { id: 'term.planetary-body', matches: keyIs(...planetaryBodyKeys) },
  { id: 'term.star-system', matches: anyOf(
    sourceHas('Star System'),
    keyIs('outpost.system.label', 'outpost.system.select', 'history.changeSystem', 'history.clearSystem', 'status.referenceData.loaded'),
  ) },
  { id: 'skill.outpost-management', matches: sourceHas('Outpost Management') },
  { id: 'skill.outpost-engineering', matches: sourceHas('Outpost Engineering') },
  { id: 'skill.planetary-habitation', matches: sourceHas('Planetary Habitation') },
  { id: 'skill.research-methods', matches: sourceHas('Research Methods') },
  { id: 'skill.special-projects', matches: sourceHas('Special Projects') },
  { id: 'term.x-tech-power-core', matches: sourceHas('X-Tech Power Core') },
  { id: 'term.x-tech', matches: sourceHas('X-Tech') },
  { id: 'product.starfield', matches: sourceHas('Starfield') },
  { id: 'glossary.planned-supply', matches: sourceHas('Planned Supply') },
  { id: 'glossary.present', matches: anyOf(
    keyIs('matrix.column.present', 'matrix.action.togglePresent', 'search.results.flag.present',
      'help.present', 'help.inorganicPresentRecorded', 'help.inorganicPresentPossible',
      'matrix.action.xTech.add', 'matrix.tooltip.xTech.add', 'matrix.tooltip.xTech.present',
      'validation.xTechCapabilityPresent', 'validation.xTechRequiresPresence'),
  ) },
  { id: 'glossary.producing', matches: keyIs(
    'matrix.column.producing', 'matrix.action.toggleProducing', 'matrix.action.toggleProducingSource',
    'search.results.flag.producing', 'help.producing', 'history.startProducing', 'history.stopProducing',
    'matrix.tooltip.producing.active', 'matrix.tooltip.producing.inactive',
  ) },
  { id: 'glossary.inputs', matches: anyOf(
    keyIs('matrix.column.inputs', 'search.results.flag.missingInputs', 'matrix.tooltip.manufacturing.blocked'),
    keyStarts('matrix.tooltip.input.', 'validation.manufacturingInput', 'validation.organicInput'),
  ) },
  { id: 'glossary.logistics', matches: keyIs('matrix.column.logistics', 'help.logistics') },
  { id: 'glossary.manufacturing', matches: anyOf(
    sourceHas('Manufacturing'),
    keyStarts('matrix.manufacturing.', 'validation.duplicateManufacturing', 'validation.unknownManufacturing'),
    keyIs('matrix.section.manufacturing', 'plannedSupply.section.products', 'history.editManufacturing'),
  ) },
  { id: 'glossary.validation', matches: keyIs(
    'validation.heading', 'validation.none', 'validation.open', 'validation.close', 'validation.issueCount',
    'shortcuts.group.validation', 'shortcuts.action.toggleValidation',
  ) },
  { id: 'glossary.resource-matrix', matches: sourceHas('Resource Matrix') },
  { id: 'glossary.reshuffle', matches: keyIs(
    'outpost.navigation.reshuffleButton', 'outpost.navigation.reshuffle', 'outpost.navigation.finishReshuffle',
    'cargo.reshuffleButton', 'cargo.reshuffle', 'cargo.finishReshuffle',
  ) },
  { id: 'glossary.lock-order', matches: keyIs(
    'outpost.navigation.lockOrder', 'cargo.lockOrder',
  ) },
  { id: 'glossary.inorganic', matches: keyIs(
    'matrix.section.inorganic', 'plannedSupply.section.inorganic', 'shortcuts.action.focusFirstInorganic',
  ) },
  { id: 'glossary.organic', matches: keyIs(
    'matrix.section.organic', 'plannedSupply.section.organic', 'shortcuts.action.focusFirstOrganic',
  ) },
  { id: 'glossary.network', matches: sourceHas('Network') },
  { id: 'glossary.active-production', matches: anyOf(
    sourceHas('Active Production'), keyIs('validation.duplicateActiveProduction', 'validation.unknownProductionResource',
      'validation.unknownProductionSpecies'),
  ) },
  { id: 'glossary.source', matches: keyIs(
    'matrix.column.source', 'matrix.source.unspecified', 'matrix.action.toggleProducingSource',
    'validation.unspecifiedOrganicSource', 'validation.unresolvedCargoExport', 'validation.remediation.organicSources',
  ) },
  { id: 'glossary.destination', matches: anyOf(
    keyStarts('cargo.destination.'), keyIs('cargo.pad.noDestination', 'cargo.pad.linkedTo', 'cargo.pad.semanticSummary',
      'matrix.tooltip.export.active'),
  ) },
  { id: 'glossary.file-import-export', matches: anyOf(
    keyStarts('transfer.', 'status.import.', 'status.export.'),
    keyIs('shortcuts.group.importExport', 'shortcuts.action.import', 'shortcuts.action.export', 'history.importNetworks'),
  ) },
  { id: 'glossary.undo-redo', matches: anyOf(
    keyStarts('history.undo', 'history.redo'), keyIs('shortcuts.action.undo', 'shortcuts.action.redo', 'network.delete.undoHint'),
  ) },
  { id: 'glossary.validation-error', matches: keyIs(
    'validation.counts', 'validation.filter.error', 'validation.severity.error', 'help.validation',
  ) },
  { id: 'glossary.validation-warning', matches: keyIs(
    'validation.counts', 'validation.filter.warning', 'validation.severity.warning', 'help.validation',
  ) },
  { id: 'glossary.validation-info', matches: keyIs(
    'validation.counts', 'validation.filter.info', 'validation.severity.info', 'help.validation',
  ) },
]

const protectedTokenCandidates = [
  'Cosmos icons created by gravisio - Flaticon', 'FormID', 'He-3', 'JSON',
  'Ctrl', 'Esc', 'Shift', 'ID',
] as const

export function englishSourceSha256(source: string): string {
  return createHash('sha256').update(source).digest('hex').toUpperCase()
}

export function parametersOf(template: string): string[] {
  const normalized = template.replace(/\{(\w+), plural, one \{[^{}]*\} other \{[^{}]*\}\}/g, '{$1}')
  return [...new Set([...normalized.matchAll(/\{(\w+)\}/g)].map((match) => match[1]))].sort()
}

export function pluralParametersOf(template: string): string[] {
  return [...template.matchAll(/\{(\w+), plural, one \{[^{}]*\} other \{[^{}]*\}\}/g)]
    .map((match) => match[1])
    .sort()
}

export function hasValidPluralSyntax(template: string): boolean {
  const withoutSupportedPlural = template.replace(
    /\{\w+, plural, one \{[^{}]*\} other \{[^{}]*\}\}/g,
    '{plural}',
  )
  return !/\{[^{}]*,/.test(withoutSupportedPlural) &&
    !/\b(?:plural|one|other)\s*\{/i.test(withoutSupportedPlural)
}

export function protectedTokensOf(template: string): string[] {
  const found: string[] = []
  let remaining = template
  for (const token of protectedTokenCandidates) {
    if (remaining.includes(token)) {
      found.push(token)
      remaining = remaining.replaceAll(token, '')
    }
  }
  return found
}

const accidentalEnglishInvariantTokens = [
  ...protectedTokenCandidates, 'Starfield', 'X-Tech', 'Tec-X', 'HTTP', 'hash',
] as const

const accidentalEnglishAllowedWords: Readonly<Record<string, ReadonlySet<string>>> = {
  'es-ES': new Set(['domesticable', 'error', 'fauna', 'flora', 'normal', 'norm', 'original', 'solar', 'local']),
  'it-IT': new Set(['browser', 'fauna', 'file', 'flora', 'info', 'normal', 'norm', 'schema', 'standard', 'locale', 'local']),
  'pt-BR': new Set(['fauna', 'flora', 'item', 'normal', 'norm', 'original', 'solar', 'local', 'status', 'standard']),
  // These are ordinary Polish cognates, not broad technical-English exemptions.
  'pl-PL': new Set(['status', 'system']),
}

const suspiciousShortEnglishWords = new Set([
  'all', 'any', 'both', 'down', 'each', 'for', 'from', 'hide', 'into', 'off', 'of',
  'only', 'or', 'same', 'than', 'that', 'the', 'this', 'to', 'up', 'with',
])

function wordsOf(value: string): string[] {
  return [...value.normalize('NFC').matchAll(/[\p{L}\p{N}]+(?:[-’'][\p{L}\p{N}]+)*/gu)]
    .map((match) => match[0].toLocaleLowerCase('en-US'))
}

/**
 * Finds suspicious ordinary English tokens copied from the source into a staged
 * full-locale draft. Source intersection avoids pretending to be a general
 * language detector; the locale allowlist covers genuine shared vocabulary.
 */
export function accidentalEnglishResidueOf(english: string, translation: string, locale: string): string[] {
  const allowed = accidentalEnglishAllowedWords[locale]
  if (!allowed) return []
  const stripInvariants = (value: string) => {
    let result = value.replace(/\{\w+(?:, plural, one \{[^{}]*\} other \{[^{}]*\})?\}/g, ' ')
    for (const token of accidentalEnglishInvariantTokens) result = result.replaceAll(token, ' ')
    return result.replace(/\b[\w-]+\.(?:json|csv|xliff|ts|tsx|js|mjs)\b/gi, ' ')
  }
  const sourceWords = new Set(wordsOf(stripInvariants(english)))
  const suspicious = wordsOf(stripInvariants(translation)).filter((word) =>
    (word.length >= 4 || suspiciousShortEnglishWords.has(word)) && sourceWords.has(word) && !allowed.has(word))
  return [...new Set(suspicious)].sort()
}

function riskOf(key: MessageKey): ReviewRisk {
  if (key.startsWith('validation.') || key.startsWith('help.') || key.startsWith('shortcuts.') ||
    parametersOf(enUSMessages[key]).length > 1 || contextByKey[key] ||
    ['network.reset.explanation', 'network.delete.explanation', 'network.delete.undoHint', 'plannedSupply.heading', 'search.results.dragInstructions'].includes(key)) return 'HIGH'
  if (['cargo.', 'matrix.', 'history.', 'status.', 'power.', 'search.', 'plannedSupply.', 'transfer.'].some((prefix) => key.startsWith(prefix)) ||
    key.includes('.navigation.') || key.includes('.tooltip')) return 'MEDIUM'
  return 'LOW'
}

function contextOf(key: MessageKey): string {
  const base = contextByKey[key] ?? contextByNamespace[key.split('.')[0]] ?? 'Tracker-authored application message.'
  const role = key.includes('tooltip') ? ' This is explanatory tooltip text.'
    : key.includes('label') ? ' This is a form or control label.'
      : key.includes('heading') || key.includes('title') ? ' This is a visible heading.'
        : key.includes('description') || key.includes('instructions') ? ' This is accessible or instructional text.'
          : ''
  return `${base}${role}`
}

function constraintsOf(key: MessageKey, locale: string): string {
  const source = enUSMessages[key]
  const applicable = terminologyConstraints.filter((constraint) => constraint.matches(key, source))
  if (!applicable.length) return ''
  const localeValues = constraintValuesByLocale[locale]
  if (!localeValues && constraintExemptLocales.has(locale)) return ''
  if (!localeValues) throw new Error(`REVIEW_CONSTRAINTS_MISSING: No approved glossary constraints exist for ${locale}.`)
  return applicable
    .map((constraint) => {
      const value = localeValues[constraint.id]
      if (!value) throw new Error(`REVIEW_CONSTRAINTS_MISSING: ${locale}:${constraint.id}.`)
      if (typeof value === 'string') return `${constraint.id}=${value}`
      const variants = value.variants?.length ? `, variants=${value.variants.join(' | ')}` : ''
      return `${constraint.id}=${value.value} [strategy=${value.strategy}${variants}]`
    })
    .join('; ')
}

export function comparisonStatus(codex: string, deepL: string): ReviewComparisonStatus {
  if (!codex || !deepL) return 'MISSING'
  if (codex === deepL) return 'IDENTICAL'
  const typographic = (value: string) => value.replaceAll('\r\n', '\n').replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
  return typographic(codex) === typographic(deepL) ? 'TYPOGRAPHIC_ONLY' : 'SUBSTANTIVE'
}

function translationTokenIssue(english: string, translation: string): string | undefined {
  if (!hasValidPluralSyntax(translation)) return 'PLURAL_SYNTAX'
  if (JSON.stringify(pluralParametersOf(translation)) !== JSON.stringify(pluralParametersOf(english))) return 'PLURAL_SYNTAX'
  if (JSON.stringify(parametersOf(translation)) !== JSON.stringify(parametersOf(english))) return 'PLACEHOLDERS'
  if (protectedTokensOf(english).some((token) => !translation.includes(token))) return 'PROTECTED_TOKEN'
  return undefined
}

export function createReviewRows(locale: string, translations: Partial<MessageCatalogue> = {}): ReviewRow[] {
  return (Object.keys(enUSMessages) as MessageKey[]).sort().map((key) => {
    const english = enUSMessages[key]
    const codex = translations[key] ?? ''
    const residue = codex ? accidentalEnglishResidueOf(english, codex, locale) : []
    if (residue.length) throw new Error(`REVIEW_ACCIDENTAL_ENGLISH: ${locale}:${key}: ${residue.join(', ')}`)
    return {
      Key: key, Locale: locale, EnglishSource: english, EnglishSourceSha256: englishSourceSha256(english),
      Context: contextOf(key), Risk: riskOf(key),
      Parameters: parametersOf(english).join('; '), ProtectedTokens: protectedTokensOf(english).join('; '),
      OfficialTermConstraints: constraintsOf(key, locale), CodexTranslation: codex, DeepLTranslation: '',
      ComparisonStatus: 'MISSING', AdjudicationDecision: '', FinalTranslation: '', ReviewerNote: '',
    }
  })
}

function xmlEscape(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&apos;')
}

function xmlUnescape(value: string): string {
  return value.replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'").replaceAll('&amp;', '&')
}

function xliffTemplate(value: string): string {
  const tokenPattern = /\{\w+, plural, one \{[^{}]*\} other \{[^{}]*\}\}|\{\w+\}/g
  let cursor = 0
  let index = 0
  let result = ''
  for (const match of value.matchAll(tokenPattern)) {
    const offset = match.index ?? 0
    result += xmlEscape(value.slice(cursor, offset))
    index += 1
    const plural = match[0].match(/^\{(\w+), plural, one \{([^{}]*)\} other \{([^{}]*)\}\}$/)
    if (plural) {
      result += `<ph id="p${index}-open" equiv-text="${xmlEscape(`{${plural[1]}, plural, one {`)}">${xmlEscape(`{${plural[1]}, plural, one {`)}</ph>`
      result += xmlEscape(plural[2])
      result += `<ph id="p${index}-other" equiv-text="} other {">} other {</ph>`
      result += xmlEscape(plural[3])
      result += `<ph id="p${index}-close" equiv-text="}}">}}</ph>`
    } else {
      result += `<ph id="p${index}" equiv-text="${xmlEscape(match[0])}">${xmlEscape(match[0])}</ph>`
    }
    cursor = offset + match[0].length
  }
  return result + xmlEscape(value.slice(cursor))
}

/** Creates the current XLIFF 1.2 handoff representation from semantic source and review metadata. */
export function createReviewXliff(rows: readonly ReviewRow[], locale: string): string {
  const body = rows.map((row) => [
    `      <trans-unit id="${xmlEscape(row.Key)}" resname="${xmlEscape(row.Key)}">`,
    `        <source>${xliffTemplate(row.EnglishSource)}</source>`,
    '        <target state="new"></target>',
    `        <context-group purpose="information"><context context-type="x-message-key">${xmlEscape(row.Key)}</context><context context-type="x-risk">${row.Risk}</context></context-group>`,
    `        <prop-group><prop prop-type="x-english-source-sha256">${row.EnglishSourceSha256}</prop><prop prop-type="x-parameters">${xmlEscape(row.Parameters)}</prop><prop prop-type="x-protected-tokens">${xmlEscape(row.ProtectedTokens)}</prop></prop-group>`,
    `        <note from="context">${xmlEscape(row.Context)}</note>`,
    `        <note from="terminology">${xmlEscape(row.OfficialTermConstraints || 'No row-specific terminology constraint.')}</note>`,
    '      </trans-unit>',
  ].join('\n')).join('\n')
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">',
    `  <file original="semantic-catalogue" source-language="en-US" target-language="${xmlEscape(locale)}" datatype="plaintext">`,
    '    <body>', body, '    </body>', '  </file>', '</xliff>', '',
  ].join('\n')
}

function attributeOf(source: string, name: string): string | undefined {
  const match = source.match(new RegExp(`\\b${name}="([^"]*)"`))
  return match ? xmlUnescape(match[1]) : undefined
}

function xliffText(source: string): string {
  const withPlaceholders = source.replace(/<ph\b([^>]*)>([\s\S]*?)<\/ph>/g, (_match, attributes: string, body: string) =>
    body ? body.replace(/<[^>]+>/g, '') : attributeOf(attributes, 'equiv-text') ?? '')
    .replace(/<ph\b([^>]*)\/>/g, (_match, attributes: string) => attributeOf(attributes, 'equiv-text') ?? '')
  return xmlUnescape(withPlaceholders.replace(/<[^>]+>/g, ''))
}

/** Imports a DeepL-produced XLIFF by stable key and returns a validated review CSV. */
export function importReviewXliff(
  reviewSource: string,
  xliffSource: string,
  locale: string,
  options: { recordInvalidTokens?: boolean } = {},
): string {
  const fileMatch = xliffSource.match(/<file\b([^>]*)>/)
  if (!fileMatch || attributeOf(fileMatch[1], 'target-language') !== locale) throw new Error('XLIFF_LOCALE_MISMATCH')
  const translations = new Map<string, { target: string; source: string; sourceHash?: string }>()
  for (const match of xliffSource.matchAll(/<trans-unit\b([^>]*)>([\s\S]*?)<\/trans-unit>/g)) {
    const key = attributeOf(match[1], 'resname') ?? attributeOf(match[1], 'id')
    if (!key) throw new Error('XLIFF_MISSING_KEY')
    if (translations.has(key)) throw new Error(`XLIFF_DUPLICATE_KEY: ${key}`)
    const target = match[2].match(/<target\b[^>]*>([\s\S]*?)<\/target>/)
    const source = match[2].match(/<source\b[^>]*>([\s\S]*?)<\/source>/)
    const hash = match[2].match(/<prop\b[^>]*prop-type="x-english-source-sha256"[^>]*>([\s\S]*?)<\/prop>/)
    translations.set(key, {
      target: target ? xliffText(target[1]).trim() : '',
      source: source ? xliffText(source[1]) : '',
      sourceHash: hash ? xmlUnescape(hash[1].trim()) : undefined,
    })
  }
  const rows = parseAndValidateReviewCsv(reviewSource, locale)
  const expectedKeys = new Set(rows.map((row) => row.Key))
  for (const key of translations.keys()) if (!expectedKeys.has(key as MessageKey)) throw new Error(`XLIFF_UNKNOWN_KEY: ${key}`)
  for (const row of rows) {
    const unit = translations.get(row.Key)
    if (!unit) throw new Error(`XLIFF_MISSING_KEY: ${row.Key}`)
    if (unit.source !== row.EnglishSource || unit.sourceHash !== row.EnglishSourceSha256) throw new Error(`XLIFF_STALE_SOURCE: ${row.Key}`)
    const translated = unit.target
    if (!translated) throw new Error(`XLIFF_MISSING_TRANSLATION: ${row.Key}`)
    const tokenIssue = translationTokenIssue(row.EnglishSource, translated)
    if (tokenIssue && !options.recordInvalidTokens) {
      throw new Error(`XLIFF_INVALID_${tokenIssue}: ${row.Key}`)
    }
    row.DeepLTranslation = translated
    row.ComparisonStatus = tokenIssue ? 'INVALID_TOKENS' : comparisonStatus(row.CodexTranslation, translated)
  }
  return serializeReviewRows(rows)
}

function csvCell(value: string): string { return `"${value.replaceAll('"', '""')}"` }

export function createReviewCsv(locale: string, translations: Partial<MessageCatalogue> = {}): string {
  return serializeReviewRows(createReviewRows(locale, translations))
}

export function serializeReviewRows(rows: readonly ReviewRow[]): string {
  const lines = [REVIEW_COLUMNS.map(csvCell).join(','), ...rows
    .map((row) => REVIEW_COLUMNS.map((column) => csvCell(row[column])).join(','))]
  return `${lines.join('\n')}\n`
}

export function parseAndValidateReviewCsv(source: string, locale: string): ReviewRow[] {
  const rows = parse(source, { bom: true, columns: true, skip_empty_lines: true }) as ReviewRow[]
  const seen = new Set<string>()
  for (const row of rows) {
    if (JSON.stringify(Object.keys(row)) !== JSON.stringify(REVIEW_COLUMNS)) throw new Error('REVIEW_SCHEMA_INVALID')
    if (row.Locale !== locale) throw new Error(`REVIEW_LOCALE_MISMATCH: ${row.Key}`)
    if (seen.has(row.Key)) throw new Error(`REVIEW_DUPLICATE_KEY: ${row.Key}`)
    seen.add(row.Key)
    const english = enUSMessages[row.Key]
    if (english === undefined) throw new Error(`REVIEW_UNKNOWN_KEY: ${row.Key}`)
    if (row.EnglishSource !== english || row.EnglishSourceSha256 !== englishSourceSha256(english)) throw new Error(`REVIEW_STALE_SOURCE: ${row.Key}`)
    if (row.OfficialTermConstraints !== constraintsOf(row.Key, locale)) throw new Error(`REVIEW_CONSTRAINTS_STALE: ${row.Key}`)
    const expectedComparison = row.DeepLTranslation && translationTokenIssue(english, row.DeepLTranslation)
      ? 'INVALID_TOKENS'
      : comparisonStatus(row.CodexTranslation, row.DeepLTranslation)
    if (row.ComparisonStatus !== expectedComparison) throw new Error(`REVIEW_COMPARISON_STATUS_INVALID: ${row.Key}`)
    for (const field of ['CodexTranslation', 'FinalTranslation'] as const) {
      if (!row[field]) continue
      const issue = translationTokenIssue(english, row[field])
      if (issue) throw new Error(`REVIEW_INVALID_${issue}: ${row.Key}:${field}`)
    }
    if (row.DeepLTranslation && row.ComparisonStatus !== 'INVALID_TOKENS') {
      const issue = translationTokenIssue(english, row.DeepLTranslation)
      if (issue) throw new Error(`REVIEW_INVALID_${issue}: ${row.Key}:DeepLTranslation`)
    }
    validateAdjudication(row)
  }
  const missing = (Object.keys(enUSMessages) as MessageKey[]).filter((key) => !seen.has(key))
  if (missing.length) throw new Error(`REVIEW_MISSING_KEY: ${missing[0]}`)
  return rows
}

const reviewDecisions = new Set<ReviewDecision>([
  '', 'AGREED', 'CODEX', 'DEEPL', 'CUSTOM', 'INVALID_DEEPL_REPAIRED',
])

const genericReviewerNotes = new Set([
  'Reviewed against the English source, UI context, risk metadata, and approved terminology.',
  'Low-risk spot-check completed against the English source and UI role.',
])

function validateAdjudication(row: ReviewRow): void {
  if (!reviewDecisions.has(row.AdjudicationDecision)) {
    throw new Error(`REVIEW_DECISION_INVALID: ${row.Key}`)
  }
  const hasApproval = Boolean(row.FinalTranslation || row.AdjudicationDecision || row.ReviewerNote)
  if (!hasApproval) return
  if (!row.FinalTranslation || !row.AdjudicationDecision) {
    throw new Error(`REVIEW_DECISION_REQUIRED: ${row.Key}`)
  }
  if (row.ReviewerNote.trim().length < 40 || genericReviewerNotes.has(row.ReviewerNote.trim())) {
    throw new Error(`REVIEW_RATIONALE_REQUIRED: ${row.Key}`)
  }
  if (row.AdjudicationDecision === 'AGREED') {
    if (row.ComparisonStatus !== 'IDENTICAL' || row.CodexTranslation !== row.DeepLTranslation ||
        row.FinalTranslation !== row.CodexTranslation) {
      throw new Error(`REVIEW_DECISION_CONTRADICTS_EVIDENCE: ${row.Key}`)
    }
  } else if (row.AdjudicationDecision === 'CODEX') {
    if (row.FinalTranslation !== row.CodexTranslation) {
      throw new Error(`REVIEW_DECISION_CONTRADICTS_EVIDENCE: ${row.Key}`)
    }
  } else if (row.AdjudicationDecision === 'DEEPL') {
    if (row.ComparisonStatus === 'INVALID_TOKENS' || row.FinalTranslation !== row.DeepLTranslation) {
      throw new Error(`REVIEW_DECISION_CONTRADICTS_EVIDENCE: ${row.Key}`)
    }
  } else if (row.AdjudicationDecision === 'CUSTOM') {
    if (row.ComparisonStatus === 'INVALID_TOKENS' || row.FinalTranslation === row.CodexTranslation ||
        row.FinalTranslation === row.DeepLTranslation) {
      throw new Error(`REVIEW_DECISION_CONTRADICTS_EVIDENCE: ${row.Key}`)
    }
  } else if (row.AdjudicationDecision === 'INVALID_DEEPL_REPAIRED') {
    if (row.ComparisonStatus !== 'INVALID_TOKENS') {
      throw new Error(`REVIEW_DECISION_CONTRADICTS_EVIDENCE: ${row.Key}`)
    }
  }
}

export function finalCatalogueFromReview(source: string, locale: string): MessageCatalogue {
  const rows = parseAndValidateReviewCsv(source, locale)
  const result = {} as MessageCatalogue
  for (const row of rows) {
    if (!row.FinalTranslation || !row.AdjudicationDecision || !row.ReviewerNote) throw new Error(`REVIEW_ROW_NOT_APPROVED: ${row.Key}`)
    result[row.Key] = row.FinalTranslation
  }
  return result
}
