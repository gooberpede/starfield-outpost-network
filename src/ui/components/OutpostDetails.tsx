/**
 * OutpostDetails.tsx
 *
 * Purpose:
 *   Edits the basic identity and location of the currently selected outpost.
 *
 * Architecture:
 *   This component presents the outpost name as an editable heading above a
 *   compact location strip. Layout-specific styling is delegated to
 *   OutpostDetails.css, while selection and persistence remain upstream.
 *
 * Change this file when:
 *   - outpost identity/location fields change;
 *   - the semantic structure of the details strip changes.
 */

import {
  useState,
} from 'react'

import type {
  Outpost,
} from '../../domain/models'

import {
  getSolarEfficiency,
  getWindEfficiency,
} from '../../domain/powerEfficiency'

import type {
  BodyBiomeId,
  PlanetaryBodyReference,
  StarSystemReference,
} from '../../domain/referenceData'
import type { BiomeButtonGroup } from '../../domain/bodyResourceAvailability.ts'

import {
  getSolarEfficiencyLabel,
  getWindEfficiencyLabel,
} from '../powerEfficiencyPresentation'
import { contextHelpText } from '../contextHelpText'
import { getPowerEfficiencyTooltip } from '../statusTooltips'
import { ContextHelp } from './ContextHelp'
import { useLocalization } from '../../localization/LocalizationContext.ts'
import { getReferenceDisplayName } from '../../localization/referenceNames.ts'
import { getBiomeGroupDisplayName } from '../biomePresentation.ts'

import './OutpostDetails.css'

interface OutpostDetailsProps {
  outpost: Outpost
  systems: StarSystemReference[]
  bodies: PlanetaryBodyReference[]
  biomeGroups: BiomeButtonGroup[]
  onNameCommit: (
    name: string,
  ) => void
  onSystemChange: (
    systemId: string,
  ) => void
  onBodyChange: (
    bodyId: string,
  ) => void
  onBiomeGroupToggle: (bodyBiomeIds: BodyBiomeId[]) => void
}

interface OutpostNameFieldProps {
  name: string
  onCommit: (name: string) => void
}

/**
 * Owns one outpost-name editing session. Its parent keys the field by outpost
 * identity and authoritative name so navigation and Undo/Redo reset the draft.
 */
function OutpostNameField({
  name,
  onCommit,
}: OutpostNameFieldProps) {
  const { t } = useLocalization()
  const [draftName, setDraftName] =
    useState(name)

  return (
    <input
      className="outpost-details__name"
      type="text"
      aria-label={t('outpost.name.label')}
      value={draftName}
      onChange={(event) =>
        setDraftName(event.target.value)
      }
      onBlur={() => {
        if (draftName !== name) {
          onCommit(draftName)
        }
      }}
    />
  )
}

export function OutpostDetails({
  outpost,
  systems,
  bodies,
  biomeGroups,
  onNameCommit,
  onSystemChange,
  onBodyChange,
  onBiomeGroupToggle,
}: OutpostDetailsProps) {
  const { locale, t } = useLocalization()
  const eligibleBodies = bodies.filter(
    (body) => body.outpostAllowed,
  )
  const eligibleSystemIds = new Set(
    eligibleBodies.map((body) => body.systemId),
  )
  const currentSystem = systems.find(
    (system) => system.id === outpost.systemId,
  )
  const availableSystems = systems.filter(
    (system) =>
      eligibleSystemIds.has(system.id) ||
      system.id === outpost.systemId,
  )
  const currentBody = bodies.find(
    (body) => body.id === outpost.bodyId,
  )
  const solarOutput = currentBody?.solarArrayPower ?? null
  const windOutput = currentBody?.windTurbinePower ?? null
  const solarEfficiency = getSolarEfficiency(solarOutput)
  const windEfficiency = getWindEfficiency(windOutput)
  const solarEfficiencyLabel = getSolarEfficiencyLabel(solarEfficiency, locale)
  const windEfficiencyLabel = getWindEfficiencyLabel(windEfficiency, locale)
  const availableBodies = eligibleBodies.filter(
    (body) => body.systemId === outpost.systemId,
  )

  if (
    currentBody &&
    !availableBodies.some((body) => body.id === currentBody.id)
  ) {
    availableBodies.push(currentBody)
  }

  return (
    <section className="outpost-details">
      <OutpostNameField
        key={`${outpost.id}:${outpost.name}`}
        name={outpost.name}
        onCommit={onNameCommit}
      />

      <div className="outpost-details__fields">
        <label className="outpost-details__field">
          <span>{t('outpost.system.label')}</span>

          <select
            value={outpost.systemId}
            onChange={(event) =>
              onSystemChange(
                event.target.value,
              )
            }
          >
            <option value="">
              {t('outpost.system.select')}
            </option>

            {outpost.systemId && !currentSystem && (
              <option value={outpost.systemId}>
                {outpost.systemId}
              </option>
            )}

            {availableSystems.map((system) => (
              <option
                key={system.id}
                value={system.id}
              >
                {getReferenceDisplayName('system', system.id, system.name, locale)}
              </option>
            ))}
          </select>
        </label>

        <label className="outpost-details__field">
          <span>{t('outpost.body.label')}</span>

          <select
            value={outpost.bodyId}
            disabled={!outpost.systemId}
            onChange={(event) =>
              onBodyChange(
                event.target.value,
              )
            }
          >
            <option value="">
              {t('outpost.body.select')}
            </option>

            {outpost.bodyId && !currentBody && (
              <option value={outpost.bodyId}>
                {outpost.bodyId}
              </option>
            )}

            {availableBodies.map((body) => (
              <option
                key={body.id}
                value={body.id}
              >
                {getReferenceDisplayName('body', body.id, body.name, locale)}
              </option>
            ))}
          </select>
        </label>

        <div className="outpost-details__field outpost-details__efficiency">
          <span>{t('outpost.solar.label')}</span>
          <output
            tabIndex={0}
            title={getPowerEfficiencyTooltip(t('outpost.solar.label'), solarEfficiency, solarOutput, locale)}
            aria-label={getPowerEfficiencyTooltip(t('outpost.solar.label'), solarEfficiency, solarOutput, locale)}
          >{solarEfficiencyLabel}</output>
        </div>

        <div className="outpost-details__field outpost-details__efficiency">
          <span>{t('outpost.wind.label')}</span>
          <output
            tabIndex={0}
            title={getPowerEfficiencyTooltip(t('outpost.wind.label'), windEfficiency, windOutput, locale)}
            aria-label={getPowerEfficiencyTooltip(t('outpost.wind.label'), windEfficiency, windOutput, locale)}
          >{windEfficiencyLabel}</output>
        </div>

        <div className="outpost-details__field outpost-details__biomes">
          <span className="outpost-details__field-label">
            {t('outpost.biomes.label')}
            <ContextHelp context={t('outpost.biomes.label')} text={t(contextHelpText.biomes)} />
          </span>
          <div className="outpost-details__biome-buttons">
            {biomeGroups.map((group) => {
              const pressed = outpost.selectedBiomeIds.length > 0 &&
                group.bodyBiomeIds.every((id) => outpost.selectedBiomeIds.includes(id))
              return (
                <button
                  key={group.key}
                  type="button"
                  aria-pressed={pressed}
                  onClick={() => onBiomeGroupToggle(group.bodyBiomeIds)}
                >
                  {getBiomeGroupDisplayName(group, locale)}
                </button>
              )
            })}
          </div>
        </div>

      </div>
    </section>
  )
}
