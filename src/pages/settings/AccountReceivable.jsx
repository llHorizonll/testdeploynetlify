import React, { useContext, useState, useEffect } from "react";
import { GblContext } from "providers/formatter";
import { useForm } from "react-hook-form";
import { makeStyles } from "@material-ui/core/styles";
import { Box, Typography, Button, Divider } from "@material-ui/core";
import { SelectInForm, SwitchInForm, NumberFormatInForm, MuiAutosuggest, DescInForm } from "components/Form";
import { getSettingAr, updateSettingAr, getDepartmentList, getAccountCodeList, getUnitList } from "services/setting";
import { VatTypeOptions } from "utils/options";
import DialogArType from "./Dialog/ArType";
import DialogArTitle from "./Dialog/ArTitle";
import DialogArProject from "./Dialog/ArProject";
import DialogArOwner from "./Dialog/ArOwner";
import ActionMenu from "components/ActionMenu";
import ButtonFooter from "components/ButtonFooter";
import SnackbarUtils from "utils/SnackbarUtils";

const useStyles = makeStyles((theme) => ({
  tabPanel: { width: "100%", margin: "0 20px" },
  button: { textTransform: "none" },
}));

const AccountReceivable = (props) => {
  const { children, value, index, ...other } = props;
  const classes = useStyles();
  const { UpdateSettingAll, ToNumber } = useContext(GblContext);

  const [lookupList, setLookupList] = useState({
    departmentList: [],
    accountCodeList: [],
    unitList: [],
  });
  const [setting, setSetting] = useState();
  const [mode, setMode] = useState("view");
  const [openArType, setOpenArType] = useState(false);
  const [openArTitle, setOpenArTitle] = useState(false);
  const [openArProject, setOpenArProject] = useState(false);
  const [openArOwner, setOpenArOwner] = useState(false);

  const methods = useForm({ defaultValues: setting });

  const { handleSubmit, reset } = methods;

  const fetchDeptLookup = async () => {
    const { Data } = await getDepartmentList();
    setLookupList((state) => ({
      ...state,
      departmentList: Data,
    }));
  };
  const fetchAccLookup = async () => {
    const { Data } = await getAccountCodeList("Ar");
    setLookupList((state) => ({
      ...state,
      accountCodeList: Data,
    }));
  };
  const fetchUnitLookup = async () => {
    const { Data } = await getUnitList();
    setLookupList((state) => ({
      ...state,
      unitList: Data,
    }));
  };

  const fetchItem = async () => {
    const setting = await getSettingAr();
    if (setting) {
      setSetting(setting);
      reset(setting);
    }
  };

  useEffect(() => {
    if (value === index) {
      fetchItem();
      fetchDeptLookup();
      fetchAccLookup();
      fetchUnitLookup();
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  const disableFormEnter = (e) => {
    if (e.key === "Enter" && e.target.localName !== "textarea") e.preventDefault();
  };

  const onSubmit = async (values) => {
    values.TaxRate1 = ToNumber(values.TaxRate1);
    values.TaxRate2 = ToNumber(values.TaxRate2);
    values.ReceiptTaxRate = ToNumber(values.ReceiptTaxRate);
    let settingAll = JSON.parse(localStorage.getItem("SettingAll"));
    settingAll.SettingAr = values;

    const { Code, UserMessage } = await updateSettingAr(values);
    if (Code === 0) {
      localStorage.setItem("SettingAll", JSON.stringify(settingAll));
      UpdateSettingAll(settingAll);
      SnackbarUtils.success(UserMessage);
      setMode("view");
      setSetting(settingAll.SettingAr);
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
            <Box display="flex">
              <Box p={1} width="50%">
                <Typography variant="body1">
                  <b>Default Value (A/R Invoice)</b>
                </Typography>
              </Box>
            </Box>
            <Box p={1} display="flex" justifyContent="space-between">
              <Box flexGrow={1}>
                <Typography variant="subtitle1">Department Code</Typography>
                <Typography variant="caption">Set default department</Typography>
              </Box>
              <Box style={{ width: 160 }}>
                <MuiAutosuggest
                  label="Dept. Code"
                  name="InvoiceDeptCode"
                  optKey="DeptCode"
                  optDesc="Description"
                  options={lookupList["departmentList"]}
                  updateOtherField={[{ key: "InvoiceDeptDesc", optKey: "Description" }]}
                  methods={methods}
                  disabled={mode === "view"}
                />
              </Box>
              <Box px={1}>
                <DescInForm
                  style={{ marginTop: 8 }}
                  name="InvoiceDeptDesc"
                  methods={methods}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Box>
            </Box>
            <Box p={1} display="flex" justifyContent="space-between">
              <Box flexGrow={1}>
                <Typography variant="subtitle1">(Debit) Account Code</Typography>
                <Typography variant="caption">Set default debit accountcode</Typography>
              </Box>
              <Box style={{ width: 160 }}>
                <MuiAutosuggest
                  label="Dr. Ac."
                  name="InvoiceDrAcc"
                  optKey="AccCode"
                  optDesc="Description"
                  options={lookupList["accountCodeList"]}
                  updateOtherField={[{ key: "InvoiceDrAccDesc", optKey: "Description" }]}
                  methods={methods}
                  disabled={mode === "view"}
                />
              </Box>
              <Box px={1}>
                <DescInForm
                  style={{ marginTop: 8 }}
                  name="InvoiceDrAccDesc"
                  methods={methods}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Box>
            </Box>
            <Box p={1} display="flex" justifyContent="space-between">
              <Box flexGrow={1}>
                <Typography variant="subtitle1">(Credit) Account Code</Typography>
                <Typography variant="caption">Set default credit accountcode</Typography>
              </Box>
              <Box style={{ width: 160 }}>
                <MuiAutosuggest
                  label="Cr. Ac."
                  name="InvoiceCrAcc"
                  optKey="AccCode"
                  optDesc="Description"
                  options={lookupList["accountCodeList"]}
                  updateOtherField={[{ key: "InvoiceCrAccDesc", optKey: "Description" }]}
                  methods={methods}
                  disabled={mode === "view"}
                />
              </Box>
              <Box px={1}>
                <DescInForm
                  style={{ marginTop: 8 }}
                  name="InvoiceCrAccDesc"
                  methods={methods}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Box>
            </Box>
            <Box p={1} display="flex" justifyContent="space-between">
              <Box flexGrow={1}>
                <Typography variant="subtitle1">Tax Amount 1</Typography>
                <Typography variant="caption">Set default Tax1</Typography>
              </Box>
              <Box px={1} style={{ width: 174 }}>
                {methods.watch("TaxRate1") !== undefined && (
                  <SelectInForm
                    label="Type"
                    name="TaxType1"
                    options={VatTypeOptions}
                    methods={methods}
                    disabled={mode === "view"}
                    clearOtherFieldError={"TaxRate1"}
                  />
                )}
              </Box>
              <Box style={{ width: 170 }}>
                {methods.watch("TaxRate1") !== undefined && (
                  <NumberFormatInForm
                    label="Rate"
                    name="TaxRate1"
                    methods={methods}
                    disabled={mode === "view"}
                    rule={{
                      min: {
                        value: methods.watch("TaxType1") !== "None" ? 1 : 0,
                        message: "* Required",
                      },
                    }}
                  />
                )}
              </Box>
            </Box>
            {methods.watch("TaxType1") !== "None" && (
              <Box p={1} display="flex" justifyContent="flex-end">
                <Box style={{ width: 160 }}>
                  <MuiAutosuggest
                    label="Account Code"
                    name="TaxAcc1"
                    optKey="AccCode"
                    optDesc="Description"
                    options={lookupList["accountCodeList"]}
                    updateOtherField={[{ key: "TaxAcc1Desc", optKey: "Description" }]}
                    methods={methods}
                    disabled={mode === "view"}
                    rule={{
                      required: {
                        value: methods.watch("TaxType1") !== "None",
                        message: "* Required",
                      },
                    }}
                  />
                </Box>
                <Box px={1}>
                  <DescInForm
                    style={{ marginTop: 8 }}
                    name="TaxAcc1Desc"
                    methods={methods}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Box>
              </Box>
            )}
            <Box p={1} display="flex" justifyContent="space-between">
              <Box flexGrow={1}>
                <Typography variant="subtitle1">Tax Amount 2</Typography>
                <Typography variant="caption">Set default Tax2</Typography>
              </Box>
              <Box px={1} style={{ width: 174 }}>
                {methods.watch("TaxType2") && (
                  <SelectInForm
                    label="Type"
                    name="TaxType2"
                    options={VatTypeOptions}
                    methods={methods}
                    disabled={mode === "view"}
                    clearOtherFieldError={"TaxRate2"}
                  />
                )}
              </Box>
              <Box style={{ width: 170 }}>
                {methods.watch("TaxRate2") !== undefined && (
                  <NumberFormatInForm
                    label="Rate"
                    name="TaxRate2"
                    methods={methods}
                    disabled={mode === "view"}
                    rule={{
                      min: {
                        value: methods.watch("TaxType2") !== "None" ? 1 : 0,
                        message: "* Required",
                      },
                    }}
                  />
                )}
              </Box>
            </Box>
            {methods.watch("TaxType2") !== "None" && (
              <Box p={1} display="flex" justifyContent="flex-end">
                <Box style={{ width: 160 }}>
                  <MuiAutosuggest
                    label="Account Code"
                    name="TaxAcc2"
                    optKey="AccCode"
                    optDesc="Description"
                    options={lookupList["accountCodeList"]}
                    updateOtherField={[{ key: "TaxAcc2Desc", optKey: "Description" }]}
                    methods={methods}
                    disabled={mode === "view"}
                    rule={{
                      required: {
                        value: methods.watch("TaxType2") !== "None",
                        message: "* Required",
                      },
                    }}
                  />
                </Box>
                <Box px={1}>
                  <DescInForm
                    style={{ marginTop: 8 }}
                    name="TaxAcc2Desc"
                    methods={methods}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Box>
              </Box>
            )}

            <Divider />
            <Box display="flex">
              <Box p={1} width="50%">
                <Typography variant="body1">
                  <b>Default Value (A/R Receipt)</b>
                </Typography>
              </Box>
            </Box>
            <Box p={1} display="flex" justifyContent="space-between">
              <Box flexGrow={1}>
                <Typography variant="subtitle1">Department Code</Typography>
                <Typography variant="caption">Set default department</Typography>
              </Box>
              <Box style={{ width: 160 }}>
                <MuiAutosuggest
                  label="Dept. Code"
                  name="ReceiptDeptCode"
                  optKey="DeptCode"
                  optDesc="Description"
                  options={lookupList["departmentList"]}
                  methods={methods}
                  disabled={mode === "view"}
                />
              </Box>
              <Box px={1}>
                <DescInForm
                  style={{ marginTop: 8 }}
                  name="ReceiptDeptDesc"
                  methods={methods}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Box>
            </Box>
            <Box p={1} display="flex" justifyContent="space-between">
              <Box flexGrow={1}>
                <Typography variant="subtitle1">(Debit) Account Code</Typography>
                <Typography variant="caption">Set default debit accountcode</Typography>
              </Box>
              <Box style={{ width: 160 }}>
                <MuiAutosuggest
                  label="Dr. Ac."
                  name="ReceiptDrAcc"
                  optKey="AccCode"
                  optDesc="Description"
                  options={lookupList["accountCodeList"]}
                  methods={methods}
                  disabled={mode === "view"}
                />
              </Box>
              <Box px={1}>
                <DescInForm
                  style={{ marginTop: 8 }}
                  name="ReceiptDrAccDesc"
                  methods={methods}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Box>
            </Box>
            <Box p={1} display="flex" justifyContent="space-between">
              <Box flexGrow={1}>
                <Typography variant="subtitle1">(Credit) Account Code</Typography>
                <Typography variant="caption">Set default credit accountcode</Typography>
              </Box>
              <Box style={{ width: 160 }}>
                <MuiAutosuggest
                  label="Cr. Ac."
                  name="ReceiptCrAcc"
                  optKey="AccCode"
                  optDesc="Description"
                  options={lookupList["accountCodeList"]}
                  methods={methods}
                  disabled={mode === "view"}
                />
              </Box>
              <Box px={1}>
                <DescInForm
                  style={{ marginTop: 8 }}
                  name="ReceiptCrAccDesc"
                  methods={methods}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Box>
            </Box>
            <Box p={1} display="flex" justifyContent="space-between">
              <Box flexGrow={1}>
                <Typography variant="subtitle1">Tax</Typography>
                <Typography variant="caption">Set default Tax</Typography>
              </Box>
              <Box px={1} style={{ width: 174 }}>
                {methods.watch("ReceiptTaxType") && (
                  <SelectInForm
                    label="Type"
                    name="ReceiptTaxType"
                    options={VatTypeOptions}
                    methods={methods}
                    disabled
                  />
                )}
              </Box>
              <Box style={{ width: 170 }}>
                {methods.watch("ReceiptTaxRate") !== undefined && (
                  <NumberFormatInForm label="Rate" name="ReceiptTaxRate" methods={methods} disabled={mode === "view"} />
                )}
              </Box>
            </Box>
            <Box p={1} display="flex" justifyContent="space-between">
              <Box flexGrow={1}>
                <Typography variant="subtitle1">Copy Receipt Ref No. to Tax Invoice</Typography>
                <Typography variant="caption">Copy Receipt Ref No. to Tax Invoice</Typography>
              </Box>
              <Box>
                <SwitchInForm name="AutoTaxInv" methods={methods} disabled={mode === "view"} defaultChecked />
              </Box>
            </Box>
            <Divider />
            <Box p={1} display="flex" justifyContent="space-between">
              <Box flexGrow={1}>
                <Typography variant="subtitle1">Default Unit</Typography>
                <Typography variant="caption">Set default unit</Typography>
              </Box>
              <Box style={{ width: 170 }}>
                <MuiAutosuggest
                  label="Unit"
                  name="DefaultUnit"
                  optKey="UnitCode"
                  optDesc="Description"
                  options={lookupList["unitList"]}
                  methods={methods}
                  disabled={mode === "view"}
                />
              </Box>
            </Box>
            <Box p={1} style={{ marginBottom: 20 }} display="flex" justifyContent="space-between">
              <Box flexGrow={1}>
                <Typography variant="subtitle1">Setup Lookup</Typography>
                <Typography variant="caption">add edit delete lookup</Typography>
              </Box>
              <Box px={1}>
                <Button variant="outlined" onClick={() => setOpenArType(true)}>
                  AR Type
                </Button>
              </Box>
              <Box px={1}>
                <Button variant="outlined" onClick={() => setOpenArTitle(true)}>
                  AR Title
                </Button>
              </Box>
              <Box px={1}>
                <Button variant="outlined" onClick={() => setOpenArOwner(true)}>
                  AR Owner
                </Button>
              </Box>
              <Box px={1}>
                <Button variant="outlined" onClick={() => setOpenArProject(true)}>
                  AR Project
                </Button>
              </Box>
            </Box>

            {mode !== "view" && <ButtonFooter CancelFnc={CancelFnc} />}
          </form>
          <pre>{process.env.NODE_ENV === "development" ? JSON.stringify(methods.watch(), 0, 2) : ""}</pre>
          <DialogArType title={"AR Type"} open={openArType} onClose={() => setOpenArType(false)} />
          <DialogArTitle title={"AR Title"} open={openArTitle} onClose={() => setOpenArTitle(false)} />

          <DialogArOwner title={"AR Owner"} open={openArOwner} onClose={() => setOpenArOwner(false)} />
          <DialogArProject title={"AR Project"} open={openArProject} onClose={() => setOpenArProject(false)} />
        </>
      )}
    </div>
  );
};

export default AccountReceivable;
