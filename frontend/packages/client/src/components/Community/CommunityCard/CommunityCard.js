import Blockies from 'react-blockies';
import { Link } from 'react-router-dom';
import { useMediaQuery } from 'hooks';
import JoinCommunityButton from '../JoinCommunityButton';
import NameAndBody from './NameAndBody';
import PillsWithStatus from './PillsWithStatus';

/**
 * CommunityCard will group communities on a row bases,
 * will use elementsPerRow to determine how many communities to render per row
 */

const CommunityCard = ({
  logo,
  name,
  body,
  id,
  slug,
  hideJoin,
  pActive,
  pPending,
} = {}) => {
  const isNotMobile = useMediaQuery();
  const avatarSize = isNotMobile
    ? {
        logo: { width: 96, height: 96 },
        blockie: { size: 10, scale: 9.6 },
        columnStyle: { maxHeight: '120px' },
      }
    : {
        logo: { width: 60, height: 60 },
        blockie: { size: 10, scale: 6 },
        columnStyle: { maxHeight: '85px' },
      };

  return (
    <Link to={`/community/${id}?tab=proposals`} style={{ color: 'inherit' }}>
      <div className="is-flex is-flex-grow-1 rounded-lg border-light p-5 p-4-mobile is-flex-direction-column transition-all community-card">
        <div className="columns is-multiline is-flex-grow-1 is-mobile">
          <div className="column is-narrow" style={avatarSize.columnStyle}>
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

          <div
            className={`column is-flex is-flex-direction-column${
              isNotMobile
                ? ' is-narrow'
                : ' flex-1 is-align-items-flex-end is-justify-content-flex-start'
            } `}
          >
            {!hideJoin ? (
              <JoinCommunityButton communityId={id} />
            ) : (
              <PillsWithStatus pActive={pActive} pPending={pPending} />
            )}
          </div>

          {!isNotMobile && <NameAndBody name={name} body={body} isMobile />}
        </div>
      </div>
    </Link>
  );
};

CommunityCard.displayName = 'Community-Card';

export default CommunityCard;
