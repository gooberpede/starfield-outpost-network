import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import { translate } from '../src/localization/catalog.ts'
import { getCompactDisplayText } from '../src/localization/compactDisplay.ts'

test('approved compact display copy is locale- and surface-specific', () => {
  assert.equal(getCompactDisplayText('pl-PL', 'outpost-details.solar-heading'), 'Słońce')
  assert.equal(getCompactDisplayText('pl-PL', 'outpost-details.wind-heading'), 'Wiatr')
  assert.equal(getCompactDisplayText('fr-FR', 'item-search.placeholder'), 'Rechercher…')
  assert.equal(getCompactDisplayText('de-DE', 'item-search.placeholder'), 'Suchen…')

  assert.equal(
    getCompactDisplayText('fr-FR', 'outpost-details.solar-heading'),
    translate('fr-FR', 'outpost.solar.label'),
  )
  assert.equal(
    getCompactDisplayText('pl-PL', 'item-search.placeholder'),
    translate('pl-PL', 'search.input.placeholder'),
  )
})

test('compact display copy leaves full semantic catalogue messages unchanged', () => {
  assert.equal(translate('pl-PL', 'outpost.solar.label'), 'Energia słoneczna')
  assert.equal(translate('pl-PL', 'outpost.wind.label'), 'Energia wiatrowa')
  assert.equal(
    translate('fr-FR', 'search.input.placeholder'),
    'Rechercher des ressources ou des produits',
  )
  assert.equal(
    translate('de-DE', 'search.input.placeholder'),
    'Ressourcen oder Produkte suchen',
  )
})

test('power indicator forced-colors rules preserve structural state cues', async () => {
  const css = await readFile(
    new URL('../src/ui/components/OutpostDetails.css', import.meta.url),
    'utf8',
  )
  assert.match(css, /@media \(forced-colors: active\)/)
  assert.match(css, /\.power-efficiency-indicator__segment\[data-filled='true'\]/)
  assert.match(css, /\.power-efficiency-indicator__none-marker/)
  assert.match(css, /\.power-efficiency-indicator__unknown-marker/)
  assert.match(css, /CanvasText/)
  assert.match(css, /Highlight/)
})
