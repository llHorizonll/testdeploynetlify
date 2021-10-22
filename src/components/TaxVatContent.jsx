import React, { useContext } from "react";
import { GblContext } from "providers/formatter";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Chip from "@material-ui/core/Chip";

const useStyles = makeStyles((theme) => ({
  root: {
    minWidth: 200,
    //backgroundColor: theme.palette.type === "dark" ? "inherit" : "grey",
  },
  content: {
    padding: theme.spacing(0, 2),
  },
  chipAdd: {
    margin: "0 10px",
    backgroundColor: theme.palette.primary.main,
    color: "white",
  },
  chipInclude: {
    margin: "0 10px",
    backgroundColor: "green",
    color: "white",
  },
  wrapTxt: {
    whiteSpace: "pre-wrap",
  },
}));

const SwitchTaxType = ({ type }) => {
  const classes = useStyles();
  switch (type) {
    case "Add":
      return (
        <>
          <Chip label={type} classes={{ root: classes.chipAdd }} size="small" />
        </>
      );
    case "Include":
      return (
        <>
          <Chip label={type} classes={{ root: classes.chipInclude }} size="small" />
        </>
      );
    default:
      return (
        <>
          <Chip label={type} size="small" />
        </>
      );
  }
};

const TaxVatContent = ({ data, module }) => {
  const classes = useStyles();
  const { DateToString, NumberFormat } = useContext(GblContext);
  return (
    <React.Fragment>
      <Box className={classes.content}>
        {module === "AR" ? (
          <>
            <Typography variant="body2">
              <b>Group</b>
            </Typography>
            <Typography variant="body2" component="p" gutterBottom>
              {data.GroupNo}
            </Typography>
            <Typography variant="body2">
              <b>Date</b>
            </Typography>
            <Typography variant="body2" component="p" gutterBottom>
              {DateToString(data.InvdDate)}
            </Typography>
          </>
        ) : (
          ""
        )}
        <Typography variant="body2">
          <b>Dept.</b>
        </Typography>
        <Typography variant="body2" component="p" className={classes.wrapTxt} gutterBottom>
          {data.DeptCode} : {data.DeptDesc}
        </Typography>
        <Typography variant="body2">
          <b>Dr Acc </b>
        </Typography>
        <Typography variant="body2" component="p" className={classes.wrapTxt} gutterBottom>
          {data.DrAcc} : {data.DrAccDesc}
        </Typography>
        <Typography variant="body2">
          <b>Cr Acc</b>
        </Typography>
        <Typography variant="body2" component="p" className={classes.wrapTxt} gutterBottom>
          {data.CrAcc} : {data.CrAccDesc}
        </Typography>
        {data.TaxType1 !== "None" ? (
          <React.Fragment>
            <Typography variant="body2" component="b">
              <b>Tax Type 1</b>
              <SwitchTaxType type={data.TaxType1} />
              {data.TaxOverwrite1 === "O" ? <Chip label="Overwrite" color="primary" size="small" /> : ""}
            </Typography>
            <br />
            <Typography variant="body2" component="p" gutterBottom>
              <b>Tax Rate</b> {NumberFormat(data.TaxRate1)}
            </Typography>
            <Typography variant="body2" component="p" className={classes.wrapTxt}>
              {module === "AP" ? <b>Tax Dr Acc 1</b> : <b>Tax Cr Acc 1</b>}
            </Typography>
            <Typography variant="body2" component="p" className={classes.wrapTxt} gutterBottom>
              {data.TaxAcc1} : {data.TaxAcc1Desc}
            </Typography>
          </React.Fragment>
        ) : (
          ""
        )}
        {data.TaxType2 !== "None" ? (
          <React.Fragment>
            <Typography variant="body2" component="b">
              <b>Tax Type 2</b>
              <SwitchTaxType type={data.TaxType2} />
              {data.TaxOverwrite2 === "O" ? <Chip label="Overwrite" color="primary" size="small" /> : ""}
            </Typography>
            <br />
            <Typography variant="body2" component="p" gutterBottom>
              <b>Tax Rate</b> {NumberFormat(data.TaxRate2)}
            </Typography>
            <Typography variant="body2" component="p" className={classes.wrapTxt}>
              {module === "AP" ? <b>Tax Dr Acc 2</b> : <b>Tax Cr Acc 2</b>}
            </Typography>
            <Typography variant="body2" component="p" className={classes.wrapTxt} gutterBottom>
              {data.TaxAcc2} : {data.TaxAcc2Desc}
            </Typography>
          </React.Fragment>
        ) : (
          ""
        )}
      </Box>
    </React.Fragment>
  );
};

export default TaxVatContent;
