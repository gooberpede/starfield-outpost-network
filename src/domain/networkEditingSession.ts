/**
 * networkEditingSession.ts
 *
 * Purpose:
 *   Coordinates the current OutpostNetwork with its session-only Undo/Redo
 *   history as one atomic editing state.
 *
 * Architecture:
 *   Network state and history describe one editing session and must move
 *   together. This module therefore provides pure state transitions for:
 *
 *   - applying one undoable user action;
 *   - moving backward through history;
 *   - moving forward through history.
 *
 *   React is deliberately not imported here. App.tsx can use this module
 *   through useReducer, while the actual editing/history rules remain
 *   framework-independent and testable as ordinary domain logic.
 *
 *   The update function supplied to an "apply" action may perform several
 *   related network mutations. They still produce one history entry because
 *   one deliberate user operation should correspond to one Undo step.
 *
 * Change this file when:
 *   - editing-session actions change;
 *   - transaction/coalescing behaviour is introduced;
 *   - direct history navigation is added.
 */

import {
  createNetworkHistory,
  recordUndoableAction,
  redoNetworkChange,
  undoNetworkChange,
} from './history.ts'

import type {
  NetworkHistory,
} from './history'

import type {
  OutpostNetwork,
} from './models'

/**
 * Represents the complete network-editing state for the current session.
 */
export interface NetworkEditingSession {
  network: OutpostNetwork
  history: NetworkHistory
}

/**
 * Calculates a replacement network from the current one.
 *
 * Callers should treat the supplied network as immutable and return either
 * the unchanged object or a newly constructed OutpostNetwork.
 */
export type NetworkUpdate = (
  network: OutpostNetwork,
) => OutpostNetwork

/**
 * Describes every editing-session transition currently supported.
 *
 * timestamp is supplied by the application layer so the reducer itself
 * remains pure and deterministic.
 */
export type NetworkEditingAction =
  | {
      type: 'apply'
      label: string
      timestamp: number
      update: NetworkUpdate
    }
  | {
      type: 'undo'
    }
  | {
      type: 'redo'
    }

/**
 * Creates a fresh editing session around an existing network.
 *
 * Undo/Redo history always starts empty.
 */
export function createNetworkEditingSession(
  network: OutpostNetwork,
): NetworkEditingSession {
  return {
    network,
    history: createNetworkHistory(),
  }
}

/**
 * Applies one deliberate undoable user operation.
 *
 * The pre-change network is recorded before the replacement network becomes
 * current. Any existing Redo branch is discarded by recordUndoableAction().
 *
 * Returning the exact same network object is treated as a no-op and does not
 * create an unnecessary history entry.
 */
function applyUndoableNetworkChange(
  session: NetworkEditingSession,
  label: string,
  timestamp: number,
  update: NetworkUpdate,
): NetworkEditingSession {
  const updatedNetwork =
    update(session.network)

  if (updatedNetwork === session.network) {
    return session
  }

  return {
    network: updatedNetwork,

    history:
      recordUndoableAction(
        session.history,
        session.network,
        label,
        timestamp,
      ),
  }
}

/**
 * Moves the editing session backward by one history entry.
 */
function undoEditingSession(
  session: NetworkEditingSession,
): NetworkEditingSession {
  const result =
    undoNetworkChange(
      session.history,
      session.network,
    )

  if (!result.network) {
    return session
  }

  return {
    network: result.network,
    history: result.history,
  }
}

/**
 * Moves the editing session forward by one previously undone history entry.
 */
function redoEditingSession(
  session: NetworkEditingSession,
): NetworkEditingSession {
  const result =
    redoNetworkChange(
      session.history,
      session.network,
    )

  if (!result.network) {
    return session
  }

  return {
    network: result.network,
    history: result.history,
  }
}

/**
 * Pure reducer for all network-editing-session transitions.
 *
 * App.tsx can use this directly with React.useReducer so network and history
 * are always published together as one state transition.
 */
export function networkEditingSessionReducer(
  session: NetworkEditingSession,
  action: NetworkEditingAction,
): NetworkEditingSession {
  switch (action.type) {
    case 'apply':
      return applyUndoableNetworkChange(
        session,
        action.label,
        action.timestamp,
        action.update,
      )

    case 'undo':
      return undoEditingSession(session)

    case 'redo':
      return redoEditingSession(session)
  }
}
