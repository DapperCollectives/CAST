import React from "react";
import { cleanup, render } from "@testing-library/react";
import "@testing-library/jest-dom";
import renderer from "react-test-renderer";
import ProposalList from "./ProposalList";
import { MemoryRouter } from "react-router-dom";

jest.mock("../../utils.js", () => {
  const originalModule = jest.requireActual("../../utils.js");

  return {
    __esModule: true,
    ...originalModule,
    parseDateFromServer: () => ({
      date: new Date(1648726329708),
      diffFromNow: 86400000,
      diffDays: 1,
    }),
  };
});

const date = new Date();

const getProposalList = ({ isFixed = true, filter = "All" } = {}) =>
  [
    {
      id: 1,
      name: "test proposal",
      description: "test description",
      communityId: 1,
      choices: ["a", "b", "c"],
      strategy: "token-weighted-default",
      creatorAddr: "0xf8d6e0586b0a20c7",
      ...(isFixed
        ? {
            startTime: "2022-03-24T11:32:09.708727Z",
            endTime: "2022-03-25T11:32:09.708727Z",
          }
        : {
            startTime: new Date().setDate(date.getDay() - 1),
            endTime: new Date().setDate(date.getDay() + 3),
          }),
      createdAt: "2022-03-24T14:32:09.708727Z",
      status: "published",
      block_height: 0,
      total_votes: 0,
      timestamp: "",
      sig: "",
      computedStatus: "active",
      winCount: 4480000,
      textDecision: "No, do not compensate them",
      voted: false,
    },
    {
      id: 2,
      name: "test proposal",
      description: "test description",
      communityId: 1,
      choices: ["a", "b", "c"],
      strategy: "token-weighted-default",
      creatorAddr: "0xf8d6e0586b0a20c7",
      ...(isFixed
        ? {
            startTime: "2022-03-31T11:32:09.708727Z",
            endTime: "2022-04-23T11:32:09.708727Z",
          }
        : {
            startTime: new Date().setDate(date.getDay() + 1),
            endTime: new Date().setDate(date.getDay() + 3),
          }),
      createdAt: "2022-03-24T14:32:09.708727Z",
      status: "published",
      block_height: 0,
      total_votes: 0,
      timestamp: "",
      sig: "",
      computedStatus: "pending",
      winCount: 4480000,
      textDecision: "No, do not compensate them",
      voted: false,
    },
    {
      id: 3,
      name: "test proposal",
      description: "test description",
      communityId: 1,
      choices: ["a", "b", "c"],
      strategy: "token-weighted-default",
      creatorAddr: "0xf8d6e0586b0a20c7",

      ...(isFixed
        ? {
            startTime: "2022-02-22T11:32:09.708727Z",
            endTime: "2022-03-23T11:32:09.708727Z",
          }
        : {
            startTime: new Date().setDate(date.getDay() - 3),
            endTime: new Date().setDate(date.getDay() - 1),
          }),
      createdAt: "2022-03-24T14:32:09.708727Z",
      status: "published",
      block_height: 0,
      total_votes: 0,
      timestamp: "",
      sig: "",
      computedStatus: "closed",
      winCount: 4480000,
      textDecision: "No, do not compensate them",
      voted: false,
    },
    {
      id: 4,
      name: "test proposal",
      description: "test description",
      communityId: 1,
      choices: ["a", "b", "c"],
      strategy: "token-weighted-default",
      creatorAddr: "0xf8d6e0586b0a20c7",
      createdAt: "2022-03-24T14:32:09.708727Z",
      ...(isFixed
        ? {
            startTime: "2022-03-24T11:32:09.708727Z",
            endTime: "2022-03-25T11:32:09.708727Z",
          }
        : {
            startTime: new Date().setDate(date.getDay() - 3),
            endTime: new Date().setDate(date.getDay() + 1),
          }),
      status: "cancelled",
      block_height: 0,
      total_votes: 0,
      timestamp: "",
      sig: "",
      computedStatus: "cancelled",
      winCount: 4480000,
      textDecision: "No, do not compensate them",
      voted: false,
    },
  ].filter(
    (proposal) =>
      proposal.computedStatus === filter.toLocaleLowerCase() || filter === "All"
  );

const filterValues = ["All", "Active", "Pending", "Closed", "Cancelled"];

afterEach(cleanup);

beforeAll(() => {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  });
});
describe("ProposalList UI Component", () => {
  const testCases = [
    {
      description: "with regular params",
      params: {
        proposalList: getProposalList(),
        filterValues,
        filterValue: filterValues[0],
      },
    },
    {
      description: "with empty proposal list",
      params: { proposalList: [], filterValues, filterValue: filterValues[0] },
    },
    {
      description: "with no params",
      params: {
        proposalList: undefined,
        filterValues: undefined,
        filterValue: undefined,
      },
    },
  ];
  testCases.forEach((testCase) => {
    it(`renders correctly ${testCase.description}`, () => {
      const setFilterValuesMockFn = jest.fn();
      const component = renderer.create(
        <MemoryRouter>
          <ProposalList
            proposalsList={testCase.params.proposalList}
            proposalFilterValues={testCase.params.filterValues}
            setFilterValues={undefined}
            filterValue={testCase.params.filterValue}
          />
        </MemoryRouter>
      );
      let tree = component.toJSON();
      expect(tree).toMatchSnapshot();
    });
  });
});

