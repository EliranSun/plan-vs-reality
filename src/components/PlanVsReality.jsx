import { useState, useRef, useEffect, useCallback } from "react";

const PHASES = [
  { id: "morning", label: "Morning", icon: "☀️", hours: "6am – 12pm" },
  { id: "midday", label: "Midday", icon: "🌤", hours: "12pm – 3pm" },
  { id: "afternoon", label: "Afternoon", icon: "🌅", hours: "3pm – 6pm" },
  { id: "evening", label: "Evening", icon: "🌙", hours: "6pm – 10pm" },
];

const STATUS_COLORS = {
  completed: "#34d399",
  dropped: "#f87171",
  moved: "#fbbf24",
  unplanned: "#a78bfa",
  pending: "#94a3b8",
};

const STATUS_LABELS = {
  completed: "Done",
  dropped: "Dropped",
  moved: "Moved",
  unplanned: "Unplanned",
  pending: "Pending",
};

let idCounter = 1;
const uid = () => `task-${Date.now()}-${idCounter++}`;

const DEMO_PLAN = {
  morning: [
    { id: uid(), text: "Deep work: CSS quest system", status: "pending" },
    { id: uid(), text: "Review Fibery board", status: "pending" },
  ],
  midday: [
    { id: uid(), text: "Lunch break + walk", status: "pending" },
    { id: uid(), text: "Reply to emails", status: "pending" },
  ],
  afternoon: [
    { id: uid(), text: "Unity shader debugging", status: "pending" },
    { id: uid(), text: "Write quest notification logic", status: "pending" },
  ],
  evening: [
    { id: uid(), text: "Read game design article", status: "pending" },
  ],
};

const emptyPhases = () => ({
  morning: [],
  midday: [],
  afternoon: [],
  evening: [],
});

// ─── Inline editable text ───
function EditableText({ value, onChange, placeholder, className, style }) {
  const [editing, setEditing] = useState(!value);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  if (editing) {
    return (
      <input
        ref={inputRef}
        className={className}
        style={{
          ...style,
          background: "transparent",
          border: "none",
          borderBottom: "1.5px solid var(--accent)",
          outline: "none",
          width: "100%",
          padding: "2px 0",
        }}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => value && setEditing(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && value) setEditing(false);
          if (e.key === "Escape") setEditing(false);
        }}
      />
    );
  }

  return (
    <span
      className={className}
      style={{ ...style, cursor: "pointer" }}
      onClick={() => setEditing(true)}
      title="Click to edit"
    >
      {value}
    </span>
  );
}

