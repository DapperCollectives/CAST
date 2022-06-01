import React from "react";
import { cleanup, render } from "@testing-library/react";
import "@testing-library/jest-dom";
import renderer from "react-test-renderer";
import AboutCommunity from "./AboutCommunity";

let props = {};
afterEach(cleanup);

jest.mock("react-blockies", () => (props) => {
  const MockName = "blockies-component-mock";
  return <MockName {...props} />;
});

beforeAll(() => {
  props = {
    textAbout:
      "Gitcoin is the community of builders, creators, and protocols at the center of open web ecosystems. We build and fund Public Goods.",
    adminMembers: [
      {
        name: "nick-1.eth",
      },
      {
        name: "ceresstation-1.eth",
      },
    ],
    authorsMembers: [
      {
        name: "nick-2.eth",
      },
      {
        name: "ceresstation-2.eth",
      },
    ],
  };
});

afterAll(() => {
  jest.unmock("react-blockies");
});

describe("AboutCommunity UI Component", () => {
  it("renders correctly", () => {
    const component = renderer.create(
      <AboutCommunity
        textAbout={props.textAbout}
        items={props.items}
        adminMembers={props.adminMembers}
        authorsMembers={props.authorsMembers}
      />
    );
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});

describe("AboutCommunity", () => {
  let rendered;
  beforeEach(() => {
    rendered = render(
      <AboutCommunity
        textAbout={props.textAbout}
        items={props.items}
        adminMembers={props.adminMembers}
        authorsMembers={props.authorsMembers}
      />
    );
  });
  it("should display 'About' title and about text", () => {
    const { getByText } = rendered;
    expect(getByText(props.textAbout)).toBeInTheDocument();
    expect(getByText("About")).toBeInTheDocument();
  });
  it("should display admin and authors", () => {
    const { getByText } = rendered;
    props.adminMembers.forEach(({ name }) => {
      expect(getByText(name)).toBeInTheDocument();
    });
    props.authorsMembers.forEach((member) => {
      expect(getByText(member.name)).toBeInTheDocument();
    });
  });
});

describe("AboutCommunity with no props", () => {
  let rendered;
  beforeEach(() => {
    rendered = render(<AboutCommunity />);
  });
  it("should display 'About' title only", () => {
    const { queryByText, getByText } = rendered;
    expect(queryByText(props.textAbout)).toBe(null);
    expect(getByText("About")).toBeInTheDocument();
  });
  it("should not display admin and authors", () => {
    const { queryByText } = rendered;
    props.adminMembers.forEach(({ name }) => {
      expect(queryByText(name)).toBe(null);
    });
    props.authorsMembers.forEach((member) => {
      expect(queryByText(member.name)).toBe(null);
    });
  });
});
