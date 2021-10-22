import React, { useContext, useState } from "react";
import { withTranslate } from "react-admin";
import { GblContext } from "providers/formatter";
import { makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import CircularProgress from "@material-ui/core/CircularProgress";
import { Paper, Typography, Box, Button, Divider } from "@material-ui/core";
import Collapse from "@material-ui/core/Collapse";
import IconButton from "@material-ui/core/IconButton";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { permissionName } from "utils/constants";
import { addMonths, endOfMonth } from "date-fns";
import { closePeriodAr } from "services/arProcedure";
import { getSettingAll } from "services/setting";
import DialogARContractList from "./DialogARContractList";
import CardPMSHotelogix from "./CardPMSHotelogix";
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
  const { ClosePeriodAr } = settingAll.SettingClosePeriod;
  const timer = React.useRef();

  const [loading, setLoading] = useState({
    closedPeriod: false,
    rec: false,
  });
  const [endMonth, setEndMonth] = useState(new Date());
  const [openDialog, setOpenDialog] = useState(false);
  const [expandedPMS, setExpandedPMS] = useState(false);
  React.useEffect(() => {
    return () => {
      clearTimeout(timer.current);
    };
  }, []);

  React.useEffect(() => {
    let currentAp = addMonths(new Date(ClosePeriodAr), 1);
    setEndMonth(endOfMonth(currentAp));
  }, [ClosePeriodAr]);

  const handleClickClosePeriod = async () => {
    if (!permissions.find((i) => i.Name === permissionName["AR.Procedure.PeriodEnd"]).Update) {
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
        const { Code, InternalMessage, UserMessage } = await closePeriodAr(closeDate);
        if (Code >= 0) {
          SnackbarUtils.success(UserMessage);
          const setting = await getSettingAll();
          localStorage.setItem("SettingAll", JSON.stringify(setting));
          UpdateSettingAll(setting);
          let currentAp = addMonths(new Date(setting.SettingClosePeriod.ClosePeriodAp), 1);
          setEndMonth(endOfMonth(currentAp));

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
            <Typography variant="subtitle1">Apply Contract</Typography>
            <Typography variant="caption">Apply Contract</Typography>
          </Box>
          <Divider />
          <Box p={1}>
            <Button
              variant="outlined"
              onClick={() => {
                if (!permissions.find((i) => i.Name === permissionName["AR.Procedure.ApplyContract"]).Update) {
                  SnackbarUtils.error(translate("ra.permission.denied"));
                  return;
                }
                setOpenDialog(true);
              }}
            >
              Apply Contract
            </Button>
          </Box>
        </Box>
        <Divider />

        <Box p={1} onClick={() => setExpandedPMS(!expandedPMS)}>
          <Typography variant="h6" className={classes.title2}>
            Posting from PMS
            <IconButton
              className={clsx(classes.expand, {
                [classes.expandOpen]: expandedPMS,
              })}
              aria-expanded={expandedPMS}
              aria-label="show more"
            >
              <ExpandMoreIcon />
            </IconButton>
          </Typography>
        </Box>
        <Collapse in={expandedPMS} timeout="auto" unmountOnExit>
          {expandedPMS && <CardPMSHotelogix />}
        </Collapse>
        <Divider />

        <Box p={1} display="flex">
          <Box p={1} flexGrow={1}>
            <Typography variant="subtitle1">Close Period</Typography>
            <Typography variant="caption">Account Receivable Close Period</Typography>
          </Box>
          <Box p={1} display="flex" alignItems="center">
            <b>Close to date &nbsp;: </b> &nbsp; {DateToString(endMonth)}
          </Box>
          <Box p={1} display="flex" alignItems="center">
            <LoadingButton text="Close Period" disabled={loading.closedPeriod} fnc={handleClickClosePeriod} />
          </Box>
        </Box>
      </Paper>
      {openDialog && <DialogARContractList open={openDialog} onClose={() => setOpenDialog(false)} />}
    </div>
  );
};

export default withTranslate(List);
