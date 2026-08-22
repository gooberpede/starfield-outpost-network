import type { Resource } from '../../domain/models'
import type { ResourceId } from '../../domain/referenceData'

interface ProductionEditorProps {
  resources: Resource[]
  localResourceIds: ResourceId[]
  activeProductionIds: ResourceId[]
  onChange: (resourceIds: ResourceId[]) => void
}

export function ProductionEditor({
  resources,
  localResourceIds,
  activeProductionIds,
  onChange,
}: ProductionEditorProps) {
  const localResources = resources.filter((resource) =>
    localResourceIds.includes(resource.id),
  )

  function toggleProduction(resourceId: ResourceId) {
    const isActive = activeProductionIds.includes(resourceId)

    if (isActive) {
      onChange(
        activeProductionIds.filter(
          (activeId) => activeId !== resourceId,
        ),
      )
    } else {
      onChange([...activeProductionIds, resourceId])
    }
  }

  return (
    <section>
      <h2>Active Production</h2>

      {localResources.length === 0 ? (
        <p>No local resources have been selected.</p>
      ) : (
        localResources.map((resource) => (
          <p key={resource.id}>
            <label>
              <input
                type="checkbox"
                checked={activeProductionIds.includes(resource.id)}
                onChange={() => toggleProduction(resource.id)}
              />
              {resource.name} ({resource.shortName})
            </label>
          </p>
        ))
      )}
    </section>
  )
}