import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import JoinCommunityButton from './JoinCommunityButton';
import WrapperResponsive from 'components/WrapperResponsive';
import { useWindowDimensions } from 'hooks';
import Blockies from 'react-blockies';
/**
 * CommunityCard will group communities on a row bases,
 * will use elementsPerRow to determine how many communities to render per row
 */
const CommunityCard = ({ logo, name, description, id, slug }) => {
  const descriptionStyle = {
    lineHeight: '1.5em',
    height: '3em',
    overflow: 'hidden',
  };

  const { width: windowWidth } = useWindowDimensions();
  const joinBtnPositions = useMemo(
    () => ({
      bigger: { top: '52px', right: '74px' },
      smaller: { top: '144px', right: '332px' },
    }),
    []
  );
  const joinBtnDefault =
    windowWidth >= 500 ? joinBtnPositions.bigger : joinBtnPositions.smaller;
  const [joinBtnTopRight, setJoinBtnTopRight] = useState(joinBtnDefault);
  const [bottomSpacer, setBottomSpacer] = useState();

  useEffect(() => {
    if (
      windowWidth < 500 &&
      joinBtnTopRight.top !== joinBtnPositions.smaller.top &&
      bottomSpacer === false
    ) {
      setJoinBtnTopRight({
        top: joinBtnPositions.smaller.top,
        right: joinBtnPositions.smaller.top - windowWidth + 500,
      });
      setBottomSpacer(true);
    } else if (
      windowWidth >= 500 &&
      joinBtnTopRight.top !== joinBtnPositions.bigger.top &&
      bottomSpacer
    ) {
      setJoinBtnTopRight(joinBtnPositions.bigger);
      setBottomSpacer(false);
    }
  }, [joinBtnTopRight.top, windowWidth, bottomSpacer, joinBtnPositions]);

  return (
    <>
      <Link to={`/community/${id}?tab=about`} style={{ color: 'inherit' }}>
        <div className="is-flex is-flex-grow-1 rounded-sm border-light p-5 is-flex-direction-column transition-all community-card">
          <div className="columns is-multiline is-flex-grow-1 is-mobile">
            <div className="column is-narrow">
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
                  seed={slug}
                  size={10}
                  scale={9.6}
                  className="rounded-sm"
                />
              )}
            </div>
            <div className="column">
              <WrapperResponsive
                classNames="title mb-2"
                extraClasses="is-4 pt-1"
                extraClassesMobile="is-6 pt-2"
              >
                {name}
              </WrapperResponsive>
              <p className="has-text-grey" style={descriptionStyle}>
                {description}
              </p>
            </div>
          </div>
          {bottomSpacer ? (
            <div
              className="columns is-flex-grow-1 is-mobile"
              style={{ minHeight: '64px' }}
            />
          ) : null}
        </div>
      </Link>
      <div style={{ position: 'absolute', margin: 0, ...joinBtnTopRight }}>
        <JoinCommunityButton communityId={id} />
      </div>
    </>
  );
};

export default CommunityCard;
