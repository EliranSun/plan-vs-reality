import { useState, memo } from "react";
import TaskCard from "../TaskCard/TaskCard";

export function PhaseHeader({ phase }) {
  return (
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
  );
}

function PhaseBlock({ phase, tasks, side, onAddTask, onUpdateTask, onRemoveTask, onMoveRequest, showHeader = true }) {
  const [isAddHovered, setIsAddHovered] = useState(false);

  return (
    <div style={{ marginBottom: 8 }}>
      {showHeader && <PhaseHeader phase={phase} />}

      {/* Task list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            side={side}
            onUpdate={(updated) => onUpdateTask(phase.id, task.id, updated)}
            onRemove={() => onRemoveTask(phase.id, task.id)}
            onMoveRequest={onMoveRequest ? (t) => onMoveRequest(phase.id, t) : undefined}
          />
        ))}
      </div>

      {/* Add button */}
      <button
        onClick={() => onAddTask(phase.id)}
        style={{
          marginTop: 8,
          padding: "10px 16px",
          border: `1px dashed ${isAddHovered ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.12)"}`,
          borderRadius: 8,
          background: isAddHovered ? "rgba(255,255,255,0.04)" : "transparent",
          color: isAddHovered ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.3)",
          fontSize: 13,
          cursor: "pointer",
          width: "100%",
          fontFamily: "'DM Sans', sans-serif",
          transition: "all 0.15s",
        }}
        onPointerEnter={() => setIsAddHovered(true)}
        onPointerLeave={() => setIsAddHovered(false)}
      >
        + add task
      </button>
    </div>
  );
}

export default memo(PhaseBlock);
