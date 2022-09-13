import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { Svg } from '@cast/shared-components';

const Tablink = forwardRef(
  (
    {
      linkText,
      linkUrl,
      isActive,
      onlyLink,
      onClick = () => {},
      className = '',
    },
    ref
  ) => {
    const textClass = `${className} ${
      isActive ? 'has-text-black' : 'has-text-grey'
    }`;

    if (!linkUrl) {
      return (
        // eslint-disable-next-line jsx-a11y/anchor-is-valid
        <a className={textClass} onClick={onClick}>
          {linkText}
        </a>
      );
    }

    if (onlyLink) {
      return (
        <Link to={linkUrl} className={textClass}>
          {linkText}
        </Link>
      );
    }

    const link = isActive ? (
      <>
        <b className="pr-2">{linkText + ' '}</b>
        <Svg name="Star" width="13" height="13" fill="black" />
      </>
    ) : (
      <>{linkText}</>
    );

    return (
      <Link to={linkUrl} className={textClass} ref={ref}>
        <div
          className={`is-flex is-align-items-center is-justify-content-left`}
        >
          {link}
        </div>
      </Link>
    );
  }
);

export default Tablink;
