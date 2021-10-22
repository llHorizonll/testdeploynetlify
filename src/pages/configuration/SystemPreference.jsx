import React, { useState, useEffect } from "react";
import { Box, Button, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { getSettingSystem } from "services/setting";

const useStyles = makeStyles({
  tabPanel: { width: "80%" },
  button: { textTransform: "none" },
});

const captionsText = [
  "*Define a symbol to separate the integer part from the fractional part. eg 99.00 or 99,00",
  "*Define a symbol to separate groups of thousands. eg 1,000,000  or 1.000.000",
  "*Define a currency decimal base",
  "*Define a decimal rate of the currency",
  "*Define cost per unit decimal base",
  "*Define a decimal base of the quantity",
  "*Default currency of the system",
  "*Displays format date of the system",
];

const SystemPreference = (props) => {
  const { children, value, index, ...other } = props;
  const classes = useStyles();
  const [setting, setSetting] = useState();

  useEffect(() => {
    async function fetch() {
      
      const setting = await getSettingSystem();
      setSetting(setting);
     
    }
    fetch();
  }, []);

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
        <>
          <Box p={1} display="flex" justifyContent="space-between">
            <Box p={1}>
              <Typography variant="subtitle1">Decimal Separator :</Typography>
              <Typography variant="caption">{captionsText[0]}</Typography>
            </Box>
            <Box p={1} flexShrink={1}>
              <Button variant="contained">{setting[`DecimalSeparator`]}</Button>
            </Box>
          </Box>

          <Box p={1} display="flex" justifyContent="space-between">
            <Box p={1}>
              <Typography variant="subtitle1">Thousand Separator :</Typography>
              <Typography variant="caption">{captionsText[1]}</Typography>
            </Box>
            <Box p={1} flexShrink={1}>
              <Button variant="contained">{setting[`ThousandSeparator`]}</Button>
            </Box>
          </Box>

          <Box p={1} display="flex" justifyContent="space-between">
            <Box p={1}>
              <Typography variant="subtitle1">Base Decimal :</Typography>
              <Typography variant="caption">{captionsText[2]}</Typography>
            </Box>
            <Box p={1} flexShrink={1}>
              <Button variant="contained">{setting[`CurrencyBaseDecimal`]}</Button>
            </Box>
          </Box>

          <Box p={1} display="flex" justifyContent="space-between">
            <Box p={1}>
              <Typography variant="subtitle1">Rate Decimal :</Typography>
              <Typography variant="caption">{captionsText[3]}</Typography>
            </Box>
            <Box p={1} flexShrink={1}>
              <Button variant="contained">{setting[`CurrencyRateDecimal`]}</Button>
            </Box>
          </Box>

          <Box p={1} display="flex" justifyContent="space-between">
            <Box p={1}>
              <Typography variant="subtitle1">Cost/ Unit Decimal :</Typography>
              <Typography variant="caption">{captionsText[4]}</Typography>
            </Box>
            <Box p={1} flexShrink={1}>
              <Button variant="contained">{setting[`CostPerUnitBaseDecimal`]}</Button>
            </Box>
          </Box>

          <Box p={1} display="flex" justifyContent="space-between">
            <Box p={1}>
              <Typography variant="subtitle1">Qty Decimal :</Typography>
              <Typography variant="caption">{captionsText[5]}</Typography>
            </Box>
            <Box p={1} flexShrink={1}>
              <Button variant="contained">{setting[`BaseQtyDecimal`]}</Button>
            </Box>
          </Box>

          <Box p={1} display="flex" justifyContent="space-between">
            <Box p={1}>
              <Typography variant="subtitle1">Base Currency :</Typography>
              <Typography variant="caption">{captionsText[6]}</Typography>
            </Box>
            <Box p={1} flexShrink={1}>
              <Button variant="contained">{setting[`DefaultCurrencyCode`]}</Button>
            </Box>
          </Box>

          <Box p={1} display="flex" justifyContent="space-between">
            <Box p={1}>
              <Typography variant="subtitle1">DateFormat :</Typography>
              <Typography variant="caption">{captionsText[7]}</Typography>
            </Box>
            <Box p={1} flexShrink={1}>
              <Button variant="contained" className={classes.button}>
                {setting[`DateFormat`]}
              </Button>
            </Box>
          </Box>
        </>
      )}
    </div>
  );
};

export default SystemPreference;
