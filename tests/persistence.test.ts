import { test } from 'node:test'
import assert from 'node:assert/strict'
import { LocalSessionStore, STORAGE_KEY, type StoragePort, type LockPort } from '../src/state/localSessionStore'
import { activeInDay, durations, emptyData, mergeData, parseData, todayBounds, transition } from '../src/state/sessionData'

class Disk implements StoragePort {
  raw: string | null = null; writes = 0; failRead = false; failWrite = false
  getItem() { if (this.failRead) throw new DOMException('blocked', 'SecurityError'); return this.raw }
  setItem(_key: string, value: string) { if (this.failWrite) throw new DOMException('full', 'QuotaExceededError'); this.raw = value; this.writes++ }
}
function fixture() {
  const disk = new Disk(); let at = 1_000_000, id = 0, queue = Promise.resolve()
  const lock: LockPort = (_key, fn) => { const work = queue.then(fn); queue = work.catch(() => {}); return work }
  const make = () => new LocalSessionStore(disk, lock, () => at, () => `id-${++id}`)
  return { disk, make, advance: (ms: number) => { at += ms }, now: () => at }
}
test('running survives discarded store; closed time accrues; paused time does not', async () => {
  const f = fixture(); let s = f.make()
  await s.dispatch({ type:'start', activityId:'act-ai-dev' }); const id = s.getSnapshot().data.current!.id
  f.advance(30_000); s = f.make(); assert.equal(durations(s.getSnapshot().data.current!, f.now()).activeMs, 30_000)
  await s.dispatch({type:'pause', id}); f.advance(3_600_000); s = f.make()
  assert.equal(s.getSnapshot().data.current!.status,'paused')
  assert.equal(durations(s.getSnapshot().data.current!, f.now()).activeMs,30_000)
  await s.dispatch({type:'resume',id}); f.advance(20_000); await s.dispatch({type:'stop',id})
  const r = f.make().getSnapshot().data.sessions[0]
  assert.equal(r.activeMs,50_000); assert.equal(r.pauseMs,3_600_000); assert.equal(r.elapsedMs,3_650_000)
})
test('duplicate resume and queued stop generate one stable record and no extra writes', async () => {
  const f=fixture(),s=f.make(); await s.dispatch({type:'start',activityId:'act-toeic'}); const id=s.getSnapshot().data.current!.id
  await s.dispatch({type:'pause',id}); f.advance(100); await Promise.all([s.dispatch({type:'resume',id}),s.dispatch({type:'resume',id})])
  f.advance(500); await Promise.all([s.dispatch({type:'stop',id}),s.dispatch({type:'stop',id})])
  assert.equal(s.getSnapshot().data.sessions.length,1);assert.equal(s.getSnapshot().data.sessions[0].id,id);assert.equal(f.disk.writes,4)
})
test('display ticks are read only; Output and edits survive reload and round trip', async () => {
  const f=fixture(),s=f.make();await s.dispatch({type:'start',activityId:'act-typescript'});const id=s.getSnapshot().data.current!.id
  for(let i=0;i<600;i++){f.advance(1000);durations(s.getSnapshot().data.current!,f.now())}
  assert.equal(f.disk.writes,1)
  await s.dispatch({type:'output',id,text:' 原始 Output '});await s.dispatch({type:'stop',id})
  const oid=s.getSnapshot().data.sessions[0].outputs[0].id
  await s.dispatch({type:'edit-output',id,outputId:oid,text:'修改后 Output'})
  assert.equal(f.make().getSnapshot().data.sessions[0].outputs[0].text,'修改后 Output')
  const exported=s.export(); const d=fixture(),target=d.make();await target.import(exported)
  await s.import(exported);assert.equal(s.getSnapshot().data.sessions.length,1)
  assert.deepEqual(target.getSnapshot().data.sessions,s.getSnapshot().data.sessions)
  await target.import(exported);assert.equal(target.getSnapshot().data.sessions.length,1)
})
test('midnight splits effective time including a pause spanning midnight; complete facts survive', () => {
  const midnight = new Date(2026,8,12).getTime()
  const run={startAt:midnight-3_600_000,pauseIntervals:[{start:midnight-600_000,end:midnight+600_000}]}
  assert.equal(activeInDay(run,midnight+3_600_000,midnight+1000),3_000_000)
  assert.equal(activeInDay(run,midnight+3_600_000,midnight-1000),3_000_000)
  assert.equal(durations(run,midnight+3_600_000).activeMs,6_000_000)
  const [lo,hi]=todayBounds(midnight+1000);assert.equal(lo,midnight);assert.equal(new Date(hi).getDate(),13)
})
test('two initially current tabs competing for start cannot overwrite each other', async () => {
  const f=fixture(),a=f.make(),b=f.make()
  const results=await Promise.allSettled([a.dispatch({type:'start',activityId:'act-ai-dev'}),b.dispatch({type:'start',activityId:'act-exercise'})])
  assert.equal(results.filter(r=>r.status==='fulfilled').length,1)
  assert.equal(f.disk.writes,1);assert.equal(b.getSnapshot().conflict,true)
  assert.equal(parseData(f.disk.raw!).current!.activityId,'act-ai-dev')
  b.reload();assert.equal(b.getSnapshot().data.current!.id,a.getSnapshot().data.current!.id)
})
test('quota failure retains newly completed session; another writer cannot destroy that memory branch', async () => {
  const f=fixture(),a=f.make();await a.dispatch({type:'start',activityId:'act-ai-dev'});const id=a.getSnapshot().data.current!.id
  const b=f.make();f.disk.failWrite=true;f.advance(1000);await a.dispatch({type:'stop',id})
  assert.equal(a.getSnapshot().unsaved,true);assert.equal(a.getSnapshot().data.sessions.length,1)
  assert.match(a.getSnapshot().warning,/errors.saveFailed/);assert.equal(parseData(f.disk.raw!).sessions.length,0)
  f.disk.failWrite=false;await b.dispatch({type:'pause',id});a.checkExternal()
  await assert.rejects(a.retry());assert.equal(a.getSnapshot().data.sessions.length,1)
  assert.equal(parseData(a.export()).sessions.length,1)
})
test('quota recovery explicitly retries entire memory branch without per-second writes', async () => {
  const f=fixture(),s=f.make();f.disk.failWrite=true;await s.dispatch({type:'start',activityId:'act-ai-dev'})
  assert.equal(f.disk.raw,null);f.disk.failWrite=false;await s.retry()
  assert.equal(s.getSnapshot().unsaved,false);assert.equal(f.make().getSnapshot().data.current!.id,s.getSnapshot().data.current!.id)
})
test('invalid existing JSON is never silently replaced; raw bytes and memory export remain available', async () => {
  const f=fixture();f.disk.raw='{BROKEN';const s=f.make()
  assert.match(s.getSnapshot().warning,/errors.readFailed/);await s.dispatch({type:'start',activityId:'act-ai-dev'})
  assert.equal(f.disk.raw,'{BROKEN');assert.equal(s.rawBackup(),'{BROKEN');assert.equal(f.disk.writes,0)
  assert.ok(parseData(s.export()).current);assert.equal(s.getSnapshot().unsaved,true)
  s.reload();assert.ok(s.getSnapshot().data.current)
})
test('disabled storage or absent locks keeps actions in memory with explicit warning', async () => {
  const f=fixture();f.disk.failRead=true;const a=f.make();await a.dispatch({type:'start',activityId:'act-ai-dev'})
  assert.ok(a.getSnapshot().data.current);assert.ok(a.getSnapshot().warning);assert.equal(f.disk.writes,0)
  const b=new LocalSessionStore(f.disk,undefined);await b.dispatch({type:'start',activityId:'act-toeic'})
  assert.match(b.getSnapshot().warning,/errors.noLocks/);assert.ok(b.getSnapshot().data.current)
})
test('malformed imports, unknown versions, overlapping time and conflicting IDs are all-or-nothing', async () => {
  const f=fixture(),s=f.make();await s.dispatch({type:'start',activityId:'act-ai-dev'});const id=s.getSnapshot().data.current!.id
  f.advance(1000);await s.dispatch({type:'stop',id});const before=s.export(),raw=f.disk.raw
  for (const invalid of ['{}','null','{"version":2}',before.replace('"activeMs": 1000','"activeMs": -1')]) {
    assert.throws(()=>s.import(invalid));assert.equal(s.export(),before);assert.equal(f.disk.raw,raw)
  }
  const conflict=JSON.parse(before);conflict.sessions[0].activityId='act-toeic'
  await assert.rejects(s.import(JSON.stringify(conflict)));assert.equal(f.disk.raw,raw)
  const overlapping=JSON.parse(before);overlapping.sessions[0].id='other-id'
  await assert.rejects(s.import(JSON.stringify(overlapping)));assert.equal(s.export(),before)
})
test('importing two distinct current tasks is rejected, exact current task import is idempotent', () => {
  const base=transition(emptyData(),{type:'start',activityId:'act-ai-dev'},1000,()=> 'run-a')
  assert.deepEqual(mergeData(base,parseData(JSON.stringify(base))),base)
  const other=transition(emptyData(),{type:'start',activityId:'act-toeic'},1000,()=> 'run-b')
  assert.throws(()=>mergeData(base,other))
})
test('external deletion is a conflict, not silent reset; backwards clock cannot create negative intervals', async () => {
  const f=fixture(),s=f.make();await s.dispatch({type:'start',activityId:'act-ai-dev'});const id=s.getSnapshot().data.current!.id
  f.advance(-5000);await s.dispatch({type:'pause',id});assert.equal(durations(s.getSnapshot().data.current!,s.getSnapshot().data.current!.lastAt).activeMs,0)
  f.disk.raw=null;s.checkExternal();assert.equal(s.getSnapshot().conflict,true);assert.ok(s.getSnapshot().data.current)
  assert.equal(STORAGE_KEY,'time-management.showcase.v1')
})

