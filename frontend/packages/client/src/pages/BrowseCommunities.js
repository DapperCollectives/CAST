import { Svg } from '@cast/shared-components';
import { FadeIn, Pill } from 'components';
import CommunitiesPresenter from 'components/Community/CommunitiesPresenter';

// fake results to adjust presentation
const CommunityResult = [
  {
    id: 1,
    name: 'Flow 1',
    body: 'Vote on Flow Validators',
    isMember: true,
  },
  {
    id: 2,
    name: 'Flow 2',
    body: 'Vote on Flow Validators',
    isMember: false,
  },
  {
    id: 3,
    name: 'Flow 3',
    body: 'Vote on Flow Validators',
    isMember: true,
  },
];

const pills = [
  { text: 'All', amount: 22, selected: true },
  { text: 'DAO', amount: 3 },
  { text: 'Creator', amount: 4 },
  { text: 'NFT', amount: 8 },
  { text: 'Collector', amount: 0 },
];

const pillContent = (text, amount) => (
  <p>
    <span className="has-text-weight-bold">{text}</span> {amount}
  </p>
);

export default function BrowseCommunities() {
  return (
    <>
      <div className="search-container has-background-light-grey">
        <section className="section">
          <div className="container px-1-mobile">
            <div
              className="is-flex search-input"
              style={{ position: 'relative' }}
            >
              <input
                placeholder="Search communities by name or description"
                className="border-light rounded-sm pr-3 py-3 column"
                style={{ paddingLeft: '40px' }}
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignContent: 'center',
                  position: 'absolute',
                  left: 12,
                  top: 12,
                }}
              >
                <Svg name="Search" />
              </div>
            </div>
            <div
              className="is-flex is-flex-wrap-wrap mt-5"
              style={{ marginLeft: '-8px' }}
            >
              {pills.map((pill, index) => (
                <Pill
                  key={`pill-${index}`}
                  onClick={() => {
                    console.log('I was clicked');
                  }}
                  text={pillContent(pill.text, pill.amount)}
                  backgroundColorClass={
                    pill.selected ? 'has-background-black' : ''
                  }
                  padding="px-4 py-2"
                  fontSize=""
                  fontWeight=""
                  classNames={`mx-2 mt-2 ${
                    pill.selected ? '' : 'has-text-black pill-border'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>
      </div>
      <section className="section">
        <div className="container">
          <FadeIn>
            <CommunitiesPresenter
              title="Communities"
              communities={CommunityResult}
            />
          </FadeIn>
        </div>
      </section>
    </>
  );
}
