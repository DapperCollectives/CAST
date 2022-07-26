import React from 'react';
import { useMediaQuery } from 'hooks';
import classnames from 'classnames';

const defaultButtonStyle = {
  border: 'none',
  fontSize: '12px',
  marginLeft: '4px',
};

export default function Popover({
  buttonStyle = defaultButtonStyle,
  paragraphs = [],
  children,
} = {}) {
  const notMobile = useMediaQuery();
  const popoverClassName = classnames(
    'columns',
    { 'm-4': notMobile },
    { 'm-2': !notMobile }
  );
  return (
    <div className="popover is-popover-bottom">
      <button
        className="delete has-text-grey rounded-full cursor-pointer popover-trigger"
        style={buttonStyle}
      >
        {children}
      </button>
      <div className="popover-content">
        <div className={popoverClassName}>
          <div className="column is-12 p-0">
            {paragraphs.map((p, index) => (
              <p
                className="small-text has-text-weight-normal has-text-grey small-text"
                style={{
                  lineHeight: '20px',
                }}
                key={`popover-${index}`}
              >
                {p}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
