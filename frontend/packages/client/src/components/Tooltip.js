import React from "react";

export default function Tooltip({ position, text, children, classNames = "" }) {
  const positionConfig = {
    left: "has-tooltip-left",
    right: "has-tooltip-right",
    top: "has-tooltip-top",
    bottom: "has-tooltip-bottom",
  };
  const className = positionConfig[position] ?? "";
  return (
    <span
      className={`has-tooltip-arrow ${className} ${classNames}`}
      data-tooltip={text}
    >
      {children}
    </span>
  );
}
