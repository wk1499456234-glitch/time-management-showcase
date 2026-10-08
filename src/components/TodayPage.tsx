import type { SessionEngine } from '../state/useSessionEngine'
import { computeBudgetStats } from '../utils/stats'
import { BudgetSummary } from './BudgetSummary'
import { ActivityStart } from './ActivityStart'
import { RunningPanel } from './RunningPanel'
import { SessionSummaryCard } from './SessionSummaryCard'
import { DailySessionsList } from './DailySessionsList'

export function TodayPage({ engine }: { engine: SessionEngine }) {
  const stats = computeBudgetStats(engine.todayActiveMs)

  return (
    <section className="page">
      <BudgetSummary stats={stats} />

      {engine.lastFinishedSession && (
        <SessionSummaryCard session={engine.lastFinishedSession} onClose={engine.dismissLastSummary} />
      )}

      <div id="timer" className="section-target" tabIndex={-1}>
      <fieldset className="session-controls" disabled={engine.conflict || engine.pending}>
      {engine.status === 'idle' ? (
        <ActivityStart onStart={engine.start} />
      ) : (
        <RunningPanel
          status={engine.status}
          activityId={engine.currentActivityId as string}
          activeMs={engine.activeMs}
          outputs={engine.outputs}
          onPause={engine.pause}
          onResume={engine.resume}
          onStop={engine.stop}
          onAddOutput={engine.addOutput}
          onEditOutput={(id, text) => engine.data.current ? engine.editOutput(engine.data.current.id, id, text) : Promise.resolve(false)}
        />
      )}

      </fieldset>
      </div>
      <DailySessionsList sessions={engine.finishedSessions} onEditOutput={(sessionId, outputId, text) => engine.editOutput(sessionId, outputId, text)} />
    </section>
  )
}
