const RemoveLightFill = ({
  fill = '#636363',
  width = '20',
  height = '20',
} = {}) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="10" cy="10" r="10" fill="#F9F9F9" />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M5 10C5 9.44772 5.44772 9 6 9H14C14.5523 9 15 9.44772 15 10C15 10.5523 14.5523 11 14 11H6C5.44772 11 5 10.5523 5 10Z"
      fill={fill}
    />
  </svg>
);

export default RemoveLightFill;
