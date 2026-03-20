import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

const TIME_PRESETS = [
  { label: "15m", minutes: 15 },
  { label: "30m", minutes: 30 },
  { label: "45m", minutes: 45 },
  { label: "1h", minutes: 60 },
  { label: "2h", minutes: 120 },
  { label: "3h", minutes: 180 },
];

export function formatMinutes(minutes) {
  if (!minutes) return null;
  if (minutes < 60) return `${minutes}m`;
  if (minutes % 60 === 0) return `${minutes / 60}h`;
  return `${Math.floor(minutes / 60)}h${minutes % 60}m`;
}

export default function TimePill({ estimatedMinutes, onChange, visible }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const popoverRef = useRef(null);
  const [popoverPos, setPopoverPos] = useState(null);

  useEffect(() => {
    if (!open) return;
    function handler(e) {
      if (
        (ref.current && ref.current.contains(e.target)) ||
        (popoverRef.current && popoverRef.current.contains(e.target))
      )
        return;
      setOpen(false);
    }
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, [open]);

  useEffect(() => {
    if (open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPopoverPos({
        top: rect.top - 6,
        right: window.innerWidth - rect.right,
      });
    }
  }, [open]);

  const label = formatMinutes(estimatedMinutes);

  if (!label && !visible && !open) return null;

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

      {open && popoverPos && createPortal(
        <div
          ref={popoverRef}
          style={{
            position: "fixed",
            right: popoverPos.right,
            top: popoverPos.top,
            transform: "translateY(-100%)",
            background: "#1e1e2e",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 10,
            padding: 8,
            display: "flex",
            flexWrap: "wrap",
            gap: 4,
            width: 148,
            zIndex: 10000,
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
        </div>,
        document.body
      )}
    </div>
  );
}
