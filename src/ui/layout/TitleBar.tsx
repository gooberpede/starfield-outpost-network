/**
 * TitleBar.tsx
 *
 * Purpose:
 *   Displays application identity at the top of the page.
 *
 * Architecture:
 *   The title bar is deliberately separate from the persistent working header.
 *   It participates in normal document scrolling and therefore disappears as
 *   the user moves down into the workspace.
 *
 *   Network-level controls do not belong here; they live in the sticky page
 *   header below.
 *
 * Change this file when:
 *   - application-title presentation changes;
 *   - subtitle, version, or other application-identity information is added;
 *   - title-bar-specific presentation behaviour changes.
 */

import { useId } from 'react'
import './TitleBar.css'
import { useLocalization } from '../../localization/LocalizationContext.ts'
import {
  getLocaleSelectorOptions,
  supportedLocales,
} from '../../localization/locale.ts'
import type { SupportedLocale } from '../../localization/types.ts'

interface TitleBarProps {
  onAbout: () => void
}

export function TitleBar({ onAbout }: TitleBarProps) {
  const localeDescriptionId = useId()
  const {
    automaticLocale,
    locale,
    localeOverride,
    setLocaleOverride,
    t,
  } = useLocalization()
  const closedLabel = supportedLocales.find(({ id }) => id === locale)?.shortLabel ??
    locale.toUpperCase()
  const automaticLabel = supportedLocales.find(({ id }) => id === automaticLocale)?.shortLabel ??
    automaticLocale.toUpperCase()

  return (
    <header className="title-bar">
      <h1>Starfield Outpost Network</h1>
      <label className="title-bar__locale">
        <select
          aria-label={t('locale.selector.label')}
          aria-describedby={localeDescriptionId}
          title={t('locale.selector.current', { locale: closedLabel })}
          value={localeOverride ?? 'automatic'}
          onChange={(event) => {
            const value = event.target.value
            setLocaleOverride(value === 'automatic' ? null : value as SupportedLocale)
          }}
        >
          {getLocaleSelectorOptions(
            automaticLocale,
            t('locale.selector.automatic', { locale: automaticLabel }),
          ).map((option) => (
            <option
              key={option.value}
              value={option.value}
              lang={option.value === 'automatic' ? locale : option.value}
            >
              {option.label}
            </option>
          ))}
        </select>
        <span aria-hidden="true" className="title-bar__locale-label">{closedLabel}</span>
        <span id={localeDescriptionId} className="ui-visually-hidden">
          {t('locale.selector.current', { locale: closedLabel })}
        </span>
      </label>
      <button
        type="button"
        className="title-bar__about"
        onClick={onAbout}
      >
        {t('common.about')}
      </button>
    </header>
  )
}
