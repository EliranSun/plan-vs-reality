import { useState, memo, useRef, useEffect } from "react";
import EditableText from "../EditableText/EditableText";
import { STATUS_COLORS, STATUS_LABELS } from "../../constants/phases";

const TIME_PRESETS = [
  { label: "15m", minutes: 15 },
  { label: "30m", minutes: 30 },
  { label: "45m", minutes: 45 },
  { label: "1h", minutes: 60 },
  { label: "2h", minutes: 120 },
  { label: "3h", minutes: 180 },
];

function formatMinutes(minutes) {
  if (!minutes) return null;
  if (minutes < 60) return `${minutes}m`;
  if (minutes % 60 === 0) return `${minutes / 60}h`;
  return `${Math.floor(minutes / 60)}h${minutes % 60}m`;
}

function TimePill({ estimatedMinutes, onChange, visible }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, [open]);

  const label = formatMinutes(estimatedMinutes);

  if (!label && !visible) return null;

  return (
    <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        title={label ? `Estimate: ${label}. Click to change.` : "Set time estimate"}
        style={{
          background: label ? "rgba(255,255,255,0.12)" : "transparent",
          border: `1px solid ${label ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.15)"}`,
          borderRadius: 8,
          color: label ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.35)",
          cursor: "pointer",
          fontSize: 10,
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 500,
          padding: "2px 6px",
          lineHeight: 1.4,
          letterSpacing: 0.3,
          transition: "all 0.15s",
          whiteSpace: "nowrap",
        }}
      >
        {label ?? "⏱"}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            bottom: "calc(100% + 6px)",
            background: "#1e1e2e",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 10,
            padding: 8,
            display: "flex",
            flexWrap: "wrap",
            gap: 4,
            width: 148,
            zIndex: 100,
            boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {TIME_PRESETS.map((p) => (
            <button
              key={p.minutes}
              onClick={() => { onChange(p.minutes); setOpen(false); }}
              style={{
                background: estimatedMinutes === p.minutes
                  ? "rgba(255,255,255,0.18)"
                  : "rgba(255,255,255,0.06)",
                border: `1px solid ${estimatedMinutes === p.minutes
                  ? "rgba(255,255,255,0.3)"
                  : "rgba(255,255,255,0.1)"}`,
                borderRadius: 6,
                color: estimatedMinutes === p.minutes
                  ? "rgba(255,255,255,0.9)"
                  : "rgba(255,255,255,0.55)",
                cursor: "pointer",
                fontSize: 11,
                fontFamily: "'DM Sans', sans-serif",
                padding: "3px 8px",
                transition: "all 0.12s",
              }}
            >
              {p.label}
            </button>
          ))}
          {estimatedMinutes && (
            <button
              onClick={() => { onChange(undefined); setOpen(false); }}
              style={{
                background: "transparent",
                border: "1px solid rgba(248,113,113,0.3)",
                borderRadius: 6,
                color: "rgba(248,113,113,0.7)",
                cursor: "pointer",
                fontSize: 11,
                fontFamily: "'DM Sans', sans-serif",
                padding: "3px 8px",
                width: "100%",
                marginTop: 2,
                transition: "all 0.12s",
              }}
            >
              ✕ clear
            </button>
          )}
        </div>
      )}
    </div>
  );
}

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
        overflow: "visible",
      }}
      onPointerEnter={() => setIsCardHovered(true)}
      onPointerLeave={() => setIsCardHovered(false)}
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

      <TimePill
        estimatedMinutes={task.estimatedMinutes}
        onChange={(minutes) => onUpdate({ ...task, estimatedMinutes: minutes })}
        visible={isCardHovered}
      />

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
