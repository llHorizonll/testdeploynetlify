import React from "react";
import clsx from "clsx";
import { useTranslate } from "react-admin";
import { Grid, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  footer: {
    position: "sticky",
    bottom: 0,
    zIndex: 100,
    padding: theme.spacing(1, 2),
    background: "white",
    border: "1px solid rgba(0, 0, 0, 0.23)",
    borderRadius: 8,
  },
  footerNoBorder: {
    position: "sticky",
    bottom: 0,
    zIndex: 100,
    background: "white",
  },
  textCancel: {
    color: theme.palette.type === "dark" ? theme.palette.grey[800] : "inherit",
    border: `1px solid rgba(0, 0, 0, 0.23)`,
  },
}));

export default ({ SaveFnc, CancelFnc, noBorder }) => {
  const classes = useStyles();
  const translate = useTranslate();
  return (
    <div
      className={clsx(classes.drawer, {
        [classes.footer]: !noBorder,
        [classes.footerNoBorder]: noBorder,
      })}
    >
      <Grid container justifyContent="flex-end" spacing={2}>
        <Grid item>
          <Button variant="contained" color="primary" type="submit" onClick={SaveFnc}>
            {translate("ra.action.save")}
          </Button>
        </Grid>
        <Grid item>
          <Button variant="outlined" className={classes.textCancel} onClick={CancelFnc}>
            {translate("ra.action.cancel")}
          </Button>
        </Grid>
      </Grid>
    </div>
  );
};
