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
  onChange: (resourceIds: ResourceId[]) => void
  onActiveProductionChange: (resourceIds: ResourceId[]) => void
}

export function ResourceEditor({
  resources,
  selectedResourceIds,
  activeProductionIds,
  onChange,
  onActiveProductionChange,
}: ResourceEditorProps) {
  /**
   * Adds or removes a resource from this outpost site's local resources.
   *
   * Removing a local resource also removes it from active production because
   * an extractor or farm cannot continue producing something that is no
   * longer recorded as present at the site.
   */
  function toggleResource(resourceId: ResourceId) {
    const isSelected =
      selectedResourceIds.includes(resourceId)

    if (isSelected) {
      onChange(
        selectedResourceIds.filter(
          (selectedId) =>
            selectedId !== resourceId,
        ),
      )

      if (
        activeProductionIds.includes(
          resourceId,
        )
      ) {
        onActiveProductionChange(
          activeProductionIds.filter(
            (activeId) =>
              activeId !== resourceId,
          ),
        )
      }

      return
    }

    onChange([
      ...selectedResourceIds,
      resourceId,
    ])
  }

  /**
   * Toggles extraction/farming for one resource already present at this
   * outpost site.
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

    const isActive =
      activeProductionIds.includes(
        resourceId,
      )

    if (isActive) {
      onActiveProductionChange(
        activeProductionIds.filter(
          (activeId) =>
            activeId !== resourceId,
        ),
      )
    } else {
      onActiveProductionChange([
        ...activeProductionIds,
        resourceId,
      ])
    }
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