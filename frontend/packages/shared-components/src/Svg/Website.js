const Website = ({ width = '30', height = '15', className = '' } = {}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M2.5 5L17.5 5"
      stroke="black"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3.33333 16.6668L16.6667 16.6668C17.1269 16.6668 17.5 16.2937 17.5 15.8335L17.5 4.16683C17.5 3.70659 17.1269 3.3335 16.6667 3.3335L3.33333 3.3335C2.8731 3.3335 2.5 3.70659 2.5 4.16683L2.5 15.8335C2.5 16.2937 2.8731 16.6668 3.33333 16.6668Z"
      stroke="black"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default Website;
