import { useState, useRef, useEffect } from "react";

export default function EditableText({ value, onChange, placeholder, className, style }) {
  const [editing, setEditing] = useState(!value);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  if (editing) {
    return (
      <input
        ref={inputRef}
        className={className}
        style={{
          ...style,
          fontSize: 16, // Prevents iOS Safari auto-zoom on focus
          background: "rgba(255,255,255,0.06)",
          border: "none",
          borderBottom: "2px solid rgba(255,255,255,0.5)",
          borderRadius: "4px 4px 0 0",
          outline: "none",
          width: "100%",
          padding: "4px 6px",
        }}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => value && setEditing(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && value) setEditing(false);
          if (e.key === "Escape") setEditing(false);
        }}
      />
    );
  }

  return (
    <span
      className={className}
      style={{ ...style, cursor: "pointer" }}
      onClick={() => setEditing(true)}
      title="Click to edit"
    >
      {value}
    </span>
  );
}
