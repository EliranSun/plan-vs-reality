import { useState } from "react";
import { usePlanVsReality } from "../../hooks/usePlanVsReality";
import { PHASES, STATUS_LABELS } from "../../constants/phases";
import PhaseBlock from "../PhaseBlock/PhaseBlock";
import DiffSummary from "../DiffSummary/DiffSummary";
import DataMenu from "../DataMenu/DataMenu";
import FocusView from "../FocusView/FocusView";
import CalendarView from "../CalendarView/CalendarView";
import MoveMenu from "../MoveMenu/MoveMenu";

function offsetDate(dateStr, days) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function PlanVsReality() {
  const {
    plan,
    execution,
    synced,
    view,
    currentDate,
    allDaySummaries,
    setView,
    navigateToDate,
    addPlanTask,
    updatePlanTask,
    removePlanTask,
    addUnplannedTask,
    updateExecTask,
    removeExecTask,
    moveExecTask,
    moveExecTaskToDate,
    syncToExecution,
    importData,
    resetToDemo,
    clearAll,
  } = usePlanVsReality();

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [moveTarget, setMoveTarget] = useState(null); // { phaseId, task }

  const todayStr = new Date().toISOString().slice(0, 10);
  const isToday = currentDate === todayStr;

  const formattedDate = new Date(currentDate + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const showPlan = view === "split" || view === "plan";
  const showExec = view === "split" || view === "execution";
  const statusColorClasses = {
    completed: "bg-emerald-400",
    dropped: "bg-red-400",
    moved: "bg-amber-400",
    unplanned: "bg-violet-400",
    pending: "bg-slate-400",
  };

  if (calendarOpen) {
    return (
      <CalendarView
        allDaySummaries={allDaySummaries}
        currentDate={currentDate}
        onSelectDate={navigateToDate}
        onClose={() => setCalendarOpen(false)}
      />
    );
  }

  if (view === "focus") {
    return (
      <FocusView
        execution={execution}
        currentDate={currentDate}
        updateExecTask={updateExecTask}
        moveExecTask={moveExecTask}
        moveExecTaskToDate={moveExecTaskToDate}
        setView={setView}
      />
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-[960px] bg-[#0f1117] px-3 pt-4 pb-8 font-['DM_Sans',sans-serif] text-white">
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&family=Instrument+Serif:ital@0;1&display=swap"
        rel="stylesheet"
      />

      {/* Header */}
      <div className="mb-7 flex items-start justify-between">
        <div>
          <h1 className="m-0 font-['Instrument_Serif',serif] text-4xl font-normal tracking-[-0.5px] text-white/90">
            Plan{" "}
            <span className="text-white/25 italic">
              vs.
            </span>{" "}
            Reality
          </h1>
          <div className="mt-1.5 flex items-center gap-1">
            <button
              onClick={() => navigateToDate(offsetDate(currentDate, -1))}
              title="Previous day"
              className="cursor-pointer border-none bg-transparent px-1 py-0 text-base leading-none text-white/25"
            >
              ‹
            </button>
            <button
              onClick={() => setCalendarOpen(true)}
              title="Open calendar"
              className="flex cursor-pointer items-center gap-1.5 border-none bg-transparent p-0"
            >
              <span className={`text-sm ${isToday ? "text-white/35" : "text-white/55"}`}>
                {formattedDate}
              </span>
              <span className="text-[13px] opacity-40">📅</span>
            </button>
            <button
              onClick={() => navigateToDate(offsetDate(currentDate, 1))}
              title="Next day"
              className="cursor-pointer border-none bg-transparent px-1 py-0 text-base leading-none text-white/25"
            >
              ›
            </button>
            {!isToday && (
              <button
                onClick={() => navigateToDate(todayStr)}
                title="Go to today"
                className="cursor-pointer rounded-[5px] border-none bg-white/6 px-[7px] py-[3px] font-['DM_Sans',sans-serif] text-[10px] tracking-[0.3px] text-white/40"
              >
                Today
              </button>
            )}
          </div>
        </div>
        <DataMenu
          plan={plan}
          execution={execution}
          synced={synced}
          onImport={importData}
          onResetToDemo={resetToDemo}
          onClearAll={clearAll}
        />
      </div>

      {/* View toggle */}
      <div className="mb-5 flex w-fit gap-1 rounded-[10px] bg-white/4 p-1">
        {[
          { id: "plan", label: "Plan" },
          { id: "split", label: "Split" },
          { id: "execution", label: "Reality" },
          ...(synced ? [{ id: "focus", label: "Focus" }] : []),
        ].map((v) => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            className={`cursor-pointer rounded-lg border-none px-[18px] py-[7px] font-['DM_Sans',sans-serif] text-[13px] font-medium transition-all duration-150 ${
              view === v.id
                ? "bg-white/10 text-white/90"
                : "bg-transparent text-white/35"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Diff summary — only when execution has items */}
      {synced && <DiffSummary plan={plan} execution={execution} />}

      {/* Sync button */}
      {!synced && (
        <button
          onClick={syncToExecution}
          className="mx-auto mb-7 block cursor-pointer rounded-[10px] border border-white/15 bg-white/6 px-8 py-3 font-['DM_Sans',sans-serif] text-sm font-medium text-white/75 transition-all duration-200 hover:border-white/30 hover:bg-white/10"
        >
          Lock plan → Start tracking reality
        </button>
      )}

      {/* Two columns */}
      <div className={`grid gap-4 ${view === "split" ? "grid-cols-2" : "grid-cols-1"}`}>
        {/* Plan Column */}
        {showPlan && (
          <div>
            <div className="mb-5 flex items-center gap-2.5 border-b border-white/6 pb-3">
              <div className="size-2.5 rounded-full bg-linear-to-br from-blue-400 to-indigo-400" />
              <h2 className="m-0 font-['Instrument_Serif',serif] text-[22px] font-normal text-white/70">
                The Plan
              </h2>
              {synced && (
                <span className="rounded-[5px] bg-white/6 px-2 py-[3px] text-[10px] tracking-[0.8px] text-white/30 uppercase">
                  locked
                </span>
              )}
            </div>
            {PHASES.map((phase) => (
              <PhaseBlock
                key={phase.id}
                phase={phase}
                tasks={plan[phase.id] || []}
                side="plan"
                onAddTask={addPlanTask}
                onUpdateTask={updatePlanTask}
                onRemoveTask={removePlanTask}
              />
            ))}
          </div>
        )}

        {/* Execution Column */}
        {showExec && (
          <div>
            <div className="mb-5 flex items-center gap-2.5 border-b border-white/6 pb-3">
              <div className="size-2.5 rounded-full bg-linear-to-br from-emerald-400 to-amber-400" />
              <h2 className="m-0 font-['Instrument_Serif',serif] text-[22px] font-normal text-white/70">
                Reality
              </h2>
            </div>
            {!synced ? (
              <div className="rounded-xl border border-dashed border-white/8 px-5 py-10 text-center text-sm italic text-white/20">
                Set up your plan first, then lock it to start tracking
              </div>
            ) : (
              PHASES.map((phase) => (
                <PhaseBlock
                  key={phase.id}
                  phase={phase}
                  tasks={execution[phase.id] || []}
                  side="execution"
                  onAddTask={addUnplannedTask}
                  onUpdateTask={updateExecTask}
                  onRemoveTask={removeExecTask}
                  onMoveRequest={(phaseId, task) => setMoveTarget({ phaseId, task })}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-10 flex flex-wrap justify-center gap-5">
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <div key={key} className="flex items-center gap-1.5 text-[11px] text-white/35">
            <div className={`size-2 rounded-[3px] ${statusColorClasses[key] || "bg-slate-400"}`} />
            {label}
          </div>
        ))}
      </div>

      {/* Move menu hint */}
      {synced && (
        <div className="mt-3 text-center text-[10px] tracking-[0.3px] text-white/15">
          Long-press a task to move it
        </div>
      )}

      {/* Move menu */}
      {moveTarget && (
        <MoveMenu
          task={moveTarget.task}
          currentPhaseId={moveTarget.phaseId}
          currentDate={currentDate}
          onMoveToPhase={(fromPhaseId, taskId, toPhaseId) => {
            moveExecTask(fromPhaseId, taskId, toPhaseId);
            setMoveTarget(null);
          }}
          onMoveToDate={(fromPhaseId, taskId, targetDate, toPhaseId) => {
            moveExecTaskToDate(fromPhaseId, taskId, targetDate, toPhaseId);
            setMoveTarget(null);
          }}
          onClose={() => setMoveTarget(null)}
        />
      )}
    </div>
  );
}
