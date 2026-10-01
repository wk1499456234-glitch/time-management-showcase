import { LocalSessionStore, type StoragePort } from '../src/state/localSessionStore'
import { parseData } from '../src/state/sessionData'

// Only the dedicated acceptance origin is allowed; never touches the daily origin.
const button = document.querySelector('button')!
const result = document.querySelector('pre')!
button.addEventListener('click', async () => {
  button.disabled = true
  if (location.origin !== 'http://127.0.0.1:5185') { result.textContent = 'REFUSED: isolated port required'; return }
  const prefix = `time-management-test-${crypto.randomUUID()}-`
  const created = new Set<string>()
  const lines: string[] = []
  const check = (ok: unknown, text: string) => { if (!ok) throw new Error(text); lines.push('PASS '+text) }
  const port = (suffix: string): StoragePort => ({
    getItem: () => localStorage.getItem(prefix+suffix),
    setItem: (_key, value) => { created.add(prefix+suffix); localStorage.setItem(prefix+suffix,value) },
  })
  const make = (suffix: string) => new LocalSessionStore(port(suffix), (_name, fn) => navigator.locks.request(prefix+suffix, fn))
  try {
    const a=make('shared'),b=make('shared')
    const outcomes=await Promise.allSettled([a.dispatch({type:'start',activityId:'act-ai-dev'}),b.dispatch({type:'start',activityId:'act-toeic'})])
    check(outcomes.filter(x=>x.status==='fulfilled').length===1 && b.getSnapshot().conflict,'real Web Locks serialize competing stores; loser is explicitly blocked')
    check(make('shared').getSnapshot().data.current?.id===a.getSnapshot().data.current?.id,'fresh instance reads real localStorage')
    const q=make('quota');await q.dispatch({type:'start',activityId:'act-exercise'})
    const id=q.getSnapshot().data.current!.id, original=localStorage.getItem(prefix+'quota')
    let full=false,index=0
    for (const size of [131072,1024,16,1]) {
      for(let n=0;n<256;n++) {
        const key=prefix+'fill-'+index++;created.add(key)
        try { localStorage.setItem(key,'x'.repeat(size)) }
        catch(e) { if (!(e instanceof DOMException) || e.name!=='QuotaExceededError') throw e; full=true; break }
      }
    }
    check(full,'actual browser quota limit reached in isolated origin')
    await q.dispatch({type:'output',id,text:'隔离容量测试'.repeat(1000)})
    check(q.getSnapshot().unsaved && q.getSnapshot().data.current!.outputs.length===1 && /errors.saveFailed/.test(q.getSnapshot().warning),'quota failure keeps new Output in memory and reports failure')
    check(localStorage.getItem(prefix+'quota')===original,'quota failure leaves last persisted bytes intact')
    for (const key of created) if(key.includes('-fill-')) localStorage.removeItem(key)
    await q.retry();check(!q.getSnapshot().unsaved && make('quota').getSnapshot().data.current!.outputs.length===1,'retry after freeing only test filler restores complete branch')
    created.add(prefix+'broken');localStorage.setItem(prefix+'broken','{corrupt-original')
    const broken=make('broken');await broken.dispatch({type:'start',activityId:'act-ai-dev'})
    check(broken.getSnapshot().unsaved && localStorage.getItem(prefix+'broken')==='{corrupt-original' && parseData(broken.export()).current,'corrupt real storage is retained and memory remains exportable')
    result.textContent=lines.join('\n')+'\nALL PASSED; isolated keys cleaned below.'
  } catch(e) { result.textContent=lines.join('\n')+'\nFAIL '+String(e) }
  finally { for(const key of created) localStorage.removeItem(key);result.textContent+='\nCleanup: '+[...created].filter(key=>localStorage.getItem(key)!==null).length+' test keys remain.' }
})
