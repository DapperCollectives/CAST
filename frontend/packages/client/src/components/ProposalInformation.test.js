import renderer from 'react-test-renderer';
import '@testing-library/jest-dom';
import { cleanup, render } from '@testing-library/react';
import { ProposalInformation } from './ProposalInformation';

let documentMock;

jest.mock('react-blockies', () => (props) => {
  const MockName = 'blockies-component-mock';
  return <MockName {...props} />;
});

beforeEach(() => {
  documentMock = jest
    .spyOn(document, 'querySelector')
    .mockImplementation((selector) => {
      switch (selector) {
        case 'header':
          return { offsetHeight: 85 };
        default:
          return null;
      }
    });
});

afterEach(() => {
  documentMock.mockClear();
});

afterEach(cleanup);

afterAll(() => {
  jest.unmock('react-blockies');
});

const proposalData = {
  creatorAddr: '0xf8d6e0586b0a20c7',
  strategies: ['token-weighted-capped'],
  isCoreCreator: false,
  ipfs: 'QmZbsvX2ww3JtK6PGPHXu64ZkELN8kXhhSv7vkHcp9KQGr',
  ipfsUrl: 'http://www.ipfs.com/QmZbsvX2ww3JtK6PGPHXu64ZkELN8kXhhSv7vkHcp9KQGr',
  startTime: new Date('December 17, 2022 03:24:00'),
  endTime: new Date('December 22, 2022 03:24:00'),
  proposalId: '12',
  openStrategyModal: () => {},
  className: '',
};

describe('ProposalInformation UI Component', () => {
  it(`renders correctly`, () => {
    const component = renderer.create(
      <ProposalInformation
        creatorAddr={proposalData.creatorAddr}
        strategies={proposalData.strategies}
        isCoreCreator={proposalData.isCoreCreator}
        ipfs={proposalData.ipfs}
        ipfsUrl={proposalData.ipfsUrl}
        startTime={proposalData.startTime}
        endTime={proposalData.endTime}
        proposalId={proposalData.proposalId}
        openStrategyModal={proposalData.openStrategyModal}
        className={proposalData.className}
      />
    );
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it(`renders correctly with className`, () => {
    const component = renderer.create(
      <ProposalInformation
        creatorAddr={proposalData.creatorAddr}
        strategies={proposalData.strategies}
        isCoreCreator={proposalData.isCoreCreator}
        ipfs={proposalData.ipfs}
        ipfsUrl={proposalData.ipfsUrl}
        startTime={proposalData.startTime}
        endTime={proposalData.endTime}
        proposalId={proposalData.proposalId}
        openStrategyModal={proposalData.openStrategyModal}
        className="has-background-white-ter"
      />
    );
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it(`renders correctly with no props`, () => {
    const component = renderer.create(<ProposalInformation />);
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});

describe('ProposalInformation renders labels and data', () => {
  let rendered;
  beforeEach(() => {
    documentMock = jest
      .spyOn(document, 'querySelector')
      .mockImplementation((selector) => {
        switch (selector) {
          case 'header':
            return { offsetHeight: 85 };
          default:
            return null;
        }
      });
    rendered = render(
      <ProposalInformation
        creatorAddr={proposalData.creatorAddr}
        strategies={proposalData.strategies}
        isCoreCreator={proposalData.isCoreCreator}
        ipfs={proposalData.ipfs}
        ipfsUrl={proposalData.ipfsUrl}
        startTime={proposalData.startTime}
        endTime={proposalData.endTime}
        proposalId={proposalData.proposalId}
        openStrategyModal={proposalData.openStrategyModal}
        className={proposalData.className}
      />
    );
  });

  afterEach(() => {
    documentMock.mockClear();
  });

  it('should display Author label text', () => {
    const { getAllByText } = rendered;
    // there three elements in DOM to be responsive
    expect(getAllByText('Author')).toHaveLength(3);
  });

  it('should display Author address value', () => {
    const { getAllByText } = rendered;
    // there three elements in DOM to be responsive
    expect(getAllByText(proposalData.creatorAddr)).toHaveLength(3);
  });

  it('should display Start date label text', () => {
    const { getAllByText } = rendered;
    // there three elements in DOM to be responsive
    expect(getAllByText('Start date')).toHaveLength(3);
  });

  it("should display Start date value widh format '[Month], [Day], [Yeah], [time][AM/PM]'", () => {
    const { getAllByText } = rendered;
    // there three elements in DOM to be responsive
    expect(
      getAllByText(
        proposalData.startTime.toLocaleString(undefined, {
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          month: 'short',
          year: 'numeric',
          hour12: true,
        })
      )
    ).toHaveLength(3);
  });

  it('should display End date label text', () => {
    const { getAllByText } = rendered;
    // there three elements in DOM to be responsive
    expect(getAllByText('End date')).toHaveLength(3);
  });

  it("should display End date value '[Month], [Day], [Yeah], [time][AM/PM]'", () => {
    const { getAllByText } = rendered;
    // there three elements in DOM to be responsive
    expect(
      getAllByText(
        proposalData.endTime.toLocaleString(undefined, {
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          month: 'short',
          year: 'numeric',
          hour12: true,
        })
      )
    ).toHaveLength(3);
  });
});
