import { useState, useRef, useEffect, useCallback } from "react";
import { PHASES } from "../../constants/phases";
import { formatMinutes } from "../TimePill/TimePill";

function formatDateSlug() {
  const d = new Date();
  return d.toISOString().slice(0, 10); // e.g. 2026-03-19
}

function buildMarkdown(plan, execution, synced) {
  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const statusIcon = { completed: "✅", dropped: "❌", pending: "⬜", unplanned: "🟣", moved: "🟡" };

  let md = `# Plan vs Reality — ${dateStr}\n\n`;

  md += `## 📋 The Plan\n\n`;
  PHASES.forEach((phase) => {
    const tasks = plan[phase.id] || [];
    if (!tasks.length) return;
    md += `### ${phase.icon} ${phase.label} (${phase.hours})\n`;
    tasks.forEach((t) => {
      const timeTag = t.estimatedMinutes ? ` ⏱${formatMinutes(t.estimatedMinutes)}` : "";
      md += `- [ ] ${t.text}${timeTag}\n`;
    });
    md += "\n";
  });

  if (synced) {
    md += `## 🎯 Reality\n\n`;
    PHASES.forEach((phase) => {
      const tasks = execution[phase.id] || [];
      if (!tasks.length) return;
      md += `### ${phase.icon} ${phase.label} (${phase.hours})\n`;
      tasks.forEach((t) => {
        const icon = statusIcon[t.status] ?? "⬜";
        const tag = t.status !== "pending" ? ` _(${t.status})_` : "";
        const timeTag = t.estimatedMinutes ? ` ⏱${formatMinutes(t.estimatedMinutes)}` : "";
        md += `- ${icon} ${t.text}${timeTag}${tag}\n`;
      });
      md += "\n";
    });
  }

  return md;
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const menuItemStyle = (hovered) => ({
  display: "flex",
  alignItems: "center",
  gap: 10,
  width: "100%",
  padding: "9px 14px",
  background: hovered ? "rgba(255,255,255,0.07)" : "transparent",
  border: "none",
  borderRadius: 8,
  color: hovered ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.65)",
  fontSize: 13,
  fontFamily: "'DM Sans', sans-serif",
  fontWeight: 450,
  cursor: "pointer",
  textAlign: "left",
  transition: "all 0.12s",
  whiteSpace: "nowrap",
});

function MenuItem({ icon, label, onClick, danger }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      style={{
        ...menuItemStyle(hovered),
        color: danger
          ? hovered ? "#f87171" : "rgba(248,113,113,0.7)"
          : menuItemStyle(hovered).color,
      }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={{ fontSize: 15, width: 18, textAlign: "center" }}>{icon}</span>
      {label}
    </button>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "4px 0" }} />;
}

export default function DataMenu({ plan, execution, synced, onImport, onResetToDemo, onClearAll }) {
  const [open, setOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const menuRef = useRef(null);
  const fileInputRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const notify = useCallback((msg, isError = false) => {
    setNotification({ msg, isError });
    setTimeout(() => setNotification(null), 2500);
  }, []);

  const handleExportJSON = useCallback(() => {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      plan,
      execution,
      synced,
    };
    downloadFile(JSON.stringify(data, null, 2), `plan-vs-reality-${formatDateSlug()}.json`, "application/json");
    setOpen(false);
    notify("Exported as JSON");
  }, [plan, execution, synced, notify]);

  const handleExportMarkdown = useCallback(() => {
    const md = buildMarkdown(plan, execution, synced);
    downloadFile(md, `plan-vs-reality-${formatDateSlug()}.md`, "text/markdown");
    setOpen(false);
    notify("Exported as Markdown");
  }, [plan, execution, synced, notify]);

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
    setOpen(false);
  }, []);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data.plan || !data.execution) throw new Error("Invalid format");
        const ok = onImport(data);
        if (ok) notify("Data imported successfully");
        else notify("Import failed — invalid data", true);
      } catch {
        notify("Import failed — invalid JSON", true);
      }
    };
    reader.readAsText(file);
    // reset so same file can be re-imported
    e.target.value = "";
  }, [onImport, notify]);

  const handleResetDemo = useCallback(() => {
    if (!window.confirm("Reset to demo data? Current data will be lost.")) return;
    onResetToDemo();
    setOpen(false);
    notify("Reset to demo data");
  }, [onResetToDemo, notify]);

  const handleClearAll = useCallback(() => {
    if (!window.confirm("Clear everything? This cannot be undone.")) return;
    onClearAll();
    setOpen(false);
    notify("All data cleared");
  }, [onClearAll, notify]);

  return (
    <div ref={menuRef} style={{ position: "relative" }}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        title="Data options"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 34,
          height: 34,
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.1)",
          background: open ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)",
          color: "rgba(255,255,255,0.55)",
          cursor: "pointer",
          fontSize: 16,
          transition: "all 0.15s",
        }}
      >
        ⋯
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            zIndex: 100,
            minWidth: 200,
            background: "#1a1d27",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12,
            padding: "6px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)",
            animation: "fadeSlideIn 0.12s ease",
          }}
        >
          <style>{`
            @keyframes fadeSlideIn {
              from { opacity: 0; transform: translateY(-4px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          <div style={{ padding: "4px 14px 6px", fontSize: 10, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: 1 }}>
            Export
          </div>
          <MenuItem icon="📦" label="Export as JSON" onClick={handleExportJSON} />
          <MenuItem icon="📝" label="Export as Markdown" onClick={handleExportMarkdown} />

          <Divider />

          <div style={{ padding: "4px 14px 6px", fontSize: 10, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: 1 }}>
            Import
          </div>
          <MenuItem icon="📂" label="Import from JSON" onClick={handleImportClick} />

          <Divider />

          <div style={{ padding: "4px 14px 6px", fontSize: 10, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: 1 }}>
            Reset
          </div>
          <MenuItem icon="🎲" label="Load demo data" onClick={handleResetDemo} />
          <MenuItem icon="🗑" label="Clear all" onClick={handleClearAll} danger />
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {/* Toast notification */}
      {notification && (
        <div
          style={{
            position: "fixed",
            bottom: 28,
            left: "50%",
            transform: "translateX(-50%)",
            background: notification.isError ? "rgba(248,113,113,0.15)" : "rgba(52,211,153,0.15)",
            border: `1px solid ${notification.isError ? "rgba(248,113,113,0.3)" : "rgba(52,211,153,0.3)"}`,
            color: notification.isError ? "#f87171" : "#34d399",
            padding: "10px 20px",
            borderRadius: 10,
            fontSize: 13,
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 500,
            zIndex: 200,
            pointerEvents: "none",
            animation: "fadeSlideIn 0.15s ease",
            whiteSpace: "nowrap",
          }}
        >
          {notification.msg}
        </div>
      )}
    </div>
  );
}
