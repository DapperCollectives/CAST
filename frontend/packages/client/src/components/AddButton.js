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
  return (
    <div className={classNames} onClick={!disabled ? onAdd : () => {}}>
      <Plus fill={disabled ? "hsl(0, 0%, 48%)" : "black"} />{" "}
      <span className="ml-2 small-text is-flex is-align-items-center">
        Add{` ${addText}`}
      </span>
    </div>
  );
}
