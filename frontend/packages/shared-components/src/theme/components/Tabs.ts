const Tabs = {
  variants: {
    profile: {
      tab: {
        _first: {
          marginStart: 0,
        },
        _selected: {
          borderBottom: '2px solid',
          borderColor: 'black',
          fontWeight: 'bold',
          color: 'black',
        },
        _focus: {
          'box-shadow': 'none',
        },
        marginLeft: 3,
        marginRight: 3,
        paddingLeft: 0,
        paddingRight: 0,
      },
      tablist: {
        color: 'grey.500',
        borderBottom: '1px solid',
        borderColor: 'inherit',
        fontSize: 'lg',
        lineHeight: '23px',
      },
      tabpanel: {
        marginTop: 10,
        padding: 0,
      },
    },
  },
};

export default Tabs;
