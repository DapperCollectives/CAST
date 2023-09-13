import Loader from '../Loader';
import FlipsCards from './FlipsCard';

const FlipsList = ({ proposals, initialLoading }) => {
  return (
    <>
      {initialLoading && <Loader fullHeight />}
      <div className="columns is-variable is-3 is-multiline">
        {(proposals ?? []).map((pr, i) => (
          <FlipsCards pr={pr} key={i} />
        ))}
      </div>
    </>
  );
};

export default FlipsList;
