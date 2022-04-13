import React from "react";

export default function WrapperResponsive({
  as: Tag = "div",
  children,
  commonClasses = "",
  extraClasses = "",
  extraClassesMobile = "",
  extraStyles,
  extraStylesMobile,
} = {}) {
  const classesForMobile = "is-hidden-tablet"
    .concat(" " + commonClasses)
    .concat(" " + extraClassesMobile)
    .trim();

  const classes = "is-hidden-mobile"
    .concat(" " + commonClasses)
    .concat(" " + extraClasses)
    .trim();

  const component =
    typeof extraStyles === "object" ? (
      <Tag className={classes} style={extraStyles}>
        {children}
      </Tag>
    ) : (
      <Tag className={classes}>{children}</Tag>
    );

  const mobileComponent =
    typeof extraStylesMobile === "object" ? (
      <Tag className={classesForMobile} style={extraStylesMobile}>
        {children}
      </Tag>
    ) : (
      <Tag className={classesForMobile}>{children}</Tag>
    );

  return (
    <>
      {component}
      {mobileComponent}
    </>
  );
}
