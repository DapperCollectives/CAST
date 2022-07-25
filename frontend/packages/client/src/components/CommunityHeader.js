import React from 'react';
import { useMediaQuery } from 'hooks';
import Blockies from 'react-blockies';

export default function CommunityHeader({
  id,
  bannerImgUrl,
  logo,
  slug,
  communityName,
  members,
  totalMembers,
  joinCommunityButton,
} = {}) {
  const notMobile = useMediaQuery();

  return (
    <div className="is-flex is-flex-direction-column">
      <div
        className="is-flex community-header-wrapper"
        style={{
          backgroundImage: bannerImgUrl ? `url(${bannerImgUrl})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="is-flex section">
        <div className="container">
          <div style={{ position: 'absolute', top: '-120px' }}>
            {logo ? (
              <div
                role="img"
                aria-label="community banner"
                className="rounded-full"
                style={{
                  width: 150,
                  height: 150,
                  backgroundImage: `url(${logo})`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  backgroundSize: 'cover',
                }}
              ></div>
            ) : (
              <Blockies
                seed={slug ?? `seed-${id}`}
                size={10}
                scale={15}
                className="blockies blockies-border"
              />
            )}
          </div>
          <div className="columns pt-7">
            <div className="column">
              <h2 className="has-text-weight-bold is-size-3">
                {communityName}
              </h2>
              <p className="has-text-grey small-text">{totalMembers} members</p>
              <div className="is-flex">
                {members
                  ? members.map(({ addr }, idx) => (
                      <div
                        key={`${idx}`}
                        className="blockies-wrapper is-relative"
                        style={{ right: `${idx * (notMobile ? 12 : 6)}px` }}
                      >
                        <Blockies
                          seed={addr}
                          size={notMobile ? 10 : 6}
                          scale={4}
                          className="blockies blockies-border"
                        />
                      </div>
                    ))
                  : null}
              </div>
            </div>
            <div className="column is-1">{joinCommunityButton}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
