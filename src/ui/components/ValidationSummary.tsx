/**
 * ValidationSummary.tsx
 *
 * Purpose:
 *   Presents the application's current validation status as a persistent
 *   counter and an expandable human-readable issue summary.
 *
 * Architecture:
 *   Validation logic remains entirely in the domain layer. This component
 *   receives already-produced ValidationIssue objects and resolves their
 *   stored IDs into display names for the user.
 *
 *   The open/closed state is UI-only and is not persisted in the network.
 *
 * Change this file when:
 *   - validation summary presentation changes;
 *   - issue context needs richer human-readable labels;
 *   - severity/category presentation is expanded;
 *   - summary interaction changes.
 */

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import type {
  KeyboardEvent as ReactKeyboardEvent,
} from 'react'

import './ValidationSummary.css'

import type {
  Outpost,
} from '../../domain/models'

import type {
  ReferenceData,
} from '../../domain/referenceData'

import type {
  ValidationIssue,
} from '../../domain/validation/types'

import {
  getValidationIssuePresentation,
  sortValidationIssues,
} from '../validationPresentation'

import {
  activateValidationIssue,
  getValidationIssueIdentity,
  getValidationRovingIndex,
  handleValidationShortcut,
  isValidationActivationKey,
  isValidationIssueActionable,
} from '../validationInteraction'
import { contextHelpText } from '../contextHelpText'
import { ContextHelp } from './ContextHelp'

interface ValidationSummaryProps {
  issues: ValidationIssue[]
  outposts: Outpost[]
  referenceData: ReferenceData | null
  onNavigateToIssue: (issue: ValidationIssue) => void
}

