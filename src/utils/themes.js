export const darkTheme = {
  palette: {
    type: "dark", // Switching the dark mode on is a single property value change.
    primary: {
      light: "#EDF2F9",
      main: "#2196f3",
      dark: "#335482",
      contrastText: "#fff",
    },
    secondary: {
      light: "#EDF2F9",
      main: "#2196f3",
      dark: "#335482",
      contrastText: "#fff",
    },
    background: {
      default: "#121212",
    },
  },
  typography: {
    htmlFontSize: 18,
  },
  shape: {
    borderRadius: 10,
  },
  overrides: {
    RaLayout: {
      content: {
        marginLeft: 0,
        width: 200,
        padding: 12,
      },
    },
    // targeting refresh button
    RaAppBar: {
      toolbar: {
        "& button": {
          "&:nth-last-child(2)": {
            display: "none",
          },
        },
      },
    },
    MuiToolbar: {
      gutters: {
        paddingLeft: "16px !important",
        paddingRight: "10px !important",
      },
    },
    MuiInputBase: {
      input: {
        padding: "3px 0 7px",
      },
    },
    MUIDataTableToolbar: {
      root: {
        display: "flex !important",
      },
      titleText: {
        textAlign: "left  !important",
      },
      actions: {
        textAlign: "right !important",
      },
    },
    MUIDataTableHeadCell: {
      sortLabelRoot: {
        height: "unset",
      },
      sortActive: {
        color: "white",
      },
      contentWrapper: {
        color: "white",
      },
      fixedHeader: {
        color: "white",
        backgroundColor: "#34558b",
        padding: "8px 12px !important",
      },
    },
    MUIDataTableFilterList: {
      root: {
        margin: "-10px 16px 10px 16px",
      },
    },
    MuiTableSortLabel: {
      icon: {
        color: "white !important",
      },
    },
    MuiTableCell: {
      sizeSmall: {
        padding: "6px 12px 6px 12px",
      },
      paddingCheckbox: {
        padding: "0 12px 0 16px !important",
      },
    },
    MuiTablePagination: {
      selectRoot: {
        paddingTop: 6,
      },
    },
    MuiFormControl: {
      marginDense: {
        marginTop: 4,
      },
    },
    MuiFilledInput: {
      root: {
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
      },
      inputMarginDense: {
        paddingTop: 10,
      },
    },
    MuiOutlinedInput: {
      root: {
        borderRadius: 4,
      },
      adornedEnd: {
        paddingRight: 0,
      },
      inputMarginDense: {
        paddingBottom: 6,
      },
    },
    MuiInputAdornment: {
      positionEnd: {
        marginLeft: 0,
      },
    },
    MuiInputLabel: {
      outlined: {
        transform: "translate(14px, 16px) scale(1)",
      },
    },
    MuiFormHelperText: {
      root: {
        whiteSpace: "nowrap",
      },
      contained: {
        marginLeft: 0,
      },
    },
    MuiButton: {
      root: {
        fontSize: "0.7777777777777778rem !important",
      },
    },
    MuiSvgIcon: {
      root: {
        fontSize: "1.3333333333333333rem !important",
      },
      fontSizeSmall: {
        fontSize: "1.1111111111111112rem !important",
      },
    },
  },
};

export const lightTheme = {
  palette: {
    type: "light",
    primary: {
      light: "#4f83cc",
      main: "#34558b",
      dark: "#335482",
      contrastText: "#fff",
    },
    secondary: {
      light: "#EDF2F9",
      main: "#2196f3",
      dark: "#335482",
      contrastText: "#fff",
    },
    background: {
      default: "#fcfcfe",
    },
  },
  typography: {
    htmlFontSize: 18,
  },
  shape: {
    borderRadius: 10,
  },
  overrides: {
    RaLayout: {
      content: {
        marginLeft: 0,
        width: 200,
        padding: 12,
      },
    },
    // targeting refresh button
    RaAppBar: {
      toolbar: {
        "& button": {
          "&:nth-last-child(2)": {
            display: "none",
          },
        },
      },
    },
    MuiToolbar: {
      gutters: {
        paddingLeft: "16px !important",
        paddingRight: "10px !important",
      },
    },
    MuiInputBase: {
      input: {
        padding: "3px 0 7px",
      },
    },
    MUIDataTableHeadCell: {
      sortLabelRoot: {
        height: "unset",
      },
      sortAction: {
        color: "white",
      },
      sortActive: {
        color: "white",
      },
      contentWrapper: {
        color: "white",
      },
      fixedHeader: {
        color: "white",
        backgroundColor: "#34558b",
        padding: "8px 12px !important",
      },
    },
    MUIDataTableFilterList: {
      root: {
        margin: "-10px 16px 10px 16px",
      },
    },
    MUIDataTableToolbar: {
      root: {
        display: "flex !important",
      },
      titleText: {
        textAlign: "left  !important",
      },
      actions: {
        textAlign: "right !important",
      },
    },
    MuiTableSortLabel: {
      icon: {
        color: "white !important",
      },
    },
    MuiTablePagination: {
      selectRoot: {
        paddingTop: 6,
      },
    },
    MuiTableCell: {
      sizeSmall: {
        padding: "6px 12px 6px 12px",
      },
      paddingCheckbox: {
        padding: "0 12px 0 16px !important",
      },
    },
    MuiFormControl: {
      marginDense: {
        marginTop: 4,
      },
    },
    MuiFilledInput: {
      root: {
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
      },
      inputMarginDense: {
        paddingTop: 10,
      },
    },
    MuiOutlinedInput: {
      root: {
        borderRadius: 4,
      },
      adornedEnd: {
        paddingRight: 0,
      },
      inputMarginDense: {
        paddingBottom: 6,
      },
    },
    MuiInputAdornment: {
      positionEnd: {
        marginLeft: 0,
      },
    },
    MuiInputLabel: {
      outlined: {
        transform: "translate(14px, 16px) scale(1)",
      },
    },
    MuiFormHelperText: {
      root: {
        whiteSpace: "nowrap",
      },
      contained: {
        marginLeft: 0,
      },
    },
    MuiButton: {
      root: {
        fontSize: "0.7777777777777778rem !important",
      },
    },
    MuiSvgIcon: {
      root: {
        fontSize: "1.3333333333333333rem !important",
      },
      fontSizeSmall: {
        fontSize: "1.1111111111111112rem !important",
      },
    },
  },
};
