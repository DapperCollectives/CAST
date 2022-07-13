import React from 'react';
import { Link } from 'react-router-dom';
import JoinCommunityButton from './JoinCommunityButton';
import WrapperResponsive from 'components/WrapperResponsive';
import Blockies from 'react-blockies';
/**
 * CommunityCard will group communities on a row bases,
 * will use elementsPerRow to determine how many communities to render per row
 */
const CommunityCard = ({ logo, name, body, id, slug }) => {
  const descriptionStyle = {
    lineHeight: '1.5em',
    height: '3em',
    overflow: 'hidden',
  };

  return (
    <>
      <Link to={`/community/${id}?tab=proposals`} style={{ color: 'inherit' }}>
        <div className="is-flex is-flex-grow-1 rounded-sm border-light p-5 is-flex-direction-column transition-all community-card">
          <div className="columns is-multiline is-flex-grow-1 is-mobile">
            <div className="column is-narrow" style={{ maxHeight: '120px' }}>
              {logo ? (
                <div
                  className="border-light rounded-sm"
                  style={{
                    width: 96,
                    height: 96,
                    backgroundImage: `url(${logo})`,
                    backgroundSize: 'cover',
                  }}
                />
              ) : (
                <Blockies
                  seed={slug ?? `seed-${id}`}
                  size={10}
                  scale={9.6}
                  className="rounded-sm"
                />
              )}
            </div>
            <div className="column is-flex is-flex-direction-column is-justify-content-center">
              <WrapperResponsive
                classNames="is-size-5 mb-2"
                extraClasses="is-4 pt-1"
                extraClassesMobile="is-6 pt-2"
              >
                {name}
              </WrapperResponsive>
              <p className="has-text-grey" style={descriptionStyle}>
                {body}
              </p>
            </div>
            <div className="column is-narrow is-flex is-flex-direction-column is-justify-content-start">
              <JoinCommunityButton communityId={id} darkMode={false} />
            </div>
          </div>
        </div>
      </Link>
    </>
  );
};

export default CommunityCard;
