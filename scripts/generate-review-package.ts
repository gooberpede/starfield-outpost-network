import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { createReviewCsv, createReviewRows, createReviewXliff, importReviewXliff } from '../src/localization/reviewPackage.ts'
import { reviewRouteForLocale } from './localization/review-routing.ts'

const args = process.argv.slice(2)
const localeIndex = args.indexOf('--locale')
const localeValue = localeIndex >= 0 ? args[localeIndex + 1] : 'ja-JP'
if (!localeValue) throw new Error('Missing value for --locale.')
const { locale, artifacts, source } = reviewRouteForLocale(localeValue)
const destination = path.resolve(artifacts.review)
const xliffDestination = path.resolve(artifacts.xliff)
const importIndex = args.indexOf('--import-xliff')
if (importIndex >= 0) {
  const importPath = args[importIndex + 1]
  if (!importPath) throw new Error('Missing value for --import-xliff.')
  const [reviewSource, xliffSource] = await Promise.all([readFile(destination, 'utf8'), readFile(path.resolve(importPath), 'utf8')])
  const recordInvalidTokens = args.includes('--record-invalid-tokens')
  await writeFile(destination, importReviewXliff(reviewSource, xliffSource, locale, { recordInvalidTokens }), 'utf8')
  console.log(`Imported DeepL translations into ${destination}`)
} else {
  const rows = createReviewRows(locale, source.translations)
  const writes = [writeFile(destination, createReviewCsv(locale, source.translations), 'utf8')]
  if (source.createXliff) writes.push(writeFile(xliffDestination, createReviewXliff(rows, locale), 'utf8'))
  await Promise.all(writes)
  console.log(`Generated ${destination}`)
  if (source.createXliff) console.log(`Generated ${xliffDestination}`)
}
