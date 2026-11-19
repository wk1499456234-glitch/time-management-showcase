import {readFileSync, readdirSync, statSync, writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
const excluded=new Set(['node_modules','dist','.git','.test-output','.local-review','vite.config.js','vite.config.d.ts'])
function walk(root='.') {return readdirSync(root).flatMap(name=>{
 if(excluded.has(name)||name.endsWith('.tsbuildinfo'))return []
 const p=root==='.'?name:`${root}/${name}`
 return statSync(p).isDirectory()?walk(p):[p]
})}
const files=walk().sort()
writeFileSync('PUBLIC-FILES.txt',files.join('\n')+'\n')
writeFileSync('CHECKPOINT.sha256',files.filter(p=>p!=='CHECKPOINT.sha256').map(p=>`${createHash('sha256').update(readFileSync(p)).digest('hex')}  ${p}`).join('\n')+'\n')
console.log(`Reviewed candidate manifest: ${files.length} files. Review before publishing.`)
