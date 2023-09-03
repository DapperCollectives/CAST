const Flow = ({ width = '80', height = '30', className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 146.4 146.4"
    width={width}
    height={height}
    className={className}
  >
    <g>
      <circle style={{ fill: '#00ef8b' }} cx="73.2" cy="73.2" r="73.2" />
      <rect
        style={{ fill: '#fff' }}
        x="84.7"
        y="61.8"
        width="20.7"
        height="20.7"
      />
      <path
        style={{ fill: '#fff' }}
        d="m64,90.2c0,4.3-3.5,7.8-7.8,7.8s-7.8-3.5-7.8-7.8,3.5-7.8,7.8-7.8h7.8v-20.6h-7.7c-15.7,0-28.4,12.7-28.4,28.4s12.7,28.4,28.4,28.4,28.4-12.7,28.4-28.4v-7.8h-20.7v7.8Z"
      />
      <path
        style={{ fill: '#fff' }}
        d="m92.4,51.4h23.3v-20.6h-23.3c-15.7,0-28.4,12.7-28.4,28.4v2.6h20.7v-2.6c0-4.3,3.5-7.8,7.7-7.8Z"
      />
      <polygon
        style={{ fill: '#16ff99' }}
        points="64 82.4 84.7 82.4 84.7 82.4 84.7 61.8 84.7 61.8 64 61.8 64 82.4"
      />
    </g>
  </svg>
);

export default Flow;
