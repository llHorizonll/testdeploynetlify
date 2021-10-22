import React from "react";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import List from "@material-ui/core/List";
import MenuItem from "@material-ui/core/MenuItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Typography from "@material-ui/core/Typography";
import Collapse from "@material-ui/core/Collapse";
import Tooltip from "@material-ui/core/Tooltip";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslate } from "react-admin";

const useStyles = makeStyles((theme) => ({
  icon: { minWidth: theme.spacing(5) },
  iconRight: { minWidth: theme.spacing(1) },
  sidebarIsOpen: {
    "& a": {
      paddingLeft: theme.spacing(4),
      transition: "padding-left 195ms cubic-bezier(0.4, 0, 0.6, 1) 0ms",
    },
  },
  sidebarIsClosed: {
    "& a": {
      paddingLeft: theme.spacing(2),
      transition: "padding-left 195ms cubic-bezier(0.4, 0, 0.6, 1) 0ms",
    },
  },
}));

const SubMenu = ({
  handleToggle,
  sidebarIsOpen,
  isOpen,
  name,
  icon,
  children,
  dense,
}) => {
  const translate = useTranslate();
  const classes = useStyles();

  const header = (
    <MenuItem dense={dense} button onClick={handleToggle}>
      <ListItemIcon className={classes.icon}>{icon}</ListItemIcon>
      <ListItemText>
        <Typography variant="inherit" color="textSecondary">
          {translate(name)}
        </Typography>
      </ListItemText>
      <ListItemIcon className={classes.iconRight}>
        {isOpen ? <ExpandLess /> : <ExpandMore />}
      </ListItemIcon>
    </MenuItem>
  );

  return (
    <>
      {sidebarIsOpen || isOpen ? (
        header
      ) : (
        <Tooltip title={translate(name)} placement="right">
          {header}
        </Tooltip>
      )}
      <Collapse in={isOpen} timeout="auto" unmountOnExit>
        <List
          dense={dense}
          component="div"
          disablePadding
          className={
            sidebarIsOpen ? classes.sidebarIsOpen : classes.sidebarIsClosed
          }
        >
          {children}
        </List>
      </Collapse>
    </>
  );
};

export default SubMenu;
