import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

import { createJapaneseReviewCsv } from '../src/localization/japaneseReviewPackage.ts'

const destination = fileURLToPath(
  new URL('../docs/localization/ja-JP-review-source.csv', import.meta.url),
)

await writeFile(destination, createJapaneseReviewCsv(), 'utf8')
console.log(`Generated ${destination}`)
