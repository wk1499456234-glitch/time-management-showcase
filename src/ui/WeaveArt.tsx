import ribbons from '../assets/timeweave-ribbons.svg'

/** Original filled, shaded ribbons. Decorative; never a screenshot of controls. */
export function WeaveArt({className=''}:{className?:string}) {
  return <img className={`weave-art ${className}`} src={ribbons} alt="" aria-hidden="true" width="800" height="250"/>
}
