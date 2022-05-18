import React, { useState } from "react";
import { CaretDown } from "../Svg";
import Tooltip from "../Tooltip";

const TooltipWrapper = ({ isOpen, children }) => {
  if (isOpen) {
    return <>{children}</>;
  }
  return (
    <Tooltip
      classNames="is-flex is-flex-grow-1"
      position="top"
      text="Filter proposals based on status"
    >
      {children}
    </Tooltip>
  );
};

const DropDownFilter = ({ value, filterValues, setFilterValues }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openCloseDrowdown = () => {
    setIsOpen((status) => !status);
  };

  const setValue = (value) => () => {
    setFilterValues(value);
  };

  // use for click out on dropdown
  const closeOnBlur = () => {
    setIsOpen(false);
  };

  return (
    <div
      className={`dropdown is-right is-flex is-flex-grow-1${
        isOpen ? " is-active" : ""
      }`}
      onBlur={closeOnBlur}
      aria-haspopup="true"
      aria-controls="dropdown-menu"
    >
      <div className="dropdown-trigger columns m-0 is-flex-grow-1">
        <button
          className="button rounded-sm is-outlined border-light column m-0 py-0 px-3 is-full-mobile"
          aria-haspopup="true"
          aria-controls="dropdown-menu"
          onClick={openCloseDrowdown}
        >
          <TooltipWrapper isOpen={isOpen}>
            <div className="is-flex is-flex-grow-1 is-align-items-center is-justify-content-space-between has-text-grey small-text">
              {value}
              <CaretDown className="has-text-black" />
            </div>
          </TooltipWrapper>
        </button>
      </div>
      <div
        className="dropdown-menu column p-0 is-full-mobile"
        id="dropdown-menu"
        role="menu"
      >
        <div className="dropdown-content">
          {(filterValues || []).map((itemValue, index) => (
            <button
              className={`button is-white dropdown-item has-text-grey${
                itemValue === value ? " is-active" : ""
              }`}
              onMouseDown={setValue(itemValue)}
              key={`drop-down-${index}`}
              data-testid={`drop-down-item-${itemValue}`}
            >
              {itemValue}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
export default DropDownFilter;
