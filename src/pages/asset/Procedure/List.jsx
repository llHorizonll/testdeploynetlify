import React, { useContext, useState } from "react";
import { withTranslate } from "react-admin";
import { GblContext } from "providers/formatter";
import { makeStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Divider from "@material-ui/core/Divider";
import { permissionName } from "utils/constants";
import { addMonths, endOfMonth } from "date-fns";
import { closePeriodAsset } from "services/assetProcedure";
import { getSettingAll } from "services/setting";
import SnackbarUtils from "utils/SnackbarUtils";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  title: {
    margin: theme.spacing(2, 0, 2),
  },
  paper: {
    padding: theme.spacing(2),

    maxWidth: 500,
  },
  menuPaper: {
    maxHeight: 200,
  },
  image: {
    width: 128,
    height: 128,
  },
  img: {
    margin: "auto",
    display: "block",
    maxWidth: "100%",
    maxHeight: "100%",
  },
  expand: {
    transform: "rotate(0deg)",
    marginLeft: "auto",
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: "rotate(180deg)",
  },
  wrapper: {
    position: "relative",
  },
  buttonProgress: {
    color: theme.palette.primary.main,
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
}));

const List = (props) => {
  const classes = useStyles();
  const { permissions, translate } = props;
  const { settingAll, UpdateSettingAll, DateToString, ToMySqlDate } = useContext(GblContext);
  const { SettingClosePeriod } = settingAll;
  const { ClosePeriodAsset } = SettingClosePeriod;
  const timer = React.useRef();

  const [loading, setLoading] = useState({
    closedPeriod: false,
  });
  const [endMonth, setEndMonth] = useState(new Date());

  React.useEffect(() => {
    return () => {
      clearTimeout(timer.current);
    };
  }, []);

  React.useEffect(() => {
    let currentAsset = addMonths(new Date(ClosePeriodAsset), 1);
    setEndMonth(endOfMonth(currentAsset));
  }, [ClosePeriodAsset]);

  const handleClickClosePeriod = async () => {
    if (!permissions.find((i) => i.Name === permissionName["Ast.Procedure.PeriodEnd"]).Update) {
      SnackbarUtils.error(translate("ra.permission.denied"));
      return;
    }
    let msg = `Do you want to close period ${DateToString(endMonth)} ?`;
    let dialog = window.confirm(msg);
    if (dialog) {
      if (!loading.closedPeriod) {
        setLoading((state) => ({
          ...state,
          closedPeriod: true,
        }));
        let closeDate = ToMySqlDate(endMonth);

        const { Code, InternalMessage, UserMessage } = await closePeriodAsset(closeDate);
        if (Code >= 0) {
          SnackbarUtils.success(UserMessage);
          const setting = await getSettingAll();
          localStorage.setItem("SettingAll", JSON.stringify(setting));
          UpdateSettingAll(setting);

          let currentAsset = addMonths(new Date(setting.SettingClosePeriod.ClosePeriodAsset), 1);
          setEndMonth(endOfMonth(currentAsset));

          timer.current = window.setTimeout(() => {
            setLoading((state) => ({
              ...state,
              closedPeriod: false,
            }));
          }, 1000);
        } else {
          SnackbarUtils.toast(InternalMessage);
        }
      }
    }
  };

  const LoadingButton = ({ text, disabled, fnc }) => {
    return (
      <div className={classes.wrapper}>
        <Button variant="contained" color="primary" disabled={disabled} onClick={fnc}>
          {text}
        </Button>
        {disabled && <CircularProgress size={24} className={classes.buttonProgress} />}
      </div>
    );
  };

  return (
    <div className={classes.root}>
      <Paper
        elevation={3}
        style={{
          paddingTop: 5,
          paddingLeft: 20,
          paddingRight: 20,
          paddingBottom: 20,
        }}
      >
        <Typography variant="h6" className={classes.title}>
          Procedure
        </Typography>

        <Box p={1} display="flex">
          <Box p={1} flexGrow={1}>
            <Typography variant="subtitle1">Close Period</Typography>
            <Typography variant="caption">Asset Close Period</Typography>
          </Box>
          <Box p={1} display="flex" alignItems="center">
            <b>Close to date &nbsp;: </b> &nbsp; {DateToString(endMonth)}
          </Box>
          <Box p={1} display="flex" alignItems="center">
            <LoadingButton text="ClosePeriod" disabled={loading.closedPeriod} fnc={handleClickClosePeriod} />
          </Box>
        </Box>
        <Divider />
      </Paper>
    </div>
  );
};

export default withTranslate(List);
