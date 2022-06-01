import React from "react";
import { render, screen, waitFor } from "@testing-library/react";

import "@testing-library/jest-dom";
import renderer from "react-test-renderer";
import Dropdown from "./Dropdown";
import userEvent from "@testing-library/user-event";

describe("Dropdown UI Component", () => {
  it(`renders correctly`, () => {
    const props = {
      defaultValue: undefined,
      values: [
        { value: "option-a", label: "Option A" },
        { value: "option-b", label: "Option B" },
        { value: "option-c", label: "Option C" },
      ],
      onSelectValue: () => {},
      disabled: false,
      label: "Select an option",
    };
    const component = renderer.create(
      <Dropdown
        defaultValue={props.defaultValue}
        values={props.values}
        onSelectValue={props.onSelectValue}
        disabled={props.disabled}
        label={props.label}
      />
    );
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it(`renders correctly with default prop`, () => {
    const props = {
      defaultValue: "option-a",
      values: [
        { value: "option-a", label: "Option A" },
        { value: "option-b", label: "Option B" },
        { value: "option-c", label: "Option C" },
      ],
      onSelectValue: () => {},
      disabled: false,
      label: "Select an option",
    };
    const component = renderer.create(
      <Dropdown
        defaultValue={props.defaultValue}
        values={props.values}
        onSelectValue={props.onSelectValue}
        disabled={props.disabled}
        label={props.label}
      />
    );
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it(`renders correctly with no props`, () => {
    const component = renderer.create(<Dropdown />);
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});

describe("Dropdown component", () => {
  let props;
  let handleOnSelectValue;
  beforeEach(() => {
    handleOnSelectValue = jest.fn();
    props = {
      defaultValue: undefined,
      values: [
        { value: "option-a", label: "Option A" },
        { value: "option-b", label: "Option B" },
        { value: "option-c", label: "Option C" },
      ],
      onSelectValue: handleOnSelectValue,
      disabled: false,
      label: "Select an option",
    };
    render(
      <Dropdown
        defaultValue={props.defaultValue}
        values={props.values}
        onSelectValue={props.onSelectValue}
        disabled={props.disabled}
        label={props.label}
      />
    );
  });
  it("should display 'Label' text", async () => {
    expect(screen.getByText(props.label)).toBeInTheDocument();
  });
  it("dropdown opens on click event", async () => {
    userEvent.click(screen.getByTestId("dropdown-button"));
    await waitFor(() =>
      expect(screen.getByTestId("dropdown-menu").getAttribute("class")).toMatch(
        /is-active/gi
      )
    );
  });

  it("should display all options", async () => {
    props.values.map(async (option) => {
      expect(screen.getByText(option.label)).toBeInTheDocument();
    });
  });
  it("should display all options", async () => {
    // click on open dropdown
    userEvent.click(screen.getByTestId("dropdown-button"));
    // click to select option
    userEvent.click(screen.getByTestId("item-option-a"));
    // assert callback onSelectValue has been call

    await waitFor(() => expect(handleOnSelectValue).toHaveBeenCalledTimes(1));
  });
});
