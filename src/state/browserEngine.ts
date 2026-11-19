import {useSessionEngine} from './useSessionEngine'
export function useBrowserEngine(){
 const e=useSessionEngine()
 return {...e,ready:true,blocked:e.pending||e.conflict||e.unsaved,error:e.error||e.warning,
 journalWarning:'',todayAsOf:e.now,refresh:e.reloadData,recoveryBackup:e.rawBackup}
}
export type SessionEngine=ReturnType<typeof useBrowserEngine>
