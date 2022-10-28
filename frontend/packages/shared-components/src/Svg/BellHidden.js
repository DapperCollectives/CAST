const BellHidden = ({ height = '20', width = '19', ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    fill="none"
    viewBox="0 0 19 20"
    {...props}
  >
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M1.293.293a1 1 0 011.414 0l13.99 13.99a.915.915 0 01.02.02l1.99 1.99a1 1 0 01-1.414 1.414L15.586 16H13a4 4 0 11-8 0H2a2 2 0 01-1.992-1.826l-.006-.117A1.001 1.001 0 010 14v-.586A2 2 0 01.586 12L1 11.586V8a7.97 7.97 0 011.68-4.906L1.293 1.707a1 1 0 010-1.414zm2.816 4.23L13.586 14H2.002L2 13.97v-.557l.51-.51A1.67 1.67 0 003 11.721V8c0-1.297.41-2.496 1.11-3.477zM9 18a2 2 0 01-2-2h4a2 2 0 01-2 2zM9 0h-.017l-.24.004h-.017c-.92.032-1.8.218-2.617.535a1 1 0 00.723 1.864 5.972 5.972 0 011.953-.4L9.008 2A6 6 0 0115 8v2.999a1 1 0 002 0V8a8 8 0 00-8-8z"
      clipRule="evenodd"
    />
  </svg>
);

export default BellHidden;
