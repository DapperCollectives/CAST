const ErrorOutline = ({
  width = '24',
  height = '24',
  color = 'black',
} = {}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="12"
      cy="12"
      r="11"
      fill={`${color === 'black' ? 'white' : 'none'}`}
      stroke={color}
      strokeWidth="2"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M11.2949 16.2352C11.2949 15.8453 11.611 15.5293 12.0008 15.5293H12.142C12.5318 15.5293 12.8479 15.8453 12.8479 16.2352V16.3764C12.8479 16.7662 12.5318 17.0822 12.142 17.0822H12.0008C11.611 17.0822 11.2949 16.7662 11.2949 16.3764V16.2352Z"
      fill={color}
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12.0711 5.64746C12.461 5.64746 12.777 5.9635 12.777 6.35334V12.0004C12.777 12.3903 12.461 12.7063 12.0711 12.7063C11.6813 12.7063 11.3652 12.3903 11.3652 12.0004V6.35334C11.3652 5.9635 11.6813 5.64746 12.0711 5.64746Z"
      fill={color}
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default ErrorOutline;
