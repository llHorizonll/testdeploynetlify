/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Chip, Avatar, Card } from "@material-ui/core";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import Icon from "@material-ui/core/Icon";
import UserList from "./UserList";
import { getUserByUserName } from "services/setting";
import gbl from "utils/formatter";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    alignItems: "center",
  },
  title: {
    padding: theme.spacing(2),
  },
  tabPanel: { width: "100%", margin: "0 20px" },
  details: {
    display: "flex",
  },
  content: {
    flex: "1 0 auto",
  },
  contentEnd: {
    marginTop: "18px",
    paddingBottom: "16px !important",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
  },
  atlarge: {
    margin: theme.spacing(2),
    width: theme.spacing(12),
    height: theme.spacing(12),
  },
  large: {
    width: theme.spacing(10),
    height: theme.spacing(10),
  },
  cover: {
    width: 151,
  },
  status: {
    display: "flex",
    //alignItems: "center",
    marginTop: theme.spacing(2),
  },
  menus: {
    display: "flex",
    justifyContent: "flex-end",
    flex: 1,
    marginRight: theme.spacing(2),
  },
  playIcon: {
    height: 38,
    width: 38,
  },
  statusActive: {
    backgroundColor: "green",
    color: "white",
  },
  formControl: {
    margin: theme.spacing(0.5),
    minWidth: 120,
  },
}));

const Users = (props) => {
  const { children, value, index, ...other } = props;
  const classes = useStyles();
  const [username, setUsername] = useState();
  const [userActive, setUserActive] = useState(true);
  const [email, setEmail] = useState();
  //FIXME:set bu, setpermission
  const [bu, setBu] = useState([]);

  const fetch = async (username = localStorage.getItem("UserName")) => {
    let u = username || localStorage.getItem("UserName");
    if (u) {
      const { Data } = await getUserByUserName(u);
      if (Data) {
        setUsername(Data[0].User.UserName);
        setEmail(Data[0].User.Email);
        setUserActive(Data[0].Status.Active);
        setBu(Data.map((i) => i.Tenant.Tenant));
      }
    }
  };

  React.useEffect(() => {
    if (value === index) {
      fetch(gbl.UserName);
    }
  }, [value, index]);

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
      className={classes.tabPanel}
    >
      {value === index && (
        <Card className={classes.root}>
          <Avatar className={classes.atlarge}>
            <Icon style={{ fontSize: 62 }}>person</Icon>
          </Avatar>
          <div className={classes.details}>
            <CardContent className={classes.contentEnd}>
              <>
                <Typography variant="subtitle1" color="textSecondary">
                  Username
                </Typography>
                <Typography variant="subtitle1" color="textSecondary">
                  <b>{username}</b>
                </Typography>
              </>
            </CardContent>

            <CardContent className={classes.contentEnd}>
              {email !== "" ? (
                <>
                  <Typography variant="subtitle1" color="textSecondary">
                    Email
                  </Typography>
                  <Typography variant="subtitle1" color="textSecondary">
                    <b>{email}</b>
                  </Typography>
                </>
              ) : (
                ""
              )}
            </CardContent>
            <CardContent className={classes.contentEnd}>
              <>
                <Typography variant="subtitle1" color="textSecondary">
                  Business Unit
                </Typography>
                <Typography variant="subtitle1" color="textSecondary">
                  <b>{bu.join(", ")}</b>
                </Typography>
              </>
            </CardContent>
            <Chip value={userActive} label={"Active"} className={classes.statusActive} />
          </div>
        </Card>
      )}
      <UserList />
    </div>
  );
};

export default Users;
