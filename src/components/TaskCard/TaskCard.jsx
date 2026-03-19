import { useState, memo } from "react";
import EditableText from "../EditableText/EditableText";
import { STATUS_COLORS, STATUS_LABELS } from "../../constants/phases";

function TaskCard({ task, side, onUpdate, onRemove }) {
  const isExecution = side === "execution";
  const statusColor = STATUS_COLORS[task.status] || STATUS_COLORS.pending;
  const [isCardHovered, setIsCardHovered] = useState(false);
  const [isRemoveHovered, setIsRemoveHovered] = useState(false);

  const originalPhase = isExecution ? task.sourcePhasId : null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        borderRadius: 10,
        background: isCardHovered ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${isCardHovered ? statusColor + "44" : "rgba(255,255,255,0.07)"}`,
        transition: "all 0.2s",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={() => setIsCardHovered(true)}
      onMouseLeave={() => setIsCardHovered(false)}
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
          color: isRemoveHovered ? "#f87171" : "rgba(255,255,255,0.2)",
          cursor: "pointer",
          fontSize: 16,
          padding: "0 2px",
          lineHeight: 1,
          flexShrink: 0,
          transition: "color 0.15s",
        }}
        onMouseEnter={() => setIsRemoveHovered(true)}
        onMouseLeave={() => setIsRemoveHovered(false)}
        title="Remove"
      >
        ×
      </button>
    </div>
  );
}

export default memo(TaskCard);
