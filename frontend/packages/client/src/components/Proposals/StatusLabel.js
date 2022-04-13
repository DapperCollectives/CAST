import React from "react";

const StatusLabel = ({
  status,
  color = "has-background-grey",
  margin,
  className,
}) => {
  let classes = "has-text-white rounded-sm px-2 py-1";
  if (className) {
    classes = classes.concat(" " + className);
  }
  if (margin) {
    classes = classes.concat(" " + margin);
  }
  if (color) {
    classes = classes.concat(" " + color);
  }
  return <span className={classes}>{status}</span>;
};

export default StatusLabel;