export function ValidationSummary({
  issues,
  outposts,
  referenceData,
  onNavigateToIssue,
}: ValidationSummaryProps) {
  const [isOpen, setIsOpen] =
    useState(false)
  const [activeIssueKey, setActiveIssueKey] =
    useState<string | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const issueRefs = useRef(new Map<string, HTMLButtonElement>())
  const previousActionableKeysRef = useRef<string[]>([])
  const focusIssueAfterOpenRef = useRef(false)
  const issueListHadFocusRef = useRef(false)

  const errorCount =
    issues.filter(
      (issue) =>
        issue.severity === 'error',
    ).length

  const warningCount =
    issues.filter(
      (issue) =>
        issue.severity === 'warning',
    ).length

  const infoCount =
    issues.filter(
      (issue) =>
        issue.severity === 'info',
    ).length

  const validOutpostIds = useMemo(
    () => new Set(outposts.map((outpost) => outpost.id)),
    [outposts],
  )

  const keyedIssues = useMemo(() => {
    const occurrenceCounts = new Map<string, number>()

    return sortValidationIssues(issues).map((issue) => {
      const identity = getValidationIssueIdentity(issue)
      const occurrence = occurrenceCounts.get(identity) ?? 0
      occurrenceCounts.set(identity, occurrence + 1)

      return {
        issue,
        key: `${identity}:${occurrence}`,
        actionable: isValidationIssueActionable(issue, validOutpostIds),
      }
    })
  }, [issues, validOutpostIds])

  const actionableKeys = useMemo(
    () => keyedIssues
      .filter((entry) => entry.actionable)
      .map((entry) => entry.key),
    [keyedIssues],
  )
  const effectiveActiveIssueKey = activeIssueKey && actionableKeys.includes(activeIssueKey)
    ? activeIssueKey
    : actionableKeys[0] ?? null

  useEffect(() => {
    function handleGlobalShortcut(event: KeyboardEvent) {
      handleValidationShortcut(event, () => {
        if (isOpen) {
          if (panelRef.current?.contains(document.activeElement)) {
            triggerRef.current?.focus()
          }
          focusIssueAfterOpenRef.current = false
          setIsOpen(false)
        } else {
          focusIssueAfterOpenRef.current = true
          setIsOpen(true)
        }
      })
    }

    document.addEventListener('keydown', handleGlobalShortcut)
    return () => document.removeEventListener('keydown', handleGlobalShortcut)
  }, [isOpen])

  useLayoutEffect(() => {
    if (!isOpen || !focusIssueAfterOpenRef.current) return

    focusIssueAfterOpenRef.current = false
    if (effectiveActiveIssueKey) {
      issueRefs.current.get(effectiveActiveIssueKey)?.focus()
    } else {
      triggerRef.current?.focus()
    }
  }, [effectiveActiveIssueKey, isOpen])

  useLayoutEffect(() => {
    const previousKeys = previousActionableKeysRef.current
    previousActionableKeysRef.current = actionableKeys

    if (!activeIssueKey || actionableKeys.includes(activeIssueKey)) return

    const previousIndex = Math.max(previousKeys.indexOf(activeIssueKey), 0)
    const fallbackKey = actionableKeys[
      Math.min(previousIndex, actionableKeys.length - 1)
    ] ?? null
    setActiveIssueKey(fallbackKey)

    if (issueListHadFocusRef.current) {
      if (fallbackKey) {
        issueRefs.current.get(fallbackKey)?.focus()
      } else {
        issueListHadFocusRef.current = false
        triggerRef.current?.focus()
      }
    }
  }, [actionableKeys, activeIssueKey])

  function focusActionableIssue(key: string) {
    setActiveIssueKey(key)
    issueRefs.current.get(key)?.focus()
  }

  function activateIssue(issue: ValidationIssue) {
    activateValidationIssue(issue, validOutpostIds, onNavigateToIssue)
  }

  function handleIssueKeyDown(
    event: ReactKeyboardEvent<HTMLButtonElement>,
    issueKey: string,
    issue: ValidationIssue,
  ) {
    if (event.key === 'Escape') {
      event.preventDefault()
      issueListHadFocusRef.current = false
      triggerRef.current?.focus()
      return
    }

    if (isValidationActivationKey(event.key)) {
      event.preventDefault()
      activateIssue(issue)
      return
    }

    if (
      event.key !== 'ArrowDown' &&
      event.key !== 'ArrowUp' &&
      event.key !== 'Home' &&
      event.key !== 'End'
    ) {
      return
    }

    event.preventDefault()
    const currentIndex = actionableKeys.indexOf(issueKey)
    const targetIndex = getValidationRovingIndex(
      currentIndex,
      event.key,
      actionableKeys.length,
    )
    if (targetIndex !== null) focusActionableIssue(actionableKeys[targetIndex])
  }

  return (
    <div className="validation-summary">
      <div className="validation-summary__controls">
        <button
          ref={triggerRef}
          type="button"
          onClick={() =>
            setIsOpen((current) => !current)
          }
          aria-expanded={isOpen}
        >
          Validation: {issues.length}{' '}
          {issues.length === 1
            ? 'issue'
            : 'issues'}
        </button>
        <ContextHelp context="Validation" text={contextHelpText.validation} />
      </div>

      {isOpen && (
        <div
          ref={panelRef}
          className="validation-summary-panel"
          onBlur={(event) => {
            if (
              event.relatedTarget &&
              !panelRef.current?.contains(event.relatedTarget)
            ) {
              issueListHadFocusRef.current = false
            }
          }}
        >
          <div className="validation-summary-panel__header">
            <strong>Validation</strong>
            <span>
              {errorCount} errors ·{' '}
              {warningCount} warnings ·{' '}
              {infoCount} info
            </span>
          </div>

          {issues.length === 0 ? (
            <p className="validation-summary-panel__empty">No validation issues.</p>
          ) : (
            <ul className="validation-summary-panel__issues technical-scrollbar">
              {keyedIssues.map(({ issue, key, actionable }) => {
                const presentation = getValidationIssuePresentation(
                  issue,
                  outposts,
                  referenceData,
                )

                return (
                  <li
                    key={key}
                    className={`validation-summary-panel__issue validation-summary-panel__issue--${issue.severity}${actionable ? ' validation-summary-panel__issue--actionable' : ''}`}
                  >
                    {actionable ? (
                      <button
                        ref={(element) => {
                          if (element) issueRefs.current.set(key, element)
                          else issueRefs.current.delete(key)
                        }}
                        type="button"
                        className="validation-summary-panel__issue-action"
                        tabIndex={key === effectiveActiveIssueKey ? 0 : -1}
                        onClick={() => activateIssue(issue)}
                        onFocus={() => {
                          issueListHadFocusRef.current = true
                          setActiveIssueKey(key)
                        }}
                        onKeyDown={(event) => handleIssueKeyDown(event, key, issue)}
                      >
                        <IssueContent presentation={presentation} />
                      </button>
                    ) : (
                      <div className="validation-summary-panel__issue-content">
                        <IssueContent presentation={presentation} />
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

function IssueContent({
  presentation,
}: {
  presentation: ReturnType<typeof getValidationIssuePresentation>
}) {
  return (
    <>
      {presentation.context && (
        <div className="validation-summary-panel__context">
          {presentation.context}
        </div>
      )}
      <div className="validation-summary-panel__message">
        {presentation.message}
      </div>
      {presentation.remediation && (
        <div className="validation-summary-panel__remediation">
          {presentation.remediation}
        </div>
      )}
    </>
  )
}
