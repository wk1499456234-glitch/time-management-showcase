import {useEffect,useLayoutEffect,useRef,useState} from 'react'
import {LocaleProvider,useLocale} from './i18n'
import {useBrowserEngine as useSessionEngine,type SessionEngine} from './state/browserEngine'
import {ACTIVITIES} from './data/activities'
import {formatClock} from './utils/time'
import type {FinishedSession} from './types'
import {Outputs} from './ui/Outputs'
import {ReviewPage} from './ui/ReviewPage'
import {SettingsPage} from './ui/SettingsPage'
import {words} from './ui/copy'
import {clockTime,dateTime,tokyoDay} from './ui/data'
import {Icon,Reveal} from './ui/motion'
import {Records as SampleRecords} from './ui/DemoPages'

import {pages as routes,route as parseRoute,backupRoute,type Page as Route} from './ui/routes'
import {brand} from './ui/brand'
import {WeaveMark} from './ui/WeaveMark'
import {TodayOverview} from './ui/TodayOverview'



const routeFromHash=():Route=>parseRoute(location.hash)
function AppShell(){
  const DRAFT='time-management.showcase.output-draft'
  const engine=useSessionEngine(),{locale,t}=useLocale(),l={...words[locale],brand:brand[locale],edition:locale==='ja-JP'?'公開デモ':'公开演示'}
  const [route,setRoute]=useState<Route>(routeFromHash),[visit,setVisit]=useState(0)
  const [draft,setDraft]=useState(()=>{try{return sessionStorage.getItem(DRAFT)||''}catch{return ''}})
  const [draftWarning,setDraftWarning]=useState(false),[keyboard,setKeyboard]=useState(false)
  const main=useRef<HTMLElement>(null),first=useRef(true)
  useEffect(()=>{const navigate=()=>{setRoute(routeFromHash());setVisit(v=>v+1)};window.addEventListener('hashchange',navigate);return()=>window.removeEventListener('hashchange',navigate)},[])
  useEffect(()=>{try{sessionStorage.setItem(DRAFT,draft);setDraftWarning(false)}catch{setDraftWarning(true)}},[draft])
  useEffect(()=>{if(!draft)return;const warn=(e:BeforeUnloadEvent)=>{e.preventDefault();e.returnValue=''};addEventListener('beforeunload',warn);return()=>removeEventListener('beforeunload',warn)},[draft])
  useEffect(()=>{document.title=`${l[route]} · ${l.brand} · ${l.edition}`},[route,l])
  useEffect(()=>{const viewport=window.visualViewport;const update=()=>setKeyboard(!!viewport&&innerWidth<=760&&innerHeight-viewport.height>120);viewport?.addEventListener('resize',update);update();return()=>viewport?.removeEventListener('resize',update)},[])
  useLayoutEffect(()=>{
    const element=main.current;if(!element)return
    window.scrollTo({top:0,behavior:'instant'});if(!first.current)element.focus({preventScroll:true});first.current=false
    if(backupRoute(location.hash)){
      const backup=element.querySelector<HTMLElement>('#backup'),details=backup?.querySelector('details');if(details)details.open=true
      backup?.focus({preventScroll:true});backup?.scrollIntoView({block:'start'})
    }
    const reduced=matchMedia('(prefers-reduced-motion: reduce)')
    // Critical timer inputs stay visible and usable throughout navigation.
    const target=route==='timer'?element.querySelector<HTMLElement>('.page-intro'):element
    let animation:Animation|undefined
    try {if(!reduced.matches)animation=target?.animate?.([{opacity:.2},{opacity:1}],{duration:200,easing:'ease-out'})} catch { /* Animation failure must not interrupt the page. */ }
    const cancel=()=>{if(reduced.matches)animation?.cancel()};reduced.addEventListener('change',cancel)
    return()=>{animation?.cancel();reduced.removeEventListener('change',cancel)}
  },[route,visit])
  useEffect(()=>{
    const saved=engine.savedOutput
    if(saved)setDraft(current=>current===saved.text?'':current)
  },[engine.savedOutput])
  const retrySave=()=>engine.retry()
  const activeName=t(ACTIVITIES.find(a=>a.id===engine.currentActivityId)?.nameKey??'')
  return <div className={keyboard?'product keyboard-open':'product'}>
    <a className="skip-link" href="#main" onClick={e=>{e.preventDefault();main.current?.focus()}}>{l.skip}</a>
    <header className="site-header"><a className="brand" href="#/timer"><span className="brand-mark"><WeaveMark/></span>{l.brand}</a><nav className="main-nav" aria-label={l.nav}>{routes.map(r=><a href={`#/${r}`} key={r} aria-current={route===r?'page':undefined}><Icon name={r}/>{l[r]}</a>)}</nav><a className="account-link" href="#/settings" aria-label={locale==='ja-JP'?'設定':'设置'}><Icon name="settings" size={24}/></a></header>
    {route!=='timer'&&engine.status!=='idle'&&<aside className="running-ribbon"><span><span className={`status-dot ${engine.status}`}/>{activeName} · {engine.status==='running'?l.running:l.paused}<strong className="mono">{formatClock(engine.activeMs)}</strong></span><a href="#/timer">{l.backTimer}<Icon name="arrow" size={16}/></a></aside>}
    {(engine.error||engine.journalWarning)&&<div className="global-feedback"><p className="error" role="alert">{t(engine.error||'backend.journalWarning')}</p><div className="actions">{engine.unsaved&&!engine.conflict&&<button className="button" disabled={engine.pending} onClick={()=>void retrySave()}>{l.retrySave}</button>}{!engine.ready&&<button className="button" disabled={engine.pending} onClick={()=>void engine.refresh()}>{l.retryRead}</button>}<a className="text-button" href="#/settings/backup">{l.maintenance}<Icon name="arrow" size={16}/></a></div></div>}
    {draftWarning&&<p className="global-feedback error" role="alert">{l.draftWarning}</p>}
    <main id="main" className={`main-content page-${route}`} tabIndex={-1} ref={main} data-page={route}>
      {route==='timer'&&<TimerPage engine={engine} draft={draft} setDraft={setDraft}/>}
      {route==='records'&&<RecordsSwitch engine={engine}/>}
      {route==='review'&&<ReviewPage/>}
      {route==='settings'&&<SettingsPage engine={engine}/>}
    </main>
  </div>
}
function TimerPage({engine,draft,setDraft}:{engine:SessionEngine;draft:string;setDraft:(value:string|((v:string)=>string))=>void}){
  const {locale,t}=useLocale(),l=words[locale],ja=locale==='ja-JP'
  const availability:string='off'
  const [selected,setSelected]=useState(ACTIVITIES[0].id),[saving,setSaving]=useState(false),[saved,setSaved]=useState(false),[endOpen,setEndOpen]=useState(false)
  const submitLock=useRef(false),composing=useRef(false),current=engine.data.current
  async function save(){
    if(!draft.trim()||engine.blocked||engine.status!=='running'||submitLock.current||composing.current)return
    const text=draft;submitLock.current=true;setSaving(true);setSaved(false)
    try{if(await engine.addOutput(text)){setDraft(v=>v===text?'':v);setSaved(true)}}finally{setSaving(false);submitLock.current=false}
  }
  function end(){if(draft.trim())setEndOpen(true);else void engine.stop()}
  return <>
    {!engine.ready&&!engine.error&&<p role="status">{l.loading}</p>}
    <div className="timer-layout"><div className="timer-workspace">
      <div className="page-heading page-intro timer-heading"><h1>{l.timer}</h1><time dateTime={tokyoDay(engine.now)}>{new Date(engine.now).toLocaleDateString(locale,{timeZone:'Asia/Tokyo',month:'long',day:'numeric'})}</time></div>
      <section className="active-timer" aria-label={l.effective}>
        <label className="activity-select"><span>{ja?'活動':'活动'}</span><select id="timer-activity" aria-label={l.choose} value={current?.activityId??selected} disabled={!!current||engine.blocked} onChange={e=>setSelected(e.target.value)}>{ACTIVITIES.map(a=><option key={a.id} value={a.id}>{t(a.nameKey)}</option>)}</select></label>
        <div className="clock" role="timer" aria-label={l.effective}>{formatClock(engine.activeMs).padStart(8,'0')}</div>
        <p className="timer-state">{current&&<span className={`status-dot ${engine.status}`}/>} {current?(engine.status==='running'?l.running:l.paused):(ja?'開始前':'尚未开始')}</p>
        <div className="timer-actions">{!current?<button className="button primary start-button" disabled={engine.blocked} onClick={()=>void engine.start(selected)}><Icon name="play" size={22}/>{ja?'開始':'开始'}</button>:<><button className="button primary" disabled={engine.blocked} onClick={()=>void(engine.status==='running'?engine.pause():engine.resume())}><Icon name={engine.status==='running'?'pause':'play'} size={24}/>{engine.status==='running'?l.pause:l.resume}</button><button className="button" disabled={engine.blocked} onClick={end}>{l.stop}</button></>}</div>
      </section>
      {endOpen&&<div className="inline-confirm" role="region" aria-label={l.stop}><p>{l.stopDraft}</p><div className="actions"><button className="button" disabled={engine.blocked} onClick={()=>{void engine.stop();setEndOpen(false)}}>{l.keepStop}</button><button className="button" onClick={()=>setEndOpen(false)}>{l.cancel}</button></div></div>}
      <form className="composer" onSubmit={e=>{e.preventDefault();void save()}}><label htmlFor="output-draft">{l.output}</label><p className="composer-hint">{ja?'学んだことや、進んだことを残しましょう。':'记下学到了什么、完成了什么。'}</p><textarea id="output-draft" value={draft} rows={4} maxLength={20000} disabled={engine.status!=='running'} placeholder={ja?'例：英単語を20語復習した':'例如：复习了20个单词'} onChange={e=>{setDraft(e.target.value);setSaved(false)}} onCompositionStart={()=>{composing.current=true}} onCompositionEnd={()=>{composing.current=false}} onKeyDown={e=>{if((e.ctrlKey||e.metaKey)&&e.key==='Enter'&&!e.nativeEvent.isComposing&&!composing.current){e.preventDefault();void save()}}}/><div className="composer-footer"><span className="muted" role="status">{saved?l.saved:engine.status==='paused'?l.pausedHint:!current?(draft?l.idleDraft:ja?'開始すると成果を記録できます。':'开始活动后可以记录成果。'):availability==='enabled'?(ja?'保存後、AIが内容を整理します。':'保存后，AI会整理内容。'):ja?'このブラウザーに保存します。AIには送信しません。':'保存到当前浏览器，不发送给AI。'}</span><button className="button primary" disabled={engine.blocked||saving||!draft.trim()||engine.status!=='running'}>{saving?l.saving:ja?'成果を保存':'保存成果'}</button></div></form>
    </div><TodayOverview engine={engine}/></div>
  </>
}

