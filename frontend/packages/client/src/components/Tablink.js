import React from "react";
import { Link } from "react-router-dom";
import { Star } from "components/Svg";

const Tablink = ({
  linkText,
  linkUrl,
  isActive,
  onlyLink,
  onClick = () => {},
  animateHover = false,
  className = "",
}) => {
  const textClass = `${className} ${
    isActive ? "has-text-black" : "has-text-grey"
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
      <b className="pr-2">{linkText + " "}</b>
      <Star width="13" height="13" fill="black" />
    </>
  ) : (
    <>{linkText}</>
  );

  const animateClasses = animateHover ? " tab-link transition-all" : "";

  return (
    <Link to={linkUrl} className={textClass}>
      <div
        className={`is-flex is-align-items-center is-justify-content-left ${animateClasses}`}
      >
        {link}
      </div>
    </Link>
  );
};

export default Tablink;
