import {useLocale} from '../i18n'
import {LocalDataPanel} from '../components/LocalDataPanel'
import type {SessionEngine} from '../state/browserEngine'
export function SettingsPage({engine}:{engine:SessionEngine}){
 const {locale,setLocale}=useLocale(),ja=locale==='ja-JP'
 return <><div className="page-heading"><h1>{ja?'設定':'设置'}</h1></div><section className="setting-row"><h2>{ja?'表示言語':'界面语言'}</h2><div className="actions"><button className="button" aria-pressed={!ja} onClick={()=>setLocale('zh-CN')}>简体中文</button><button className="button" aria-pressed={ja} onClick={()=>setLocale('ja-JP')}>日本語</button></div></section>
 <section className="setting-row"><h2>{ja?'データの保存':'数据保存'}</h2><div><h3>{ja?'このブラウザーに保存':'保存到当前浏览器'}</h3><p>{ja?'時間とOutputは端末内に保存されます。固定サンプルとは別の記録で、サーバーには送信されません。':'计时和Output保存在当前设备的浏览器，与固定示例分开，不发送到服务器。'}</p></div></section>
 <section className="setting-row"><h2>{ja?'JSONバックアップ':'JSON备份'}</h2><div><LocalDataPanel engine={engine}/><p className="small muted">{ja?'試用記録の原文・日時・一時停止を保存します。固定のAI結果は含みません。ブラウザーのデータ消去前や端末変更時は書き出してください。':'保存试用记录的原文、时间和暂停区间，不包含固定AI结果。清除浏览器数据或更换设备前请导出。'}</p></div></section>
 <section className="setting-row"><h2>AI</h2><div><p>{ja?'公開版では保存済みのAI解析と週の振り返りを読めます。試用入力からのAI生成は行いません。':'公开版可阅读已保存的AI解析和周回顾，不对试用输入生成AI结果。'}</p><a className="text-button" href="#/review">{ja?'保存済みの結果を読む':'读取已保存结果'} →</a><details><summary>{ja?'フル版との違い':'与完整版的区别'}</summary><p>{ja?'フル版はサーバーに保存し、許可された本人が解析・成果確認・週の回顧生成と更新を行えます。公開版の試用記録とは自動同期しません。':'完整版保存到服务端，获授权本人可解析、确认成果、生成和更新周回顾。与公开版试用记录不会自动同步。'}</p></details></div></section></>
}