function activeInDate(s:Pick<FinishedSession,'startAt'|'endAt'|'pauseIntervals'>,day:string){
  const lo=Date.parse(day+'T00:00:00+09:00'),hi=lo+86400000,start=Math.max(lo,s.startAt),end=Math.min(hi,s.endAt)
  return Math.max(0,end-start-s.pauseIntervals.reduce((sum,p)=>sum+Math.max(0,Math.min(end,p.end??s.endAt)-Math.max(start,p.start)),0))
}
function RecordsPage({engine}:{engine:SessionEngine}){
  const {locale,t}=useLocale(),l=words[locale]
  const [date,setDate]=useState(''),[shown,setShown]=useState(20),[opened,setOpened]=useState<Set<string>>(new Set())
  const sessions=[...engine.allSessions].sort((a,b)=>b.startAt-a.startAt)
  const filtered=date?sessions.filter(s=>s.startAt<Date.parse(date+'T00:00:00+09:00')+86400000&&s.endAt>=Date.parse(date+'T00:00:00+09:00')):sessions
  const days=[...new Set(filtered.slice(0,shown).map(s=>date||tokyoDay(s.startAt)))]
  return <><div className="page-heading page-intro"><h1>{l.records}</h1><p className="muted">{l.recordsIntro}</p></div>
    <div className="page-tools"><label className="select-label">{l.date}<input type="date" value={date} onChange={e=>{setDate(e.target.value);setShown(20)}}/></label><button className="text-button" onClick={()=>{setDate('');setShown(20)}}>{l.allDates}</button></div>
    {!filtered.length&&<div className="empty-state"><Icon name="records" size={36}/><h2>{l.noRecords}</h2><p className="muted">{l.noRecordsHint}</p><a className="button primary" href="#/timer">{l.backTimer}<Icon name="arrow" size={16}/></a></div>}
    {days.map((day,index)=><Reveal key={day} id={`records:${day}`} order={index%3}><section className="day-group"><div className="day-heading"><h2>{day}</h2><span className="small muted">{l.dayTotal} · <span className="mono">{formatClock(sessions.reduce((sum,s)=>sum+activeInDate(s,day),0)+(engine.data.current?activeInDate({...engine.data.current,endAt:Math.max(engine.now,engine.data.current.lastAt)},day):0))}</span></span></div>{filtered.slice(0,shown).filter(s=>(date||tokyoDay(s.startAt))===day).map(s=><details className="history-record" key={s.id} onToggle={e=>{const isOpen=e.currentTarget.open;setOpened(old=>{const next=new Set(old);if(isOpen)next.add(s.id);else next.delete(s.id);return next})}}><summary><span className="history-date">{clockTime(s.startAt,locale)}<small>{clockTime(s.endAt,locale)}</small></span><span className="history-description"><strong>{t(ACTIVITIES.find(a=>a.id===s.activityId)?.nameKey??s.activityId)}</strong><span className="muted">{s.outputs[s.outputs.length-1]?.text??l.noSessionOutputs}</span></span><span className="history-time mono">{formatClock(s.activeMs)}</span><Icon name="chevron" size={18}/></summary><div className="history-content"><p className="small muted">{l.sessionTime} · {formatClock(s.activeMs)} · {s.outputs.length} {l.count}</p>{opened.has(s.id)&&<Outputs sid={s.id} outputs={s.outputs} engine={engine}/>}<details className="record-times"><summary>{l.recordRange}<Icon name="chevron" size={16}/></summary><p className="small muted">{dateTime(s.startAt,locale)} — {dateTime(s.endAt,locale)}</p>{s.pauseIntervals.length>0&&<><p>{l.pauses}</p><ul>{s.pauseIntervals.map((p,i)=><li key={i}>{dateTime(p.start,locale)} — {p.end?dateTime(p.end,locale):l.ongoing}</li>)}</ul></>}</details></div></details>)}</section></Reveal>)}
    {filtered.length>shown&&<button className="text-button load-more" onClick={()=>setShown(v=>v+20)}>{l.more}</button>}
  </>
}
export default function ProductApp(){return <LocaleProvider><AppShell/></LocaleProvider>}

function RecordsSwitch({engine}:{engine:SessionEngine}){const {locale}=useLocale();const sample=location.hash.startsWith('#/records/sample');return <><div className="page-tools"><label>{locale==='ja-JP'?'表示する記録':'记录来源'}<select value={sample?'sample':'trial'} onChange={e=>{location.hash=e.target.value==='sample'?'#/records/sample':'#/records'}}><option value="trial">{locale==='ja-JP'?'自分の試用記録':'我的试用记录'}</option><option value="sample">{locale==='ja-JP'?'架空の学習サンプル':'虚构学习示例'}</option></select></label></div>{sample?<SampleRecords engine={engine} sampleOnly/>:<RecordsPage engine={engine}/>}</>}
