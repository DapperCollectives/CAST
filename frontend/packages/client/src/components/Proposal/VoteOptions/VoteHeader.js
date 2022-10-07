const Wrapper = ({ children }) => (
  <h3
    className={`is-size-5 has-text-weight-bold`}
    style={{ lineHeight: '24px' }}
  >
    {children}
  </h3>
);

export default function VoteHeader({ currentOption, previousVote, isClosed }) {
  if (currentOption !== null && currentOption === previousVote) {
    return (
      <Wrapper>
        <>You successfully voted on this proposal!</>
      </Wrapper>
    );
  }
  if (
    !(currentOption !== null && currentOption === previousVote) &&
    !isClosed
  ) {
    return (
      <Wrapper>
        <>Cast your vote</>
      </Wrapper>
    );
  }
  if (isClosed) {
    return (
      <Wrapper>
        <>Voting has ended on this proposal.</>
      </Wrapper>
    );
  }
}
