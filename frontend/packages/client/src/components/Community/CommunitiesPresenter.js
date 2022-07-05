import React from 'react';
import CommunityCard from './CommunityCard';
import classnames from 'classnames';
/**
 * CommunitiesPresenter will group communities on a row bases,
 * will use elementsPerRow to determine how many communities to render per row
 */
const CommunitiesPresenter = ({
  classNames,
  title,
  elementsPerRow = 2,
  communities,
} = {}) => {
  // used to get column size based on number of elements
  // per row
  let columnSize = '';
  switch (elementsPerRow) {
    case 2: {
      columnSize = 'is-6-desktop';
      break;
    }
    case 3: {
      columnSize = 'is-4-desktop';
      break;
    }
    default: {
      columnSize = 'is-6-desktop';
    }
  }

  const containerClasses = classnames('container', {
    [classNames]: !!classNames,
  });

  return (
    <div className={containerClasses}>
      <h1 className="is-uppercase small-text communities">{title}</h1>
      <div className="columns is-multiline">
        {communities.map((community, index) => {
          const { logo, name, description, id, isComingSoon } = community;
          return (
            <div
              className={`column ${columnSize} is-12-tablet`}
              key={`community-${index}`}
              style={{ position: 'relative' }} // bulma class did not override
            >
              <CommunityCard
                logo={logo}
                name={name}
                description={description}
                id={id}
                isComingSoon={isComingSoon}
                key={index}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CommunitiesPresenter;
