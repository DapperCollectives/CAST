import { Link } from 'react-router-dom';
import { useStarAnimation } from 'hooks';

const stars = [
  { topPer: 0, leftPer: 0, width: '31px', height: '31px', start: 100 },
  { topPer: 0.42, leftPer: 0.18, width: '20px', height: '20px', start: 1000 },
  { topPer: 0.1, leftPer: 0.45, width: '31px', height: '31px', start: 700 },
  { topPer: 0.1, leftPer: 0.99, width: '31px', height: '31px', start: 1100 },
  { topPer: 0.35, leftPer: 0.7, width: '31px', height: '31px', start: 1100 },
  { topPer: 0.92, leftPer: 0.67, width: '25px', height: '25px', start: 500 },
];

export default function HomeHeader() {
  const { addToArrayOfRefes, starArray, parentRef } = useStarAnimation({
    stars,
  });

  return (
    <div
      className="is-flex is-flex-direction-column is-align-items-center is-justify-content-center py-5-mobile py-7 has-background-light-grey"
      style={{
        position: 'relative',
        zIndex: 0, // needed for stars to show up
      }}
    >
      <div
        className="is-flex is-flex-direction-column is-align-items-center is-justify-content-center px-4"
        style={{ position: 'relative' }}
        ref={parentRef}
      >
        <div className="is-flex">
          <h1 className="has-text-weight-bold has-text-centered header-text">
            Make decisions, together.
          </h1>
        </div>
        <h4 className="py-4 mb-4 is-size-4 has-text-centered">
          CAST is a voting tool for token communities.{' '}
        </h4>
        {starArray.map((position, index) => (
          <div
            key={index}
            ref={addToArrayOfRefes}
            style={{ ...position, position: 'absolute', zIndex: '-10' }}
          />
        ))}
      </div>
      <div className="columns">
        <div className="column">
          <Link to={`/about`}>
            <div
              className="button is-fullwidth rounded-lg is-flex has-text-weight-bold has-text-white has-background-black px-5"
              style={{ minHeight: '40px' }}
            >
              Learn More
            </div>
          </Link>
        </div>
        <div className="column">
          <Link to={`/community/create`}>
            <div
              className="button is-fullwidth rounded-lg is-flex has-text-weight-bold has-background-white px-5"
              style={{ minHeight: '40px' }}
            >
              Create a Community
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
