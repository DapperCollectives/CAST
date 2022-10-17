const Email = ({ width = '25', height = '25' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    fill="none"
    viewBox="0 0 24 25"
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M20 5.5H4a1 1 0 00-1 1v12a1 1 0 001 1h16a1 1 0 001-1v-12a1 1 0 00-1-1z"
    />
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M3 6.5l9.257 7L21 6.5"
    />
  </svg>
);

export default Email;
