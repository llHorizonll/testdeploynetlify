import React from "react";
import { Grid, Typography } from "@material-ui/core";
import { withTranslate } from "react-admin";

const TextTopInGrid = ({ sizeSm, label, value, translate }) => {
  return (
    <Grid item xs={12} sm={sizeSm}>
      <Typography variant="body2">
        <b>{translate(`ra.field.${label}`)}</b>
      </Typography>
      <Typography variant="body2" className="wrapText">
        {value}
      </Typography>
    </Grid>
  );
};

export default withTranslate(TextTopInGrid);
