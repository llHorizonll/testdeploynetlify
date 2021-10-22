import React, { useContext } from "react";
import { GblContext } from "providers/formatter";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";

const useStyles = makeStyles((theme) => ({
  contentRight: {
    textAlign: "right",
    marginRight: 10,
  },
}));

const SummaryRightSide = ({ data }) => {
  const classes = useStyles();
  const { NumberFormat } = useContext(GblContext);
  return (
    <React.Fragment>
      <Grid container justifyContent="center" alignItems="center" spacing={1} style={{ margin: "0px -8px 10px -8px" }}>
        <Grid item xs={6}>
          <Typography variant="body2" align="right">
            <b>Net Amount :</b>
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2" className={classes.contentRight}>
            {NumberFormat(data.NetBaseAmt)}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2" align="right">
            <b>Tax Amount 1:</b>
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2" className={classes.contentRight}>
            {NumberFormat(data.TaxBaseAmt1)}
          </Typography>
        </Grid>
        {data.TaxType2 !== "None" ? (
          <React.Fragment>
            {" "}
            <Grid item xs={6}>
              <Typography variant="body2" align="right">
                <b>Tax Amount 2:</b>
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" className={classes.contentRight}>
                {NumberFormat(data.TaxBaseAmt2)}
              </Typography>
            </Grid>
          </React.Fragment>
        ) : (
          ""
        )}
        <Grid item xs={6}>
          <Typography variant="body2" align="right">
            <b>Total Amount :</b>
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2" className={classes.contentRight}>
            {NumberFormat(data.NetBaseAmt + data.TaxBaseAmt1 + data.TaxBaseAmt2)}
          </Typography>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

export default SummaryRightSide;
