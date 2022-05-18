import React, { useCallback } from "react";
import { Link, useHistory } from "react-router-dom";
import { useWebContext } from "contexts/Web3";
import { WrapperResponsive } from "components";

const CommingSoon = () => {
  return (
    <span className="has-background-light rounded-sm px-2 py-2 mr-1 is-size-7">
      Coming Soon
    </span>
  );
};
/**
 * CommunityCard will group communities on a row bases,
 * will use elementsPerRow to determine how many communities to render per row
 */
const CommunityCard = ({
  logo,
  name,
  description,
  id,
  isComingSoon = false,
  isMember = false,
  enableJoin = false,
}) => {
  const history = useHistory();

  const {
    user: { addr },
  } = useWebContext();

  const navigateAndJoinCommunity = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      // This will be updated when having the implementation to join a community
      console.log(`> Address ${addr} joining to community ${id}`);
      history.push(`/community/${id}`);
    },
    [id, addr, history]
  );

  const descriptionStyle = {
    lineHeight: "1.5em",
    height: "3em",
    overflow: "hidden",
  };

  const hoverClasses = !isComingSoon ? " transition-all community-card" : "";

  const Body = (
    <div
      className={`is-flex is-flex-grow-1 rounded-sm border-light p-5${hoverClasses}`}
    >
      <div className="columns is-multiline is-flex-grow-1 is-mobile">
        <div className="column is-narrow">
          <div
            className="border-light rounded-sm"
            style={{
              width: 96,
              height: 96,
              backgroundImage: `url(${logo})`,
              backgroundSize: "cover",
            }}
          />
        </div>
        <div className="column">
          <WrapperResponsive
            classNames="title mb-2"
            extraClasses="is-4 pt-1"
            extraClassesMobile="is-6 pt-2"
          >
            {name}
          </WrapperResponsive>
          {isComingSoon ? (
            <CommingSoon />
          ) : (
            <p className="has-text-grey" style={descriptionStyle}>
              {description}
            </p>
          )}
        </div>
        {enableJoin && !isMember && (
          <div className="column is-narrow-tablet is-full-mobile">
            <div className="is-flex is-justify-content-flex-end">
              <button
                className="button rounded-sm is-outlined is-uppercase is-fullwidth"
                onClick={navigateAndJoinCommunity}
              >
                Join
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (isComingSoon) {
    return Body;
  }

  return (
    <Link to={`/community/${id}?tab=about`} style={{ color: "inherit" }}>
      {Body}
    </Link>
  );
};

export default CommunityCard;
