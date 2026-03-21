import { useState } from "react";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function hitRateColor(hitRate) {
  if (hitRate >= 70) return "#34d399";
  if (hitRate >= 40) return "#fbbf24";
  return "#f87171";
}

function hitRateBg(hitRate) {
  if (hitRate >= 70) return "rgba(52, 211, 153, 0.12)";
  if (hitRate >= 40) return "rgba(251, 191, 36, 0.12)";
  return "rgba(248, 113, 113, 0.12)";
}

function toDateStr(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function CalendarView({ allDaySummaries, currentDate, onSelectDate, onClose }) {
  const summaryMap = Object.fromEntries(
    allDaySummaries.filter((s) => s.hasData).map((s) => [s.date, s])
  );

  const today = todayStr();
  const [displayYear, setDisplayYear] = useState(() => {
    const d = currentDate ? new Date(currentDate + "T00:00:00") : new Date();
    return d.getFullYear();
  });
  const [displayMonth, setDisplayMonth] = useState(() => {
    const d = currentDate ? new Date(currentDate + "T00:00:00") : new Date();
    return d.getMonth();
  });

  const firstDayOfMonth = new Date(displayYear, displayMonth, 1).getDay();
  const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();

  const monthLabel = new Date(displayYear, displayMonth).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  function prevMonth() {
    if (displayMonth === 0) { setDisplayMonth(11); setDisplayYear(y => y - 1); }
    else setDisplayMonth(m => m - 1);
  }

  function nextMonth() {
    if (displayMonth === 11) { setDisplayMonth(0); setDisplayYear(y => y + 1); }
    else setDisplayMonth(m => m + 1);
  }

  const cells = [];
  // Leading empty cells
  for (let i = 0; i < firstDayOfMonth; i++) {
    cells.push(null);
  }
  // Day cells
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(d);
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#0f1117",
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        fontFamily: "'DM Sans', sans-serif",
        overflowY: "auto",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 20px 0",
          maxWidth: 600,
          width: "100%",
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
        <span
          style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: 22,
            color: "rgba(255,255,255,0.85)",
            fontWeight: 400,
          }}
        >
          History
        </span>
        <button
          onClick={onClose}
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "none",
            borderRadius: 8,
            color: "rgba(255,255,255,0.5)",
            fontSize: 18,
            width: 36,
            height: 36,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ✕
        </button>
      </div>

      {/* Month navigation */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 20px 12px",
          maxWidth: 600,
          width: "100%",
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
        <button
          onClick={prevMonth}
          style={{
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.4)",
            fontSize: 22,
            cursor: "pointer",
            padding: "4px 10px",
            borderRadius: 6,
          }}
        >
          ‹
        </button>
        <span
          style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: 20,
            color: "rgba(255,255,255,0.75)",
            fontWeight: 400,
          }}
        >
          {monthLabel}
        </span>
        <button
          onClick={nextMonth}
          style={{
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.4)",
            fontSize: 22,
            cursor: "pointer",
            padding: "4px 10px",
            borderRadius: 6,
          }}
        >
          ›
        </button>
      </div>

      {/* Day labels */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 4,
          padding: "0 16px",
          maxWidth: 600,
          width: "100%",
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
        {DAY_LABELS.map((d) => (
          <div
            key={d}
            style={{
              textAlign: "center",
              fontSize: 10,
              color: "rgba(255,255,255,0.25)",
              textTransform: "uppercase",
              letterSpacing: 0.8,
              paddingBottom: 6,
              fontWeight: 500,
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 4,
          padding: "0 16px 32px",
          maxWidth: 600,
          width: "100%",
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} />;
          }

          const dateStr = toDateStr(displayYear, displayMonth, day);
          const summary = summaryMap[dateStr];
          const isToday = dateStr === today;
          const isSelected = dateStr === currentDate;
          const isFuture = dateStr > today;

          return (
            <button
              key={dateStr}
              onClick={() => { onSelectDate(dateStr); onClose(); }}
              style={{
                aspectRatio: "1",
                borderRadius: 10,
                border: isSelected
                  ? "2px solid rgba(255,255,255,0.6)"
                  : isToday
                  ? "2px solid rgba(255,255,255,0.25)"
                  : "2px solid transparent",
                background: summary
                  ? hitRateBg(summary.hitRate)
                  : isSelected
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(255,255,255,0.02)",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
                padding: "6px 2px",
                transition: "all 0.15s",
                opacity: isFuture && !summary ? 0.5 : 1,
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: isToday ? 600 : 400,
                  color: isToday ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.7)",
                  lineHeight: 1,
                }}
              >
                {day}
              </span>

              {summary && (
                <>
                  <div
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: hitRateColor(summary.hitRate),
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 9,
                      color: hitRateColor(summary.hitRate),
                      fontWeight: 600,
                      lineHeight: 1,
                    }}
                  >
                    {summary.hitRate}%
                  </span>
                </>
              )}

              {!summary && isToday && (
                <div
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.3)",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          gap: 20,
          justifyContent: "center",
          flexWrap: "wrap",
          padding: "0 20px 40px",
          maxWidth: 600,
          width: "100%",
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
        {[
          { color: "#34d399", label: "≥ 70% hit rate" },
          { color: "#fbbf24", label: "40–69% hit rate" },
          { color: "#f87171", label: "< 40% hit rate" },
        ].map((item) => (
          <div
            key={item.label}
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
                borderRadius: "50%",
                background: item.color,
              }}
            />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
