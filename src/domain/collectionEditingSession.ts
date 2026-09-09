/**
 * Purpose: Own the complete collection, working context, and global history.
 * Architecture: Every undoable operation stores immutable before/after states;
 * navigation and remembered selections remain session transitions, not history.
 * Change this file when: collection editing or contextual history rules change.
 */
import {
  appendNetworkFromLatestCharacter,
  deleteNetwork,
  getActiveSavedNetwork,
  replaceActiveNetwork,
  resetOnlyNetwork,
  setActiveNetwork,
} from '../data/networkCollection.ts'
import type { NetworkCollection } from '../data/networkCollection'
import type { OutpostNetwork } from './models'

export interface WorkingContext {
  networkId: string
  outpostId: string | null
}

export interface CollectionHistoryState {
  collection: NetworkCollection
  context: WorkingContext
}

export interface CollectionHistoryEntry {
  label: string
  timestamp: number
  before: CollectionHistoryState
  after: CollectionHistoryState
  resetsNetworkPresentation: boolean
}

export interface CollectionEditingSession {
  collection: NetworkCollection
  context: WorkingContext
  selectedOutpostByNetworkId: Record<string, string | null>
  history: {
    past: CollectionHistoryEntry[]
    future: CollectionHistoryEntry[]
  }
}

export type NetworkUpdate = (network: OutpostNetwork) => OutpostNetwork

export type CollectionEditingAction =
  | { type: 'apply-active-network'; label: string; timestamp: number;
      update: NetworkUpdate; outpostId?: string | null }
  | { type: 'select-outpost'; outpostId: string | null }
  | { type: 'switch-network'; networkId: string }
  | { type: 'add-network'; networkId: string; outpostId: string;
      outpostBaseName?: string; timestamp: number }
  | { type: 'delete-network'; timestamp: number }
  | { type: 'reset-network'; outpostId: string; outpostBaseName?: string; timestamp: number }
  | { type: 'replace-collection'; collection: NetworkCollection; timestamp: number }
  | { type: 'undo' }
  | { type: 'redo' }

export function normalizeHistoryState(
  state: CollectionHistoryState,
): CollectionHistoryState {
  const requestedNetwork = state.collection.networks.find(
    ({ id }) => id === state.context.networkId,
  )
  const activeNetwork = state.collection.networks.find(
    ({ id }) => id === state.collection.activeNetworkId,
  )
  const resolvedNetwork = requestedNetwork ?? activeNetwork ?? state.collection.networks[0]
  if (!resolvedNetwork) {
    throw new Error('A network collection must contain at least one network.')
  }
  const outpostId = resolvedNetwork.network.outposts.some(
    ({ id }) => id === state.context.outpostId,
  ) ? state.context.outpostId : resolvedNetwork.network.outposts[0]?.id ?? null
  return {
    collection: resolvedNetwork.id === state.collection.activeNetworkId
      ? state.collection
      : { ...state.collection, activeNetworkId: resolvedNetwork.id },
    context: { networkId: resolvedNetwork.id, outpostId },
  }
}

export function formatNetworkHistoryLabel(
  collection: NetworkCollection,
  networkId: string,
  label: string,
): string {
  if (collection.networks.length === 1) return label
  const ordinal = collection.networks.findIndex(({ id }) => id === networkId) + 1
  return ordinal > 0 ? `Network ${ordinal}: ${label}` : label
}

function remember(
  session: CollectionEditingSession,
  state: CollectionHistoryState,
): CollectionEditingSession {
  return {
    ...session,
    ...state,
    selectedOutpostByNetworkId: {
      ...session.selectedOutpostByNetworkId,
      [state.context.networkId]: state.context.outpostId,
    },
  }
}

function record(
  session: CollectionEditingSession,
  label: string,
  timestamp: number,
  after: CollectionHistoryState,
  resetsNetworkPresentation = false,
): CollectionEditingSession {
  const before = normalizeHistoryState({
    collection: session.collection,
    context: session.context,
  })
  const normalizedAfter = normalizeHistoryState(after)
  if (normalizedAfter.collection === before.collection &&
    normalizedAfter.context.networkId === before.context.networkId &&
    normalizedAfter.context.outpostId === before.context.outpostId) return session
  return remember({
    ...session,
    history: {
      past: [...session.history.past, {
        label, timestamp, before, after: normalizedAfter,
        resetsNetworkPresentation,
      }],
      future: [],
    },
  }, normalizedAfter)
}

export function createCollectionEditingSession(
  collection: NetworkCollection,
): CollectionEditingSession {
  const active = getActiveSavedNetwork(collection)
  const state = normalizeHistoryState({
    collection,
    context: {
      networkId: active.id,
      outpostId: active.network.outposts[0]?.id ?? null,
    },
  })
  return {
    ...state,
    selectedOutpostByNetworkId: {
      [state.context.networkId]: state.context.outpostId,
    },
    history: { past: [], future: [] },
  }
}

