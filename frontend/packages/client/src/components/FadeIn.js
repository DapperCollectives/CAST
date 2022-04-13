import React from "react";

export default function FadeIn({ children }) {
  return (
    <div style={{ display: "inherit" }} className="fade-in">
      {children}
    </div>
  );
}
