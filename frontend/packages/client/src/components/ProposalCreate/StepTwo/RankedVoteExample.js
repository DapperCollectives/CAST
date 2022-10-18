import { Fragment } from 'react';

export default function RankedVoteExample() {
  return (
    <>
      {['Option C', 'Option B', 'Option A'].map((text, index) => (
        <div
          className="is-flex is-align-items-center mb-1"
          style={{ whiteSpace: 'nowrap' }}
          key={index}
        >
          <div
            className="rounded-full has-background-grey has-text-white mr-2 is-flex is-align-items-center is-justify-content-center"
            style={{ width: 12, height: 12 }}
          >
            <span style={{ fontSize: 7, paddingTop: 1 }}>{index + 1}</span>
          </div>
          <span className="smaller-text">{text}</span>
        </div>
      ))}
    </>
  );
}
