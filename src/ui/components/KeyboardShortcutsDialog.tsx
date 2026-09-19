import { useId, useMemo, useRef } from 'react'
import type { MouseEvent } from 'react'
import { useLocalization } from '../../localization/LocalizationContext.ts'
import {
  formatAccessibleShortcutChord,
  getShortcutChordTokens,
  shortcutRegistry,
  type ShortcutActionId,
  type ShortcutGroupId,
} from '../keyboardShortcuts.ts'
import { useModalDialog } from './useModalDialog.ts'
import './KeyboardShortcutsDialog.css'

interface KeyboardShortcutsDialogProps { onClose: () => void }

const groupOrder: readonly ShortcutGroupId[] = ['history', 'search', 'outpost-navigation', 'validation']

export function KeyboardShortcutsDialog({ onClose }: KeyboardShortcutsDialogProps) {
  const { locale, t } = useLocalization()
  const titleId = useId()
  const descriptionId = useId()
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const { dialogRef, handleKeyDown } = useModalDialog({ initialFocusRef: closeButtonRef, onClose })
  const groups = useMemo(() => groupOrder.map((group) => {
    const definitions = shortcutRegistry.filter((definition) => definition.group === group)
    const actions = [...new Set(definitions.map((definition) => definition.action))]
    return { group, groupKey: definitions[0].groupKey, actions }
  }), [])

  function handleBackdropMouseDown(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) event.preventDefault()
  }

  return <div className="shortcuts-dialog__backdrop" onMouseDown={handleBackdropMouseDown}>
    <div ref={dialogRef} className="shortcuts-dialog" role="dialog" aria-modal="true"
      aria-labelledby={titleId} aria-describedby={descriptionId} onKeyDown={handleKeyDown}>
      <header className="shortcuts-dialog__header">
        <h2 id={titleId}>{t('shortcuts.title')}</h2>
        <button type="button" className="shortcuts-dialog__icon-close" aria-label={t('shortcuts.closeDialog')}
          title={t('common.close')} onClick={onClose}>×</button>
      </header>
      <p id={descriptionId} className="shortcuts-dialog__intro">{t('shortcuts.introduction')}</p>
      <div className="shortcuts-dialog__groups">
        {groups.map(({ group, groupKey, actions }) => <section key={group}>
          <h3>{t(groupKey)}</h3>
          <dl>
            {actions.map((action) => <ShortcutRow key={action} action={action} locale={locale} />)}
          </dl>
        </section>)}
      </div>
      <div className="shortcuts-dialog__actions">
        <button ref={closeButtonRef} type="button" onClick={onClose}>{t('common.close')}</button>
      </div>
    </div>
  </div>
}

function ShortcutRow({ action, locale }: { action: ShortcutActionId; locale: 'en-US' | 'en-GB' | 'ja-JP' }) {
  const { t } = useLocalization()
  const definitions = shortcutRegistry.filter((definition) => definition.action === action)
  return <div className="shortcuts-dialog__row">
    <dt>{t(definitions[0].labelKey)}</dt>
    <dd>{definitions.map((definition) => <kbd key={definition.id}
      aria-label={formatAccessibleShortcutChord(definition, locale)}>
      {getShortcutChordTokens(definition).map((token, index) => <span key={`${token}-${index}`}>
        {index > 0 && <span aria-hidden="true"> + </span>}
        <span aria-hidden="true">{token}</span>
      </span>)}
    </kbd>)}</dd>
  </div>
}