// ─── Task Card ───
function TaskCard({ task, side, onUpdate, onRemove, planPhases }) {
  const isExecution = side === "execution";
  const statusColor = STATUS_COLORS[task.status] || STATUS_COLORS.pending;

  const originalPhase = isExecution
    ? Object.entries(planPhases || {}).find(([, tasks]) =>
        tasks.some((t) => t.text === task.text)
      )?.[0]
    : null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        borderRadius: 10,
        background: "rgba(255,255,255,0.04)",
        border: `1px solid rgba(255,255,255,0.07)`,
        transition: "all 0.2s",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.08)";
        e.currentTarget.style.borderColor = statusColor + "44";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.04)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
      }}
    >
      {/* Status pip */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          background: statusColor,
          borderRadius: "10px 0 0 10px",
        }}
      />

      {isExecution ? (
        <button
          onClick={() => {
            const next =
              task.status === "pending"
                ? "completed"
                : task.status === "completed"
                ? "dropped"
                : "pending";
            onUpdate({ ...task, status: next });
          }}
          title={`Status: ${STATUS_LABELS[task.status]}. Click to cycle.`}
          style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            border: `2px solid ${statusColor}`,
            background:
              task.status === "completed"
                ? statusColor
                : task.status === "dropped"
                ? statusColor + "33"
                : "transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            fontSize: 12,
            color: "#fff",
            transition: "all 0.15s",
          }}
        >
          {task.status === "completed"
            ? "✓"
            : task.status === "dropped"
            ? "✕"
            : ""}
        </button>
      ) : (
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.25)",
            flexShrink: 0,
          }}
        />
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <EditableText
          value={task.text}
          onChange={(text) => onUpdate({ ...task, text })}
          placeholder="What's the task?"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            color:
              task.status === "dropped"
                ? "rgba(255,255,255,0.35)"
                : "rgba(255,255,255,0.88)",
            textDecoration:
              task.status === "dropped" ? "line-through" : "none",
          }}
        />
        {isExecution && task.status === "unplanned" && (
          <span
            style={{
              fontSize: 10,
              color: STATUS_COLORS.unplanned,
              fontWeight: 600,
              letterSpacing: 0.5,
              textTransform: "uppercase",
              marginTop: 2,
              display: "block",
            }}
          >
            unplanned
          </span>
        )}
        {isExecution &&
          task.status === "moved" &&
          originalPhase &&
          originalPhase !== task.movedFrom && (
            <span
              style={{
                fontSize: 10,
                color: STATUS_COLORS.moved,
                fontWeight: 600,
                letterSpacing: 0.5,
                marginTop: 2,
                display: "block",
              }}
            >
              moved from {originalPhase}
            </span>
          )}
      </div>

      <button
        onClick={onRemove}
        style={{
          background: "none",
          border: "none",
          color: "rgba(255,255,255,0.2)",
          cursor: "pointer",
          fontSize: 16,
          padding: "0 2px",
          lineHeight: 1,
          flexShrink: 0,
        }}
        onMouseEnter={(e) => (e.target.style.color = "#f87171")}
        onMouseLeave={(e) =>
          (e.target.style.color = "rgba(255,255,255,0.2)")
        }
        title="Remove"
      >
        ×
      </button>
    </div>
  );
}

// ─── Phase Column ───
function PhaseBlock({ phase, tasks, side, onAddTask, onUpdateTask, onRemoveTask, planPhases }) {
  return (
    <div style={{ marginBottom: 8 }}>
      {/* Phase header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 10,
          padding: "0 4px",
        }}
      >
        <span style={{ fontSize: 18 }}>{phase.icon}</span>
        <span
          style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: 17,
            color: "rgba(255,255,255,0.75)",
            fontWeight: 400,
          }}
        >
          {phase.label}
        </span>
        <span
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.3)",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {phase.hours}
        </span>
      </div>

      {/* Task list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            side={side}
            planPhases={planPhases}
            onUpdate={(updated) => onUpdateTask(phase.id, task.id, updated)}
            onRemove={() => onRemoveTask(phase.id, task.id)}
          />
        ))}
      </div>

      {/* Add button */}
      <button
        onClick={() => onAddTask(phase.id)}
        style={{
          marginTop: 8,
          padding: "6px 12px",
          border: "1px dashed rgba(255,255,255,0.12)",
          borderRadius: 8,
          background: "transparent",
          color: "rgba(255,255,255,0.3)",
          fontSize: 13,
          cursor: "pointer",
          width: "100%",
          fontFamily: "'DM Sans', sans-serif",
          transition: "all 0.15s",
        }}
        onMouseEnter={(e) => {
          e.target.style.borderColor = "rgba(255,255,255,0.25)";
          e.target.style.color = "rgba(255,255,255,0.55)";
        }}
        onMouseLeave={(e) => {
          e.target.style.borderColor = "rgba(255,255,255,0.12)";
          e.target.style.color = "rgba(255,255,255,0.3)";
        }}
      >
        + add task
      </button>
    </div>
  );
}

