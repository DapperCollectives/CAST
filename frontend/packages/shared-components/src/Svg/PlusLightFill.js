const PlusLightFill = ({
  fill = '#636363',
  width = '20',
  height = '20',
} = {}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="10" cy="10" r="10" fill="#F9F9F9" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10 5C10.5523 5 11 5.44772 11 6L11 14C11 14.5523 10.5523 15 10 15C9.44772 15 9 14.5523 9 14L9 6C9 5.44772 9.44772 5 10 5Z"
      fill="#636363"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5 10C5 9.44772 5.44772 9 6 9H14C14.5523 9 15 9.44772 15 10C15 10.5523 14.5523 11 14 11H6C5.44772 11 5 10.5523 5 10Z"
      fill="#636363"
    />
  </svg>
);

export default PlusLightFill;
