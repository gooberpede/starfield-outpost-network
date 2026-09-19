import { writeFile } from 'node:fs/promises'
import path from 'node:path'

import { jaJPMessages } from '../src/localization/locales/ja-JP.ts'
import { createReviewCsv } from '../src/localization/reviewPackage.ts'

const args = process.argv.slice(2)
const localeIndex = args.indexOf('--locale')
const locale = localeIndex >= 0 ? args[localeIndex + 1] : 'ja-JP'
if (!locale) throw new Error('Missing value for --locale.')
if (!['ja-JP', 'fr-FR', 'de-DE'].includes(locale)) throw new Error(`Unsupported review locale: ${locale}`)
const translations = locale === 'ja-JP' ? jaJPMessages : {}
const destination = path.resolve(`docs/localization/${locale}-review.csv`)
await writeFile(destination, createReviewCsv(locale, translations), 'utf8')
console.log(`Generated ${destination}`)
