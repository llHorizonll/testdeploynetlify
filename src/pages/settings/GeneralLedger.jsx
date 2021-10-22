import React, { useContext, useState, useEffect } from "react";
import { GblContext } from "providers/formatter";
import { useForm } from "react-hook-form";
import { makeStyles } from "@material-ui/core/styles";
import { Box, Typography, Button, Divider } from "@material-ui/core";
import { SwitchInForm, MuiAutosuggest } from "components/Form";
import {
  getSettingClosePeriod,
  getSettingGl,
  updateSettingGl,
  getAccountCodeList,
  getDepartmentList,
} from "services/setting";
import DialogPrefix from "./Dialog/Prefix";
import ActionMenu from "components/ActionMenu";
import ButtonFooter from "components/ButtonFooter";
import { addDays, startOfYear, endOfYear } from "date-fns";
import SnackbarUtils from "utils/SnackbarUtils";

const useStyles = makeStyles((theme) => ({
  tabPanel: { width: "100%", margin: "0 20px" },
  button: { textTransform: "none" },
}));

const GeneralLedger = (props) => {
  const { children, value, index, ...other } = props;
  const classes = useStyles();
  const { UpdateSettingAll, DateToString } = useContext(GblContext);
  const [lookupList, setLookupList] = useState({
    accountCodeList: [],
    departmentList: [],
  });
  const [closePeriodList, setClosePeriodList] = useState({
    ClosePeriodIncome: "",
    ClosePeriodAp: "",
    ClosePeriodGl: "",
    ClosePeriodAsset: "",
    ClosePeriodAr: "",
  });
  const [currentPeriodList, setCurrentPeriodList] = useState({
    CurrentPeriodIncome: "",
    CurrentPeriodAp: "",
    CurrentPeriodGl: "",
    CurrentPeriodAsset: "",
    CurrentPeriodAr: "",
  });
  const [setting, setSetting] = useState();
  const [mode, setMode] = useState("view");
  const [openDPrefix, setOpenDPrefix] = useState(false);

  const methods = useForm({ defaultValues: setting });

  const { handleSubmit, reset } = methods;

  const fetchAccLookup = async () => {
    const { Data } = await getAccountCodeList("Gl");
    setLookupList((state) => ({
      ...state,
      accountCodeList: Data,
    }));
  };

  const fetchDeptLookup = async () => {
    const { Data } = await getDepartmentList();
    setLookupList((state) => ({
      ...state,
      departmentList: Data,
    }));
  };

  const fetchClosePeriodList = async () => {
    const setting = await getSettingClosePeriod();
    if (setting) {
      setClosePeriodList(setting);
      setCurrentPeriod(setting);
    }
  };

  const fetchItem = async () => {
    const setting = await getSettingGl();
    if (setting) {
      setSetting(setting);
      reset(setting);
    }
  };

  useEffect(() => {
    if (value === index) {
      fetchItem();
      fetchAccLookup();
      fetchDeptLookup();
      fetchClosePeriodList();
    }
  }, [value, reset]); // eslint-disable-line react-hooks/exhaustive-deps

  const disableFormEnter = (e) => {
    if (e.key === "Enter" && e.target.localName !== "textarea") e.preventDefault();
  };

  const onSubmit = async (values) => {
    let settingAll = JSON.parse(localStorage.getItem("SettingAll"));
    settingAll.SettingGl = values;
    const { Code, UserMessage } = await updateSettingGl(values);
    if (Code === 0) {
      SnackbarUtils.success(UserMessage);
      setMode("view");
      fetchItem();
      localStorage.setItem("SettingAll", JSON.stringify(settingAll));
      UpdateSettingAll(settingAll);
    } else {
      alert(UserMessage);
    }
  };

  const menuControlProp = [
    {
      name: "Edit",
      fnc: () => {
        setMode("edit");
      },
    },
  ];

  const CancelFnc = () => {
    reset();
    setMode("view");
  };

  function setCurrentPeriod(date) {
    let currentAp = addDays(new Date(date.ClosePeriodAp), 1);
    let currentAr = addDays(new Date(date.ClosePeriodAr), 1);
    let currentAsset = addDays(new Date(date.ClosePeriodAsset), 1);
    let currentGl = addDays(new Date(date.ClosePeriodGl), 1);
    let currentIncome = addDays(new Date(date.ClosePeriodIncome), 1);
    let ff = startOfYear(new Date(date.ClosePeriodGl));
    let ft = endOfYear(new Date(date.ClosePeriodGl));

    setCurrentPeriodList({
      CurrentPeriodIncome: currentIncome,
      CurrentPeriodAp: currentAp,
      CurrentPeriodGl: currentGl,
      CurrentPeriodAsset: currentAsset,
      CurrentPeriodAr: currentAr,
      FiscalFrom: ff,
      FiscalTo: ft,
    });
  }

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
          <ActionMenu menuControl={menuControlProp} justifyContent="flex-start" />
          <Divider />
          <form onSubmit={handleSubmit(onSubmit)} onKeyDown={disableFormEnter}>
            <Box p={1} display="flex" justifyContent="space-between">
              <Box flexGrow={1}>
                <Typography variant="subtitle1">Allow edit JV. from posting</Typography>
                <Typography variant="caption">Allow edit JV. from posting</Typography>
              </Box>
              <Box>
                <SwitchInForm
                  name="AllowEditJvPostingFromSource"
                  methods={methods}
                  disabled={mode === "view"}
                  defaultChecked
                />
              </Box>
            </Box>
            <Box p={1} display="flex" justifyContent="space-between">
              <Box flexGrow={1}>
                <Typography variant="subtitle1">Reverse Account Nature When Negative</Typography>
                <Typography variant="caption">Reverse Account Nature When Negative</Typography>
              </Box>
              <Box>
                <SwitchInForm
                  name="ChangeNatureIfNegative"
                  methods={methods}
                  disabled={mode === "view"}
                  defaultChecked
                />
              </Box>
            </Box>
            <Box p={1} display="flex">
              <Box flexGrow={1}>
                <Typography variant="subtitle1">Retain Earning Account</Typography>
                <Typography variant="caption">Identify Retained Earnings account</Typography>
              </Box>
              <Box px={1} style={{ width: 160 }}>
                <MuiAutosuggest
                  label="Department"
                  name="RetainEarningDeptCode"
                  optKey="DeptCode"
                  optDesc="Description"
                  options={lookupList["departmentList"]}
                  methods={methods}
                  disabled={mode === "view"}
                />
              </Box>
              <Box px={1} style={{ width: 160 }}>
                <MuiAutosuggest
                  label="AccountCode"
                  name="RetainEarningAccCode"
                  optKey="AccCode"
                  optDesc="Description"
                  options={lookupList["accountCodeList"]}
                  methods={methods}
                  disabled={mode === "view"}
                />
              </Box>
            </Box>
            <Box p={1} display="flex">
              <Box flexGrow={1}>
                <Typography variant="subtitle1">Gl Posting Account</Typography>
                <Typography variant="caption">Enable Force Posting Dept Code (Type-B)</Typography>
              </Box>
              <Box px={1}>
                <SwitchInForm
                  name="ForceUpdateDeptCodeTypeB"
                  methods={methods}
                  disabled={mode === "view"}
                  defaultChecked
                />
              </Box>
              <Box px={1} style={{ width: 160 }}>
                <MuiAutosuggest
                  label="Department"
                  name="DeptCodeForTypeB"
                  optKey="DeptCode"
                  optDesc="Description"
                  options={lookupList["departmentList"]}
                  methods={methods}
                  disabled={methods.watch("ForceUpdateDeptCodeTypeB") === false}
                  clearable
                />
              </Box>
            </Box>
            <Box p={1} display="flex" justifyContent="space-between">
              <Box flexGrow={1}>
                <Typography variant="subtitle1">Setup Lookup</Typography>
                <Typography variant="caption">add edit delete lookup</Typography>
              </Box>
              <Box>
                <Button variant="outlined" onClick={() => setOpenDPrefix(true)}>
                  Prefix
                </Button>
              </Box>
            </Box>
            <Divider />
            <Box p={1} display="flex" justifyContent="space-between">
              <Box flexGrow={1}>
                <Typography variant="subtitle1">Fiscal Year</Typography>
                <Typography variant="caption">Fiscal Year</Typography>
              </Box>
              <Box p={1} style={{ margin: "auto 0" }}>
                {DateToString(currentPeriodList.FiscalFrom)}
              </Box>
              <Box p={1} style={{ margin: "auto 0" }}>
                To
              </Box>
              <Box p={1} style={{ margin: "auto 0" }}>
                {DateToString(currentPeriodList.FiscalTo)}
              </Box>
            </Box>
            <Box display="flex">
              <Box p={1} width="50%">
                <Typography variant="body1">
                  <b>View Close Period</b>
                </Typography>
                <Box p={1} display="flex" justifyContent="space-between">
                  <Box>Genaral Ledger</Box>
                  <Box>{DateToString(closePeriodList.ClosePeriodGl)}</Box>
                </Box>
                <Box p={1} display="flex" justifyContent="space-between">
                  <Box>Account Payable</Box>
                  <Box>{DateToString(closePeriodList.ClosePeriodAp)}</Box>
                </Box>
                <Box p={1} display="flex" justifyContent="space-between">
                  <Box>Asset</Box>
                  <Box>{DateToString(closePeriodList.ClosePeriodAsset)}</Box>
                </Box>
                <Box p={1} display="flex" justifyContent="space-between">
                  <Box>Account Receivable</Box>
                  <Box>{DateToString(closePeriodList.ClosePeriodAr)}</Box>
                </Box>
              </Box>
              <Box p={1} flexShrink={1} width="50%">
                <Typography variant="body1">
                  <b>View Current Period</b>
                </Typography>
                <Box p={1} display="flex" justifyContent="space-between">
                  <Box>Genaral Ledger</Box>
                  <Box>{DateToString(currentPeriodList.CurrentPeriodGl)}</Box>
                </Box>
                <Box p={1} display="flex" justifyContent="space-between">
                  <Box>Account Payable</Box>
                  <Box>{DateToString(currentPeriodList.CurrentPeriodAp)}</Box>
                </Box>
                <Box p={1} display="flex" justifyContent="space-between">
                  <Box>Asset</Box>
                  <Box>{DateToString(currentPeriodList.CurrentPeriodAsset)}</Box>
                </Box>
                <Box p={1} display="flex" justifyContent="space-between">
                  <Box>Account Receivable</Box>
                  <Box>{DateToString(currentPeriodList.CurrentPeriodAr)}</Box>
                </Box>
              </Box>
            </Box>
            {mode !== "view" && <ButtonFooter CancelFnc={CancelFnc} />}
          </form>
          <DialogPrefix title={"Prefix"} open={openDPrefix} onClose={() => setOpenDPrefix(false)} />
        </>
      )}
    </div>
  );
};

export default GeneralLedger;
