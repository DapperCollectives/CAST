import { cleanup, render } from '@testing-library/react';
import React from 'react';
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom';
import ProposalCardHeader from './ProposalCardHeader';

const date = new Date();
let pendingProposalProps = {
  textDecision: 'This is decision text',
  winCount: 12,
  voted: true,
  endTime: new Date().setDate(date.getDate() + 10),
  startTime: new Date().setDate(date.getDate() + 2),
  computedStatus: 'pending',
};
let activeProposalProps = {
  textDecision: 'This is decision text',
  winCount: 12,
  voted: true,
  endTime: new Date().setDate(date.getDate() + 10),
  startTime: new Date().setDate(date.getDate() - 2),
  computedStatus: 'active',
};
let closedProposalProps = {
  textDecision: 'This is decision text',
  winCount: 12,
  voted: true,
  endTime: new Date().setDate(date.getDate() - 3),
  startTime: new Date().setDate(date.getDate() - 8),
  computedStatus: 'closed',
};
let cancelledProposalProps = {
  computedStatus: 'cancelled',
  textDecision: 'This is decision text',
  winCount: 12,
  voted: true,
  endTime: new Date().setDate(date.getDate() + 10),
  startTime: new Date().setDate(date.getDate() - 2),
};
const propsArray = [
  activeProposalProps,
  pendingProposalProps,
  closedProposalProps,
  cancelledProposalProps,
];
afterEach(cleanup);

describe('ProposalCardHeader UI Component', () => {
  propsArray.forEach((props) => {
    it(`renders correctly on  ${props.computedStatus} computedStatus`, () => {
      const component = renderer.create(
        <ProposalCardHeader
          textDecision={props.textDecision}
          winCount={props.winCount}
          voted={props.voted}
          endTime={props.endTime}
          startTime={props.startTime}
          computedStatus={props.computedStatus}
        />
      );
      let tree = component.toJSON();
      expect(tree).toMatchSnapshot();
    });
  });
});

describe("ProposalCardHeader computedStatus 'pending'", () => {
  let rendered;
  beforeEach(() => {
    rendered = render(
      <ProposalCardHeader
        textDecision={pendingProposalProps.textDecision}
        winCount={pendingProposalProps.winCount}
        voted={pendingProposalProps.voted}
        endTime={pendingProposalProps.endTime}
        startTime={pendingProposalProps.startTime}
        computedStatus={pendingProposalProps.computedStatus}
      />
    );
  });
  it("should display 'Pending' label with grey light color", () => {
    const { getByText } = rendered;
    expect(getByText('Pending')).toBeInTheDocument();
    expect(getByText('Pending')).toHaveClass(
      'has-text-white rounded-sm px-2 py-1 has-background-grey-light'
    );
  });
  it('does not display voted label', () => {
    const { queryByText } = rendered;
    expect(queryByText('voted')).toBe(null);
  });
});

describe("ProposalCardHeader computedStatus 'active' without vote", () => {
  let daysToClose = 10;
  let endTime = new Date().setDate(date.getDate() + daysToClose);
  let startTime = new Date().setDate(date.getDate() - 2);
  let rendered;
  beforeEach(() => {
    rendered = render(
      <ProposalCardHeader
        textDecision={activeProposalProps.textDecision}
        winCount={activeProposalProps.winCount}
        voted={false}
        endTime={endTime}
        startTime={startTime}
        computedStatus={activeProposalProps.computedStatus}
      />
    );
  });
  it('should display active text with countdown days', () => {
    const { getByText } = rendered;
    expect(
      getByText(`Active: Ends in ${daysToClose} days`)
    ).toBeInTheDocument();
  });
  it('should display active icon', () => {
    const { queryByTitle } = rendered;
    expect(queryByTitle('Active')).toBeInTheDocument();
  });
  it('should not display voted label', () => {
    const { queryByText } = rendered;
    expect(queryByText(`Voted`)).toBe(null);
  });
});

describe("ProposalCardHeader computedStatus 'active' with user vote", () => {
  let daysToClose = 10;
  let endTime = new Date().setDate(date.getDate() + daysToClose);
  let startTime = new Date().setDate(date.getDate() - 2);
  let rendered;
  beforeEach(() => {
    rendered = render(
      <ProposalCardHeader
        textDecision={activeProposalProps.textDecision}
        winCount={activeProposalProps.winCount}
        voted={activeProposalProps.voted}
        endTime={endTime}
        startTime={startTime}
        computedStatus={activeProposalProps.computedStatus}
      />
    );
  });
  it('should display active text with countdown days', () => {
    const { getByText } = rendered;
    expect(
      getByText(`Active: Ends in ${daysToClose} days`)
    ).toBeInTheDocument();
  });
  it('should display active icon', () => {
    const { queryByTitle } = rendered;
    expect(queryByTitle('Active')).toBeInTheDocument();
  });
  it('should display voted label when user voted', () => {
    const { getByText } = rendered;
    expect(getByText(`Voted`)).toBeInTheDocument();
  });
});

describe("ProposalCardHeader computedStatus 'closed'", () => {
  let rendered;
  beforeEach(() => {
    rendered = render(
      <ProposalCardHeader
        textDecision={closedProposalProps.textDecision}
        winCount={closedProposalProps.winCount}
        voted={closedProposalProps.voted}
        endTime={closedProposalProps.endTime}
        startTime={closedProposalProps.startTime}
        computedStatus={closedProposalProps.computedStatus}
      />
    );
  });
  it("should display 'Closed' label with grey color", () => {
    const { getByText } = rendered;
    expect(getByText('Closed')).toBeInTheDocument();
    expect(getByText('Closed')).toHaveClass(
      'has-text-white rounded-sm px-2 py-1 has-background-grey'
    );
  });
  it('should display decision text with win count', () => {
    const { getByText } = rendered;
    expect(
      getByText(
        `${closedProposalProps.textDecision} (${closedProposalProps.winCount})`
      )
    ).toBeInTheDocument();
  });
  it('does not display voted label', () => {
    const { queryByText } = rendered;
    expect(queryByText('voted')).toBe(null);
  });
  it('should display closed checked icon', () => {
    const { queryByTitle } = rendered;
    expect(queryByTitle('CheckCircle')).toBeInTheDocument();
  });
});

describe('ProposalCardHeader defaults to closed when no props are passed', () => {
  let rendered;
  beforeEach(() => {
    rendered = render(<ProposalCardHeader />);
  });
  it("should display 'Closed' label with grey color", () => {
    const { getByText } = rendered;
    expect(getByText('Closed')).toBeInTheDocument();
    expect(getByText('Closed')).toHaveClass(
      'has-text-white rounded-sm px-2 py-1 has-background-grey'
    );
  });
  it('does not display voted label', () => {
    const { queryByText } = rendered;
    expect(queryByText('voted')).toBe(null);
  });
  it('should display closed checked icon', () => {
    const { queryByTitle } = rendered;
    expect(queryByTitle('CheckCircle')).toBeInTheDocument();
  });
});
