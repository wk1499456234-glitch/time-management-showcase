import { build } from 'esbuild'
import { mkdir, mkdtemp } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'
await mkdir('.test-output', { recursive: true })
const folder = await mkdtemp('.test-output/persistence-')
const outfile = join(folder, 'tests.mjs')
await build({ stdin:{contents:"import './tests/persistence.test.ts'; import './tests/demo.test.ts';",resolveDir:process.cwd(),loader:'ts'}, outfile, bundle:true, platform:'node', format:'esm', packages:'external' })
const result = spawnSync(process.execPath, ['--test', outfile], { stdio:'inherit' })
process.exitCode = result.status ?? 1
