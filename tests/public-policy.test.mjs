import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {execFileSync} from 'node:child_process'
import {createHash} from 'node:crypto'
import {scanText,verifySource} from '../scripts/public-policy.mjs'
test('scripts, workflows and text are scanned; exception is exact and bounded',()=>{
 for(const p of ['scripts/a.mjs','.github/workflows/a.yml','note.txt'])for(const raw of ['sk-'+'x'.repeat(25),'https://home.'+'ts.net','OPENAI'+'_API_KEY'])assert.throws(()=>scanText(p,raw))
 const guard="location.origin !== 'http://"+'127.0.'+'0.1'+":5185'"
 assert.doesNotThrow(()=>scanText('tests/browser-storage.ts',guard))
 assert.throws(()=>scanText('src/App.tsx',guard))
 assert.throws(()=>scanText('tests/browser-storage.ts',guard+' https://home.'+'ts.net'))
})
test('tracked, untracked, ignored tracked, hashes and image formats fail closed',()=>{
 const root=mkdtempSync(join(tmpdir(),'timeweave-public-policy-'))
 const git=(...args)=>execFileSync('git',args,{cwd:root,stdio:'pipe'})
 const write=(p,s)=>writeFileSync(join(root,p),s)
 const manifest=(extra=[])=>{
  const files=['.gitignore','CHECKPOINT.sha256','PUBLIC-FILES.txt','safe.txt',...extra].sort()
  write('PUBLIC-FILES.txt',files.join('\n')+'\n')
  const bytes=p=>p==='safe.txt'?'reviewed':p==='.gitignore'?'ignored.txt\n':files.join('\n')+'\n'
  write('CHECKPOINT.sha256',files.filter(p=>p!=='CHECKPOINT.sha256').map(p=>`${createHash('sha256').update(bytes(p)).digest('hex')}  ${p}`).join('\n')+'\n')
 }
 try{
  git('init','--quiet');write('.gitignore','ignored.txt\n');write('safe.txt','reviewed');manifest();git('add','.')
  assert.equal(verifySource(root),4)
  write('unlisted.txt','surprise');assert.throws(()=>verifySource(root),/file set/);rmSync(join(root,'unlisted.txt'))
  write('ignored.txt','hidden');git('add','-f','ignored.txt');assert.throws(()=>verifySource(root),/file set/);git('rm','--cached','ignored.txt')
  write('safe.txt','changed');assert.throws(()=>verifySource(root),/Changed after review/);write('safe.txt','reviewed')
  write('bad.png',Buffer.from([255,216,255]));manifest(['bad.png']);assert.throws(()=>verifySource(root),/Image extension mismatch/)
 }finally{rmSync(root,{recursive:true,force:true})}
})
