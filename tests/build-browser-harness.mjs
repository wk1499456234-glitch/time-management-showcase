import { build } from 'esbuild'
import { mkdir, writeFile } from 'node:fs/promises'
await mkdir('.test-output/browser', { recursive:true })
await build({ entryPoints:['tests/browser-storage.ts'], outfile:'.test-output/browser/check.js', bundle:true, platform:'browser', format:'esm' })
await writeFile('.test-output/browser/index.html','<!doctype html><meta charset="UTF-8"><title>隔离存储验收</title><h1>时间管理浏览器存储定向测试</h1><p>仅操作 5185 隔离来源的随机测试键，结束自动清理。不会访问 5174 用户数据。</p><button>运行隔离存储验收</button><pre>尚未运行</pre><script type="module" src="/check.js"></script>')
