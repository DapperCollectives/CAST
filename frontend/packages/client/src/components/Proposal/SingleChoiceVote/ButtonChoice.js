const ButtonChoice = ({
  choice,
  currentOption,
  readOnly,
  confirmAndVote,
  previousVote,
}) => {
  const _confirmAndVote = (value) => () => confirmAndVote(value);

  const showVotedCheck = (value) =>
    !!currentOption &&
    String(currentOption[0]) === String(value) &&
    String(previousVote) === String(value);

  return (
    <button
      style={{ minHeight: '67px', height: 'auto', width: '100%' }}
      className={`button vote-button transition-all is-flex has-background-yellow rounded-sm is-${
        (choice.value === currentOption || !currentOption) && !readOnly
          ? 'enabled'
          : 'disabled'
      }`}
      onClick={_confirmAndVote(choice.value)}
    >
      <div className="columns is-mobile">
        {showVotedCheck(choice.value) && (
          <div className="column is-narrow is-flex is-align-items-center">
            <span className={`mr-3 is-button-chosen is-inline-flex`} />
          </div>
        )}
        <div className="column">
          <p
            className="has-text-justified"
            style={{
              whiteSpace: 'normal',
              wordWrap: 'break-word',
            }}
          >
            {choice.label}
          </p>
        </div>
      </div>
    </button>
  );
};

export default ButtonChoice;
