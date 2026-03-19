import { useState } from "react";
import { usePlanVsReality } from "../../hooks/usePlanVsReality";
import { PHASES, STATUS_COLORS, STATUS_LABELS } from "../../constants/phases";
import PhaseBlock from "../PhaseBlock/PhaseBlock";
import DiffSummary from "../DiffSummary/DiffSummary";

export default function PlanVsReality() {
  const {
    plan,
    execution,
    synced,
    view,
    setView,
    addPlanTask,
    updatePlanTask,
    removePlanTask,
    addUnplannedTask,
    updateExecTask,
    removeExecTask,
    syncToExecution,
  } = usePlanVsReality();

  const [isSyncHovered, setIsSyncHovered] = useState(false);

  const showPlan = view === "split" || view === "plan";
  const showExec = view === "split" || view === "execution";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f1117",
        color: "#fff",
        fontFamily: "'DM Sans', sans-serif",
        padding: "32px 24px 64px",
        maxWidth: 960,
        margin: "0 auto",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&family=Instrument+Serif:ital@0;1&display=swap"
        rel="stylesheet"
      />

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
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
        <p
          style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.35)",
            margin: "6px 0 0",
          }}
        >
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
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
          gap: 32,
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
    </div>
  );
}
