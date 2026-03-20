import { useState, useRef, useCallback, memo } from "react";
import EditableText from "../EditableText/EditableText";
import { STATUS_COLORS, STATUS_LABELS, PHASES } from "../../constants/phases";
import TimePill from "../TimePill/TimePill";

const PHASE_LABELS = Object.fromEntries(PHASES.map((p) => [p.id, p.label]));

function TaskCard({ task, side, onUpdate, onRemove, onMoveRequest }) {
  const isExecution = side === "execution";
  const statusColor = STATUS_COLORS[task.status] || STATUS_COLORS.pending;
  const [isCardHovered, setIsCardHovered] = useState(false);
  const [isRemoveHovered, setIsRemoveHovered] = useState(false);
  const [isPressing, setIsPressing] = useState(false);

  const pressTimer = useRef(null);

  const clearPress = useCallback(() => {
    clearTimeout(pressTimer.current);
    pressTimer.current = null;
    setIsPressing(false);
  }, []);

  const handlePointerDown = useCallback(
    (e) => {
      if (!isExecution || !onMoveRequest) return;
      // Ignore right-clicks and non-primary buttons
      if (e.button && e.button !== 0) return;
      setIsPressing(true);
      pressTimer.current = setTimeout(() => {
        setIsPressing(false);
        onMoveRequest(task);
      }, 500);
    },
    [isExecution, onMoveRequest, task]
  );

  const handlePointerUp = useCallback(() => {
    clearPress();
  }, [clearPress]);

  return (
    <div
      className="pvr-task-card"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        borderRadius: 10,
        background: isPressing
          ? "rgba(251,191,36,0.08)"
          : isCardHovered
          ? "rgba(255,255,255,0.08)"
          : "rgba(255,255,255,0.04)",
        border: `1px solid ${
          isPressing
            ? STATUS_COLORS.moved + "55"
            : isCardHovered
            ? statusColor + "44"
            : "rgba(255,255,255,0.07)"
        }`,
        transition: "all 0.2s",
        position: "relative",
        overflow: "visible",
        transform: isPressing ? "scale(0.98)" : "scale(1)",
        touchAction: isExecution ? "none" : "auto",
      }}
      onPointerEnter={() => setIsCardHovered(true)}
      onPointerLeave={() => {
        setIsCardHovered(false);
        clearPress();
      }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={clearPress}
      onContextMenu={(e) => {
        if (isExecution && onMoveRequest) {
          e.preventDefault();
          clearPress();
          onMoveRequest(task);
        }
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
          onClick={(e) => {
            e.stopPropagation();
            const next =
              task.status === "pending" || task.status === "moved"
                ? "completed"
                : task.status === "completed"
                ? "dropped"
                : "pending";
            onUpdate({ ...task, status: next });
          }}
          onPointerDown={(e) => e.stopPropagation()}
          title={`Status: ${STATUS_LABELS[task.status] || STATUS_LABELS.pending}. Click to cycle.`}
          className="pvr-status-btn"
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
          className="pvr-task-text"
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
        {isExecution && task.status === "moved" && task.movedFrom && (
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
            moved from {PHASE_LABELS[task.movedFrom] || task.movedFrom}
          </span>
        )}
      </div>

      <TimePill
        estimatedMinutes={task.estimatedMinutes}
        onChange={(minutes) => onUpdate({ ...task, estimatedMinutes: minutes })}
        visible={true}
      />

      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        onPointerDown={(e) => e.stopPropagation()}
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
        onPointerEnter={() => setIsRemoveHovered(true)}
        onPointerLeave={() => setIsRemoveHovered(false)}
        title="Remove"
      >
        ×
      </button>
    </div>
  );
}

export default memo(TaskCard);
