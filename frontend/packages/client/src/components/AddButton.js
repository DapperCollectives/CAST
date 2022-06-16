import React from "react";
import classnames from "classnames";
import { Plus } from "components/Svg";

export default function AddButton({
  onAdd = () => {},
  diabled = false,
  addText = "",
  className = "",
} = {}) {
  const classNames = classnames(
    "is-flex is-align-items-centered",
    {
      [className]: !!className,
    },
    { "is-disabled has-text-grey": disabled },
    { "cursor-pointer": !diabled }
  );
  return (
    <div className={classNames} onClick={onAdd}>
      <Plus />{" "}
      <span className="ml-2 small-text is-flex is-align-items-center">
        Add{` ${addText}`}
      </span>
    </div>
  );
}