test('Output creation and edits preserve raw whitespace and multilingual text through JSON', async () => {
  const f=fixture(),s=f.make(); await s.dispatch({type:'start',activityId:'act-typescript'})
  const id=s.getSnapshot().data.current!.id, raw='  日本語 / 中文 / English  '
  await s.dispatch({type:'output',id,text:raw})
  assert.equal(f.make().getSnapshot().data.current!.outputs[0].text,raw)
  const oid=s.getSnapshot().data.current!.outputs[0].id, edited='  修正した原文  '
  await s.dispatch({type:'edit-output',id,outputId:oid,text:edited})
  assert.equal(parseData(s.export()).current!.outputs[0].text,edited)
  await assert.rejects(s.dispatch({type:'edit-output',id,outputId:oid,text:'   '}))
  await assert.rejects(s.dispatch({type:'output',id,text:'x'.repeat(20000)+' '}))
})
test('JSON property order does not turn identical records into conflicts', async () => {
  const f=fixture(),s=f.make();await s.dispatch({type:'start',activityId:'act-ai-dev'})
  const id=s.getSnapshot().data.current!.id;f.advance(1000);await s.dispatch({type:'stop',id})
  const backup=JSON.parse(s.export())
  backup.sessions=backup.sessions.map((record: object)=>Object.fromEntries(Object.entries(record).reverse()))
  await s.import(JSON.stringify(backup));assert.equal(s.getSnapshot().data.sessions.length,1)
})
