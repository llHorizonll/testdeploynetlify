import React, { useContext, useState, useEffect } from "react";
import { GblContext } from "providers/formatter";
import { useForm } from "react-hook-form";
import { makeStyles } from "@material-ui/core/styles";
import { Box, Typography, Button, Divider } from "@material-ui/core";
import { SelectInForm, SwitchInForm, MuiAutosuggest, DescInForm } from "components/Form";
import { getSettingAp, updateSettingAp, getUnitList, getAccountCodeList, getDepartmentList } from "services/setting";
import { AgingPeriodOptions, PaymentPostingDateOptions, InvoiceTaxStatusOptions } from "utils/options";
import DialogVendorCate from "./Dialog/VendorCategory";
import DialogWHTType from "./Dialog/WHTType";
import DialogWHTService from "./Dialog/WHTService";
import ActionMenu from "components/ActionMenu";
import ButtonFooter from "components/ButtonFooter";
import SnackbarUtils from "utils/SnackbarUtils";

const useStyles = makeStyles((theme) => ({
  tabPanel: { width: "100%", margin: "0 20px" },
  button: { textTransform: "none" },
}));

const AccountPayable = (props) => {
  const { children, value, index, ...other } = props;
  const classes = useStyles();
  const { UpdateSettingAll } = useContext(GblContext);
  const [lookupList, setLookupList] = useState({
    unitList: [],
    accountCodeList: [],
    departmentList: [],
  });
  const [setting, setSetting] = useState();
  const [mode, setMode] = useState("view");
  const [openVendorCate, setOpenVendorCate] = useState(false);
  const [openWHTt, setOpenWHTt] = useState(false);
  const [openWHTs, setOpenWHTs] = useState(false);

  const methods = useForm({ defaultValues: setting });

  const { handleSubmit, reset } = methods;

  const fetchUnitLookup = async () => {
    const { Data } = await getUnitList();
    setLookupList((state) => ({
      ...state,
      unitList: Data,
    }));
  };

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

  const fetchItem = async () => {
    const setting = await getSettingAp();
    if (setting) {
      setSetting(setting);
      reset(setting);
    }
  };

  useEffect(() => {
    if (value === index) {
      fetchItem();
      fetchUnitLookup();
      fetchAccLookup();
      fetchDeptLookup();
    }
  }, [value, reset]); // eslint-disable-line react-hooks/exhaustive-deps

  const disableFormEnter = (e) => {
    if (e.key === "Enter" && e.target.localName !== "textarea") e.preventDefault();
  };

  const onSubmit = async (values) => {
    values.ShowWithholdingTaxAt = "Payment";
    let settingAll = JSON.parse(localStorage.getItem("SettingAll"));
    settingAll.SettingAp = values;
    const { Code, UserMessage } = await updateSettingAp(values);
    if (Code === 0) {
      SnackbarUtils.success(UserMessage);
      localStorage.setItem("SettingAll", JSON.stringify(settingAll));
      UpdateSettingAll(settingAll);
      setMode("view");
      fetchItem();
    } else {
      SnackbarUtils.success(UserMessage);
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
            <Box p={1} display="flex" justifyContent="space-between">
              <Box flexGrow={1}>
                <Typography variant="subtitle1">Aging Period</Typography>
                <Typography variant="caption">The start date of aging period calculation</Typography>
              </Box>
              <Box style={{ width: 160 }}>
                {methods.watch("AgingPeriodBy") && (
                  <SelectInForm
                    label="Aging Period By"
                    name="AgingPeriodBy"
                    options={AgingPeriodOptions.map((i) => i.value)}
                    methods={methods}
                    disabled
                  />
                )}
              </Box>
            </Box>
            <Box p={1} display="flex" justifyContent="space-between">
              <Box flexGrow={1}>
                <Typography variant="subtitle1">Payment Posting</Typography>
                <Typography variant="caption">
                  Date of payment will be effect with the AP aging and posting to GL
                </Typography>
              </Box>
              <Box style={{ width: 160 }}>
                {methods.watch("PaymentPostingBy") && (
                  <SelectInForm
                    label="Date"
                    name="PaymentPostingBy"
                    options={PaymentPostingDateOptions.map((i) => i.value)}
                    methods={methods}
                    disabled
                  />
                )}
              </Box>
            </Box>
            <Box p={1} display="flex" justifyContent="space-between">
              <Box flexGrow={1}>
                <Typography variant="subtitle1">Default Tax Invoice Status</Typography>
                <Typography variant="caption">Set default tax invoice status when create invoice</Typography>
              </Box>
              <Box style={{ width: 160 }}>
                {methods.watch("DefaultTaxInvoiceStatus") && (
                  <SelectInForm
                    label="Status"
                    name="DefaultTaxInvoiceStatus"
                    options={InvoiceTaxStatusOptions}
                    methods={methods}
                    disabled={mode === "view"}
                  />
                )}
              </Box>
            </Box>
            <Box p={1} display="flex" justifyContent="space-between">
              <Box flexGrow={1}>
                <Typography variant="subtitle1">Default Unit</Typography>
                <Typography variant="caption">Set default unit</Typography>
              </Box>
              <Box style={{ width: 160 }}>
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
            <Box p={1} display="flex" justifyContent="space-between">
              <Box flexGrow={1}>
                <Typography variant="subtitle1">Setup Lookup</Typography>
                <Typography variant="caption">add edit delete lookup</Typography>
              </Box>
              <Box px={1}>
                <Button variant="outlined" onClick={() => setOpenVendorCate(true)}>
                  Vendor Category
                </Button>
              </Box>
              <Box px={1}>
                <Button variant="outlined" onClick={() => setOpenWHTt(true)}>
                  WHT Type
                </Button>
              </Box>
              <Box px={1}>
                <Button variant="outlined" onClick={() => setOpenWHTs(true)}>
                  WHT Service
                </Button>
              </Box>
            </Box>
            <Divider />
            <Box p={1} display="flex" justifyContent="space-between">
              <Box flexGrow={1}>
                <Typography variant="subtitle1">Allow duplicate Cheque No.</Typography>
                <Typography variant="caption">Allow duplicate Cheque No.</Typography>
              </Box>
              <Box>
                <SwitchInForm
                  name="AllowDuplicateChequeNo"
                  methods={methods}
                  disabled={mode === "view"}
                  defaultChecked
                />
              </Box>
            </Box>
            <Box p={1} display="flex" justifyContent="space-between">
              <Box flexGrow={1}>
                <Typography variant="subtitle1">Allow to edit posting invoice</Typography>
                <Typography variant="caption">Allow to edit posting invoice</Typography>
              </Box>
              <Box>
                <SwitchInForm
                  name="AllowEditPostingInvoice"
                  methods={methods}
                  disabled={mode === "view"}
                  defaultChecked
                />
              </Box>
            </Box>
            <Box p={1} display="flex" justifyContent="space-between">
              <Box flexGrow={1}>
                <Typography variant="subtitle1">Allow to delete posting invoice</Typography>
                <Typography variant="caption">Allow to delete posting invoice</Typography>
              </Box>
              <Box>
                <SwitchInForm
                  name="AllowDeletePostingInvoice"
                  methods={methods}
                  disabled={mode === "view"}
                  defaultChecked
                />
              </Box>
            </Box>
            <Box p={1} display="flex" justifyContent="space-between">
              <Box flexGrow={1}>
                <Typography variant="subtitle1">Disallow create duplicate TaxID on vendor profile</Typography>
                <Typography variant="caption">Disallow create duplicate TaxID on vendor profile</Typography>
              </Box>
              <Box>
                <SwitchInForm
                  name="DisallowVendorDuplicateTaxId"
                  methods={methods}
                  disabled={mode === "view"}
                  defaultChecked
                />
              </Box>
            </Box>
            <Box p={1} display="flex" justifyContent="space-between">
              <Box flexGrow={1}>
                <Typography variant="subtitle1">Enable Thai Tax</Typography>
                <Typography variant="caption">Enable Thai Tax</Typography>
              </Box>
              <Box>
                <SwitchInForm
                  name="EnableThaiTaxReconcile"
                  methods={methods}
                  disabled={mode === "view"}
                  defaultChecked
                />
              </Box>
            </Box>
            <Box p={1} display="flex" justifyContent="space-between">
              <Box flexGrow={1}>
                <Typography variant="subtitle1">Auto Posting Vat Reconcile JV</Typography>
                <Typography variant="caption">Auto Posting Vat Reconcile JV</Typography>
              </Box>
              <Box>
                <SwitchInForm name="AutoPostingToGl" methods={methods} disabled={mode === "view"} />
              </Box>
            </Box>
            {methods.watch("AutoPostingToGl") && (
              <>
                <Box p={1} display="flex">
                  <Box flexGrow={1}>
                    <Typography variant="subtitle1">Department Code</Typography>
                    <Typography variant="caption">Set default department when vatreconcile post to gl</Typography>
                  </Box>
                  <Box px={1} style={{ width: 160 }}>
                    <MuiAutosuggest
                      label="Department"
                      name="PostingDepartment"
                      optKey="DeptCode"
                      optDesc="Description"
                      options={lookupList["departmentList"]}
                      updateOtherField={[{ key: "PostingDepartmentDesc", optKey: "Description" }]}
                      methods={methods}
                      disabled={mode === "view"}
                    />
                  </Box>
                  <Box px={1}>
                    <DescInForm
                      style={{ marginTop: 8 }}
                      name="PostingDepartmentDesc"
                      methods={methods}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Box>
                </Box>
                <Box p={1} display="flex">
                  <Box flexGrow={1}>
                    <Typography variant="subtitle1">Account Code</Typography>
                    <Typography variant="caption">Set default accountcode when vatreconcile post to gl</Typography>
                  </Box>
                  <Box px={1} style={{ width: 160 }}>
                    <MuiAutosuggest
                      label="AccountCode"
                      name="PostingAccount"
                      optKey="AccCode"
                      optDesc="Description"
                      options={lookupList["accountCodeList"]}
                      updateOtherField={[{ key: "PostingAccountDesc", optKey: "Description" }]}
                      methods={methods}
                      disabled={mode === "view"}
                    />
                  </Box>
                  <Box px={1}>
                    <DescInForm
                      style={{ marginTop: 8 }}
                      name="PostingAccountDesc"
                      methods={methods}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Box>
                </Box>
              </>
            )}
            {mode !== "view" && <ButtonFooter CancelFnc={CancelFnc} />}
          </form>
          <DialogVendorCate title={"Vendor Category"} open={openVendorCate} onClose={() => setOpenVendorCate(false)} />
          <DialogWHTType title={"WHT. Tax Type"} open={openWHTt} onClose={() => setOpenWHTt(false)} />
          <DialogWHTService title={"WHT. Service Type"} open={openWHTs} onClose={() => setOpenWHTs(false)} />
          <pre>{process.env.NODE_ENV === "development" ? JSON.stringify(methods.watch(), 0, 2) : ""}</pre>
        </>
      )}
    </div>
  );
};

export default AccountPayable;
