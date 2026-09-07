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
  useState,
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

interface ValidationSummaryProps {
  issues: ValidationIssue[]
  outposts: Outpost[]
  referenceData: ReferenceData | null
}

export function ValidationSummary({
  issues,
  outposts,
  referenceData,
}: ValidationSummaryProps) {
  const [isOpen, setIsOpen] =
    useState(false)

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

  const sortedIssues = sortValidationIssues(issues)

  return (
    <div className="validation-summary">
      <button
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

      {isOpen && (
        <div className="validation-summary-panel">
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
              {sortedIssues.map((issue, index) => {
                const presentation = getValidationIssuePresentation(
                  issue,
                  outposts,
                  referenceData,
                )

                return (
                  <li
                    key={`${issue.ruleId}-${index}`}
                    className={`validation-summary-panel__issue validation-summary-panel__issue--${issue.severity}`}
                    aria-label={`${issue.severity} issue`}
                  >
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
