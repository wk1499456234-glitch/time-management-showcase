import test from 'node:test'
import assert from 'node:assert/strict'
import {LocalSessionStore} from '../src/state/localSessionStore'
function setup(){
 let raw:string|null=null,fail=false,n=0,writes=0,queue=Promise.resolve()
 const disk={getItem:()=>raw,setItem:(_key:string,value:string)=>{if(fail)throw new Error('quota');raw=value;writes++}}
 const lock=(_key:string,work:()=>void)=>{const next=queue.then(work);queue=next.catch(()=>{});return next}
 const make=()=>new LocalSessionStore(disk,lock,()=>1000+n,()=>`unique-${++n}`)
 return {make,setFail:(v:boolean)=>{fail=v},writes:()=>writes}
}
test('failed append stays in memory; same action retries, double clicks never append twice',async()=>{
 const f=setup(),s=f.make();assert.equal((await s.dispatch({type:'start',activityId:'act-toeic'})).status,'saved')
 const action={type:'output' as const,id:s.getSnapshot().data.current!.id,text:'  復習20語  '}
 f.setFail(true)
 const results=await Promise.all([s.dispatch(action),s.dispatch(action)])
 assert.ok(results.every(r=>r.status==='memory-only'));assert.equal(s.getSnapshot().data.current!.outputs.length,1)
 assert.equal(f.make().getSnapshot().data.current!.outputs.length,0);assert.equal(s.getSnapshot().savedOutput,undefined)
 await assert.rejects(s.dispatch({...action,text:'different input'}),/retryFirst/)
 f.setFail(false);const writes=f.writes()
 const retried=await Promise.all([s.dispatch(action),s.dispatch(action),s.retry()])
 assert.equal(retried[0].status,'saved');assert.equal(f.writes()-writes,1)
 assert.equal(f.make().getSnapshot().data.current!.outputs.length,1)
 assert.equal(s.getSnapshot().savedOutput?.text,action.text)
 assert.equal((await s.retry()).status,'unchanged');assert.equal(f.writes()-writes,1)
})
test('edit failure preserves old persisted text and new memory input; retry persists exact identity',async()=>{
 const f=setup(),s=f.make();await s.dispatch({type:'start',activityId:'act-toeic'});const id=s.getSnapshot().data.current!.id
 await s.dispatch({type:'output',id,text:'原文'});const outputId=s.getSnapshot().data.current!.outputs[0].id
 f.setFail(true);const edit={type:'edit-output' as const,id,outputId,text:' 新しい原文 '}
 assert.equal((await s.dispatch(edit)).status,'memory-only');assert.equal(f.make().getSnapshot().data.current!.outputs[0].text,'原文')
 assert.equal(s.getSnapshot().data.current!.outputs[0].text,edit.text)
 f.setFail(false);assert.equal((await s.dispatch(edit)).status,'saved')
 assert.deepEqual(f.make().getSnapshot().data.current!.outputs,s.getSnapshot().data.current!.outputs)
})
test('import failure is not success; retry and repeated import preserve count and raw facts',async()=>{
 const origin=setup(),source=origin.make();await source.dispatch({type:'start',activityId:'act-toeic'});const id=source.getSnapshot().data.current!.id
 await source.dispatch({type:'output',id,text:'import 原文'});await source.dispatch({type:'stop',id});const raw=source.export()
 const f=setup(),s=f.make();f.setFail(true)
 assert.equal((await s.import(raw)).status,'memory-only');assert.equal(f.make().getSnapshot().data.sessions.length,0)
 f.setFail(false);assert.equal((await s.import(raw)).status,'saved');await s.import(raw)
 assert.deepEqual(f.make().getSnapshot().data.sessions,source.getSnapshot().data.sessions)
})
