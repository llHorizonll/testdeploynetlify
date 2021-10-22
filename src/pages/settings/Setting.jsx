import React, { useState } from "react";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import { Tabs, Tab, Typography } from "@material-ui/core";
import Dashboard from "./Dashboard";
import AccountPayable from "./AccountPayable";
import GeneralLedger from "./GeneralLedger";
import Asset from "./Asset";
import AccountReceivable from "./AccountReceivable";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  title: {
    margin: theme.spacing(2, 1, 2),
  },
  container: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
    display: "flex",
  },
  tabs: {
    borderRight: `1px solid ${theme.palette.divider}`,
  },
}));

function a11yProps(index) {
  return {
    id: `vertical-tab-${index}`,
    "aria-controls": `vertical-tabpanel-${index}`,
  };
}

const CustomTab = withStyles((theme) => ({
  root: {
    textTransform: "none",
    //fontWeight: theme.typography.fontWeightRegular,
    //fontSize: theme.typography.pxToRem(15),
    marginRight: theme.spacing(2),
    "&:focus": {
      opacity: 1,
    },
  },

  wrapper: {
    alignItems: "start",
  },
}))((props) => <Tab disableRipple {...props} />);

const Settings = () => {
  const classes = useStyles();
  const [value, setValue] = useState(0);

  const handleChange = (e, newValue) => {
    setValue(newValue);
  };
  
  //FIXME: set permission in setting
  return (
    <div className={classes.root}>
      <Typography variant="h6" className={classes.title}>
        Setting
      </Typography>
      <div className={classes.container}>
        <Tabs orientation="vertical" variant="fullWidth" value={value} onChange={handleChange} className={classes.tabs}>
          <CustomTab label="Dashboard" {...a11yProps(0)} />
          <CustomTab label="Account Payable" {...a11yProps(1)} />
          <CustomTab label="General Ledger" {...a11yProps(2)} />
          <CustomTab label="Asset" {...a11yProps(3)} />
          <CustomTab label="Account Receivable" {...a11yProps(4)} />
        </Tabs>
        <Dashboard value={value} index={0}>
          Dashboard
        </Dashboard>
        <AccountPayable value={value} index={1}>
          Account Payable
        </AccountPayable>
        <GeneralLedger value={value} index={2}>
          General Ledger
        </GeneralLedger>
        <Asset value={value} index={3}>
          Asset
        </Asset>
        <AccountReceivable value={value} index={4}>
          Account Receivable
        </AccountReceivable>
      </div>
    </div>
  );
};

export default Settings;
