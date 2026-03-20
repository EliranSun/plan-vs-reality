import { useState, useRef, useCallback } from "react";
import { PHASES, STATUS_COLORS } from "../../constants/phases";
import TimePill from "../TimePill/TimePill";
import MoveMenu from "../MoveMenu/MoveMenu";

function getCurrentPhaseIdx() {
  const h = new Date().getHours();
  if (h >= 6 && h < 12) return 0;  // morning
  if (h >= 12 && h < 15) return 1; // midday
  if (h >= 15 && h < 18) return 2; // afternoon
  if (h >= 18 && h < 22) return 3; // evening
  return 0;
}

export default function FocusView({ execution, currentDate, updateExecTask, moveExecTask, moveExecTaskToDate, setView }) {
  const [activeIdx, setActiveIdx] = useState(getCurrentPhaseIdx);
  const [slideDir, setSlideDir] = useState("right");
  const [poppingId, setPoppingId] = useState(null);
  const [justCompletedId, setJustCompletedId] = useState(null);
  const touchStartX = useRef(null);
  const [moveTarget, setMoveTarget] = useState(null);
  const pressTimer = useRef(null);
  const [pressingId, setPressingId] = useState(null);

  const clearPress = useCallback(() => {
    clearTimeout(pressTimer.current);
    pressTimer.current = null;
    setPressingId(null);
  }, []);

  const activePhase = PHASES[activeIdx];
  const tasks = execution[activePhase.id] || [];

  function navigatePhase(dir) {
    const next = activeIdx + dir;
    if (next < 0 || next >= PHASES.length) return;
    setSlideDir(dir > 0 ? "right" : "left");
    setActiveIdx(next);
  }

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (delta < -50) navigatePhase(1);
    else if (delta > 50) navigatePhase(-1);
  }

  function handleTaskClick(task) {
    setPoppingId(task.id);
    setTimeout(() => setPoppingId(null), 320);

    const next =
      task.status === "pending"
        ? "completed"
        : task.status === "completed"
        ? "dropped"
        : "pending";

    if (next === "completed") {
      setJustCompletedId(task.id);
      setTimeout(() => setJustCompletedId(null), 600);
    }

    updateExecTask(activePhase.id, task.id, { ...task, status: next });
  }

  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const totalCount = tasks.filter((t) => t.status !== "dropped").length;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f1117",
        color: "#fff",
        fontFamily: "'DM Sans', sans-serif",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
        userSelect: "none",
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&family=Instrument+Serif:ital@0;1&display=swap"
        rel="stylesheet"
      />

      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 28px 0",
          animation: "focusHeaderIn 0.3s ease both",
        }}
      >
        <button
          onClick={() => setView("split")}
          style={{
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.35)",
            fontSize: 14,
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            padding: "8px 0",
            display: "flex",
            alignItems: "center",
            gap: 6,
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
        >
          ← Plan vs Reality
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {currentDate && (
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>
              {new Date(currentDate + "T00:00:00").toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
          {totalCount > 0 && (
            <span
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.25)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {completedCount}/{totalCount}
            </span>
          )}
        </div>
      </div>

      {/* Phase header */}
      <div
        key={`header-${activeIdx}`}
        style={{
          padding: "32px 28px 0",
          animation: "focusHeaderIn 0.35s ease both",
        }}
      >
        <div style={{ fontSize: 44, lineHeight: 1, marginBottom: 8 }}>
          {activePhase.icon}
        </div>
        <h1
          style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: "clamp(52px, 10vw, 80px)",
            fontWeight: 400,
            margin: "0 0 6px",
            letterSpacing: -1,
            color: "rgba(255,255,255,0.95)",
            lineHeight: 1,
          }}
        >
          {activePhase.label}
        </h1>
        <p
          style={{
            fontSize: 15,
            color: "rgba(255,255,255,0.28)",
            margin: 0,
            letterSpacing: 0.2,
          }}
        >
          {activePhase.hours}
        </p>
      </div>

      {/* Task list */}
      <div
        key={`tasks-${activeIdx}`}
        style={{
          flex: 1,
          padding: "28px 28px 0",
          overflowY: "auto",
          animation:
            slideDir === "right"
              ? "phaseSlideIn 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94) both"
              : "phaseSlideInLeft 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94) both",
        }}
      >
        {tasks.length === 0 ? (
          <div
            style={{
              paddingTop: 40,
              color: "rgba(255,255,255,0.18)",
              fontSize: 20,
              fontStyle: "italic",
              fontFamily: "'Instrument Serif', serif",
            }}
          >
            Nothing planned here.
          </div>
        ) : (
          tasks.map((task) => {
            const isCompleted = task.status === "completed";
            const isDropped = task.status === "dropped";
            const isPopping = poppingId === task.id;
            const wasJustCompleted = justCompletedId === task.id;
            const hasEstimate = Number.isFinite(task.estimatedMinutes) && task.estimatedMinutes > 0;
            const showPlannedMeta = task.status !== "unplanned";
            const plannedMeta = hasEstimate
              ? `Planned · ${task.estimatedMinutes}m estimated`
              : "Planned task";

            return (
              <div
                key={task.id}
                onClick={() => handleTaskClick(task)}
                onPointerDown={(e) => {
                  if (e.button && e.button !== 0) return;
                  setPressingId(task.id);
                  pressTimer.current = setTimeout(() => {
                    setPressingId(null);
                    setMoveTarget({ phaseId: activePhase.id, task });
                  }, 500);
                }}
                onPointerUp={clearPress}
                onPointerCancel={clearPress}
                onPointerLeave={clearPress}
                onContextMenu={(e) => {
                  e.preventDefault();
                  clearPress();
                  setMoveTarget({ phaseId: activePhase.id, task });
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "20px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  cursor: "pointer",
                  animation: isPopping ? "taskPop 0.32s ease both" : "none",
                  transition: "opacity 0.25s ease, transform 0.15s ease",
                  opacity: isDropped ? 0.22 : 1,
                  transform: pressingId === task.id ? "scale(0.98)" : "scale(1)",
                  touchAction: "none",
                }}
              >
                {/* Status bar */}
                <div
                  style={{
                    width: 5,
                    minWidth: 5,
                    alignSelf: "stretch",
                    borderRadius: 3,
                    background: STATUS_COLORS[task.status] || STATUS_COLORS.pending,
                    transition: "background 0.2s ease",
                  }}
                />

                {/* Task text */}
                <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
                  <span
                    style={{
                      fontSize: "clamp(24px, 4.5vw, 34px)",
                      fontWeight: 400,
                      color: isCompleted
                        ? "rgba(255,255,255,0.38)"
                        : isDropped
                        ? "rgba(255,255,255,0.22)"
                        : "rgba(255,255,255,0.92)",
                      lineHeight: 1.25,
                      display: "block",
                      transition: "color 0.25s ease",
                    }}
                  >
                    {task.text || <em style={{ opacity: 0.4 }}>Untitled task</em>}
                  </span>
                  {showPlannedMeta && (
                    <span
                      style={{
                        display: "block",
                        marginTop: 4,
                        fontSize: 12,
                        color: isDropped ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.3)",
                        letterSpacing: 0.2,
                      }}
                    >
                      {plannedMeta}
                    </span>
                  )}

                  {/* Animated strikethrough */}
                  {isCompleted && (
                    <span
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: 0,
                        height: 2,
                        background: "rgba(255,255,255,0.25)",
                        borderRadius: 1,
                        animation: "strikeGrow 0.3s ease both",
                        width: "100%",
                      }}
                    />
                  )}
                </div>

                {/* Time pill */}
                <TimePill
                  estimatedMinutes={task.estimatedMinutes}
                  onChange={(minutes) =>
                    updateExecTask(activePhase.id, task.id, { ...task, estimatedMinutes: minutes })
                  }
                  visible={!!task.estimatedMinutes}
                />

                {/* Checkmark */}
                <div
                  style={{
                    width: 32,
                    minWidth: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    color: "#34d399",
                    opacity: isCompleted ? 1 : 0,
                    animation: wasJustCompleted ? "checkBounce 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both" : "none",
                    transition: "opacity 0.2s ease",
                  }}
                >
                  ✓
                </div>
              </div>
            );
          })
        )}

        {/* Spacer at bottom */}
        <div style={{ height: 120 }} />
      </div>

      {/* Phase navigation dots + arrows */}
      <div
        style={{
          position: "sticky",
          bottom: 0,
          padding: "20px 28px 36px",
          background: "linear-gradient(to top, #0f1117 70%, transparent)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
        }}
      >
        <button
          onClick={() => navigatePhase(-1)}
          disabled={activeIdx === 0}
          style={{
            background: "none",
            border: "none",
            color: activeIdx === 0 ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.4)",
            fontSize: 20,
            cursor: activeIdx === 0 ? "default" : "pointer",
            padding: "4px 8px",
            transition: "color 0.15s",
            lineHeight: 1,
          }}
        >
          ‹
        </button>

        {/* Phase dots */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {PHASES.map((phase, i) => {
            const phaseTasks = execution[phase.id] || [];
            const phaseCompleted = phaseTasks.filter((t) => t.status === "completed").length;
            const phaseTotal = phaseTasks.filter((t) => t.status !== "dropped").length;
            const allDone = phaseTotal > 0 && phaseCompleted === phaseTotal;

            return (
              <button
                key={phase.id}
                onClick={() => {
                  setSlideDir(i > activeIdx ? "right" : "left");
                  setActiveIdx(i);
                }}
                title={phase.label}
                style={{
                  background: "none",
                  border: "none",
                  padding: 4,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: i === activeIdx ? 24 : 8,
                    height: 8,
                    borderRadius: 4,
                    background: i === activeIdx
                      ? "rgba(255,255,255,0.85)"
                      : allDone
                      ? "#34d399"
                      : "rgba(255,255,255,0.2)",
                    transition: "all 0.2s ease",
                  }}
                />
              </button>
            );
          })}
        </div>

        <button
          onClick={() => navigatePhase(1)}
          disabled={activeIdx === PHASES.length - 1}
          style={{
            background: "none",
            border: "none",
            color:
              activeIdx === PHASES.length - 1
                ? "rgba(255,255,255,0.1)"
                : "rgba(255,255,255,0.4)",
            fontSize: 20,
            cursor: activeIdx === PHASES.length - 1 ? "default" : "pointer",
            padding: "4px 8px",
            transition: "color 0.15s",
            lineHeight: 1,
          }}
        >
          ›
        </button>
      </div>

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
