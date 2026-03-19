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
          background: "transparent",
          border: "none",
          borderBottom: "1.5px solid var(--accent)",
          outline: "none",
          width: "100%",
          padding: "2px 0",
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
