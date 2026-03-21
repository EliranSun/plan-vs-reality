export const PHASES = [
  { id: "morning",   label: "Morning",   icon: "☀️",  hours: "8am – 12pm", totalMinutes: 4 * 60 },
  { id: "midday",    label: "Midday",    icon: "🌤",  hours: "12pm – 3pm", totalMinutes: 180 },
  { id: "afternoon", label: "Afternoon", icon: "🌅",  hours: "3pm – 6pm",  totalMinutes: 180 },
  { id: "evening",   label: "Evening",   icon: "🌙",  hours: "6pm – 12pm", totalMinutes: 6 * 60 },
];

export const STATUS_COLORS = {
  completed: "#34d399",
  dropped: "#f87171",
  moved: "#fbbf24",
  unplanned: "#a78bfa",
  pending: "#94a3b8",
};

export const STATUS_LABELS = {
  completed: "Done",
  dropped: "Dropped",
  moved: "Moved",
  unplanned: "Unplanned",
  pending: "Pending",
};
