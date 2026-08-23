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
  ProductReference,
  ResourceReference,
} from '../../domain/referenceData'

import type {
  ValidationIssue,
} from '../../domain/validation/types'

interface ValidationSummaryProps {
  issues: ValidationIssue[]
  outposts: Outpost[]
  resources: ResourceReference[]
  products: ProductReference[]
}

/**
 * Resolves the stored CargoItem ID in a validation issue to its current
 * reference-data display name.
 *
 * Broken or stale references fall back to their raw ID so validation itself
 * remains useful even when reference data is incomplete.
 */
function getItemName(
  issue: ValidationIssue,
  resources: ResourceReference[],
  products: ProductReference[],
): string | null {
  if (!issue.cargoItem) {
    return null
  }

  if (issue.cargoItem.type === 'resource') {
    return (
      resources.find(
        (resource) =>
          resource.id === issue.cargoItem?.id,
      )?.name ??
      issue.cargoItem.id
    )
  }

  return (
    products.find(
      (product) =>
        product.id === issue.cargoItem?.id,
    )?.name ??
    issue.cargoItem.id
  )
}

/**
 * Builds the human-readable location attached to one validation issue.
 *
 * The domain issue stores stable IDs; display-name resolution belongs here
 * in the presentation layer.
 */
function getIssueContext(
  issue: ValidationIssue,
  outposts: Outpost[],
  resources: ResourceReference[],
  products: ProductReference[],
): string | null {
  const parts: string[] = []

  const outpost =
    issue.outpostId
      ? outposts.find(
          (candidate) =>
            candidate.id === issue.outpostId,
        )
      : undefined

  if (issue.outpostId) {
    parts.push(
      outpost?.name ??
      issue.outpostId,
    )
  }

  if (issue.cargoPadId) {
    const cargoPad =
      outpost?.cargoPads.find(
        (candidate) =>
          candidate.id === issue.cargoPadId,
      )

    parts.push(
      cargoPad?.label ??
      issue.cargoPadId,
    )
  }

  const itemName =
    getItemName(
      issue,
      resources,
      products,
    )

  if (itemName) {
    parts.push(itemName)
  }

  return parts.length > 0
    ? parts.join(' · ')
    : null
}

export function ValidationSummary({
  issues,
  outposts,
  resources,
  products,
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
          <div>
            <strong>Validation</strong>

            <span>
              {' '}
              {errorCount} errors ·{' '}
              {warningCount} warnings ·{' '}
              {infoCount} info
            </span>
          </div>

          {issues.length === 0 ? (
            <p>No validation issues.</p>
          ) : (
            <ul>
              {issues.map((issue, index) => {
                const context =
                  getIssueContext(
                    issue,
                    outposts,
                    resources,
                    products,
                  )

                return (
                  <li
                    key={`${issue.ruleId}-${index}`}
                  >
                    <strong>
                      {issue.severity}
                    </strong>
                    : {issue.message}

                    {context && (
                      <>
                        {' '}
                        — {context}
                      </>
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