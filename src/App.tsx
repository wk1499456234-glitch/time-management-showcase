import {useEffect,useRef,useState} from 'react'
import {LocaleProvider,useLocale} from './i18n'
import {useSessionEngine,type SessionEngine} from './state/useSessionEngine'
import {ACTIVITIES} from './data/activities'
import {LocalDataPanel} from './components/LocalDataPanel'
import {OutputList} from './components/OutputList'
import {LanguageSwitch} from './components/LanguageSwitch'
import {formatClock} from './utils/time'
import {Icon} from './ui/motion'
import {Records,Review,Heading,useWords} from './ui/DemoPages'
import {route,pages} from './ui/routes'
import './ui/product.css'
import './ui/showcase.css'

function AppShell(){
 const e=useSessionEngine(),w=useWords(),{t,locale}=useLocale();const [hash,setHash]=useState(location.hash);const page=route(hash);
 const [draft,setDraft]=useState(()=>{try{return sessionStorage.getItem('time-management.showcase.output-draft')||''}catch{return ''}})
 const [draftWarning,setDraftWarning]=useState(false);const main=useRef<HTMLElement>(null)
 const nav=[w('タイマー','计时'),w('記録','记录'),w('振り返り','回顾'),w('設定','设置')]
 useEffect(()=>{const change=()=>{if(location.hash==='#main'){main.current?.focus();return}setHash(location.hash);window.scrollTo(0,0)};window.addEventListener('hashchange',change);return()=>window.removeEventListener('hashchange',change)},[])
 useEffect(()=>{document.title=`${nav[pages.indexOf(page)]} · ${w('時間管理','时间管理')}`;main.current?.focus({preventScroll:true});if(hash==='#backup'){const box=document.querySelector<HTMLDetailsElement>('#backup details');if(box){box.open=true;box.scrollIntoView()}}},[page,locale,hash])
 useEffect(()=>{try{sessionStorage.setItem('time-management.showcase.output-draft',draft);setDraftWarning(false)}catch{setDraftWarning(true)}},[draft])
 const activity=ACTIVITIES.find(a=>a.id===e.currentActivityId)
 return <div className="product"><a className="skip-link" href="#main">{w('本文へ移動','跳到正文')}</a>
 <header className="site-header"><a className="brand" href="#/timer"><Icon name="timer"/>{w('時間管理','时间管理')}</a><nav className="main-nav" aria-label={w('メインナビゲーション','主导航')}>{pages.map((p,i)=><a key={p} href={`#/${p}`} aria-current={p===page?'page':undefined}><Icon name={p}/>{nav[i]}</a>)}</nav><span className="header-edition">{w('公開デモ','公开展示')}</span></header>
 {page!=='timer'&&e.status!=='idle'&&<aside className="running-ribbon"><span>{t(e.status==='running'?'session.running':'session.paused')} · {activity&&t(activity.nameKey)} <strong>{formatClock(e.activeMs)}</strong></span><a href="#/timer">{w('タイマーへ','返回计时')} →</a></aside>}
 <main ref={main} id="main" tabIndex={-1} className="main-content"><div className="page-transition" key={page}>
 {(e.error||e.warning||e.unsaved)&&<p role="alert" className="error">{e.error?t(e.error):e.warning?t(e.warning):w('保存できていません。設定から再試行できます。','尚未保存，请在设置中重试。')}</p>}
 {page==='timer'&&<Timer engine={e} draft={draft} setDraft={setDraft} draftWarning={draftWarning}/>}
 {page==='records'&&<Records engine={e}/>}{page==='review'&&<Review/>}{page==='settings'&&<Settings engine={e}/>}
 </div></main><footer className="site-footer"><span>{w('時間を記録する。成果を残す。','记录时间，留下成果。')}</span><span>{w('固定例と試用記録は別々です。','固定示例与试用记录独立保存。')}</span></footer></div>
}
function Timer({engine:e,draft,setDraft,draftWarning}:{engine:SessionEngine;draft:string;setDraft:(s:string)=>void;draftWarning:boolean}){
 const w=useWords(),{t}=useLocale();const [selected,setSelected]=useState('act-toeic'),[notice,setNotice]=useState(false);const lock=useRef(false)
 const busy=e.pending||e.conflict||!!e.warning;const save=async()=>{if(!draft.trim()||lock.current)return;lock.current=true;try{if(await e.addOutput(draft)){setDraft('');setNotice(true)}}finally{lock.current=false}}
 return <><Heading page="TIMER" title={w('今、取り組むこと。','此刻，专注一件事。')} subtitle={w('試用記録はこのブラウザーだけに保存。AI には送信されません。','试用记录只保存在当前浏览器，不发送给 AI。')}/>
 {e.status==='idle'?<section className="start-state"><h2>{w('活動を選んではじめる','选择活动，开始计时')}</h2><div className="activity-options">{ACTIVITIES.map(a=><button key={a.id} className={selected===a.id?'selected':''} aria-pressed={selected===a.id} onClick={()=>setSelected(a.id)}>{t(a.nameKey)}</button>)}</div><button className="button primary" disabled={busy} onClick={()=>void e.start(selected)}><Icon name="play"/>{w('開始','开始')}</button></section>:<div className="timer-layout"><section className="active-timer"><p className="timer-activity">{t(ACTIVITIES.find(a=>a.id===e.currentActivityId)!.nameKey)} · {t(e.status==='running'?'session.running':'session.paused')}</p><div className="clock" aria-label={w('有効時間','有效时间')}>{formatClock(e.activeMs)}</div><p className="small muted">{w('一時停止中の時間は含みません。','不包含暂停期间的时间。')}</p><div className="actions timer-actions"><button className="button primary" disabled={busy} onClick={()=>void(e.status==='running'?e.pause():e.resume())}>{w(e.status==='running'?'一時停止':'再開',e.status==='running'?'暂停':'恢复')}</button><button className="button" disabled={busy} onClick={()=>void e.stop()}>{w('終了して保存','结束并保存')}</button></div></section><section className="composer"><label htmlFor="trial-output">Output</label><p className="small muted">{w('何をしたか、どれだけ進めたか。','做了什么，完成多少。')}</p><textarea id="trial-output" value={draft} maxLength={20000} rows={5} placeholder={w('例：教材を3ページ読んだ。疑問点を整理した。','例如：阅读3页教材，整理了疑问。')} onChange={ev=>{setDraft(ev.target.value);setNotice(false)}} onKeyDown={ev=>{if(ev.key==='Enter'&&(ev.ctrlKey||ev.metaKey)&&!ev.nativeEvent.isComposing){ev.preventDefault();void save()}}}/><div className="composer-footer"><p className="small muted">{w('原文を保存・自動解析なし','保存原文，不自动解析')}</p><button className="button primary" disabled={busy||!draft.trim()} onClick={()=>void save()}>{w('Outputを保存','保存 Output')}</button></div>{notice&&<p role="status">{w('原文を保存しました。','原文已保存。')}</p>}{draftWarning&&<p className="warning" role="alert">{w('下書きはこのタブを開いている間だけ保持されます。','草稿暂时只能在当前页面保持。')}</p>}</section></div>}
 {!!e.outputs.length&&<section className="session-outputs"><h2>{w('今回の成果','本次成果')}</h2><OutputList outputs={e.outputs} emptyLabel="" onEdit={(id,text)=>e.editOutput(e.data.current!.id,id,text)}/></section>}
 <div className="sample-entry"><a className="text-button" href="#/records">{w('架空の記録と保存済み AI 解析を見る','查看虚构记录与已保存 AI 解析')} <Icon name="arrow"/></a><p className="small muted">{w('5週間・30件の固定例。あなたの入力の分析ではありません。','五周30条固定示例，并非对你的输入生成的分析。')}</p></div></>
}
function Settings({engine:e}:{engine:SessionEngine}){const w=useWords();return <><Heading page="SETTINGS" title={w('設定','设置')} subtitle={w('保存場所と、この公開版でできること。','保存位置与公开版使用范围。')}/><section className="setting-row"><h2>{w('表示言語','界面语言')}</h2><LanguageSwitch/></section><section className="setting-row"><h2>{w('保存とバックアップ','保存与备份')}</h2><div><p>{w('活動・Outputはこのブラウザーに保存されます。以前の公開版と同じ保存領域を使い、固定例を混ぜたり、以前のデータを消したりしません。','试用活动和 Output 保存在当前浏览器，沿用旧公开版存储，不混入固定示例、不清除旧数据。')}</p><LocalDataPanel engine={e}/><p className="small muted">{w('JSON は訪問者の原始記録用です。固定例の AI 結果は含みません。データ消去・端末変更では引き継がれません。','JSON 仅备份访客原始记录，不包含固定示例 AI 结果。清理数据或更换设备不会自动继承记录。')}</p></div></section><section className="setting-row"><h2>{w('AI とバージョンの違い','AI 与版本区别')}</h2><div><p>{w('公開版：保存済みの解析・回顧を閲覧できます。新しい入力の解析、AI 生成、固定例の変更は実行しません。','公开版：查看已保存的解析与回顾。新输入不解析、不生成 AI 回顾，固定示例不可修改。')}</p><details><summary>{w('本機版の機能','本机版能力')}<Icon name="chevron"/></summary><p>{w('本機版はコンピューター上の SQLite に保存し、原文保存後の解析、成果修正・種類確認、週統計、操作による回顧生成・保存・更新に対応します。JSON は原始記録、SQLite 完全バックアップは派生結果と分析も含みます。','本机版保存到电脑上的 SQLite，支持原文保存后解析、成果修正与类型确认、周统计、主动生成保存更新回顾。JSON 保存原始记录；SQLite 完整备份还包含派生成果与分析。')}</p></details><p className="small muted">{w('公開ページに AI 接続設定はなく、閲覧による推論呼び出しは0回です。','公开页面没有 AI 连接配置，浏览产生的推理调用为0次。')}</p></div></section></>}
export default function App(){return <LocaleProvider><AppShell/></LocaleProvider>}
