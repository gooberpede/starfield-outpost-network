import assert from 'node:assert/strict'
import test from 'node:test'

import {
  getSolarEfficiency,
  getWindEfficiency,
} from '../src/domain/powerEfficiency.ts'
import {
  getSolarEfficiencyLabel,
  getWindEfficiencyLabel,
} from '../src/ui/powerEfficiencyPresentation.ts'

test('solar base output maps only to canonical efficiency buckets', () => {
  assert.equal(getSolarEfficiency(2), 'very-poor')
  assert.equal(getSolarEfficiency(4), 'poor')
  assert.equal(getSolarEfficiency(6), 'normal')
  assert.equal(getSolarEfficiency(8), 'good')
  assert.equal(getSolarEfficiency(null), 'unknown')
  assert.equal(getSolarEfficiency(7), 'unknown')
})

test('wind base output maps only to canonical efficiency buckets', () => {
  assert.equal(getWindEfficiency(0), 'none')
  assert.equal(getWindEfficiency(3), 'poor')
  assert.equal(getWindEfficiency(6), 'normal')
  assert.equal(getWindEfficiency(10), 'good')
  assert.equal(getWindEfficiency(null), 'unknown')
  assert.equal(getWindEfficiency(7), 'unknown')
})

test('efficiency buckets use compact qualitative display labels', () => {
  assert.equal(getSolarEfficiencyLabel('very-poor'), 'V.Poor')
  assert.equal(getSolarEfficiencyLabel('normal'), 'Norm.')
  assert.equal(getSolarEfficiencyLabel('unknown'), '—')
  assert.equal(getWindEfficiencyLabel('none'), 'None')
  assert.equal(getWindEfficiencyLabel('normal'), 'Norm.')
  assert.equal(getWindEfficiencyLabel('unknown'), '—')
})
