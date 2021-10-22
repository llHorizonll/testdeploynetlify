import React, { useContext, useState } from "react";
import { withTranslate } from "react-admin";
import { GblContext } from "providers/formatter";
import { makeStyles } from "@material-ui/core/styles";
import LaunchIcon from "@material-ui/icons/Launch";
import CircularProgress from "@material-ui/core/CircularProgress";
import { Button, Paper, Typography, Box, Divider, Select, MenuItem, Switch } from "@material-ui/core";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import DatePickerFormat from "components/DatePickerFormat";
import DialogChequeReconcil from "./DialogChequeReconcil";
import DialogEditVATReconcil from "./DialogEditVATReconcil";
import DialogVATReconcil from "./DialogVATReconcil";
import DialogWhtReconcil from "./DialogWhtReconcil";
import { permissionName } from "utils/constants";
import { format, addDays, addMonths, startOfMonth, endOfMonth } from "date-fns";
import { closePeriodAp, postReceiving } from "services/apProcedure";
import { getSettingAll } from "services/setting";
import { getListApPeriod } from "services/callStoreProcedure";
import SnackbarUtils from "utils/SnackbarUtils";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  title: {
    margin: theme.spacing(1, 0, 1),
  },
  title2: {
    fontSize: 14,
    margin: theme.spacing(1, 0, 1),
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
  lucnchIconStyle: {
    marginLeft: 8,
    verticalAlign: "middle",
    cursor: "pointer",
  },
}));

