import ribbons from '../assets/timeweave-ribbons.svg'

/** 塗りと陰影を持つ独自のリボン。装飾用であり、操作画面の画像ではない。 */
export function WeaveArt({className=''}:{className?:string}) {
  return <img className={`weave-art ${className}`} src={ribbons} alt="" aria-hidden="true" width="800" height="250"/>
}
