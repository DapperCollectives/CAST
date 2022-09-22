import { cloneElement, useRef } from 'react';

const InfoBlock = ({ title, content, component, isLastElement = false }) => {
  const containerRef = useRef();
  // warn component consumer
  if (content && component) {
    console.warn('InfoBlock: please provide content or component');
  }
  return (
    <div
      className={`columns is-mobile p-0 m-0 small-text ${
        isLastElement ? '' : 'mb-5'
      }`}
      ref={containerRef}
    >
      <div className="column p-0 is-flex is-align-items-center flex-1 has-text-grey is-4 is-5-desktop">
        {title}
      </div>
      <div
        className="column p-0 is-flex flex-1 is-align-items-center is-justify-content-flex-end"
        style={{
          height: '1.5rem',
        }}
      >
        {content}
        {component && cloneElement(component, { ref: containerRef })}
      </div>
    </div>
  );
};

export default InfoBlock;
