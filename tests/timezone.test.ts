import test from 'node:test'
import assert from 'node:assert/strict'
import {activeInDay,todayBounds} from '../src/state/sessionData'
import {formatLocalHM} from '../src/utils/time'
import {tokyoDay,clockTime} from '../src/ui/data'
test('Tokyo midnight, prior evening, cross-midnight pause and Output time ignore device zone',()=>{
 const at=(s:string)=>Date.parse(s+'+09:00'),now=at('2026-11-19T00:30:00')
 assert.deepEqual(todayBounds(now),[at('2026-11-19T00:00:00'),at('2026-11-20T00:00:00')])
 assert.equal(activeInDay({startAt:at('2026-11-18T18:00:00'),pauseIntervals:[]},at('2026-11-18T18:30:00'),now),0)
 const run={startAt:at('2026-11-18T23:30:00'),pauseIntervals:[{start:at('2026-11-18T23:50:00'),end:at('2026-11-19T00:10:00')}]}
 assert.equal(activeInDay(run,now,now),20*60000)
 assert.equal(activeInDay(run,now,at('2026-11-18T23:59:00')),20*60000)
 assert.equal(activeInDay({...run,pauseIntervals:[{...run.pauseIntervals[0],end:null}]},now,now),0)
 assert.equal(tokyoDay(now),'2026-11-19');assert.equal(formatLocalHM(now),'00:30')
 assert.equal(clockTime(now,'ja-JP'),'00:30');assert.equal(clockTime(now,'zh-CN'),'00:30')
})
