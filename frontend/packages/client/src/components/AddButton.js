import React from "react";
import { Plus } from "components/Svg";

export default function AddButton({
  onAdd = () => {},
  diabled = false,
  addText = "",
  className = "mt-2",
} = {}) {
  return (
    <div
      className={`${className} is-flex is-align-items-centered ${
        diabled ? "is-disabled has-text-grey" : "cursor-pointer"
      }`}
      onClick={onAdd}
    >
      <Plus />{" "}
      <span className="ml-2 small-text is-flex is-align-items-center">
        Add{` ${addText}`}
      </span>
    </div>
  );
}
