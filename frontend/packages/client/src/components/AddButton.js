import React from "react";
import classnames from "classnames";
import { Plus } from "components/Svg";

export default function AddButton({
  onAdd = () => {},
  disabled = false,
  addText = "",
  className = "",
} = {}) {
  const classNames = classnames(
    "is-flex is-align-items-centered",
    {
      [className]: !!className,
    },
    { "is-disabled has-text-grey": disabled },
    { "cursor-pointer": !disabled }
  );
  const onClick = !disabled ? onAdd : () => {};
  const fill = disabled ? "hsl(0, 0%, 48%)" : "black";
  return (
    <div className={classNames} onClick={onClick}>
      <Plus fill={fill} />{" "}
      <span className="ml-2 small-text is-flex is-align-items-center">
        Add{` ${addText}`}
      </span>
    </div>
  );
}
