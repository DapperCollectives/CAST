const Card = {
  baseStyle: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    border: '1px',
    borderColor: 'black',
  },
  variants: {
    warning: {
      alignItems: 'flex-start',
      padding: 6,
      borderRadius: '2xl',
      borderColor: 'red.500',
      backgroundColor: 'red.1000',
    },
    flowBox: {
      gap: 1,
      paddingTop: '14px',
      paddingLeft: '16px',
      display: 'flex',
      flexDirection: 'column',
      borderRadius: 'lg',
      backgroundColor: 'white',
      borderColor: 'grey.200',
      minWidth: '210px',
      height: '69px',
    },
  },
  defaultProps: {
    background: 'white',
  },
};

export default Card;
