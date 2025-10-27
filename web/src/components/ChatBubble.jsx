import React from "react";
export default function ChatBubble({ role, content }) {
  const bg = role === "user" ? "#eef" : "#efe";
  return (
    <div
      style={{ background: bg, borderRadius: 8, padding: 8, margin: "8px 0" }}
    >
      <strong>{role}</strong>
      <div style={{ whiteSpace: "pre-wrap" }}>{content}</div>
    </div>
  );
}
