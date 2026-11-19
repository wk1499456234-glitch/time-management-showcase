import test from 'node:test'
import assert from 'node:assert/strict'
import data from '../src/data/ai-demo.json'
import {route,backupRoute} from '../src/ui/routes'
import {LocalSessionStore,STORAGE_KEY} from '../src/state/localSessionStore'
test('five-week facts recompute from raw timestamps, pauses and separate typed units',()=>{
 assert.equal(data.records.length,30);assert.equal(data.records.filter(r=>r.source==='real-ai-human-confirmed').length,3)
 for(const week of data.weeks){
  const records=data.records.filter(r=>r.startAt>=week.startAt&&r.startAt<week.endAt)
  assert.equal(records.length,6)
  assert.equal(records.reduce((n,r)=>n+r.endAt-r.startAt-r.pauseIntervals.reduce((t,p)=>t+p.end-p.start,0),0),week.activeMs)
  assert.equal(week.activeMs,180*60000)
  for(const q of week.quantities){assert.equal(records.flatMap(r=>r.items).filter(i=>i.type===q.type&&i.unit===q.unit).reduce((n,i)=>n+(i.quantity||0),0),q.quantity)}
 }
 const real=data.records.filter(r=>r.aiItems)
 assert.deepEqual(real.map(r=>r.items.map(i=>i.quantity)),[[30],[10],[6,null]])
 for(const r of real)for(const i of r.items)assert.ok(r.raw.includes(i.source_quote))
 assert.equal(data.review.language,'ja-JP');assert.ok(data.review.result.recommendations.length<=2)
 const allowed=new Set(['current','previous-1','previous-2','previous-3','previous-4'])
 for(const f of data.review.result.findings)for(const key of f.evidence)assert.ok(allowed.has(key))
 assert.ok(!JSON.stringify(data.review.result).includes('activeTimeHHMMSS'))
})
test('four-page routes and legacy fragments',()=>{for(const page of ['timer','records','review','settings']){assert.equal(route('#/'+page),page);assert.equal(route('#'+page),page)}assert.equal(route('#backup'),'settings')})
test('App route implementation retains nested routes, backup aliases and unknown fallback',()=>{
 for(const hash of ['#backup','#/backup','#settings/backup','#/settings/backup','#/settings/backup/details']){assert.equal(route(hash),'settings');assert.equal(backupRoute(hash),true)}
 for(const p of ['timer','records','review','settings'])assert.equal(route('#/'+p+'/details'),p)
 for(const hash of ['','#unknown','#/unrecognized/details'])assert.equal(route(hash),'timer')
 assert.equal(backupRoute('#/settings/backup-other'),false)
})
test('existing browser records preserved; fixed samples never enter visitor persistence',async()=>{
 const memory=new Map<string,string>();const storage={getItem:(k:string)=>memory.get(k)??null,setItem:(k:string,v:string)=>{memory.set(k,v)}}
 let n=1000;const lock=async(_name:string,work:()=>void)=>work();const store=new LocalSessionStore(storage,lock,()=>n,()=>`test-${n}`)
 await store.dispatch({type:'start',activityId:'act-toeic'});const current=store.getSnapshot().data.current!;n=2000
 await store.dispatch({type:'output',id:current.id,text:'  訪問者の原文  '});n=3000;await store.dispatch({type:'stop',id:current.id})
 const before=memory.get(STORAGE_KEY);const reopened=new LocalSessionStore(storage,lock)
 assert.equal(memory.get(STORAGE_KEY),before);assert.equal(reopened.getSnapshot().data.sessions.length,1)
 assert.equal(reopened.getSnapshot().data.sessions[0].outputs[0].text,'  訪問者の原文  ')
 assert.equal(data.records.length,30);assert.equal(reopened.getSnapshot().data.sessions.some(r=>r.id.startsWith('fiction-')),false)
})
