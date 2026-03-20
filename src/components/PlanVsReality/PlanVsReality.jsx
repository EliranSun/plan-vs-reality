import { useState } from "react";
import { usePlanVsReality } from "../../hooks/usePlanVsReality";
import { PHASES, STATUS_COLORS, STATUS_LABELS } from "../../constants/phases";
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

  const [isSyncHovered, setIsSyncHovered] = useState(false);
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
    <div
      style={{
        minHeight: "100vh",
        background: "#0f1117",
        color: "#fff",
        fontFamily: "'DM Sans', sans-serif",
        padding: "16px 12px 32px",
        maxWidth: 960,
        margin: "0 auto",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&family=Instrument+Serif:ital@0;1&display=swap"
        rel="stylesheet"
      />

      {/* Header */}
      <div style={{ marginBottom: 28, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: 36,
              fontWeight: 400,
              color: "rgba(255,255,255,0.92)",
              margin: 0,
              letterSpacing: -0.5,
            }}
          >
            Plan{" "}
            <span style={{ color: "rgba(255,255,255,0.25)", fontStyle: "italic" }}>
              vs.
            </span>{" "}
            Reality
          </h1>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              marginTop: 6,
            }}
          >
            <button
              onClick={() => navigateToDate(offsetDate(currentDate, -1))}
              title="Previous day"
              style={{
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.25)",
                fontSize: 16,
                cursor: "pointer",
                padding: "0 4px",
                lineHeight: 1,
              }}
            >
              ‹
            </button>
            <button
              onClick={() => setCalendarOpen(true)}
              title="Open calendar"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  color: isToday ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.55)",
                }}
              >
                {formattedDate}
              </span>
              <span style={{ fontSize: 13, opacity: 0.4 }}>📅</span>
            </button>
            <button
              onClick={() => navigateToDate(offsetDate(currentDate, 1))}
              title="Next day"
              style={{
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.25)",
                fontSize: 16,
                cursor: "pointer",
                padding: "0 4px",
                lineHeight: 1,
              }}
            >
              ›
            </button>
            {!isToday && (
              <button
                onClick={() => navigateToDate(todayStr)}
                title="Go to today"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "none",
                  borderRadius: 5,
                  color: "rgba(255,255,255,0.4)",
                  fontSize: 10,
                  cursor: "pointer",
                  padding: "3px 7px",
                  fontFamily: "'DM Sans', sans-serif",
                  letterSpacing: 0.3,
                }}
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
      <div
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 20,
          background: "rgba(255,255,255,0.04)",
          borderRadius: 10,
          padding: 4,
          width: "fit-content",
        }}
      >
        {[
          { id: "plan", label: "Plan" },
          { id: "split", label: "Split" },
          { id: "execution", label: "Reality" },
          ...(synced ? [{ id: "focus", label: "Focus" }] : []),
        ].map((v) => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            style={{
              padding: "7px 18px",
              borderRadius: 8,
              border: "none",
              background:
                view === v.id ? "rgba(255,255,255,0.1)" : "transparent",
              color:
                view === v.id
                  ? "rgba(255,255,255,0.9)"
                  : "rgba(255,255,255,0.35)",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              transition: "all 0.15s",
            }}
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
          style={{
            display: "block",
            margin: "0 auto 28px",
            padding: "12px 32px",
            borderRadius: 10,
            border: `1px solid ${isSyncHovered ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.15)"}`,
            background: isSyncHovered ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.06)",
            color: "rgba(255,255,255,0.75)",
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            transition: "all 0.2s",
          }}
          onMouseEnter={() => setIsSyncHovered(true)}
          onMouseLeave={() => setIsSyncHovered(false)}
        >
          Lock plan → Start tracking reality
        </button>
      )}

      {/* Two columns */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: view === "split" ? "1fr 1fr" : "1fr",
          gap: 16,
        }}
      >
        {/* Plan Column */}
        {showPlan && (
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 20,
                paddingBottom: 12,
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #60a5fa, #818cf8)",
                }}
              />
              <h2
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontSize: 22,
                  fontWeight: 400,
                  color: "rgba(255,255,255,0.7)",
                  margin: 0,
                }}
              >
                The Plan
              </h2>
              {synced && (
                <span
                  style={{
                    fontSize: 10,
                    background: "rgba(255,255,255,0.06)",
                    padding: "3px 8px",
                    borderRadius: 5,
                    color: "rgba(255,255,255,0.3)",
                    textTransform: "uppercase",
                    letterSpacing: 0.8,
                  }}
                >
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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 20,
                paddingBottom: 12,
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #34d399, #fbbf24)",
                }}
              />
              <h2
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontSize: 22,
                  fontWeight: 400,
                  color: "rgba(255,255,255,0.7)",
                  margin: 0,
                }}
              >
                Reality
              </h2>
            </div>
            {!synced ? (
              <div
                style={{
                  padding: "40px 20px",
                  textAlign: "center",
                  color: "rgba(255,255,255,0.2)",
                  fontSize: 14,
                  fontStyle: "italic",
                  border: "1px dashed rgba(255,255,255,0.08)",
                  borderRadius: 12,
                }}
              >
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
      <div
        style={{
          marginTop: 40,
          display: "flex",
          gap: 20,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <div
            key={key}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 11,
              color: "rgba(255,255,255,0.35)",
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 3,
                background: STATUS_COLORS[key],
              }}
            />
            {label}
          </div>
        ))}
      </div>

      {/* Move menu hint */}
      {synced && (
        <div
          style={{
            marginTop: 12,
            textAlign: "center",
            fontSize: 10,
            color: "rgba(255,255,255,0.15)",
            letterSpacing: 0.3,
          }}
        >
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
