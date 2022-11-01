export default function BasicVoteExample() {
  return (
    <>
      {['For', 'Against', 'Abstain'].map((text, index) => (
        <div
          className="is-flex is-align-items-center is-justify-content-left mb-1"
          style={{ whiteSpace: 'nowrap', width: 75 }}
          key={index}
        >
          <div
            className="rounded-full has-background-grey has-text-white mr-2 is-flex is-align-items-center is-justify-content-center"
            style={{ width: 12, height: 12 }}
          >
            {index === 0 ? (
              <span style={{ fontSize: 7, paddingTop: 1 }}>&#x2713;</span>
            ) : null}
          </div>
          <span className="smaller-text">{text}</span>
        </div>
      ))}
    </>
  );
}
