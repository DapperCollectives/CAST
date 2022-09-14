const RemoveOutline = ({
  fill = 'black',
  width = '20',
  height = '20',
} = {}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 20 20"
    fill={fill}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10ZM10 0C4.47715 0 0 4.47715 0 10C0 15.5228 4.47715 20 10 20C15.5228 20 20 15.5228 20 10C20 4.47715 15.5228 0 10 0ZM6 9C5.44772 9 5 9.44771 5 10C5 10.5523 5.44772 11 6 11H14C14.5523 11 15 10.5523 15 10C15 9.44771 14.5523 9 14 9H6Z"
      fill={fill}
    />
  </svg>
);

export default RemoveOutline;
