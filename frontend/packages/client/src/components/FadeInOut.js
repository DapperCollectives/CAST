import React, { useEffect, useState } from 'react';

export default function FadeInOut({
  children,
  as: Tag = 'div',
  style = { display: 'inherit' },
  hide = false,
  onTransitionend = () => {},
} = {}) {
  const [hideClass, setHideClass] = useState('');

  useEffect(() => {
    if (hide) {
      setHideClass('fade-out');
    }
  }, [hide]);

  return (
    <Tag
      style={style}
      className={`fade-in ${hideClass}`}
      onTransitionEnd={() => onTransitionend()}
    >
      {children}
    </Tag>
  );
}
