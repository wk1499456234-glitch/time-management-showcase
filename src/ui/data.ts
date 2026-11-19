export const tokyoDay=(ms:number)=>new Date(ms+9*3600000).toISOString().slice(0,10)
export const dateTime=(ms:number,locale:string)=>new Date(ms).toLocaleString(locale,{timeZone:'Asia/Tokyo',hour12:false})
export const clockTime=(ms:number,locale:string)=>new Date(ms).toLocaleTimeString(locale,{timeZone:'Asia/Tokyo',hour:'2-digit',minute:'2-digit',hour12:false})
