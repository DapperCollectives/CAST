const Wrapper = ({ children }) => (
  <h3
    className={`is-size-5 has-text-weight-bold`}
    style={{ lineHeight: '24px' }}
  >
    {children}
  </h3>
);

export default function VoteHeader({ status }) {
  // Status: user-voted, invite-to-vote, is-closed
  const message = {
    'user-voted': <>You successfully voted on this proposal!</>,
    'invite-to-vote': <>Cast your vote</>,
    'is-closed': <>Voting has ended on this proposal.</>,
  };

  return <Wrapper>{message[status] ?? <>Cast your vote</>}</Wrapper>;
}
