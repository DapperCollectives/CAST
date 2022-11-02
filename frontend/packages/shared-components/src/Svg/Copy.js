const Copy = ({ width = '24', height = '24', bold = true }) => {
  if (!bold) {
    return (
      <svg
        width={width}
        height={height}
        viewBox="0 0 16 17"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clipPath="url(#clip0_3629_19075)">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M6.4 2.1H14.4L14.4 10.1H11.2V6.9C11.2 6.01635 10.4837 5.3 9.6 5.3H6.4L6.4 2.1ZM4.8 5.3L4.8 2.1C4.8 1.21634 5.51634 0.5 6.4 0.5H14.4C15.2837 0.5 16 1.21635 16 2.1V10.1C16 10.9837 15.2837 11.7 14.4 11.7H11.2V14.9C11.2 15.7837 10.4837 16.5 9.6 16.5L1.6 16.5C0.716344 16.5 0 15.7837 0 14.9V6.9C0 6.01634 0.716344 5.3 1.6 5.3H4.8ZM9.6 10.9V6.9H1.6V14.9L9.6 14.9V10.9Z"
            fill="#636363"
          />
        </g>
        <defs>
          <clipPath id="clip0_3629_19075">
            <rect
              width="16"
              height="16"
              fill="white"
              transform="translate(0 0.5)"
            />
          </clipPath>
        </defs>
      </svg>
    );
  }
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_2518_6960)">
        <path
          d="M14.5 14H18.25C18.6642 14 19 13.6642 19 13.25V5.75C19 5.33579 18.6642 5 18.25 5L10.75 5C10.3358 5 10 5.33579 10 5.75L10 9.5"
          stroke="black"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5.75 19L13.25 19C13.6642 19 14 18.6642 14 18.25L14 10.75C14 10.3358 13.6642 10 13.25 10L5.75 10C5.33579 10 5 10.3358 5 10.75L5 18.25C5 18.6642 5.33579 19 5.75 19Z"
          stroke="black"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_2518_6960">
          <rect
            width="16"
            height="16"
            fill="white"
            transform="translate(4 4)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};

export default Copy;
