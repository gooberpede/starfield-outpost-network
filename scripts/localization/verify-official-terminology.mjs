#!/usr/bin/env node
import { readFile } from 'node:fs/promises'
import path from 'node:path'

import {
  parseOfficialTerminologyCsv,
  validateOfficialTerminology,
} from './official-terminology.mjs'

const directory = path.resolve('reference-source')
const [policySource, provenanceSource] = await Promise.all([
  readFile(path.join(directory, 'official-terminology-policy.json'), 'utf8'),
  readFile(path.join(directory, 'official-terminology-provenance.csv'), 'utf8'),
])
const result = validateOfficialTerminology(
  JSON.parse(policySource),
  parseOfficialTerminologyCsv(provenanceSource),
)
process.stdout.write(`Validated ${result.rows} official terminology evidence rows across ${result.terms} terms.\n`)
