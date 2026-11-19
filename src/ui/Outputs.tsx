import {OutputList} from '../components/OutputList'
import type {OutputEntry} from '../types'
import type {SessionEngine} from '../state/browserEngine'
export function Outputs({sid,outputs,engine}:{sid:string;outputs:OutputEntry[];engine:SessionEngine;recent?:boolean;compact?:boolean}){
 return <OutputList outputs={outputs} emptyLabel="" onEdit={(id,text)=>engine.editOutput(sid,id,text)}/>
}
