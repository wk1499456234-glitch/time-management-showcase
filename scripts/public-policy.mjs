import {readFileSync,readdirSync,lstatSync} from 'node:fs'
import {execFileSync} from 'node:child_process'
import {createHash} from 'node:crypto'
import {resolve} from 'node:path'
import assert from 'node:assert/strict'
export const forbidden=[/127\.0\.0\.1/,new RegExp('local'+'host'),new RegExp('51'+'74'),new RegExp('tail'+'scale','i'),/\.ts\.net/,
 new RegExp('OPENAI'+'_API_KEY'),new RegExp('ANTHROPIC'+'_API_KEY'),/sk-[A-Za-z0-9_-]{20,}/,
 /proj_[A-Za-z0-9]{12,}/,/resp_[A-Za-z0-9]{12,}/,/gh[pousr]_[A-Za-z0-9]{20,}/,/[CD]:[\\/](?:Users|PersonalDev)/,
 /[A-Z0-9._%+-]+@gmail\.com/i]
export function scanText(path,raw){
 // Only this fail-closed origin guard in the non-shipped test has an exception.
 if(path==='tests/browser-storage.ts')raw=raw.replace("location.origin !== 'http://"+'127.0.'+'0.1'+":5185'","location.origin !== 'isolated-test-origin'")
 for(const pattern of forbidden)assert.ok(!pattern.test(raw),`${path}: prohibited content ${pattern}`)
}
export function publicFiles(root){
 return execFileSync('git',['ls-files','--cached','--others','--exclude-standard','-z','--','.'],{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean).sort()
}
export function verifySource(root){
 const read=p=>readFileSync(resolve(root,p))
 const manifest=read('PUBLIC-FILES.txt').toString('utf8').trim().split(/\r?\n/)
 assert.equal(new Set(manifest).size,manifest.length,'Duplicate manifest entry')
 assert.deepEqual([...manifest].sort(),publicFiles(root),'Public file set must exactly match Git tracked and non-ignored candidate files')
 for(const path of manifest){
  assert.ok(!path.startsWith('/')&&!path.includes('\\')&&!path.split('/').includes('..'),'Invalid manifest path')
  assert.ok(!/(^|\/)(?:node_modules|dist|\.git|\.local-review|\.test-output|console|server)(\/|$)/.test(path),`Private path: ${path}`)
  assert.ok(!/(?:\.env|\.db$|\.sqlite|\.private\.|backup.*\.json$)/i.test(path),`Data/secret path: ${path}`)
  assert.ok(lstatSync(resolve(root,path)).isFile(),`Missing, linked or non-file entry: ${path}`)
  const bytes=read(path)
  if(/\.(png|jpg|jpeg)$/.test(path)){
   const signature=path.endsWith('.png')?Buffer.from([137,80,78,71,13,10,26,10]):Buffer.from([255,216,255])
   assert.ok(bytes.subarray(0,signature.length).equals(signature),`Image extension mismatch: ${path}`)
  }else{assert.ok(!bytes.includes(0),`Unexpected binary public file: ${path}`);scanText(path,bytes.toString('utf8'))}
 }
 const sums=read('CHECKPOINT.sha256').toString('utf8').trim().split(/\r?\n/).map(line=>line.split('  '))
 assert.deepEqual(sums.map(([,p])=>p).sort(),manifest.filter(p=>p!=='CHECKPOINT.sha256').sort(),'Every public file needs one checksum')
 for(const [hash,path] of sums)assert.equal(createHash('sha256').update(read(path)).digest('hex'),hash,`Changed after review: ${path}`)
 // Commit publishes the index, not merely the files visible in the editor.
 assert.equal(execFileSync('git',['ls-files','--others','--exclude-standard','--','.'],{cwd:root,encoding:'utf8'}).trim(),'','Review and stage new public files before release')
 execFileSync('git',['diff','--exit-code','--quiet','--','.'],{cwd:root,stdio:'pipe'})
 return manifest.length
}
export function verifyBuild(root){
 const walk=p=>readdirSync(resolve(root,p)).flatMap(name=>{const path=`${p}/${name}`,stat=lstatSync(resolve(root,path));assert.ok(!stat.isSymbolicLink());return stat.isDirectory()?walk(path):[path]})
 const built=walk('dist')
 for(const path of built){assert.ok(/\.(html|js|css)$/.test(path),`Unexpected build file: ${path}`);scanText(path,readFileSync(resolve(root,path),'utf8'))}
 const html=readFileSync(resolve(root,'dist/index.html'),'utf8')
 assert.ok(html.includes('./assets/'),'Relative assets required')
 assert.ok(html.includes('Content-Security-Policy')&&html.replaceAll('&#39;',"'").includes("connect-src 'none'"),'Public runtime must disable connections')
 assert.ok(!html.includes('https://'),'No external HTML resources')
 return built.length
}
