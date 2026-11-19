// Filled woven ribbons remain legible at the compact brand size.
export function WeaveMark({large=false}:{large?:boolean}) {
  return <svg className={large?'weave-mark weave-large':'weave-mark'} viewBox="0 0 80 45" aria-hidden="true"><path d="M1 30C24-4 29 1 47 21S65 27 79 12C63 41 54 41 37 20S18 16 1 30Z" fill="#8393a3"/><path d="M0 36C26 42 36 14 62 6L79 5C53 14 34 46 9 42Z" fill="#c3cbd3"/><path d="M29 35C43 28 53 17 63 13L74 11C57 20 47 34 35 39Z" fill="#576c7e"/></svg>
}
