import React, { useState, forwardRef } from "react";
import { CaretDown } from "./Svg";
import classnames from "classnames";

const DropDown = forwardRef(
  (
    {
      defaultValue,
      values = [],
      onSelectValue = () => {},
      disabled = false,
      label = "Select option",
      dropdownFull = true,
      isRight = false,
      padding = "",
      margin = "",
    } = {},
    ref
  ) => {
    if (
      defaultValue &&
      !values.find(({ value }) => value === defaultValue.value)
    ) {
      console.warn("DropDown: Default value is not included in values array");
    }
    const [isOpen, setIsOpen] = useState(false);
    const [innerValue, setInnerValue] = useState(defaultValue ?? { label });

    const openCloseDropdown = () => {
      setIsOpen((status) => !status);
    };

    const setValue =
      ({ label, value }) =>
      () => {
        setInnerValue({ label, value });
        onSelectValue(value);
        setIsOpen(false);
      };

    // use for click out on dropdown
    const closeOnBlur = () => {
      setIsOpen(false);
    };

    const classNames = classnames(
      `dropdown is-flex is-flex-grow-1`,
      { "is-right": isRight },
      { "is-active": isOpen },
      { [padding]: !!padding },
      { [margin]: !!margin }
    );

    return (
      <div
        className={classNames}
        onBlur={closeOnBlur}
        aria-haspopup="true"
        aria-controls="dropdown-menu"
        data-testid="dropdown-menu"
      >
        <div
          className="dropdown-trigger columns m-0 is-flex-grow-1"
          style={{ maxWidth: "100%" }}
        >
          <button
            className={`button rounded-sm is-outlined border-light column m-0 py-0 px-3 is-full-mobile ${
              disabled ? "is-disabled" : ""
            }`}
            aria-haspopup="true"
            aria-controls="dropdown-menu"
            onClick={openCloseDropdown}
            data-testid="dropdown-button"
            ref={ref}
          >
            <div className="is-flex is-flex-grow-1 is-align-items-center is-justify-content-space-between has-text-grey small-text">
              <div
                className="is-flex"
                style={{
                  maxWidth: "calc(100% - 30px)",
                  overflow: "hidden",
                }}
              >
                {innerValue?.label}
              </div>
              <CaretDown className="has-text-black" />
            </div>
          </button>
        </div>
        <div
          className={`dropdown-menu column p-0 ${
            dropdownFull ? "is-full-mobile is-full" : ""
          }`}
          id="dropdown-menu"
          role="menu"
        >
          <div className="dropdown-content">
            {values.map((itemValue, index) => (
              <button
                className={`button is-white dropdown-item has-text-grey${
                  itemValue?.value === innerValue ? " is-active" : ""
                }`}
                onMouseDown={setValue(itemValue)}
                key={`drop-down-${index}`}
                data-testid={`item-${itemValue?.value}`}
              >
                {itemValue?.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }
);
export default DropDown;