const List = (props) => {
  const classes = useStyles();
  const { permissions, translate } = props;
  const { settingAll, UpdateSettingAll, DateToString, ToMySqlDate } = useContext(GblContext);
  const { SettingClosePeriod, SettingAp } = settingAll;
  const { ClosePeriodAp } = SettingClosePeriod;
  const timer = React.useRef();
  const [loading, setLoading] = useState({ closedPeriod: false, rec: false });
  const [endMonth, setEndMonth] = useState(new Date());
  const [taxPeriodList, setTaxPeriodList] = useState();
  const [filterDate, setFilterDate] = useState({
    from: startOfMonth(addDays(new Date(ClosePeriodAp), 1)),
    to: endOfMonth(addDays(new Date(ClosePeriodAp), 1)),
  });
  const [openDialog, setOpenDialog] = useState({
    dialogCheuqe: false,
    dialogVat: false,
    dialogEditVat: false,
    dialogWht: false,
  });
  const [useDateFromBank, setUseDateFromBank] = useState(true);
  const [clearingDate, setClearingDate] = useState(new Date());
  const [defaultTaxPeriod, setDefaultTaxPeriod] = useState(format(new Date(), "MM/yyyy"));

  React.useEffect(() => {
    return () => {
      clearTimeout(timer.current);
    };
  }, []);

  const fetchTaxPeriodLookup = async () => {
    var arr = await getListApPeriod();
    var periodList = arr.map((item) => format(new Date(item.PeriodDate), "MM/yyyy"));
    if (periodList.length > 0) {
      setTaxPeriodList(periodList);
    }
  };

  React.useEffect(() => {
    let currentAp = addMonths(new Date(ClosePeriodAp), 1);
    setEndMonth(endOfMonth(currentAp));
    fetchTaxPeriodLookup();
  }, [ClosePeriodAp]);

  const handleClickClosePeriod = async () => {
    if (!permissions.find((i) => i.Name === permissionName["AP.Procedure.PeriodEnd"]).Update) {
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
        const { Code, InternalMessage, UserMessage } = await closePeriodAp(closeDate);
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

  const handleClickPost = async (name) => {
    if (!permissions.find((i) => i.Name === permissionName["AP.Post.Receiving"]).Update) {
      SnackbarUtils.error(translate("ra.permission.denied"));
      return;
    }
    setLoading((state) => ({
      ...state,
      [name]: true,
    }));
    let param = {
      FromDate: filterDate.from,
      ToDate: filterDate.to,
    };
    const { Code, InternalMessage, UserMessage } = await postReceiving(param);
    if (Code === 0) {
      SnackbarUtils.success(UserMessage);
    } else {
      SnackbarUtils.toast(InternalMessage);
    }
    timer.current = window.setTimeout(() => {
      setLoading((state) => ({
        ...state,
        [name]: false,
      }));
    }, 1000);
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

        <Box display="flex">
          <Box p={1} flexGrow={1}>
            <Typography variant="subtitle1">Posting from Receiving</Typography>
            <Typography variant="caption">Posting from Receiving</Typography>
          </Box>
          <Box p={1}>
            <DatePickerFormat
              label="From"
              value={filterDate.from}
              onChange={(e) => {
                setFilterDate((state) => ({
                  ...state,
                  from: e,
                }));
              }}
              style={{ width: 160, margin: "0 10px" }}
            />
            <DatePickerFormat
              label="to"
              value={filterDate.to}
              onChange={(e) => {
                setFilterDate((state) => ({
                  ...state,
                  to: e,
                }));
              }}
              style={{ width: 160, margin: "0 10px" }}
            />
          </Box>
          <Divider />
          <Box p={1}>
            <LoadingButton text="Post" disabled={loading.rec} fnc={() => handleClickPost("rec")} />
          </Box>
        </Box>
        <Divider />

        <Typography variant="h6" className={classes.title}>
          Cheque Reconciliation
          <span className={classes.lucnchIconStyle}>
            <LaunchIcon
              onClick={() => {
                if (!permissions.find((i) => i.Name === permissionName["AP.Procedure.ChequeReconciliation"]).View) {
                  SnackbarUtils.error(translate("ra.permission.denied"));
                  return;
                }
                setOpenDialog((state) => ({
                  ...state,
                  dialogCheuqe: true,
                }));
              }}
            />
          </span>
        </Typography>
        {openDialog.dialogCheuqe && (
          <DialogChequeReconcil
            useDateFromBank={useDateFromBank}
            defaultClearingDate={clearingDate}
            open={openDialog.dialogCheuqe}
            onClose={() =>
              setOpenDialog((state) => ({
                ...state,
                dialogCheuqe: false,
              }))
            }
          />
        )}

        <Box display="flex">
          <Box p={1} flexGrow={1}>
            <Typography variant="subtitle1">Default clearing date</Typography>
            <Typography variant="caption">Set default clearing date</Typography>
          </Box>
          <Box p={1}>
            <DatePickerFormat
              label="Date"
              value={clearingDate}
              onChange={(e) => {
                setClearingDate(e);
              }}
              style={{ width: 160 }}
            />
          </Box>
        </Box>
        <Divider />
        <Box p={1} display="flex" justifyContent="space-between">
          <Box flexGrow={1}>
            <Typography variant="subtitle1">Set clearing date by bank statement file</Typography>
            <Typography variant="caption">Use date in bank statement</Typography>
          </Box>
          <Box>
            <FormControlLabel
              value={useDateFromBank}
              control={
                <Switch
                  checked={useDateFromBank}
                  onChange={(e, newValue) => setUseDateFromBank(newValue)}
                  label={useDateFromBank ? "Active" : "In-Active"}
                  //disabled={true}
                />
              }
              label={useDateFromBank ? "Active" : "In-Active"}
              labelPlacement="start"
              color="primary"
            />
          </Box>
        </Box>
        <Divider />
        {SettingAp.EnableThaiTaxReconcile && (
          <>
            <Typography variant="h6" className={classes.title}>
              Thai Tax Reconciliation
            </Typography>
            <Typography variant="h6" className={classes.title2}>
              Reconciliation
              <span className={classes.lucnchIconStyle}>
                <LaunchIcon
                  onClick={() => {
                    if (!permissions.find((i) => i.Name === permissionName["AP.Procedure.VatReconciliation"]).View) {
                      SnackbarUtils.error(translate("ra.permission.denied"));
                      return;
                    }
                    setOpenDialog((state) => ({
                      ...state,
                      dialogVat: true,
                    }));
                  }}
                />
              </span>
            </Typography>
            {openDialog.dialogVat && (
              <DialogVATReconcil
                taxPeriodList={taxPeriodList}
                defaultTaxPeriod={defaultTaxPeriod}
                open={openDialog.dialogVat}
                onClose={() =>
                  setOpenDialog((state) => ({
                    ...state,
                    dialogVat: false,
                  }))
                }
              />
            )}
            <Box display="flex">
              <Box p={1} flexGrow={1}>
                <Typography variant="subtitle1">Default tax period</Typography>
                <Typography variant="caption">Set default tax period in Reconciliation</Typography>
              </Box>
              <Box p={1}>
                {taxPeriodList ? (
                  <FormControl variant="outlined" fullWidth>
                    <InputLabel id="label">Period</InputLabel>
                    <Select
                      labelId="label"
                      variant="outlined"
                      margin="dense"
                      label="Period"
                      style={{ width: 160, margin: "4px 0" }}
                      value={defaultTaxPeriod}
                      onChange={(e) => {
                        setDefaultTaxPeriod(e.target.value);
                      }}
                    >
                      {taxPeriodList
                        ? taxPeriodList.map((item, idx) => (
                            <MenuItem key={idx} value={item}>
                              {item}
                            </MenuItem>
                          ))
                        : ""}
                    </Select>
                  </FormControl>
                ) : (
                  ""
                )}
              </Box>
            </Box>
            <Divider />

            <Typography variant="h6" className={classes.title2}>
              Edit VAT Reconciliation
              <span className={classes.lucnchIconStyle}>
                <LaunchIcon
                  onClick={() => {
                    if (
                      !permissions.find((i) => i.Name === permissionName["AP.Procedure.EditVatReconciliation"]).View
                    ) {
                      SnackbarUtils.error(translate("ra.permission.denied"));
                      return;
                    }
                    setOpenDialog((state) => ({
                      ...state,
                      dialogEditVat: true,
                    }));
                  }}
                />
              </span>
            </Typography>
            {openDialog.dialogEditVat && (
              <DialogEditVATReconcil
                taxPeriodList={taxPeriodList}
                open={openDialog.dialogEditVat}
                onClose={() =>
                  setOpenDialog((state) => ({
                    ...state,
                    dialogEditVat: false,
                  }))
                }
              />
            )}
            <Divider />

            <Typography variant="h6" className={classes.title2}>
              Withholding Tax Reconciliation
              <span className={classes.lucnchIconStyle}>
                <LaunchIcon
                  onClick={() => {
                    if (!permissions.find((i) => i.Name === permissionName["AP.Procedure.WhtReconciliation"]).View) {
                      SnackbarUtils.error(translate("ra.permission.denied"));
                      return;
                    }
                    setOpenDialog((state) => ({
                      ...state,
                      dialogWht: true,
                    }));
                  }}
                />
              </span>
            </Typography>
            {openDialog.dialogWht && (
              <DialogWhtReconcil
                open={openDialog.dialogWht}
                onClose={() =>
                  setOpenDialog((state) => ({
                    ...state,
                    dialogWht: false,
                  }))
                }
              />
            )}
            <Divider />
          </>
        )}
        <Box display="flex">
          <Box p={1} flexGrow={1}>
            <Typography variant="subtitle1">Close Period</Typography>
            <Typography variant="caption">Account Payable Close Period</Typography>
          </Box>
          <Box p={1} display="flex" alignItems="center">
            <b>Close to date &nbsp;: </b> &nbsp; {DateToString(endMonth)}
          </Box>
          <Box p={1} display="flex" alignItems="center">
            <LoadingButton text="ClosePeriod" disabled={loading.closedPeriod} fnc={handleClickClosePeriod} />
          </Box>
        </Box>
      </Paper>
    </div>
  );
};

export default withTranslate(List);
