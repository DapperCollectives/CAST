const Button = {
  baseStyle: {
    // adds rounded border
    borderRadius: '3xl',
    _hover: {
      textDecoration: 'none',
    },
  },
  sizes: {
    lg: {
      height: 11, // 2.75rem => 44px
    },
    md: {
      height: 10, // 2.5rem => 40px
    },
    sm: {
      height: 8, //2.125 => 34px
    },
  },
  defaultProps: {},
};

export default Button;
