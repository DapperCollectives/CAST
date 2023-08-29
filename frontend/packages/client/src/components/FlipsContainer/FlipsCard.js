import { Link } from 'react-router-dom';
import FlipCardBody from './FlipCardBody';
import FlipCardFooter from './FlipCardFooter';
import FlipCardHeader from './FlipCardHeader';
import classes from './index.module.scss';

export default function FlipsCard({ pr = {}, style }) {
  const { body, creatorAddr, name, id, voted, endTime, computedStatus } = pr;
  return (
    <Link
      to={`/community/${pr.communityId}/proposal/${pr.id}`}
      className={`${classes.linkContainer} column is-4`}
    >
      <div className="border-light rounded-sm transition-all" style={style}>
        <FlipCardHeader address={creatorAddr} />
        <FlipCardBody name={name} body={body} />
        <FlipCardFooter
          id={id}
          voted={voted}
          endTime={endTime}
          computedStatus={computedStatus}
        />
      </div>
    </Link>
  );
}