export function collectionEditingSessionReducer(
  session: CollectionEditingSession,
  action: CollectionEditingAction,
): CollectionEditingSession {
  switch (action.type) {
    case 'select-outpost': {
      const state = normalizeHistoryState({
        collection: session.collection,
        context: { ...session.context, outpostId: action.outpostId },
      })
      return remember(session, state)
    }
    case 'switch-network': {
      const collection = setActiveNetwork(session.collection, action.networkId)
      const state = normalizeHistoryState({
        collection,
        context: {
          networkId: collection.activeNetworkId,
          outpostId: session.selectedOutpostByNetworkId[collection.activeNetworkId] ?? null,
        },
      })
      return remember(session, state)
    }
    case 'apply-active-network': {
      const updated = action.update(getActiveSavedNetwork(session.collection).network)
      if (updated === getActiveSavedNetwork(session.collection).network) return session
      const collection = replaceActiveNetwork(session.collection, updated)
      const label = formatNetworkHistoryLabel(
        session.collection, session.context.networkId, action.label,
      )
      return record(session, label, action.timestamp, {
        collection,
        context: {
          ...session.context,
          outpostId: action.outpostId === undefined
            ? session.context.outpostId : action.outpostId,
        },
      })
    }
    case 'add-network': {
      const collection = appendNetworkFromLatestCharacter(
        session.collection, action.networkId, action.outpostId, action.outpostBaseName,
      )
      return record(session, formatNetworkHistoryLabel(
        collection, action.networkId, 'Add network',
      ), action.timestamp, {
        collection,
        context: { networkId: action.networkId, outpostId: action.outpostId },
      }, true)
    }
    case 'delete-network': {
      const label = formatNetworkHistoryLabel(
        session.collection, session.context.networkId, 'Delete network',
      )
      const collection = deleteNetwork(session.collection)
      const target = getActiveSavedNetwork(collection)
      return record(session, label, action.timestamp, {
        collection,
        context: {
          networkId: target.id,
          outpostId: session.selectedOutpostByNetworkId[target.id] ?? null,
        },
      }, true)
    }
    case 'reset-network': {
      const collection = resetOnlyNetwork(
        session.collection, action.outpostId, action.outpostBaseName,
      )
      return record(session, 'Reset network', action.timestamp, {
        collection,
        context: { networkId: collection.activeNetworkId, outpostId: action.outpostId },
      }, true)
    }
    case 'replace-collection': {
      const active = getActiveSavedNetwork(action.collection)
      return record(session, 'Import networks', action.timestamp, {
        collection: action.collection,
        context: {
          networkId: active.id,
          outpostId: active.network.outposts[0]?.id ?? null,
        },
      }, true)
    }
    case 'undo': {
      const entry = session.history.past.at(-1)
      if (!entry) return session
      return remember({
        ...session,
        history: {
          past: session.history.past.slice(0, -1),
          future: [...session.history.future, entry],
        },
      }, normalizeHistoryState(entry.before))
    }
    case 'redo': {
      const entry = session.history.future.at(-1)
      if (!entry) return session
      return remember({
        ...session,
        history: {
          past: [...session.history.past, entry],
          future: session.history.future.slice(0, -1),
        },
      }, normalizeHistoryState(entry.after))
    }
  }
}

/**
 * Traversal resets network-local UI only when it crosses networks or replays a
 * lifecycle/import replacement that can invalidate component-local state.
 */
export interface HistoryPresentationReset {
  navigation: boolean
  cargo: boolean
}

export function getHistoryPresentationReset(
  session: CollectionEditingSession,
  direction: 'undo' | 'redo',
): HistoryPresentationReset {
  const entry = direction === 'undo'
    ? session.history.past.at(-1)
    : session.history.future.at(-1)
  if (!entry) return { navigation: false, cargo: false }
  const target = direction === 'undo' ? entry.before : entry.after
  const normalizedTarget = normalizeHistoryState(target)
  const networkChanged = normalizedTarget.context.networkId !== session.context.networkId
  const outpostChanged = normalizedTarget.context.outpostId !== session.context.outpostId
  const membership = getEditorMembershipChanges(entry)
  return {
    navigation: entry.resetsNetworkPresentation || networkChanged || membership.outposts,
    cargo: entry.resetsNetworkPresentation || networkChanged || outpostChanged || membership.cargoPads,
  }
}

/** Detects membership changes while deliberately ignoring pure array reordering. */
function getEditorMembershipChanges(
  entry: CollectionHistoryEntry,
): { outposts: boolean; cargoPads: boolean } {
  if (entry.before.context.networkId !== entry.after.context.networkId) {
    return { outposts: true, cargoPads: true }
  }
  const beforeNetwork = entry.before.collection.networks.find(
    ({ id }) => id === entry.before.context.networkId,
  )?.network
  const afterNetwork = entry.after.collection.networks.find(
    ({ id }) => id === entry.after.context.networkId,
  )?.network
  if (!beforeNetwork || !afterNetwork) return { outposts: true, cargoPads: true }
  const sameMembers = (beforeIds: string[], afterIds: string[]) =>
    beforeIds.length === afterIds.length &&
    beforeIds.every((id) => afterIds.includes(id))
  const outposts = !sameMembers(
    beforeNetwork.outposts.map(({ id }) => id),
    afterNetwork.outposts.map(({ id }) => id),
  )
  if (entry.before.context.outpostId !== entry.after.context.outpostId) {
    return { outposts, cargoPads: true }
  }
  const outpostId = entry.before.context.outpostId
  const beforePads = beforeNetwork.outposts.find(({ id }) => id === outpostId)
    ?.cargoPads.map(({ id }) => id) ?? []
  const afterPads = afterNetwork.outposts.find(({ id }) => id === outpostId)
    ?.cargoPads.map(({ id }) => id) ?? []
  return { outposts, cargoPads: !sameMembers(beforePads, afterPads) }
}
