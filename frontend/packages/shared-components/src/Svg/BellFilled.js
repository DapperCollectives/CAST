const BellFilled = ({ height = '24', width = '24', className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    className={className}
    fill="none"
    viewBox="0 0 24 24"
  >
    <g className="has-text-yellow">
      <path
        fill="currentColor"
        d="M6 6l-1 7.5-1 1 1 2h14.5V14l-.5-3-1-5.5L13.5 3l-4 .5L6 6z"
      />
    </g>
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M13.6 2.484l4.85 2.694 1.043 5.74.507 3.04V17H4.691l-1.3-2.599 1.136-1.135L5.533 5.72l3.78-2.7 4.287-.535zM9.688 3.98l-3.221 2.3-.994 7.454-.865.865L5.31 16H19v-1.959l-.493-2.955-.957-5.264-4.15-2.306-3.712.464z"
      clipRule="evenodd"
    />
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M8.172 16.986a1 1 0 011-1h6a1 1 0 011 1v1a4 4 0 11-8 0v-1zm2 1a2 2 0 104 0h-4z"
      clipRule="evenodd"
    />
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M12.172 3.986a6 6 0 00-6 6v3.723c0 .443-.176.867-.49 1.18l-.694-.694.695.695-.51.51v.586h14V15.4l-.512-.51a1.67 1.67 0 01-.489-1.181V9.986a6 6 0 00-6-6zm-8 6a8 8 0 1116 0v3.586l.414.414a2 2 0 01.586 1.414v.586a2 2 0 01-2 2h-14a2 2 0 01-2-2v-.585a2 2 0 01.586-1.415l.64.64-.64-.64.414-.414V9.986zM17.392 1.398a1 1 0 011.4-.197 11 11 0 013.47 4.403 1 1 0 01-1.835.797 9 9 0 00-2.839-3.602 1 1 0 01-.196-1.4zM6.953 1.398a1 1 0 01-.197 1.4 9 9 0 00-2.839 3.603 1 1 0 11-1.834-.797A11 11 0 015.553 1.2a1 1 0 011.4.197z"
      clipRule="evenodd"
    />
  </svg>
);

export default BellFilled;
