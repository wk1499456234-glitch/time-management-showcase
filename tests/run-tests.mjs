import { build } from 'esbuild'
import { mkdir, mkdtemp } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'
await mkdir('.test-output', { recursive: true })
const folder = await mkdtemp('.test-output/persistence-')
const outfile = join(folder, 'tests.mjs')
await build({ stdin:{contents:"import './tests/persistence.test.ts'; import './tests/demo.test.ts'; import './tests/comparison.test.ts'; import './tests/save-recovery.test.ts'; import './tests/timezone.test.ts';",resolveDir:process.cwd(),loader:'ts'}, outfile, bundle:true, platform:'node', format:'esm', packages:'external' })
const result = spawnSync(process.execPath, ['--test', outfile], { stdio:'inherit' })
process.exitCode = result.status ?? 1
const policy=spawnSync(process.execPath,['--test','tests/public-policy.test.mjs'],{stdio:'inherit'})
if(policy.status!==0)process.exitCode=1
for(const zone of ['Asia/Tokyo','Asia/Shanghai','UTC']){
 const check=spawnSync(process.execPath,['--test','--test-name-pattern=Tokyo midnight',outfile],{stdio:'inherit',env:{...process.env,TZ:zone}})
 console.log(`Device zone checked: ${zone}`)
 if(check.status!==0)process.exitCode=1
}