describe("ProposalList no filter applied (All)", () => {
  let rendered;
  beforeEach(() => {
    const setFilterValuesMockFn = jest.fn();
    rendered = render(
      <MemoryRouter>
        <ProposalList
          proposalsList={getProposalList({ isFixed: false })}
          proposalFilterValues={filterValues}
          setFilterValues={setFilterValuesMockFn}
          filterValue={filterValues[0]}
        />
      </MemoryRouter>
    );
  });
  it("should display 'All' in filter dropdown", async () => {
    const { queryAllByTestId } = rendered;
    // 1 for mobile and one for other sizes
    expect(queryAllByTestId("drop-down-item-All")).toHaveLength(2);
    queryAllByTestId("drop-down-item-All").forEach((element) => {
      expect(element).toHaveClass("is-active");
    });
  });
  it("should display all proposals", () => {
    const { queryAllByTestId } = rendered;
    expect(queryAllByTestId("proposal-card")).toHaveLength(4);
  });
});

describe("ProposalList 'active' status", () => {
  let rendered;
  beforeEach(() => {
    const setFilterValuesMockFn = jest.fn();
    rendered = render(
      <MemoryRouter>
        <ProposalList
          proposalsList={getProposalList({
            isFixed: false,
            filter: filterValues[1],
          })}
          proposalFilterValues={filterValues}
          setFilterValues={setFilterValuesMockFn}
          filterValue={filterValues[1]}
        />
      </MemoryRouter>
    );
  });
  it("should display 'Active' in filter dropdown", async () => {
    const { queryAllByTestId } = rendered;
    // 1 for mobile and one for other sizes
    expect(queryAllByTestId("drop-down-item-Active")).toHaveLength(2);
    queryAllByTestId("drop-down-item-Active").forEach((element) => {
      expect(element).toHaveClass("is-active");
    });
  });
  it("should display active proposals", () => {
    const { queryAllByTestId } = rendered;
    expect(queryAllByTestId("proposal-card")).toHaveLength(1);
  });
});

describe("ProposalList 'pending' status", () => {
  let rendered;
  beforeEach(() => {
    const setFilterValuesMockFn = jest.fn();
    rendered = render(
      <MemoryRouter>
        <ProposalList
          proposalsList={getProposalList({
            isFixed: false,
            filter: filterValues[2],
          })}
          proposalFilterValues={filterValues}
          setFilterValues={setFilterValuesMockFn}
          filterValue={filterValues[2]}
        />
      </MemoryRouter>
    );
  });
  it("should display 'Pending' in filter dropdown", async () => {
    const { queryAllByTestId } = rendered;
    // 1 for mobile and one for other sizes
    expect(queryAllByTestId("drop-down-item-Pending")).toHaveLength(2);
    queryAllByTestId("drop-down-item-Pending").forEach((element) => {
      expect(element).toHaveClass("is-active");
    });
  });
  it("should display pending proposals", () => {
    const { queryAllByTestId } = rendered;
    expect(queryAllByTestId("proposal-card")).toHaveLength(1);
  });
});

describe("ProposalList 'closed' status", () => {
  let rendered;
  beforeEach(() => {
    const setFilterValuesMockFn = jest.fn();
    rendered = render(
      <MemoryRouter>
        <ProposalList
          proposalsList={getProposalList({
            isFixed: false,
            filter: filterValues[3],
          })}
          proposalFilterValues={filterValues}
          setFilterValues={setFilterValuesMockFn}
          filterValue={filterValues[3]}
        />
      </MemoryRouter>
    );
  });
  it("should display 'Closed' in filter dropdown", async () => {
    const { queryAllByTestId } = rendered;
    // 1 for mobile and one for other sizes
    expect(queryAllByTestId("drop-down-item-Closed")).toHaveLength(2);
    queryAllByTestId("drop-down-item-Closed").forEach((element) => {
      expect(element).toHaveClass("is-active");
    });
  });
  it("should display closed proposals", () => {
    const { queryAllByTestId } = rendered;
    expect(queryAllByTestId("proposal-card")).toHaveLength(1);
  });
});

describe("ProposalList 'cancelled' status", () => {
  let rendered;
  beforeEach(() => {
    const setFilterValuesMockFn = jest.fn();
    rendered = render(
      <MemoryRouter>
        <ProposalList
          proposalsList={getProposalList({
            isFixed: false,
            filter: filterValues[4],
          })}
          proposalFilterValues={filterValues}
          setFilterValues={setFilterValuesMockFn}
          filterValue={filterValues[4]}
        />
      </MemoryRouter>
    );
  });
  it("should display 'Cancelled' in filter dropdown", async () => {
    const { queryAllByTestId } = rendered;
    // 1 for mobile and one for other sizes
    expect(queryAllByTestId("drop-down-item-Cancelled")).toHaveLength(2);
    queryAllByTestId("drop-down-item-Cancelled").forEach((element) => {
      expect(element).toHaveClass("is-active");
    });
  });
  it("should display cancelled proposals", () => {
    const { queryAllByTestId } = rendered;
    expect(queryAllByTestId("proposal-card")).toHaveLength(1);
  });
});
