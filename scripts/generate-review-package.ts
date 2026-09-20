import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { jaJPMessages } from '../src/localization/locales/ja-JP.ts'
import { deDEReviewDraft } from '../src/localization/reviewDrafts/de-DE.ts'
import { frFRReviewDraft } from '../src/localization/reviewDrafts/fr-FR.ts'
import { createReviewCsv, createReviewRows, createReviewXliff, importReviewXliff } from '../src/localization/reviewPackage.ts'

const args = process.argv.slice(2)
const localeIndex = args.indexOf('--locale')
const locale = localeIndex >= 0 ? args[localeIndex + 1] : 'ja-JP'
if (!locale) throw new Error('Missing value for --locale.')
if (!['ja-JP', 'fr-FR', 'de-DE'].includes(locale)) throw new Error(`Unsupported review locale: ${locale}`)
const translations = locale === 'ja-JP' ? jaJPMessages : locale === 'fr-FR' ? frFRReviewDraft : deDEReviewDraft
const destination = path.resolve(`docs/localization/${locale}-review.csv`)
const xliffDestination = path.resolve(`docs/localization/${locale}-deepl.xliff`)
const importIndex = args.indexOf('--import-xliff')
if (importIndex >= 0) {
  const importPath = args[importIndex + 1]
  if (!importPath) throw new Error('Missing value for --import-xliff.')
  const [reviewSource, xliffSource] = await Promise.all([readFile(destination, 'utf8'), readFile(path.resolve(importPath), 'utf8')])
  const recordInvalidTokens = args.includes('--record-invalid-tokens')
  await writeFile(destination, importReviewXliff(reviewSource, xliffSource, locale, { recordInvalidTokens }), 'utf8')
  console.log(`Imported DeepL translations into ${destination}`)
} else {
  const rows = createReviewRows(locale, translations)
  const writes = [writeFile(destination, createReviewCsv(locale, translations), 'utf8')]
  if (locale !== 'ja-JP') writes.push(writeFile(xliffDestination, createReviewXliff(rows, locale), 'utf8'))
  await Promise.all(writes)
  console.log(`Generated ${destination}`)
  if (locale !== 'ja-JP') console.log(`Generated ${xliffDestination}`)
}
