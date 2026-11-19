import {useEffect, useRef, type ReactNode} from 'react'
import {attachScrollReveal} from './scrollReveal'

// 既定では表示する。動きの失敗や未対応で内容を隠したり、入力を妨げたりしない。
export function Reveal({children,id,order=0}:{children:ReactNode;id:string;order?:number}) {
  const ref=useRef<HTMLDivElement>(null)
  useEffect(()=>{
    if(ref.current)return attachScrollReveal(ref.current,id,order)
  },[id,order])
  return <div ref={ref} data-reveal={id}>{children}</div>
}

export function Icon({name,size=20}:{name:string;size?:number}) {
  const paths:Record<string,string>={account:'M16 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0 M3 22v-2a9 7 0 0 1 18 0v2',timer:'M12 8v5l3 2 M9 2h6 M12 2v3 M19 5l1 1 M21 14a9 9 0 1 1-18 0 9 9 0 0 1 18 0',records:'M6 3h12a2 2 0 0 1 2 2v16H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2 M4 17h16 M8 7h8 M8 11h6',review:'M4 19h16 M6 15v-4 M12 15V5 M18 15V8',settings:'M4 7h16 M4 17h16 M9 4v6 M16 14v6',arrow:'M5 12h14 M14 7l5 5-5 5',play:'M8 5l11 7-11 7Z',pause:'M8 5v14 M16 5v14',check:'M5 12l4 4L19 6',chevron:'M6 9l6 6 6-6'}
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]||paths.timer}/></svg>
}
