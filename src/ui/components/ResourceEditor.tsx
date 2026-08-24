/**
 * ResourceEditor.tsx
 *
 * Purpose:
 *   Records which planetary resources are present at the selected outpost
 *   site and which of those resources are currently being produced.
 *
 * Architecture:
 *   Local-resource presence and active production remain separate domain
 *   concepts, but are presented together in one compact UI.
 *
 *   A resource may be:
 *   - available on the planetary body but not present at this outpost site;
 *   - present at the outpost site but not actively produced;
 *   - present and actively extracted/farmed.
 *
 * Change this file when:
 *   - local-resource selection UX changes;
 *   - active-production controls become more sophisticated;
 *   - extraction and farming need to be presented differently.
 */

import type { Resource } from '../../domain/models'
import type { ResourceId } from '../../domain/referenceData'

interface ResourceEditorProps {
  resources: Resource[]
  selectedResourceIds: ResourceId[]
  activeProductionIds: ResourceId[]
  onToggleResource: (resourceId: ResourceId) => void
  onToggleActiveProduction: (
    resourceId: ResourceId,
  ) => void
}

export function ResourceEditor({
  resources,
  selectedResourceIds,
  activeProductionIds,
  onToggleResource,
  onToggleActiveProduction,
  }: ResourceEditorProps) {

  /**
   * Requests addition or removal of one resource from this outpost site.
   *
   * The application layer owns the complete persisted mutation because
   * removing a local resource may also remove it from active production.
   * Treating those effects together allows Undo/Redo to restore them as one
   * semantic action.
   */
  function toggleResource(
    resourceId: ResourceId,
  ) {
    onToggleResource(resourceId)
  }

  /**
   * Requests activation or deactivation of production for one local resource.
   *
   * The application layer owns the persisted mutation because enabling
   * production may also retire a matching Planned Supply placeholder.
   * Keeping those effects together allows Undo/Redo to restore them atomically.
   */
  function toggleActiveProduction(
    resourceId: ResourceId,
  ) {
    if (
      !selectedResourceIds.includes(
        resourceId,
      )
    ) {
      return
    }

    onToggleActiveProduction(
      resourceId,
    )
  }

  const inorganicResources =
    resources.filter(
      (resource) =>
        resource.category === 'inorganic',
    )

  const organicResources =
    resources.filter(
      (resource) =>
        resource.category === 'organic',
    )

  /**
   * Renders one resource row with separate controls for local presence and
   * active production.
   */
  function renderResource(
    resource: Resource,
  ) {
    const isLocal =
      selectedResourceIds.includes(
        resource.id,
      )

    const isActive =
      activeProductionIds.includes(
        resource.id,
      )

    return (
      <p key={resource.id}>
        <label>
          <input
            type="checkbox"
            checked={isLocal}
            onChange={() =>
              toggleResource(resource.id)
            }
          />
          {resource.name} ({resource.shortName})
        </label>

        {' '}

        <label>
          <input
            type="checkbox"
            checked={isActive}
            disabled={!isLocal}
            onChange={() =>
              toggleActiveProduction(
                resource.id,
              )
            }
          />
          Producing
        </label>
      </p>
    )
  }

  return (
    <section>
      <h2>Local Resources</h2>

      <h3>Inorganic</h3>

      {inorganicResources.map(
        renderResource,
      )}

      {organicResources.length > 0 && (
        <>
          <h3>Organic</h3>

          {organicResources.map(
            renderResource,
          )}
        </>
      )}
    </section>
  )
}