const Card = {
  baseStyle: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    border: '1px',
    borderColor: 'black',
  },
  variants: {
    warning: {
      padding: 6,
      borderRadius: '2xl',
      borderColor: 'red.200',
      backgroundColor: 'red.400',
    },
  },
  defaultProps: {
    background: 'white',
  },
};

export default Card;
