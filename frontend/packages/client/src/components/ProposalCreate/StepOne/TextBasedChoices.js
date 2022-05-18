import React, { useEffect } from "react";
import { Plus, Bin } from "components/Svg";

const TextBasedChoices = ({
  choices = [],
  onChoiceChange,
  onDestroyChoice,
  onCreateChoice,
  initChoices,
} = {}) => {
  useEffect(() => {
    initChoices([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      {choices?.map((choice, i) => (
        <div
          key={i}
          className="columns is-mobile p-0 m-0"
          style={{ position: "relative" }}
        >
          <input
            type="text"
            placeholder="Enter choice name"
            value={choice.value}
            className="border-light rounded-sm p-3 mb-4 column is-full pr-6"
            key={i}
            onChange={(event) =>
              onChoiceChange({ value: event.target.value }, i)
            }
            autoFocus
          />
          <div
            className="cursor-pointer"
            style={{
              position: "absolute",
              right: 15,
              top: 7,
            }}
            onClick={() => onDestroyChoice(i)}
          >
            <Bin />
          </div>
        </div>
      ))}
      <div
        className="mt-2 cursor-pointer is-flex is-align-items-centered"
        onClick={onCreateChoice}
      >
        <Plus />{" "}
        <span className="ml-2">
          Add {`${choices?.length >= 1 ? "Another " : ""}`}Choice
        </span>
      </div>
    </>
  );
};
export default TextBasedChoices;
