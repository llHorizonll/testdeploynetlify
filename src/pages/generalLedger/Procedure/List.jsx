import React, { useContext, useState, useEffect, useCallback } from "react";
import { withTranslate } from "react-admin";
import clsx from "clsx";
import { GblContext } from "providers/formatter";
import { makeStyles } from "@material-ui/core/styles";
import LaunchIcon from "@material-ui/icons/Launch";
import CircularProgress from "@material-ui/core/CircularProgress";
import { Button, Paper, Typography, Box, Divider, Select, MenuItem, FormControl, InputLabel } from "@material-ui/core";
import Collapse from "@material-ui/core/Collapse";
import IconButton from "@material-ui/core/IconButton";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import DatePickerFormat from "components/DatePickerFormat";
import { PeriodListWithYear } from "utils/options";
import { permissionName } from "utils/constants";
import { addDays, addMonths, startOfMonth, endOfMonth } from "date-fns";
import {
  applyStandardJv,
  closePeriodGl,
  postAr,
  postAp,
  postInventory,
  postExtraCost,
  postAssetDepre,
  postAssetDisposal,
  getSettingInterfaceBlueLedgers,
} from "services/glProcedure";
import CardPMSGuestLine from "./CardPMSGuestLine";
import ErrorListDialog from "components/ErrorList";
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
  const { SettingClosePeriod } = settingAll;
  const { ClosePeriodGl } = SettingClosePeriod;
  const timer = React.useRef();
  let periodList = PeriodListWithYear(new Date(ClosePeriodGl), 0, 2);
  const [loading, setLoading] = useState({
    apply: false,
    closedPeriod: false,
    income: false,
    ar: false,
    ap: false,
    extraCost: false,
    inv: false,
    asDepre: false,
    asDis: false,
  });
  const [expandedInv, setExpandedInv] = useState(false);
  const [expandedAsset, setExpandedAsset] = useState(false);
  const [expandedPMS, setExpandedPMS] = useState(false);
  const [expandedPOS, setExpandedPOS] = useState(false);
  const [endMonthCurrentGl, setEndMonthCurrentGl] = useState(new Date());
  const [applyDate, setApplyDate] = useState(periodList[0]);
  const [errorList, setErrorList] = useState(false);
  const [showErrorList, setShowErrorList] = useState(false);
  const [filterDate, setFilterDate] = useState({
    from: startOfMonth(addDays(new Date(ClosePeriodGl), 1)),
    to: endOfMonth(addDays(new Date(ClosePeriodGl), 1)),
  });
  const [settingInterfaceBlue, setSettingInterfaceBlue] = useState();

  useEffect(() => {
    return () => {
      clearTimeout(timer.current);
    };
  }, []);

  const getSetting = useCallback(async () => {
    const response = await getSettingInterfaceBlueLedgers();
    setSettingInterfaceBlue(response);
  }, []);

  useEffect(() => {
    let currentGl = addMonths(new Date(ClosePeriodGl), 1);
    setEndMonthCurrentGl(endOfMonth(currentGl));
    getSetting();
  }, [getSetting, ClosePeriodGl]);

  const handleClickApplyStd = async () => {
    if (!loading.apply) {
      if (!permissions.find((i) => i.Name === permissionName["GL.Procedure.ApplyStandardVoucher"]).Update) {
        SnackbarUtils.error(translate("ra.permission.denied"));
        return;
      }
      setLoading((state) => ({
        ...state,
        apply: true,
      }));
      let splitDate = applyDate.split("/");
      let atDate = `${splitDate[2]}-${splitDate[1]}-${splitDate[0]}`;
      const { Code, InternalMessage, UserMessage } = await applyStandardJv(atDate);
      if (Code === 0) {
        SnackbarUtils.success(UserMessage);
      } else {
        SnackbarUtils.toast(InternalMessage);
      }
      timer.current = window.setTimeout(() => {
        setLoading((state) => ({
          ...state,
          apply: false,
        }));
      }, 1000);
    }
  };

  const handleClickClosePeriod = async () => {
    if (!permissions.find((i) => i.Name === permissionName["GL.Procedure.PeriodEnd"]).Update) {
      SnackbarUtils.error(translate("ra.permission.denied"));
      return;
    }
    let msg = `Do you want to close period ${DateToString(endMonthCurrentGl)} ?`;
    let dialog = window.confirm(msg);
    if (dialog) {
      if (!loading.closedPeriod) {
        setLoading((state) => ({
          ...state,
          closedPeriod: true,
        }));

        const { Code, InternalMessage, UserMessage, ErrorList } = await closePeriodGl();
        if (Code >= 0) {
          SnackbarUtils.success(UserMessage);
          const setting = await getSettingAll();
          localStorage.setItem("SettingAll", JSON.stringify(setting));
          UpdateSettingAll(setting);

          let currentGl = addMonths(new Date(setting.SettingClosePeriod.ClosePeriodGl), 1);
          setEndMonthCurrentGl(endOfMonth(currentGl));
        } else {
          SnackbarUtils.toast(InternalMessage);
          if (ErrorList) {
            setErrorList(ErrorList);
            setShowErrorList(true);
          }
        }
        timer.current = window.setTimeout(() => {
          setLoading((state) => ({
            ...state,
            closedPeriod: false,
          }));
        }, 1000);
      }
    }
  };

  const CheckPostResultShowMessage = async (postResult) => {
    switch (postResult?.Code) {
      case 0:
        SnackbarUtils.success(postResult?.UserMessage);
        break;
      case -1:
        SnackbarUtils.toast(postResult?.InternalMessage);
        break;
      case -500:
        console.log("open mapping");
        break;
      default:
        break;
    }
  };

  const handleClickPost = async (name) => {
    setLoading((state) => ({
      ...state,
      [name]: true,
    }));
    let fromDate = ToMySqlDate(filterDate.from);
    let toDate = ToMySqlDate(addDays(filterDate.to, 1));
    switch (name) {
      case "income":
        alert("Not Implement");
        break;
      case "ar": {
        if (!permissions.find((i) => i.Name === permissionName["GL.Post.AR"]).Update) {
          SnackbarUtils.error(translate("ra.permission.denied"));
          return;
        }
        const r = await postAr(fromDate, toDate);
        CheckPostResultShowMessage(r);
        break;
      }
      case "ap": {
        if (!permissions.find((i) => i.Name === permissionName["GL.Post.AP"]).Update) {
          SnackbarUtils.error(translate("ra.permission.denied"));
          return;
        }
        const r = await postAp(fromDate, toDate);
        CheckPostResultShowMessage(r);
        break;
      }
      case "extraCost": {
        if (!permissions.find((i) => i.Name === permissionName["GL.Post.Receiving"]).Update) {
          SnackbarUtils.error(translate("ra.permission.denied"));
          return;
        }
        let deptCode = settingInterfaceBlue.ConfigExtraCost.DeptCode;
        let accCode = settingInterfaceBlue.ConfigExtraCost.AccCode;
        let param = {
          FromDate: fromDate,
          ToDate: toDate,
          DeptCode: deptCode,
          AccCode: accCode,
        };
        console.log("receiving", param);
        const r = await postExtraCost(param);
        CheckPostResultShowMessage(r);
        break;
      }
      case "inv": {
        if (!permissions.find((i) => i.Name === permissionName["GL.Post.Invent"]).Update) {
          SnackbarUtils.error(translate("ra.permission.denied"));
          return;
        }
        let param = {
          FromDate: fromDate,
          ToDate: toDate,
        };
        console.log("inv", param);
        const r = await postInventory(param);
        CheckPostResultShowMessage(r);
        break;
      }
      case "asDepre": {
        if (!permissions.find((i) => i.Name === permissionName["GL.Post.Asset"]).Update) {
          SnackbarUtils.error(translate("ra.permission.denied"));
          return;
        }
        console.log("asDepre", fromDate, toDate);
        const r = await postAssetDepre(fromDate, toDate);
        CheckPostResultShowMessage(r);
        break;
      }
      case "asDis": {
        if (!permissions.find((i) => i.Name === permissionName["GL.Post.Asset"]).Update) {
          SnackbarUtils.error(translate("ra.permission.denied"));
          return;
        }
        console.log("asDis", fromDate, toDate);
        const r = await postAssetDisposal(fromDate, toDate);
        CheckPostResultShowMessage(r);
        break;
      }
      default:
        break;
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

        <Box p={1} display="flex">
          <Box p={1} flexGrow={1}>
            <Typography variant="subtitle1">Apply Recurring</Typography>
            <Typography variant="caption">Apply Recurring</Typography>
          </Box>
          <Box p={1} style={{ width: 160 }}>
            <FormControl variant="outlined" fullWidth>
              <InputLabel id="simple-select-outlined-label">Period</InputLabel>
              <Select
                labelId="simple-select-filled-label"
                variant="outlined"
                margin="dense"
                label="Period"
                MenuProps={{ classes: { paper: classes.menuPaper } }}
                defaultValue={periodList && periodList[0]}
                value={applyDate}
                onChange={(e) => {
                  setApplyDate(e.target.value);
                }}
              >
                {periodList &&
                  periodList.map((item, idx) => (
                    <MenuItem key={idx} value={item}>
                      {item}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Box>
          <Box p={1}>
            <LoadingButton text="Apply" disabled={loading.apply} fnc={handleClickApplyStd} />
          </Box>
        </Box>
        <Divider />

        <Typography variant="h6" className={classes.title}>
          Posting Manual
        </Typography>
        <Box p={1} display="flex" style={{ display: "none" }}>
          <Box p={1} flexGrow={1}>
            <Typography variant="subtitle1">Posting from Income</Typography>
            <Typography variant="caption">Posting from Income</Typography>
          </Box>
          <Box p={1}>
            <DatePickerFormat
              label="From"
              value={filterDate.from}
              onChange={(e) => {
                setFilterDate((state) => ({
                  ...state,
                  from: e,
                  to: e > filterDate.to ? e : filterDate.to,
                }));
              }}
              style={{ width: 160, margin: "0 10px" }}
            />
            <DatePickerFormat
              label="to"
              value={filterDate.to}
              minDate={filterDate.from}
              onChange={(e) => {
                setFilterDate((state) => ({
                  ...state,
                  to: e,
                }));
              }}
              style={{ width: 160, margin: "0 10px" }}
            />
          </Box>
          <Box p={1}>
            <LoadingButton text="Post" disabled={loading.income} fnc={() => handleClickPost("income")} />
          </Box>
        </Box>
        <Divider />
        <Box p={1} display="flex">
          <Box p={1} flexGrow={1}>
            <Typography variant="subtitle1">Posting from AR</Typography>
            <Typography variant="caption">Posting from Account Receivable</Typography>
          </Box>
          <Box p={1}>
            <DatePickerFormat
              label="From"
              value={filterDate.from}
              onChange={(e) => {
                setFilterDate((state) => ({
                  ...state,
                  from: e,
                  to: e > filterDate.to ? e : filterDate.to,
                }));
              }}
              style={{ width: 160, margin: "0 10px" }}
            />
            <DatePickerFormat
              label="to"
              value={filterDate.to}
              minDate={filterDate.from}
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
            <LoadingButton text="Post" disabled={loading.ar} fnc={() => handleClickPost("ar")} />
          </Box>
        </Box>
        <Divider />
        <Box p={1} display="flex">
          <Box p={1} flexGrow={1}>
            <Typography variant="subtitle1">Posting from AP</Typography>
            <Typography variant="caption">Posting from Account Payable</Typography>
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
            <LoadingButton text="Post" disabled={loading.ap} fnc={() => handleClickPost("ap")} />
          </Box>
        </Box>
        <Divider />

        <Box p={1} onClick={() => setExpandedInv(!expandedInv)}>
          <Typography variant="h6">
            Posting from Inventory
            <IconButton
              className={clsx(classes.expand, {
                [classes.expandOpen]: expandedInv,
              })}
              aria-expanded={expandedInv}
              aria-label="show more"
            >
              <ExpandMoreIcon />
            </IconButton>
          </Typography>
        </Box>
        <Collapse in={expandedInv} timeout="auto" unmountOnExit>
          <Box p={1} display="flex">
            <Box p={1} flexGrow={1}>
              <Typography variant="subtitle1">Posting from Receiving (Extra cost)</Typography>
              <Typography variant="caption">Posting from Receiving (Extra cost)</Typography>
            </Box>
            <Box p={1}>
              <DatePickerFormat
                label="From"
                value={filterDate.from}
                onChange={(e) => {
                  setFilterDate((state) => ({
                    ...state,
                    from: e,
                    to: e > filterDate.to ? e : filterDate.to,
                  }));
                }}
                style={{ width: 160, margin: "0 10px" }}
              />
              <DatePickerFormat
                label="to"
                value={filterDate.to}
                minDate={filterDate.from}
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
              <LoadingButton text="Post" disabled={loading.extraCost} fnc={() => handleClickPost("extraCost")} />
            </Box>
          </Box>
          <Box p={1} display="flex">
            <Box p={1} flexGrow={1}>
              <Typography variant="subtitle1">Posting from Inventory</Typography>
              <Typography variant="caption">Posting from Inventory</Typography>
            </Box>
            <Box p={1}>
              <DatePickerFormat
                label="From"
                value={filterDate.from}
                onChange={(e) => {
                  setFilterDate((state) => ({
                    ...state,
                    from: e,
                    to: e > filterDate.to ? e : filterDate.to,
                  }));
                }}
                style={{ width: 160, margin: "0 10px" }}
              />
              <DatePickerFormat
                label="to"
                value={filterDate.to}
                minDate={filterDate.from}
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
              <LoadingButton text="Post" disabled={loading.inv} fnc={() => handleClickPost("inv")} />
            </Box>
          </Box>
        </Collapse>
        <Divider />

        <Box p={1} onClick={() => setExpandedAsset(!expandedAsset)}>
          <Typography variant="h6">
            Posting from Asset
            <IconButton
              className={clsx(classes.expand, {
                [classes.expandOpen]: expandedAsset,
              })}
              aria-expanded={expandedAsset}
              aria-label="show more"
            >
              <ExpandMoreIcon />
            </IconButton>
          </Typography>
        </Box>
        <Collapse in={expandedAsset} timeout="auto" unmountOnExit>
          <Box p={1} display="flex">
            <Box p={1} flexGrow={1}>
              <Typography variant="subtitle1">Posting from Asset Depre</Typography>
              <Typography variant="caption">Posting from Asset Depre</Typography>
            </Box>
            <Box p={1}>
              <DatePickerFormat
                label="From"
                value={filterDate.from}
                onChange={(e) => {
                  setFilterDate((state) => ({
                    ...state,
                    from: e,
                    to: e > filterDate.to ? e : filterDate.to,
                  }));
                }}
                style={{ width: 160, margin: "0 10px" }}
              />
              <DatePickerFormat
                label="to"
                value={filterDate.to}
                minDate={filterDate.from}
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
              <LoadingButton text="Post" disabled={loading.asDepre} fnc={() => handleClickPost("asDepre")} />
            </Box>
          </Box>
          <Box p={1} display="flex">
            <Box p={1} flexGrow={1}>
              <Typography variant="subtitle1">Posting from Asset Disposal</Typography>
              <Typography variant="caption">Posting from Asset Disposal</Typography>
            </Box>
            <Box p={1}>
              <DatePickerFormat
                label="From"
                value={filterDate.from}
                onChange={(e) => {
                  setFilterDate((state) => ({
                    ...state,
                    from: e,
                    to: e > filterDate.to ? e : filterDate.to,
                  }));
                }}
                style={{ width: 160, margin: "0 10px" }}
              />
              <DatePickerFormat
                label="to"
                value={filterDate.to}
                minDate={filterDate.from}
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
              <LoadingButton text="Post" disabled={loading.asDis} fnc={() => handleClickPost("asDis")} />
            </Box>
          </Box>
        </Collapse>
        <Divider />

        <Box p={1} onClick={() => setExpandedPMS(!expandedPMS)}>
          <Typography variant="h6">
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
          <Box p={1} display="flex">
            <Box p={1} flexGrow={1}>
              <Typography variant="subtitle1">
                Opera{" "}
                <span className={classes.lucnchIconStyle}>
                  <LaunchIcon onClick={() => console.log("in")} />
                </span>
              </Typography>
              <Typography variant="caption">Posting from PMS - Opera</Typography>
            </Box>
            <Box p={1}></Box>
            <Divider />
          </Box>
          {expandedPMS && <CardPMSGuestLine />}
        </Collapse>

        <Box p={1} onClick={() => setExpandedPOS(!expandedPOS)}>
          <Typography variant="h6">
            Posting from POS
            <IconButton
              className={clsx(classes.expand, {
                [classes.expandOpen]: expandedPOS,
              })}
              aria-expanded={expandedPOS}
              aria-label="show more"
            >
              <ExpandMoreIcon />
            </IconButton>
          </Typography>
        </Box>
        <Collapse in={expandedPOS} timeout="auto" unmountOnExit></Collapse>
        <Divider />
        <Box p={1} display="flex">
          <Box p={1} flexGrow={1}>
            <Typography variant="subtitle1">Close Period</Typography>
            <Typography variant="caption">General Ledger Close Period</Typography>
          </Box>
          <Box p={1} display="flex" alignItems="center">
            <b>Close to date &nbsp;: </b> &nbsp; {DateToString(endMonthCurrentGl)}
          </Box>
          <Box p={1} display="flex" alignItems="center">
            <LoadingButton text="ClosePeriod" disabled={loading.closedPeriod} fnc={handleClickClosePeriod} />
          </Box>
        </Box>
      </Paper>
      {showErrorList && (
        <ErrorListDialog open={showErrorList} onClose={() => setShowErrorList(false)} errorList={errorList} />
      )}
    </div>
  );
};

export default withTranslate(List);
