import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { PHASES } from "../../constants/phases";

function offsetDate(dateStr, days) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function formatShortDate(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function MoveMenu({
  task,
  currentPhaseId,
  currentDate,
  onMoveToPhase,
  onMoveToDate,
  onClose,
}) {
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    }
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("pointerdown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  const otherPhases = PHASES.filter((p) => p.id !== currentPhaseId);
  const dateOptions = [
    { label: "Tomorrow", date: offsetDate(currentDate, 1) },
    { label: "In 2 days", date: offsetDate(currentDate, 2) },
    { label: "In 3 days", date: offsetDate(currentDate, 3) },
  ];

  const taskLabel = task.text
    ? task.text.length > 28
      ? task.text.slice(0, 28) + "..."
      : task.text
    : "Untitled task";

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.55)",
        animation: "moveMenuFadeIn 0.15s ease both",
      }}
    >
      <div
        ref={menuRef}
        style={{
          background: "#1a1d27",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 14,
          padding: "16px 0",
          minWidth: 260,
          maxWidth: 320,
          animation: "moveMenuSlideUp 0.2s ease both",
          boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "0 20px 12px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            marginBottom: 8,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.3)",
              textTransform: "uppercase",
              letterSpacing: 0.8,
              marginBottom: 4,
            }}
          >
            Move task
          </div>
          <div
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.7)",
              fontWeight: 500,
            }}
          >
            {taskLabel}
          </div>
        </div>

        {/* Move to phase */}
        <div style={{ padding: "0 8px" }}>
          <div
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.25)",
              textTransform: "uppercase",
              letterSpacing: 0.8,
              padding: "4px 12px 6px",
            }}
          >
            Move to phase
          </div>
          {otherPhases.map((phase) => (
            <MenuItem
              key={phase.id}
              icon={phase.icon}
              label={phase.label}
              sublabel={phase.hours}
              onClick={() => onMoveToPhase(currentPhaseId, task.id, phase.id)}
            />
          ))}
        </div>

        {/* Move to date */}
        <div
          style={{
            padding: "0 8px",
            marginTop: 4,
            borderTop: "1px solid rgba(255,255,255,0.06)",
            paddingTop: 8,
          }}
        >
          <div
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.25)",
              textTransform: "uppercase",
              letterSpacing: 0.8,
              padding: "4px 12px 6px",
            }}
          >
            Move to another day
          </div>
          {dateOptions.map((opt) => (
            <MenuItem
              key={opt.date}
              icon="📅"
              label={opt.label}
              sublabel={formatShortDate(opt.date)}
              onClick={() =>
                onMoveToDate(currentPhaseId, task.id, opt.date, currentPhaseId)
              }
            />
          ))}
        </div>

        {/* Cancel */}
        <div style={{ padding: "8px 8px 0", borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: 8 }}>
          <button
            onClick={onClose}
            style={{
              width: "100%",
              padding: "10px 12px",
              background: "none",
              border: "none",
              borderRadius: 8,
              color: "rgba(255,255,255,0.35)",
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              transition: "all 0.15s",
            }}
            onPointerEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              e.currentTarget.style.color = "rgba(255,255,255,0.55)";
            }}
            onPointerLeave={(e) => {
              e.currentTarget.style.background = "none";
              e.currentTarget.style.color = "rgba(255,255,255,0.35)";
            }}
          >
            Cancel
          </button>
        </div>
      </div>

      <style>{`
        @keyframes moveMenuFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes moveMenuSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>,
    document.body
  );
}

function MenuItem({ icon, label, sublabel, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        padding: "9px 12px",
        background: "none",
        border: "none",
        borderRadius: 8,
        cursor: "pointer",
        fontFamily: "'DM Sans', sans-serif",
        transition: "background 0.12s",
        textAlign: "left",
      }}
      onPointerEnter={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.06)";
      }}
      onPointerLeave={(e) => {
        e.currentTarget.style.background = "none";
      }}
    >
      <span style={{ fontSize: 16, width: 24, textAlign: "center" }}>
        {icon}
      </span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>
          {label}
        </div>
        {sublabel && (
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>
            {sublabel}
          </div>
        )}
      </div>
      <span style={{ fontSize: 14, color: "rgba(255,255,255,0.15)" }}>›</span>
    </button>
  );
}
