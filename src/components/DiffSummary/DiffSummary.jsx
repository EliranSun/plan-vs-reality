import { PHASES, STATUS_COLORS } from "../../constants/phases";

const weight = (task) => task.estimatedMinutes ?? 1;

export default function DiffSummary({ plan, execution }) {
  let planned = 0, plannedWeight = 0, completed = 0, completedWeight = 0, dropped = 0, unplanned = 0;
  PHASES.forEach((p) => {
    (plan[p.id] || []).forEach((t) => {
      planned++;
      plannedWeight += weight(t);
    });
    (execution[p.id] || []).forEach((t) => {
      if (t.status === "completed") { completed++; completedWeight += weight(t); }
      if (t.status === "dropped") dropped++;
      if (t.status === "unplanned") unplanned++;
    });
  });

  const hitRate = plannedWeight > 0 ? Math.round((completedWeight / plannedWeight) * 100) : 0;

  const stats = [
    { label: "Planned", value: planned, color: "rgba(255,255,255,0.6)" },
    { label: "Done", value: completed, color: STATUS_COLORS.completed },
    { label: "Dropped", value: dropped, color: STATUS_COLORS.dropped },
    { label: "Unplanned", value: unplanned, color: STATUS_COLORS.unplanned },
    {
      label: "Hit Rate",
      value: `${hitRate}%`,
      color:
        hitRate >= 70
          ? STATUS_COLORS.completed
          : hitRate >= 40
          ? STATUS_COLORS.moved
          : STATUS_COLORS.dropped,
    },
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
