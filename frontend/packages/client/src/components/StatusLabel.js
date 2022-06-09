import React from "react";
import { CheckMark } from "./Svg";

const StatusLabel = ({
  status,
  color = "has-background-grey",
  margin,
  className,
  rounder,
  voted,
}) => {
  if (voted) {
    const checkColor = (status === "Active") ? "#F4AF4A" : "#14181F";
    return (
      <span style={{ fontSize: "10px" }} className="is-flex has-text-weight-bold">
        <CheckMark height="15" width="15" circleFill="white" checkFill={checkColor}
          style={{ border: `2px solid ${checkColor}`, borderRadius: "50%", marginRight: "6.5px" }}
        />
        You Voted
      </span>
    )
  }

  let callToAction;
  if (status === "Active") {
    callToAction = "Cast Your Vote";
  }
  let classes = "has-text-white px-2 py-1";
  classes = classes.concat(rounder ? " rounded-lg" : " rounded-sm")
  if (className) {
    classes = classes.concat(" " + className);
  }
  if (margin) {
    classes = classes.concat(" " + margin);
  }
  if (color) {
    classes = classes.concat(" " + color);
  }
  return <span className={classes}>{callToAction || status}</span>;
};

export default StatusLabel;
