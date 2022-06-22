import React from 'react';

const StartLoader = ({ pathId, className = '', width = 35, height = 35 }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 70 70"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g transform="translate(3 3)">
        <path
          id={pathId}
          data-name={pathId}
          d="M31.5332 5.59103C29.3198 18.8977 18.8176 29.3999 5.51096 31.6132C5.03541 31.6932 5.03541 32.3955 5.51096 32.4755C18.8176 34.6888 29.3198 45.1955 31.5376 58.5021C31.6176 58.9777 32.3198 58.9777 32.3998 58.5021C34.6132 45.1955 45.1199 34.6932 58.4265 32.4755C58.9021 32.3955 58.9021 31.6932 58.4265 31.6132C45.1199 29.3999 34.6176 18.8932 32.3998 5.58658C32.3198 5.11103 31.6132 5.11103 31.5332 5.59103Z"
          fill="currentColor"
        />
        <animate
          attributeName="fill-opacity"
          from="1"
          to="1"
          begin="0s"
          dur="1.8s"
          values="1;0.5;1"
          calcMode="linear"
          repeatCount="indefinite"
        />
      </g>
    </svg>
  );
};

export default function Loader({
  fullHeight = false,
  className = '',
  size,
  spacing,
}) {
  const style = fullHeight ? { height: '100%' } : {};
  return (
    <div
      className={`is-flex is-flex-direction-column is-align-items-center is-justify-content-center fade-in ${className}`}
      style={style}
    >
      <div className="is-flex is-align-items-center">
        <StartLoader
          width={size}
          height={size}
          pathId="loader_1"
          className={spacing ?? 'mx-3'}
        />
        <StartLoader
          width={size}
          height={size}
          pathId="loader_2"
          className={spacing ?? 'mx-3'}
        />
        <StartLoader
          width={size}
          height={size}
          pathId="loader_3"
          className={spacing ?? 'mx-3'}
        />
      </div>
    </div>
  );
}
