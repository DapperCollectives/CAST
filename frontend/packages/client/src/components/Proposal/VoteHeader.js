import { Svg } from '@cast/shared-components';

const Wrapper = ({ children }) => (
  <h3
    className={`is-size-5 has-text-weight-bold`}
    style={{ lineHeight: '24px' }}
  >
    {children}
  </h3>
);

export default function VoteHeader({ status, voteType = 'single-choice' }) {
  // Status: user-voted, invite-to-vote, is-closed
  const message = {
    'user-voted': (
      <div className="is-flex is-align-items-centered">
        <div className="mr-2 is-flex is-align-items-center">
          <Svg name="CheckMark" height="16" width="16" circleFill="#3EAE4F" />
        </div>
        You successfully voted on this proposal!
      </div>
    ),
    'invite-to-vote': (
      <>
        {voteType === 'single-choice' ? 'Cast your vote' : 'Rank your vote'}{' '}
        &#10024;
      </>
    ),
    'is-closed': <>Voting has ended on this proposal.</>,
  };

  return <Wrapper>{message[status] ?? <>Rank your vote</>}</Wrapper>;
}
