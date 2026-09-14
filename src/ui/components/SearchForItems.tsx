/**
 * Purpose: Render the controlled item combobox and movable non-modal results palette.
 * Architecture: App owns durable presentation state; this component owns only transient drag mechanics.
 * Change this file when: Search interaction, palette presentation, or ARIA behavior changes.
 */
import {
  useId,
  useCallback,
  useLayoutEffect,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react'
import { createPortal } from 'react-dom'
import type { ItemSearchResult, ItemSearchResultFlag } from '../../domain/itemSearchResults.ts'
import type { CargoItem } from '../../domain/models.ts'
import { useLocalization } from '../../localization/LocalizationContext.ts'
import type { ItemSearchEntry } from '../itemSearch.ts'
import {
  beginSearchPaletteDrag,
  clampSearchPalettePosition,
  finishSearchPaletteDrag,
  moveSearchPaletteDrag,
  type PaletteDragSession,
  type PalettePosition,
} from '../itemSearchPosition.ts'
import './SearchForItems.css'

interface Props {
  inputRef: RefObject<HTMLInputElement | null>
  draftQuery: string
  matches: ItemSearchEntry[]
  highlightedMatchKey: string | null
  isAutocompleteOpen: boolean
  submittedItemName: string | null
  results: ItemSearchResult[]
  isResultsOpen: boolean
  palettePosition: PalettePosition | null
  onDraftQueryChange: (query: string) => void
  onHighlightChange: (key: string | null) => void
  onAutocompleteOpenChange: (open: boolean) => void
  onSubmit: (item: CargoItem) => void
  onResultsOpenChange: (open: boolean) => void
  onPalettePositionChange: (position: PalettePosition) => void
  onSelectOutpost: (outpostId: string) => void
}

const flagMessageKeys: Record<ItemSearchResultFlag,
  | 'search.results.flag.present'
  | 'search.results.flag.producing'
  | 'search.results.flag.missingInputs'
  | 'search.results.flag.importing'
  | 'search.results.flag.exporting'
  | 'search.results.flag.plannedSupply'> = {
  present: 'search.results.flag.present',
  producing: 'search.results.flag.producing',
  'missing-inputs': 'search.results.flag.missingInputs',
  importing: 'search.results.flag.importing',
  exporting: 'search.results.flag.exporting',
  'planned-supply': 'search.results.flag.plannedSupply',
}

export function SearchForItems({
  inputRef, draftQuery, matches, highlightedMatchKey, isAutocompleteOpen,
  submittedItemName, results, isResultsOpen, palettePosition,
  onDraftQueryChange, onHighlightChange, onAutocompleteOpenChange, onSubmit,
  onResultsOpenChange, onPalettePositionChange, onSelectOutpost,
}: Props) {
  const { t } = useLocalization()
  const id = useId().replaceAll(':', '')
  const listboxId = `item-search-listbox-${id}`
  const descriptionId = `item-search-description-${id}`
  const paletteTitleId = `item-search-results-${id}`
  const rootRef = useRef<HTMLDivElement>(null)
  const paletteRef = useRef<HTMLElement>(null)
  const outlineRef = useRef<HTMLDivElement>(null)
  const focusResultsAfterSubmitRef = useRef(false)
  const dragRef = useRef<{
    pointerId: number
    offsetLeft: number
    offsetTop: number
    paletteWidth: number
    paletteHeight: number
    session: PaletteDragSession
  } | null>(null)
  const visibleMatches = isAutocompleteOpen ? matches : []
  const highlightedMatch = matches.find((match) => match.key === highlightedMatchKey)
  const submissionCandidate = highlightedMatch ?? (matches.length === 1 ? matches[0] : null)

  function submit(item: CargoItem, focusResults = false) {
    focusResultsAfterSubmitRef.current = focusResults
    onSubmit({ ...item })
    onAutocompleteOpenChange(false)
    onHighlightChange(null)
  }

  function handleInputKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      if (isAutocompleteOpen) {
        event.preventDefault()
        event.stopPropagation()
        onAutocompleteOpenChange(false)
        onHighlightChange(null)
      } else if (isResultsOpen) {
        event.preventDefault()
        event.stopPropagation()
        onResultsOpenChange(false)
      }
      return
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (matches.length === 0) return
      event.preventDefault()
      onAutocompleteOpenChange(true)
      const currentIndex = matches.findIndex((match) => match.key === highlightedMatchKey)
      const nextIndex = event.key === 'ArrowDown'
        ? currentIndex < 0 ? 0 : (currentIndex + 1) % matches.length
        : currentIndex < 0 ? matches.length - 1 : (currentIndex - 1 + matches.length) % matches.length
      onHighlightChange(matches[nextIndex].key)
      return
    }

    if (event.key === 'Enter') {
      if (!submissionCandidate) return
      event.preventDefault()
      submit(submissionCandidate.item, true)
    }
  }

  const clampAndSet = useCallback((position: PalettePosition) => {
    const rect = paletteRef.current?.getBoundingClientRect()
    const clamped = clampSearchPalettePosition(
      position,
      { width: rect?.width ?? 420, height: rect?.height ?? 260 },
      { width: window.innerWidth, height: window.innerHeight },
    )
    if (clamped.left !== palettePosition?.left || clamped.top !== palettePosition.top) {
      onPalettePositionChange(clamped)
    }
  }, [onPalettePositionChange, palettePosition])

  useLayoutEffect(() => {
    if (!isResultsOpen || !palettePosition || !paletteRef.current) return
    const palette = paletteRef.current
    const recover = () => clampAndSet(palettePosition)
    recover()
    window.addEventListener('resize', recover)
    const observer = new ResizeObserver(recover)
    observer.observe(palette)
    return () => {
      window.removeEventListener('resize', recover)
      observer.disconnect()
    }
  }, [clampAndSet, isResultsOpen, palettePosition])

  useLayoutEffect(() => {
    if (!isResultsOpen || !focusResultsAfterSubmitRef.current) return
    focusResultsAfterSubmitRef.current = false
    paletteRef.current?.focus()
  }, [isResultsOpen, palettePosition, submittedItemName])

  function closeResults() {
    onResultsOpenChange(false)
    inputRef.current?.focus()
  }

  function startDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest('button') || !palettePosition) return
    const paletteRect = paletteRef.current?.getBoundingClientRect()
    const outline = outlineRef.current
    if (!paletteRect || !outline) return
    dragRef.current = {
      pointerId: event.pointerId,
      offsetLeft: event.clientX - palettePosition.left,
      offsetTop: event.clientY - palettePosition.top,
      paletteWidth: paletteRect.width,
      paletteHeight: paletteRect.height,
      session: beginSearchPaletteDrag(palettePosition),
    }
    outline.style.left = `${palettePosition.left}px`
    outline.style.top = `${palettePosition.top}px`
    outline.style.width = `${paletteRect.width}px`
    outline.style.height = `${paletteRect.height}px`
    outline.hidden = false
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function moveDrag(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    drag.session = moveSearchPaletteDrag(
      drag.session,
      {
        left: event.clientX - drag.offsetLeft,
        top: event.clientY - drag.offsetTop,
      },
      { width: drag.paletteWidth, height: drag.paletteHeight },
      { width: window.innerWidth, height: window.innerHeight },
    )
    if (outlineRef.current) {
      outlineRef.current.style.left = `${drag.session.outline.left}px`
      outlineRef.current.style.top = `${drag.session.outline.top}px`
    }
  }

  function finishDrag(event: ReactPointerEvent<HTMLDivElement>, cancelled: boolean) {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    dragRef.current = null
    if (outlineRef.current) outlineRef.current.hidden = true
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    if (!cancelled) {
      const committed = finishSearchPaletteDrag(drag.session, false)
      if (committed.left !== palettePosition?.left || committed.top !== palettePosition.top) {
        onPalettePositionChange(committed)
      }
    }
  }

  function moveFromKeyboard(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (!palettePosition || !event.key.startsWith('Arrow')) return
    const movement = event.shiftKey ? 32 : 8
    const delta = {
      ArrowLeft: { left: -movement, top: 0 },
      ArrowRight: { left: movement, top: 0 },
      ArrowUp: { left: 0, top: -movement },
      ArrowDown: { left: 0, top: movement },
    }[event.key]
    if (!delta) return
    event.preventDefault()
    clampAndSet({ left: palettePosition.left + delta.left, top: palettePosition.top + delta.top })
  }

  const palette = isResultsOpen && submittedItemName && palettePosition
    ? createPortal(
        <section
          ref={paletteRef}
          className="item-search-results"
          role="region"
          tabIndex={-1}
          aria-labelledby={paletteTitleId}
          style={{ left: palettePosition.left, top: palettePosition.top }}
          onKeyDown={(event) => {
            if (event.key !== 'Escape') return
            event.preventDefault()
            event.stopPropagation()
            closeResults()
          }}
        >
          <div
            className="item-search-results__title-bar"
            tabIndex={0}
            aria-label={t('search.results.dragInstructions')}
            title={t('search.results.dragInstructions')}
            onKeyDown={moveFromKeyboard}
            onPointerDown={startDrag}
            onPointerMove={moveDrag}
            onPointerUp={(event) => finishDrag(event, false)}
            onPointerCancel={(event) => finishDrag(event, true)}
          >
            <h2 id={paletteTitleId}>{t('search.results.title')}</h2>
            <button
              type="button"
              aria-label={t('search.results.close')}
              title={t('search.results.close')}
              onClick={closeResults}
            >×</button>
          </div>
          <div className="item-search-results__body technical-scrollbar">
            <p className="item-search-results__summary" aria-live="polite">
              {results.length > 0
                ? t('search.results.found', { searchItem: submittedItemName, count: results.length })
                : t('search.results.notFound', { searchItem: submittedItemName })}
            </p>
            {results.map((result) => <div className="item-search-results__row" key={result.outpostId}>
              <button
                type="button"
                className="item-search-results__outpost"
                title={result.outpostName}
                onClick={() => onSelectOutpost(result.outpostId)}
              >{result.outpostName}</button>
              <span className="item-search-results__flags">
                {result.flags.map((flag) => <span className="item-search-results__flag" key={flag}>
                  {t(flagMessageKeys[flag])}
                </span>)}
              </span>
            </div>)}
          </div>
        </section>,
        document.body,
      )
    : null

  return <>
    <div
      ref={rootRef}
      className="item-search"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          onAutocompleteOpenChange(false)
          onHighlightChange(null)
        }
      }}
    >
      <span id={descriptionId} className="item-search__visually-hidden">
        {t('search.input.description')}
      </span>
      <div className="item-search__control">
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-label={t('search.input.label')}
          aria-describedby={descriptionId}
          aria-autocomplete="list"
          aria-expanded={visibleMatches.length > 0}
          aria-controls={listboxId}
          aria-activedescendant={highlightedMatchKey
            ? `item-search-option-${id}-${highlightedMatchKey.replaceAll(':', '-')}`
            : undefined}
          placeholder={t('search.input.placeholder')}
          value={draftQuery}
          onFocus={() => onAutocompleteOpenChange(matches.length > 0)}
          onChange={(event) => {
            onDraftQueryChange(event.target.value)
            onHighlightChange(null)
            onAutocompleteOpenChange(true)
          }}
          onKeyDown={handleInputKeyDown}
        />
        <button
          type="button"
          aria-label={t('search.submit')}
          title={t('search.submit')}
          disabled={!submissionCandidate}
          onClick={() => submissionCandidate && submit(submissionCandidate.item)}
        ><span aria-hidden="true" className="item-search__icon" /></button>
      </div>
      {visibleMatches.length > 0 && <div className="item-search__listbox" id={listboxId} role="listbox">
        {visibleMatches.map((match) => <button
          type="button"
          role="option"
          tabIndex={-1}
          id={`item-search-option-${id}-${match.key.replaceAll(':', '-')}`}
          aria-selected={match.key === highlightedMatchKey}
          className="item-search__option"
          key={match.key}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => submit(match.item)}
        >
          <span>{match.displayName} <small>{match.abbreviation}</small></span>
          {match.needsCategoryDisambiguator && <em>{t(match.category === 'resource'
            ? 'search.autocomplete.resource'
            : 'search.autocomplete.product')}</em>}
        </button>)}
      </div>}
    </div>
    {palette}
    {isResultsOpen && createPortal(
      <div ref={outlineRef} className="item-search-results__drag-outline" hidden aria-hidden="true" />,
      document.body,
    )}
  </>
}
