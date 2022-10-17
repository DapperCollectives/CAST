import { Link } from 'react-router-dom';
import { Svg } from '@cast/shared-components';
import classnames from 'classnames';

export default function BackButton({ communityId, isMobile } = {}) {
  const styleButtons = isMobile ? { maxHeight: '32px' } : { maxHeight: '40px' };

  const stylesBackButton = classnames(
    'button is-fullwidth rounded-lg is-flex has-text-weight-bold has-background-white ',
    { 'small-text px-4': isMobile },
    { 'px-5': !isMobile }
  );

  return (
    <Link to={`/community/${communityId}?tab=proposals`}>
      <div className={stylesBackButton} style={styleButtons}>
        <Svg name="ArrowLeft" />
        <span className="ml-3">Back</span>
      </div>
    </Link>
  );
}