// ─── Diff Summary ───
function DiffSummary({ plan, execution }) {
  let planned = 0, completed = 0, dropped = 0, unplanned = 0, movedCount = 0;
  PHASES.forEach((p) => {
    planned += (plan[p.id] || []).length;
    (execution[p.id] || []).forEach((t) => {
      if (t.status === "completed") completed++;
      if (t.status === "dropped") dropped++;
      if (t.status === "unplanned") unplanned++;
      if (t.status === "moved") movedCount++;
    });
  });

  const hitRate = planned > 0 ? Math.round((completed / planned) * 100) : 0;

  const stats = [
    { label: "Planned", value: planned, color: "rgba(255,255,255,0.6)" },
    { label: "Done", value: completed, color: STATUS_COLORS.completed },
    { label: "Dropped", value: dropped, color: STATUS_COLORS.dropped },
    { label: "Unplanned", value: unplanned, color: STATUS_COLORS.unplanned },
    { label: "Hit Rate", value: `${hitRate}%`, color: hitRate >= 70 ? STATUS_COLORS.completed : hitRate >= 40 ? STATUS_COLORS.moved : STATUS_COLORS.dropped },
  ];

  return (
    <div
      style={{
        display: "flex",
        gap: 0,
        padding: "14px 0",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        marginBottom: 24,
      }}
    >
      {stats.map((s) => (
        <div
          key={s.label}
          style={{
            flex: 1,
            textAlign: "center",
            borderRight: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: 24,
              color: s.color,
              lineHeight: 1.1,
            }}
          >
            {s.value}
          </div>
          <div
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.35)",
              textTransform: "uppercase",
              letterSpacing: 1,
              marginTop: 4,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main App ───
export default function PlanVsReality() {
  const [plan, setPlan] = useState(DEMO_PLAN);
  const [execution, setExecution] = useState(emptyPhases);
  const [synced, setSynced] = useState(false);
  const [view, setView] = useState("split"); // split | plan | execution

  // Sync plan → execution (one-time seed)
  const syncToExecution = useCallback(() => {
    const exec = {};
    PHASES.forEach((p) => {
      exec[p.id] = (plan[p.id] || []).map((t) => ({
        ...t,
        id: uid(),
        status: "pending",
      }));
    });
    setExecution(exec);
    setSynced(true);
  }, [plan]);

  const addTask = useCallback(
    (setter) => (phaseId) => {
      setter((prev) => ({
        ...prev,
        [phaseId]: [
          ...prev[phaseId],
          { id: uid(), text: "", status: "pending" },
        ],
      }));
    },
    []
  );

  const updateTask = useCallback(
    (setter) => (phaseId, taskId, updated) => {
      setter((prev) => ({
        ...prev,
        [phaseId]: prev[phaseId].map((t) => (t.id === taskId ? updated : t)),
      }));
    },
    []
  );

  const removeTask = useCallback(
    (setter) => (phaseId, taskId) => {
      setter((prev) => ({
        ...prev,
        [phaseId]: prev[phaseId].filter((t) => t.id !== taskId),
      }));
    },
    []
  );

  const addUnplannedTask = useCallback(
    (phaseId) => {
      setExecution((prev) => ({
        ...prev,
        [phaseId]: [
          ...prev[phaseId],
          { id: uid(), text: "", status: "unplanned" },
        ],
      }));
    },
    []
  );

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
            border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(255,255,255,0.06)",
            color: "rgba(255,255,255,0.75)",
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "rgba(255,255,255,0.1)";
            e.target.style.borderColor = "rgba(255,255,255,0.3)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "rgba(255,255,255,0.06)";
            e.target.style.borderColor = "rgba(255,255,255,0.15)";
          }}
        >
          Lock plan → Start tracking reality
        </button>
      )}

      {/* Two columns */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            view === "split" ? "1fr 1fr" : "1fr",
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
                  background:
                    "linear-gradient(135deg, #60a5fa, #818cf8)",
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
                onAddTask={synced ? () => {} : addTask(setPlan)}
                onUpdateTask={synced ? () => {} : updateTask(setPlan)}
                onRemoveTask={synced ? () => {} : removeTask(setPlan)}
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
                  background:
                    "linear-gradient(135deg, #34d399, #fbbf24)",
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
                  planPhases={plan}
                  onAddTask={addUnplannedTask}
                  onUpdateTask={updateTask(setExecution)}
                  onRemoveTask={removeTask(setExecution)}
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
