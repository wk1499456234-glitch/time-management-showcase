import { readFileSync, readdirSync, statSync } from 'node:fs'
import assert from 'node:assert/strict'
const walk = root => readdirSync(root).flatMap(name => {const path=`${root}/${name}`; return statSync(path).isDirectory() ? walk(path) : [path]})
const built=walk('dist')
const forbidden = [/127\.0\.0\.1/, /localhost/, /5174/, /tailscale/i, /\.ts\.net/, /OPENAI_API_KEY/, /ANTHROPIC_API_KEY/, /sk-[A-Za-z0-9_-]{20,}/, /gh[pousr]_[A-Za-z0-9]{20,}/, /[CD]:[\\/](?:Users|PersonalDev)/]
for(const path of [...built,...walk('src')]) {
  const raw=readFileSync(path,'utf8')
  for(const pattern of forbidden) assert.ok(!pattern.test(raw),`${path}: prohibited pattern ${pattern}`)
}
for(const path of built) assert.ok(/\.(html|js|css)$/.test(path),`Unexpected build file: ${path}`)
const html=readFileSync('dist/index.html','utf8')
assert.ok(html.includes('./assets/'),'Relative assets required')
assert.ok(html.includes('Content-Security-Policy'),'CSP required')
assert.ok(!html.includes('https://'),'No external HTML resources')
const manifest=readFileSync('PUBLIC-FILES.txt','utf8').trim().split(/\r?\n/)
for(const path of manifest) {
 assert.ok(!/(^|\/)(?:node_modules|dist|\.git|\.local-review|\.test-output|console|server)(\/|$)/.test(path),`Private path: ${path}`)
 assert.ok(!/(?:\.env|\.db$|\.sqlite|backup.*\.json$)/i.test(path),`Data/secret path: ${path}`)
 assert.ok(statSync(path).isFile(),`Missing public file: ${path}`)
}
console.log(`PASS: ${built.length} static assets, ${manifest.length} public files; no private endpoints/credential patterns. Pattern checks are not a universal secret detector.`)
