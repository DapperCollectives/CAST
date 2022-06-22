import React, { useCallback } from 'react';
import { useMediaQuery } from '../hooks';

export default function WrapperResponsive({
  as: Tag = 'div',
  children,
  classNames = '',
  styles = {},
  extraClasses = '',
  extraClassesMobile = '',
  extraStyles,
  extraStylesMobile,
} = {}) {
  const notMobile = useMediaQuery();

  const component = useCallback(
    (children) => {
      const classes = `${classNames} ${extraClasses}`.trim();
      const stylesObj = Object.assign({}, styles, extraStyles ?? {});
      return (
        <Tag className={classes} style={stylesObj}>
          {children}
        </Tag>
      );
    },
    [styles, extraStyles, classNames, extraClasses]
  );

  const mobileComponent = useCallback(
    (children) => {
      const classesForMobile = `${classNames} ${extraClassesMobile}`.trim();
      const stylesObjMob = Object.assign({}, styles, extraStylesMobile ?? {});
      return (
        <Tag className={classesForMobile} style={stylesObjMob}>
          {children}
        </Tag>
      );
    },
    [styles, classNames, extraClassesMobile, extraStylesMobile]
  );

  const returnComponent = useCallback(
    (children) => {
      return notMobile ? component(children) : mobileComponent(children);
    },
    [notMobile, component, mobileComponent]
  );
  return returnComponent(children);
}
