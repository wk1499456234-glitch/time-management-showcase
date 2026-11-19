import {useLocale} from '../i18n'
import type {SessionEngine} from '../state/browserEngine'
import {tokyoDay} from './data'
import {WeaveArt} from './WeaveArt'
import {Icon} from './motion'
import {Outputs} from './Outputs'
import {formatClock} from '../utils/time'
export function TodayOverview({engine:e}:{engine:SessionEngine}){
 const {locale}=useLocale(),ja=locale==='ja-JP'
 const recent=[...e.allSessions,...(e.data.current?[e.data.current]:[])].flatMap(s=>s.outputs.map(o=>({s:s.id,o}))).filter(r=>tokyoDay(r.o.createdAt)===tokyoDay(e.now)).sort((a,b)=>b.o.createdAt-a.o.createdAt).slice(0,3)
 return <aside className="session-outputs today-overview"><div className="today-heading"><h2>{ja?'最近の成果':'最近成果'}</h2><a href="#/records" className="text-button">{ja?'すべて見る':'查看全部'} →</a></div>{recent.length?<div className="today-recent">{recent.map(r=><Outputs key={r.o.id} sid={r.s} outputs={[r.o]} engine={e}/>)}</div>:<div className="today-empty"><WeaveArt/><h3>{ja?'今日の成果を残しましょう。':'记录今天的成果。'}</h3><p className="muted">{ja?'試用した記録はこのブラウザーに保存されます。':'试用记录保存在当前浏览器。'}</p><button className="text-button" onClick={()=>document.querySelector<HTMLElement>(e.status==='running'?'#output-draft':e.status==='paused'?'.timer-actions button':'#timer-activity')?.focus()}>{ja?'記録を始める':'开始记录'} →</button></div>}
 <p className="small muted">{ja?'今日の有効時間':'今日有效时间'} · {formatClock(e.todayActiveMs)}</p><section className="review-callout"><h2>{ja?'AIの振り返りを読む':'阅读AI回顾'}</h2><p>{ja?'架空の学習記録と、保存済みのAI結果。':'虚构学习记录与已保存的AI结果。'}</p><a href="#/review" className="button">{ja?'AI 振り返りへ':'AI 回顾'}<Icon name="arrow"/></a></section></aside>
}
