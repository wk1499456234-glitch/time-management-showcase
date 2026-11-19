import {test} from 'node:test'
import assert from 'node:assert/strict'
import demo from '../src/data/ai-demo.json'
import {comparisonData,numberText} from '../src/ui/comparisonData'
test('chronological weeks and previous-week / four-week mean remain distinct',()=>{
 const c=comparisonData(demo.weeks,demo.targetWeek)
 assert.equal(c.previous?.week,'2026-11-02');assert.equal(c.meanTime,10800000)
 assert.equal(c.means.find(q=>q.unit==='語')?.quantity,90)
 assert.equal(c.means.find(q=>q.unit==='ページ')?.quantity,6)
 assert.equal(c.current.quantities.find(q=>q.unit==='ページ')?.quantity,12)
 assert.deepEqual(c.ordered.map(w=>w.week),[...c.ordered.map(w=>w.week)].sort())
 assert.equal(comparisonData(demo.weeks,'2026-10-19').means.length,0)
 const withoutCurrent=structuredClone(demo.weeks);withoutCurrent[4].quantities=[]
 assert.equal(comparisonData(withoutCurrent,demo.targetWeek).means.length,3)
 assert.equal(comparisonData(withoutCurrent,demo.targetWeek).current.quantities.length,0)
})
test('unit groups are never combined, and missing/unconfirmed quantities are not zero',()=>{
 const weeks=structuredClone(demo.weeks)
 weeks[0].quantities[0].unit='章'
 const c=comparisonData(weeks,demo.targetWeek)
 assert.ok(c.means.length<3)
 weeks[0].coverage.unconfirmed=1
 assert.equal(comparisonData(weeks,demo.targetWeek).means.length,0)
})
test('integer formatting omits artificial decimals and preserves real decimal values',()=>{
 assert.equal(numberText(20.0,'ja-JP'),'20');assert.equal(numberText(2.125,'zh-CN'),'2.125')
 assert.equal(numberText(1000000000000,'ja-JP'),'1,000,000,000,000')
})
