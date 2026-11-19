export const pages=['timer','records','review','settings'] as const
export type Page=typeof pages[number]
export function route(hash:string):Page {const key=hash.replace(/^#\/?/,'').split('/')[0];return key==='backup'?'settings':pages.includes(key as Page)?key as Page:'timer'}
export function backupRoute(hash:string) {return /^#\/?backup(?:\/|$)/.test(hash)||/^#\/?settings\/backup(?:\/|$)/.test(hash)}
