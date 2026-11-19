import {useLocale} from '../i18n'
import {formatClock} from '../utils/time'
import {Icon} from './motion'
import {comparisonData,numberText,quantityKey,type WeekFacts,type Quantity} from './comparisonData'

function Value({q}:{q:Quantity}){const {locale}=useLocale();return <span className="metric-value"><span className="metric-number">{numberText(q.quantity,locale)}</span><span className="metric-unit">{q.unit}</span></span>}
export function HistoryComparison({weeks,selected}:{weeks:WeekFacts[];selected:string}){
  const {locale}=useLocale(),ja=locale==='ja-JP',c=comparisonData(weeks,selected)
  const groups=[...new Map(c.ordered.flatMap(w=>w.quantities).map(q=>[quantityKey(q),q])).values()]
  const missing=ja?'比較資料なし':'缺少比较资料',mean=ja?'前4週平均':'前4周平均'
  return <div className="history-comparison"><p className="small muted">{ja?'日付順 · 月曜始まり · Asia/Tokyo':'按日期排列 · 周一开始 · Asia/Tokyo'}</p>
    <div className="desktop-comparison"><table><caption>{ja?'週の統計と選択週の直前4週平均':'各周统计及所选周前4周平均'}</caption><thead><tr><th>{ja?'週の開始':'周起点'}</th><th>{ja?'有効時間':'有效时间'}</th>{groups.map(q=><th key={quantityKey(q)}>{q.type}<small>{q.unit}</small></th>)}</tr></thead><tbody>{c.ordered.map(w=><tr key={w.week} className={w.week===selected?'selected-week':''}><th>{w.week}{w.week===selected&&<small>{ja?'対象週':'所选周'}</small>}</th><td><span className="metric-number">{formatClock(w.activeMs)}</span></td>{groups.map(q=>{const value=w.quantities.find(p=>quantityKey(p)===quantityKey(q));return <td key={quantityKey(q)}>{value?<Value q={value}/>:missing}</td>})}</tr>)}<tr><th>{mean}</th><td>{c.meanTime===null?missing:formatClock(c.meanTime)}</td>{groups.map(q=>{const value=c.means.find(p=>quantityKey(p)===quantityKey(q));return <td key={quantityKey(q)}>{value?<Value q={value}/>:missing}</td>})}</tr></tbody></table></div>
    <div className="mobile-comparison">{[...c.ordered.map(w=>({key:w.week,title:`${w.week} — ${new Date(w.endAt-1+9*3600000).toISOString().slice(0,10)}`,active:w.activeMs,quantities:w.quantities})),{key:'mean',title:mean,active:c.meanTime,quantities:c.means}].map(w=><section className={`week-comparison-card ${w.key===selected?'selected-week':''}`} key={w.key}><h3>{w.title}</h3>{w.key===selected&&<p className="comparison-tag">{ja?'対象週':'所选周'}</p>}<dl className="week-metrics"><div><dt>{ja?'有効時間':'有效时间'}</dt><dd className="metric-number">{w.active===null?missing:formatClock(w.active)}</dd></div>{groups.map(q=>{const value=w.quantities.find(p=>quantityKey(p)===quantityKey(q));return <div key={quantityKey(q)} className={value&&(numberText(value.quantity,locale).length+value.unit.length>11)?'wide-metric':''}><dt>{q.type}</dt><dd>{value?<Value q={value}/>:missing}</dd></div>})}</dl></section>)}</div>
    <p className="small muted">{ja?'未記録や未確認の成果はゼロとして補いません。数量平均は4週すべての同じ種類・単位で確認できる値のみです。':'未记录或未确认的成果不补成零。数量平均仅包含前4周都有已确认值的相同类型与单位。'}</p>
  </div>
}
export function QuantityChanges({weeks,selected}:{weeks:WeekFacts[];selected:string}){
  const {locale}=useLocale(),ja=locale==='ja-JP',c=comparisonData(weeks,selected)
  const unavailable=ja?'比較資料なし':'缺少比较资料'
  return <section className="quantity-changes"><h2>{ja?'成果の変化':'成果变化'}</h2><p className="small muted">{ja?'プログラムによる数量比較。時間は週全体の値で、成果ごとの時間ではありません。':'程序计算的数量对比。时间属于整周，不代表各项成果的专属耗时。'}</p>{c.current.quantities.map(q=>{
    const previous=c.previous?.quantities.find(p=>quantityKey(p)===quantityKey(q)),mean=c.means.find(p=>quantityKey(p)===quantityKey(q))
    return <article key={quantityKey(q)}><h3>{q.type}</h3><div className="direct-comparison"><div><span>{ja?'前週':'前周'}</span>{previous?<Value q={previous}/>:<span>{unavailable}</span>}</div><span aria-hidden="true">→</span><div><span>{ja?'対象週':'所选周'}</span><Value q={q}/></div></div><p className="comparison-mean">{ja?'前4週平均':'前4周平均'}：{mean?<Value q={mean}/>:unavailable}</p><details className="evidence"><summary>{ja?'根拠を見る':'查看依据'}<Icon name="chevron" size={18}/></summary><p>{ja?'対象週':'所选周'} · {selected} · <Value q={q}/></p>{previous&&<p>{ja?'前週':'前周'} · {c.previous!.week} · <Value q={previous}/></p>}{mean&&<ul>{[...c.prior].reverse().map(w=><li key={w!.week}>{w!.week} · <Value q={w!.quantities.find(p=>quantityKey(p)===quantityKey(q))!}/></li>)}</ul>}<a className="text-button" href="#/records/sample">{ja?'原文と確認済み成果を見る':'查看原文与已确认成果'}<Icon name="arrow" size={16}/></a></details></article>
  })}</section>
}
