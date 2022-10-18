export default function SingleVoteExample() {
  return (
    <>
      {['Option A', 'Option B', 'Option C'].map((text, index) => (
        <div
          className="is-flex is-align-items-center mb-1"
          style={{ whiteSpace: 'nowrap' }}
          key={index}
        >
          {index === 1 ? (
            <div
              className="rounded-full has-background-grey has-text-white mr-2 is-flex is-align-items-center is-justify-content-center"
              style={{ width: 12, height: 12 }}
            >
              <span style={{ fontSize: 8, paddingTop: 1 }}>&#x2713;</span>
            </div>
          ) : (
            <div
              className="rounded-full has-background-grey has-text-white mr-2 is-flex is-align-items-center is-justify-content-center"
              style={{ width: 12, height: 12 }}
            />
          )}
          <span className="smaller-text">{text}</span>
        </div>
      ))}
    </>
  );
}
