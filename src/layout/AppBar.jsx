import React, { forwardRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppBar, UserMenu, MenuItemLink } from "react-admin";
import Toolbar from "@material-ui/core/Toolbar";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import SettingsIcon from "@material-ui/icons/Settings";
import { makeStyles } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import Fab from "@material-ui/core/Fab";
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";
import Brightness7Icon from "@material-ui/icons/Brightness7";
import Brightness4Icon from "@material-ui/icons/Brightness4";
import IconButton from "@material-ui/core/IconButton";
import ScrollTop from "./ScrollTop";

const useStyles = makeStyles((theme) => ({
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  title: {
    flex: 1,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    overflow: "hidden",
  },
  spacer: {
    flex: 1,
  },
  toolbar: {
    minHeight: 2,
  },
}));

const ConfigurationMenu = forwardRef((props, ref) => {
  return (
    <MenuItemLink
      ref={ref}
      to="/configuration"
      primaryText={"Configuration"}
      leftIcon={<SettingsIcon />}
      onClick={props.onClick}
      sidebarIsOpen
    />
  );
});

const CustomUserMenu = (props) => {
  return (
    <UserMenu {...props} icon={<AccountCircleIcon style={{ fontSize: 32 }} />}>
      <ConfigurationMenu />
    </UserMenu>
  );
};

const CustomAppBar = (props) => {
  const classes = useStyles();
  const theme = useSelector((state) => state.theme);
  const dispatch = useDispatch();
  const ChangeTheme = (theme) => {
    dispatch({
      type: "CHANGE_THEME",
      payload: theme === "light" ? "dark" : "light",
    });
  };
  return (
    <>
      <CssBaseline />
      <AppBar
        {...props}
        position="fixed"
        className={classes.appBar}
        elevation={1}
        userMenu={<CustomUserMenu logout={props.logout} />}
      >
        <span className={classes.spacer} />
        <IconButton aria-label="ChangeTheme" color="inherit" onClick={() => ChangeTheme(theme)}>
          {theme === "light" ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </AppBar>
      <Toolbar className={classes.toolbar} id="back-to-top-anchor" />
      <ScrollTop {...props}>
        <Fab color="secondary" size="small" aria-label="scroll back to top">
          <KeyboardArrowUpIcon />
        </Fab>
      </ScrollTop>
    </>
  );
};

export default CustomAppBar;
