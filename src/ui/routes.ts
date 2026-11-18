export const pages=['timer','records','review','settings'] as const
export type Page=typeof pages[number]
export function route(hash:string):Page {const key=hash.replace(/^#\/?/,'');return key==='backup'?'settings':pages.includes(key as Page)?key as Page:'timer'}
