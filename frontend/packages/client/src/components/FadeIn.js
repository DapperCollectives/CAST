import React from "react";

export default function FadeIn({
  children,
  as: Tag = "div",
  style = { display: "inherit" },
} = {}) {
  return (
    <Tag style={style} className="fade-in">
      {children}
    </Tag>
  );
}
