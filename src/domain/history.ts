/**
 * history.ts
 *
 * Purpose:
 *   Provides reusable, session-only Undo/Redo history for changes to an
 *   OutpostNetwork.
 *
 * Architecture:
 *   The application keeps the current network separately as its present
 *   state. History stores snapshots from immediately before or after
 *   undoable user actions.
 *
 *   Each history entry also records a human-readable action label. The
 *   initial UI may expose only simple Undo/Redo buttons, but retaining this
 *   metadata now allows a future history menu or timeline to explain what
 *   each step represents.
 *
 *   Network snapshots are retained by reference rather than deep-cloned.
 *   This is safe because application updates treat OutpostNetwork state as
 *   immutable and construct replacement objects and arrays.
 *
 *   History is deliberately not persisted with the player's saved network.
 *   Reloading the application therefore starts a new editing session with
 *   empty Undo/Redo stacks, while the currently saved network is retained.
 *
 *   Importing a network is different: a successful import is an ordinary
 *   undoable replacement within the current editing session, so the user can
 *   recover the network that existed immediately before the import.
 *
 * Key rules:
 *   - One deliberate user action should create at most one history entry.
 *   - Automatic housekeeping caused by that action belongs to the same entry.
 *   - Performing a new undoable action clears the Redo stack.
 *   - Undo moves the current state onto the Redo stack.
 *   - Redo moves the current state back onto the Undo stack.
 *
 * Change this file when:
 *   - history metadata changes;
 *   - bounded history depth is introduced;
 *   - history branching or direct timeline navigation is added;
 *   - snapshot storage strategy changes.
 */

import type {
  OutpostNetwork,
} from './models'

/**
 * Represents one reversible user action.
 *
 * network is the snapshot to restore when traversing toward this entry.
 * label describes the user action responsible for creating the history step.
 */
export interface NetworkHistoryEntry {
  network: OutpostNetwork
  label: string
  timestamp: number
}

/**
 * Stores network states on either side of the application's current state.
 *
 * The most immediately reachable entry is always at the end of each array.
 */
export interface NetworkHistory {
  past: NetworkHistoryEntry[]
  future: NetworkHistoryEntry[]
}

/**
 * Creates an empty history for a new editing session.
 */
export function createNetworkHistory(): NetworkHistory {
  return {
    past: [],
    future: [],
  }
}

/**
 * Records the current network immediately before an undoable user action.
 *
 * A new user action creates a new timeline branch, so any states previously
 * reachable through Redo are discarded.
 *
 * The caller supplies the timestamp so this domain helper remains a pure
 * transformation with no dependency on the current clock.
 */
export function recordUndoableAction(
  history: NetworkHistory,
  currentNetwork: OutpostNetwork,
  label: string,
  timestamp: number,
): NetworkHistory {
  return {
    past: [
      ...history.past,
      {
        network: currentNetwork,
        label,
        timestamp,
      },
    ],
    future: [],
  }
}

/**
 * Result returned when attempting to traverse history.
 *
 * If network is null, no traversal was possible and history is unchanged.
 */
export interface HistoryTraversalResult {
  history: NetworkHistory
  network: OutpostNetwork | null
  label: string | null
}

/**
 * Moves one step backward through network history.
 *
 * The current network becomes the corresponding Redo snapshot, while the
 * latest past snapshot becomes the new current network.
 */
export function undoNetworkChange(
  history: NetworkHistory,
  currentNetwork: OutpostNetwork,
): HistoryTraversalResult {
  const entry =
    history.past.at(-1)

  if (!entry) {
    return {
      history,
      network: null,
      label: null,
    }
  }

  return {
    history: {
      past: history.past.slice(0, -1),

      future: [
        ...history.future,
        {
          network: currentNetwork,
          label: entry.label,
          timestamp: entry.timestamp,
        },
      ],
    },

    network: entry.network,
    label: entry.label,
  }
}

/**
 * Moves one step forward through network history.
 *
 * The current network is placed back on the Undo stack, while the latest
 * future snapshot becomes the new current network.
 */
export function redoNetworkChange(
  history: NetworkHistory,
  currentNetwork: OutpostNetwork,
): HistoryTraversalResult {
  const entry =
    history.future.at(-1)

  if (!entry) {
    return {
      history,
      network: null,
      label: null,
    }
  }

  return {
    history: {
      past: [
        ...history.past,
        {
          network: currentNetwork,
          label: entry.label,
          timestamp: entry.timestamp,
        },
      ],

      future: history.future.slice(0, -1),
    },

    network: entry.network,
    label: entry.label,
  }
}