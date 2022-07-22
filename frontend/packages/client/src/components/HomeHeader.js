import React from 'react';
import { Link } from 'react-router-dom';

export default function HomeHeader() {
  return (
    <div className="is-flex is-flex-direction-column is-align-items-center is-justify-content-center pb-7">
      <h1 className="has-text-weight-bold" style={{ fontSize: '4.13rem' }}>
        Make decisions, together.
      </h1>
      <h4 className="py-5 is-size-5">
        CAST is a voting tool for token communities.{' '}
      </h4>
      <div className="columns">
        <div className="column">
          <Link to={`/about`}>
            <div
              className="button is-fullwidth rounded-sm is-uppercase is-flex small-text has-text-white has-background-black"
              style={{ minHeight: '40px' }}
            >
              LEARN MORE
            </div>
          </Link>
        </div>
        <div className="column">
          <Link to={`/community/create`}>
            <div
              className="button is-fullwidth rounded-sm is-uppercase is-flex small-text"
              style={{ minHeight: '40px' }}
            >
              CREATE A COMMUNITY
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
