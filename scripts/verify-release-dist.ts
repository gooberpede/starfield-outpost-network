/** Verify actual outputs, not just the plugin's intention to emit them. */
import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { readBuildIdentity } from './build-identity.ts'

const root = process.cwd()
for (const [source, output] of [['LICENSE', 'legal/LICENSE.txt'], ['THIRD-PARTY-NOTICE.md', 'legal/THIRD-PARTY-NOTICE.txt']]) {
  const expected = readFileSync(source)
  assert.ok(expected.length > 1000)
  assert.deepEqual(readFileSync(path.join('dist', output)), expected)
}
assert.equal(createHash('sha256').update(readFileSync('LICENSE')).digest('hex'),
  '3972dc9744f6499f0f9b2dbf76696f2ae7ad8af9b23dde66d6af86c9dfb36986')
const notice = readFileSync('THIRD-PARTY-NOTICE.md', 'utf8')
for (const name of ['react', 'react-dom', 'scheduler']) {
  assert.ok(notice.includes(readFileSync(`node_modules/${name}/LICENSE`, 'utf8').trim()), name)
}
const viteLicense = readFileSync('node_modules/vite/LICENSE.md', 'utf8')
  .split('# Licenses of bundled dependencies')[0].split('MIT License')[1]
assert.ok(notice.includes(`MIT License${viteLicense}`.trim()))
for (const file of ['LICENSE', 'THIRD-PARTY-LICENSE']) {
  assert.ok(notice.includes(readFileSync(`node_modules/rolldown/${file}`, 'utf8').trim()))
}
for (const name of ['_headers', 'robots.txt', 'favicon-16x16.png', 'favicon-32x32.png']) {
  assert.deepEqual(readFileSync(`dist/${name}`), readFileSync(`public/${name}`))
}
for (const name of ['icons.svg', 'hero.png', 'react.svg', 'vite.svg']) assert.equal(existsSync(`dist/${name}`), false)
const js = readdirSync('dist/assets').filter(name => name.endsWith('.js')).map(name => readFileSync(`dist/assets/${name}`, 'utf8')).join('\n')
for (const marker of ['hero.png', 'react.svg', 'vite.svg', 'icons.svg', 'GNU GENERAL PUBLIC LICENSE', 'CF_PAGES_COMMIT_SHA', root]) {
  assert.equal(js.includes(marker), false, marker)
}
const identity = readBuildIdentity(root)
assert.ok(js.includes(identity.version))
if (identity.commit) assert.ok(js.includes(identity.commit))
if (identity.sourceUrl) assert.ok(js.includes(identity.sourceUrl))
else assert.equal(/https:\/\/github\.com\/gooberpede\/starfield-outpost-network\/tree\/[a-f0-9]{40}/.test(js), false)
assert.ok(js.includes('designed by gravisio from Flaticon'))
console.log('Release outputs: authoritative legal text, upstream MIT notices, identity, retained favicons, security files and unused-asset checks passed.')
