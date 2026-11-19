export interface Quantity {type:string;unit:string;quantity:number}
export interface WeekFacts {week:string;endAt:number;activeMs:number;quantities:Quantity[];coverage:{total:number;completed:number;pending:number;processing:number;failed:number;unconfirmed:number}}
export const quantityKey=(q:Pick<Quantity,'type'|'unit'>)=>JSON.stringify([q.type,q.unit])
export const numberText=(value:number,locale:string)=>new Intl.NumberFormat(locale,{maximumFractionDigits:12}).format(value)
export function comparisonData(weeks:WeekFacts[],selected:string){
  const ordered=[...weeks].sort((a,b)=>a.week.localeCompare(b.week))
  const current=ordered.find(w=>w.week===selected)!
  const before=(n:number)=>new Date(Date.parse(selected+'T00:00:00Z')-n*7*86400000).toISOString().slice(0,10)
  const prior=Array.from({length:4},(_,i)=>ordered.find(w=>w.week===before(i+1)))
  const ready=prior.every(w=>w&&w.coverage.total>0&&w.coverage.completed===w.coverage.total&&!w.coverage.pending&&!w.coverage.processing&&!w.coverage.failed&&!w.coverage.unconfirmed)
  const priorGroups=[...new Map(prior.flatMap(w=>w?.quantities??[]).map(q=>[quantityKey(q),q])).values()]
  const means=ready?priorGroups.flatMap(q=>{
    const matches=prior.map(w=>w!.quantities.find(p=>quantityKey(p)===quantityKey(q)))
    return matches.every(Boolean)?[{...q,quantity:matches.reduce((sum,p)=>sum+p!.quantity,0)/4}]:[]
  }):[]
  return {ordered,current,previous:prior[0],prior,means,meanTime:prior.every(Boolean)?prior.reduce((sum,w)=>sum+w!.activeMs,0)/4:null}
}
