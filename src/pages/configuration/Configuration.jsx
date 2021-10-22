import React, { useState } from "react";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import { Tabs, Tab, Typography } from "@material-ui/core";
import CompanyProfile from "./CompanyProfile";
import SystemPreference from "./SystemPreference";
import Users from "./Users";
import Currency from "./Currency";
import Department from "./Department";
import PaymentType from "./PaymentType";
import Dimension from "./Dimension";
import Unit from "./Unit";
import VendorCategory from "./VendorCategory";
//import Interface from "./Interface";

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
    marginRight: theme.spacing(1),
    "&:focus": {
      opacity: 1,
    },
  },
  wrapper: {
    alignItems: "start",
  },
}))((props) => <Tab disableRipple {...props} />);

const Configuration = () => {
  const classes = useStyles();

  const [value, setValue] = useState(0);

  const handleChange = (e, newValue) => {
    setValue(newValue);
  };

  return (
    <div className={classes.root}>
      <Typography variant="h6" className={classes.title}>
        Configuration
      </Typography>
      <div className={classes.container}>
        <Tabs
          orientation="vertical"
          variant="fullWidth"
          value={value}
          onChange={handleChange}
          className={classes.tabs}
        >
          <CustomTab label="Company Profile" {...a11yProps(0)} />
          <CustomTab label="System Preference" {...a11yProps(1)} />
          <CustomTab label="Users" {...a11yProps(2)} />
          <CustomTab label="Currency" {...a11yProps(3)} />
          <CustomTab label="Department" {...a11yProps(4)} />
          <CustomTab label="Payment Type" {...a11yProps(5)} />
          <CustomTab label="Dimension" {...a11yProps(6)} />
          <CustomTab label="Vendor Category" {...a11yProps(7)} />
          <CustomTab label="Unit" {...a11yProps(8)} />
          {/* <CustomTab label="Interface" {...a11yProps(9)} /> */}
        </Tabs>
        <CompanyProfile value={value} index={0}>
          Company Profile
        </CompanyProfile>
        <SystemPreference value={value} index={1}>
          System Preference
        </SystemPreference>
        <Users value={value} index={2}>
          Users
        </Users>
        <Currency value={value} index={3}>
          Currency
        </Currency>
        <Department value={value} index={4}>
          Department
        </Department>
        <PaymentType value={value} index={5}>
          PaymentType
        </PaymentType>
        <Dimension value={value} index={6}>
          Dimension
        </Dimension>
        <VendorCategory value={value} index={7}>
          Vendor Category
        </VendorCategory>
        <Unit value={value} index={8}>
          Unit
        </Unit>
        {/* <Interface value={value} index={9}>
          Interface Config
        </Interface> */}
      </div>
    </div>
  );
};

export default Configuration;
