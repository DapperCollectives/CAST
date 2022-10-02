import Blockies from 'react-blockies';
import { Link } from 'react-router-dom';
import { useMediaQuery } from 'hooks';
import classNames from 'classnames';
import JoinCommunityButton from './JoinCommunityButton';

/**
 * CommunityCard will group communities on a row bases,
 * will use elementsPerRow to determine how many communities to render per row
 */

const NameAndBody = ({ name, body, isMobile }) => {
  const containerClass = classNames(
    'column is-flex is-flex-direction-column is-justyfy-content-flex-start',
    { 'is-12': isMobile }
  );
  const nameClass = classNames(
    'is-size-4 is-size-5-mobile is-4 line-clamp-2 has-text-weight-bold',
    { 'mb-2': !isMobile },
    { 'mb-1': isMobile }
  );
  const bodyClass = classNames('has-text-grey line-clamp-2', {
    'small-text': isMobile,
  });

  return (
    <div className={containerClass}>
      <div className={nameClass}>{name}</div>
      <p
        className={bodyClass}
        style={{
          lineHeight: '1.5em',
          maxHeight: '3rem',
        }}
      >
        {body}
      </p>
    </div>
  );
};

const CommunityCard = ({ logo, name, body, id, slug, hideJoin }) => {
  const isNotMobile = useMediaQuery();
  const avatarSize = isNotMobile
    ? {
        logo: { width: 96, height: 96 },
        blockie: { size: 10, scale: 9.6 },
        columnStyle: { maxHeight: '120px' },
      }
    : {
        logo: { width: 48, height: 48 },
        blockie: { size: 10, scale: 4.8 },
        columnStyle: { maxHeight: '72px' },
      };

  return (
    <Link to={`/community/${id}?tab=proposals`} style={{ color: 'inherit' }}>
      <div className="is-flex is-flex-grow-1 rounded-lg border-light p-5 p-4-mobile is-flex-direction-column transition-all community-card">
        <div className="columns is-multiline is-flex-grow-1 is-mobile">
          <div
            className="column is-narrow pr-2-mobile"
            style={avatarSize.columnStyle}
          >
            {logo ? (
              <div
                className="border-light rounded-full"
                style={{
                  ...avatarSize.logo,
                  backgroundImage: `url(${logo})`,
                  backgroundSize: 'cover',
                }}
              />
            ) : (
              <Blockies
                seed={slug ?? `seed-${id}`}
                size={avatarSize.blockie.size}
                scale={avatarSize.blockie.scale}
                className="rounded-full"
              />
            )}
          </div>
          {isNotMobile && <NameAndBody name={name} body={body} />}
          {!hideJoin && (
            <div
              className={`column is-flex is-align-items-flex-start${
                isNotMobile
                  ? ' is-narrow'
                  : ' flex-1 is-justify-content-flex-end'
              } `}
            >
              <JoinCommunityButton communityId={id} />
            </div>
          )}
          {!isNotMobile && <NameAndBody name={name} body={body} isMobile />}
        </div>
      </div>
    </Link>
  );
};

CommunityCard.displayName = 'Community-Card';

export default CommunityCard;
