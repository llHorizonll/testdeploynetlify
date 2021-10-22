import React, { useContext, useState, useEffect, useCallback } from "react";
import { GblContext } from "providers/formatter";
import { useAuthState } from "react-admin";
import { TextFieldInForm, NumberFormatInForm, MuiAutosuggest, DateInForm, DescInForm } from "components/Form";
import { Typography } from "@material-ui/core";
import { getAccountCodeList, getDepartmentList, getCurrencyList, getApPaymentTypeList } from "services/setting";
import { getApVendorList, getApWhtServiceSearchList, getApWhtTypeSearchList } from "services/accountPayable";
import List from "./List";
import Show from "./Show";
import Edit from "./Edit";
import Create from "./Create";
import ModelUriQueryString from "models/uriQueryString";
import { makeStyles } from "@material-ui/core/styles";
import { addDays } from "date-fns";
// import Hidden from "@material-ui/core/Hidden";
const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: 12,
    marginBottom: 12,
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightBold,
  },
  bold: {
    fontWeight: 600,
  },
  footerCell: {
    backgroundColor: theme.palette.background.paper,
    borderTop: "2px solid rgba(224, 224, 224, 1)",
    borderBottom: "none",
  },
  stickyFooterCell: {
    position: "sticky",
    bottom: 0,
    zIndex: 100,
    textAlign: "right",
    fontSize: "0.9rem",
    fontWeight: 600,
    color: theme.palette.primary.main,
  },
  drawerOpen: {
    marginRight: drawerWidth,
  },
  drawerClose: {
    marginRight: 54,
  },
  borderTableTop: {
    borderTop: "1px solid rgba(224, 224, 224, 1)",
  },
  borderTable: {
    border: "1px solid rgba(224, 224, 224, 1)",
  },
  content: {
    padding: 0,
  },
}));

const ViewMode = (props) => {
  return <Show {...props} useStyles={useStyles} />;
};

const SwitchActionMode = (props) => {
  const classes = useStyles();
  const { authenticated } = useAuthState();
  const { settingAll } = useContext(GblContext);
  const { SettingClosePeriod, SettingSystem } = settingAll;
  const { ClosePeriodAp } = SettingClosePeriod;
  let newClosePeriodAp = addDays(new Date(ClosePeriodAp), 1);

  const addMode = props.location.pathname.search("create") !== -1;
  const [lookupList, setLookupList] = useState({
    accountCodeList: [],
    departmentList: [],
    currencyList: [],
    vendorList: [],
    apPaymentTypeList: [],
    apWhtList: [],
    apWhtTypeList: [],
  });
  const fetchAccLookup = useCallback(async () => {
    const { Data } = await getAccountCodeList("Ap");
    setLookupList((state) => ({
      ...state,
      accountCodeList: Data,
    }));
  }, []);
  const fetchDeptLookup = useCallback(async () => {
    const { Data } = await getDepartmentList();
    setLookupList((state) => ({
      ...state,
      departmentList: Data,
    }));
  }, []);
  const fetchCurrencyLookup = useCallback(async () => {
    const { Data } = await getCurrencyList();
    setLookupList((state) => ({
      ...state,
      currencyList: Data,
    }));
  }, []);
  const fetchVendorLookup = useCallback(async () => {
    const { Data } = await getApVendorList();
    setLookupList((state) => ({
      ...state,
      vendorList: Data,
    }));
  }, []);
  const fetchPaymentTypeLookup = useCallback(async () => {
    const { Data } = await getApPaymentTypeList();
    setLookupList((state) => ({
      ...state,
      apPaymentTypeList: Data,
    }));
  }, []);
  const fetchApWhtLookup = useCallback(async () => {
    const { Data } = await getApWhtServiceSearchList(ModelUriQueryString);
    setLookupList((state) => ({
      ...state,
      apWhtList: Data,
    }));
  }, []);
  const fetchApWhtTypeLookup = useCallback(async () => {
    const { Data } = await getApWhtTypeSearchList(ModelUriQueryString);
    setLookupList((state) => ({
      ...state,
      apWhtTypeList: Data,
    }));
  }, []);

  useEffect(() => {
    if (authenticated) {
      fetchAccLookup();
      fetchDeptLookup();
      fetchVendorLookup();
      fetchCurrencyLookup();
      fetchPaymentTypeLookup();
      fetchApWhtLookup();
      fetchApWhtTypeLookup();
    }
  }, [
    authenticated,
    fetchAccLookup,
    fetchDeptLookup,
    fetchVendorLookup,
    fetchCurrencyLookup,
    fetchPaymentTypeLookup,
    fetchApWhtLookup,
    fetchApWhtTypeLookup,
  ]);

  const formFieldsEdit = [
    {
      size: 2,
      field: (
        <TextFieldInForm
          label="Seq No."
          name="PyhSeq"
          variant="outlined"
          margin="dense"
          rule={{
            maxLength: {
              value: 30,
              message: "maximum length is 30",
            },
          }}
          InputProps={{
            readOnly: true,
          }}
          disabled={!addMode}
        />
      ),
    },
    {
      size: 2,
      field: (
        <DateInForm
          label="Payment Date"
          name="PyhDate"
          minDate={addMode ? new Date(newClosePeriodAp) : false}
          minDateMessage={"Date must be more than close period"}
          required={addMode}
          disabled={!addMode}
        />
      ),
    },
    {
      size: 2,
      field: (
        <MuiAutosuggest
          label="* Vendor"
          name="VnCode"
          optKey="VnCode"
          optDesc="VnName"
          options={lookupList["vendorList"]}
          updateOtherField={[
            { key: "VnName", optKey: "VnName" },
            { key: "AppyCode", optKey: "VnPayType" },
            { key: "AppyDesc", optKey: "VnPayDept" },
            { key: "DeptPayCode", optKey: "VnPayDeptCode" },
            { key: "DeptPayDesc", optKey: "VnPayDeptDesc" },
            { key: "PyhCr", optKey: "VnCrAccCode" },
            { key: "PyhCrDesc", optKey: "VnCrAccDesc" },
            { key: "PayWht.Payee", optKey: "VnPayee" },
            { key: "PayWht.Address", optKey: "VnAdd1", useFncUpdate: true },
            { key: "PayWht.TaxId", optKey: "VnTaxNo" },
            { key: "WhtDeptCode", optKey: "VnWhtDeptCode" },
            { key: "WhtDeptDesc", optKey: "VnWhtDeptDesc" },
            { key: "WhtTaxCr", optKey: "VnWhtAccCode" },
            { key: "WhtTaxCrDesc", optKey: "VnWhtAccDesc" },
          ]}
          disabled={!addMode}
          //for custom advance update field
          fncUpdate={(value) => {
            let v = value?.VnAdd1.concat(value?.VnAdd2 ?? "", value?.VnAdd3 ?? "", value?.VnAdd4 ?? "");
            return v;
          }}
          rule={{
            required: {
              value: true,
              message: "* Required",
            },
          }}
        />
      ),
    },
    {
      size: 2,
      name: "VnName",
      field: (
        <DescInForm
          style={{ marginTop: 8 }}
          name="VnName"
          InputProps={{
            readOnly: true,
          }}
        />
      ),
    },
    {
      size: 2,
      field: (
        <MuiAutosuggest
          label="* Currency"
          name="CurCode"
          optKey="CurCode"
          optDesc="CurRate"
          options={lookupList["currencyList"]}
          updateOtherField={[{ key: "CurRate", optKey: "CurRate" }]}
          rule={{
            required: {
              value: true,
              message: "* Required",
            },
          }}
        />
      ),
    },
    {
      size: 2,
      field: (
        <NumberFormatInForm
          label="* Rate"
          name="CurRate"
          rule={{
            min: {
              value: 0.01,
              message: "* Required",
            },
            required: {
              value: true,
              message: "* Required",
            },
          }}
          decimal={SettingSystem.CurrencyRateDecimal}
        />
      ),
    },
    {
      size: 2,
      field: (
        <TextFieldInForm
          label="Cheque No. From"
          name="PyhChqFr"
          variant="outlined"
          margin="dense"
          rule={{
            maxLength: {
              value: 10,
              message: "maximum length is 10",
            },
          }}
        />
      ),
    },
    {
      size: 2,
      field: (
        <TextFieldInForm
          label="Cheque No. To"
          name="PyhChqTo"
          variant="outlined"
          margin="dense"
          rule={{
            maxLength: {
              value: 10,
              message: "maximum length is 10",
            },
          }}
        />
      ),
    },
    {
      size: 2,
      field: (
        <MuiAutosuggest
          label="* Payment Type"
          name="AppyCode"
          optKey="Code"
          optDesc="Desc"
          options={lookupList["apPaymentTypeList"]}
          updateOtherField={[{ key: "AppyDesc", optKey: "Desc" }]}
          rule={{
            required: {
              value: true,
              message: "* Required",
            },
          }}
        />
      ),
    },
    {
      size: 2,
      name: "AppyDesc",
      field: (
        <DescInForm
          style={{ marginTop: 8 }}
          name="AppyDesc"
          InputProps={{
            readOnly: true,
          }}
        />
      ),
    },
    {
      size: 4,
      field: (
        <TextFieldInForm
          label="Description"
          name="PyhDesc"
          variant="outlined"
          margin="dense"
          multiline
          rows={5}
          rule={{
            maxLength: {
              value: 255,
              message: "maximun length is 255",
            },
          }}
        />
      ),
    },
    {
      size: 2,
      field: (
        <DateInForm
          label="Cheque Date"
          name="PyhChqDt"
          minDate={new Date(newClosePeriodAp)}
          customMinDate={"PyhDate"}
          minDateMessage={"Date must be more than close period"}
          clearable
        />
      ),
      style: { marginTop: -70 },
    },
    {
      size: 2,
      field: (
        <DateInForm
          label="Clearing Date"
          name="PyhClearDt"
          minDate={new Date(newClosePeriodAp)}
          //customMinDate={addMode ? "PyhChqDt" : false}
          customMinDate={"PyhChqDt"}
          minDateMessage={"Date must be more than close period"}
          clearable
        />
      ),
      style: { marginTop: -70 },
    },
  ];

  const formFieldsPaymentAccount = [
    {
      size: 2,
      field: <Typography className={classes.heading}>Payment Account</Typography>,
    },
    {
      size: 2,
      field: (
        <MuiAutosuggest
          label="* Dept. Code"
          name="DeptPayCode"
          optKey="DeptCode"
          optDesc="Description"
          options={lookupList["departmentList"]}
          updateOtherField={[{ key: "DeptPayDesc", optKey: "Description" }]}
          rule={{
            required: {
              value: true,
              message: "* Required",
            },
          }}
        />
      ),
    },
    {
      size: 3,
      name: "DeptPayDesc",
      field: (
        <DescInForm
          name="DeptPayDesc"
          InputProps={{
            readOnly: true,
          }}
        />
      ),
    },
    {
      size: 2,
      field: (
        <MuiAutosuggest
          label="* Acc. Code"
          name="PyhCr"
          optKey="AccCode"
          optDesc="Description"
          options={lookupList["accountCodeList"]}
          updateOtherField={[{ key: "PyhCrDesc", optKey: "Description" }]}
          rule={{
            required: {
              value: true,
              message: "* Required",
            },
          }}
        />
      ),
    },
    {
      size: 3,
      name: "PyhCrDesc",
      field: (
        <DescInForm
          name="PyhCrDesc"
          InputProps={{
            readOnly: true,
          }}
        />
      ),
      
    },
  ];

  const formFieldsGainLossAccount = [
    {
      size: 2,
      field: <Typography className={classes.heading}>Gain/Loss Account</Typography>,
    },
    {
      size: 2,
      field: (
        <MuiAutosuggest
          label="Dept. Code"
          name="GainLossDept"
          optKey="DeptCode"
          optDesc="Description"
          options={lookupList["departmentList"]}
          updateOtherField={[{ key: "GainLossDeptDesc", optKey: "Description" }]}
          clearable
        />
      ),
    },
    {
      size: 3,
      name: "GainLossDeptDesc",
      field: (
        <DescInForm
          name="GainLossDeptDesc"
          InputProps={{
            readOnly: true,
          }}
        />
      ),
    },
    {
      size: 2,
      field: (
        <MuiAutosuggest
          label="Acc. Code"
          name="GainLossAcc"
          optKey="AccCode"
          optDesc="Description"
          options={lookupList["accountCodeList"]}
          updateOtherField={[{ key: "GainLossAccDesc", optKey: "Description" }]}
          clearable
        />
      ),
    },
    {
      size: 3,
      name: "GainLossAccDesc",
      field: (
        <DescInForm
          name="GainLossAccDesc"
          InputProps={{
            readOnly: true,
          }}
        />
      ),
    },
  ];

  const formFiledWhtAccount = [
    {
      size: 2,
      field: <Typography className={classes.heading}>WHT. Account</Typography>,
    },
    {
      size: 2,
      field: (
        <MuiAutosuggest
          label="Dept. Code"
          name="WhtDeptCode"
          optKey="DeptCode"
          optDesc="Description"
          options={lookupList["departmentList"]}
          updateOtherField={[{ key: "WhtDeptDesc", optKey: "Description" }]}
        />
      ),
    },
    {
      size: 3,
      name: "WhtDeptDesc",
      field: (
        <DescInForm
          name="WhtDeptDesc"
          InputProps={{
            readOnly: true,
          }}
        />
      ),
    },
    {
      size: 2,
      field: (
        <MuiAutosuggest
          label="Acc. Code"
          name="WhtTaxCr"
          optKey="AccCode"
          optDesc="Description"
          options={lookupList["accountCodeList"]}
          updateOtherField={[{ key: "WhtTaxCrDesc", optKey: "Description" }]}
        />
      ),
    },
    {
      size: 3,
      name: "WhtTaxCrDesc",
      field: (
        <DescInForm
          name="WhtTaxCrDesc"
          InputProps={{
            readOnly: true,
          }}
        />
      ),
    },
  ];

  const formFieldsWht = [
    {
      size: 2,
      field: (
        <MuiAutosuggest
          label="WHT. Form"
          name="WhtTypeCode"
          noCode
          optKey="Description"
          optDesc="Description"
          options={lookupList["apWhtTypeList"]}
          updateOtherField={[{ key: "PayWht.WhtTypeDesc", optKey: "Description" }]}
        />
      ),
    },
    {
      size: 2,
      field: (
        <TextFieldInForm
          label="Tax ID."
          name="PayWht.TaxId"
          variant="outlined"
          margin="dense"
          rule={{
            maxLength: {
              value: 20,
              message: "maximum length is 20",
            },
          }}
        />
      ),
    },
    {
      size: 2,
      field: (
        <TextFieldInForm
          label="Title"
          name="PayWht.PrePayee"
          variant="outlined"
          margin="dense"
          rule={{
            maxLength: {
              value: 50,
              message: "maximum length is 50",
            },
          }}
        />
      ),
    },
    {
      size: 2,
      field: (
        <TextFieldInForm
          label="Payee"
          name="PayWht.Payee"
          variant="outlined"
          margin="dense"
          rule={{
            maxLength: {
              value: 255,
              message: "maximum length is 255",
            },
          }}
        />
      ),
    },
    {
      size: 4,
      field: (
        <TextFieldInForm
          label="Address"
          name="PayWht.Address"
          variant="outlined"
          margin="dense"
          //multiline
          //rows={4}
          rule={{
            maxLength: {
              value: 255,
              message: "maximun length is 255",
            },
          }}
        />
      ),
    },
    {
      size: 2,
      field: (
        <TextFieldInForm
          label="WHT. No"
          name="PayWht.WhtNo"
          variant="outlined"
          margin="dense"
          rule={{
            maxLength: {
              value: 255,
              message: "maximum length is 255",
            },
          }}
        />
      ),
    },
    {
      size: 4,
      field: (
        <TextFieldInForm
          label="Ref"
          name="PayWht.WhtRemark1"
          variant="outlined"
          margin="dense"
          rule={{
            maxLength: {
              value: 255,
              message: "maximum length is 255",
            },
          }}
        />
      ),
    },
    {
      size: 6,
      field: (
        <TextFieldInForm
          label="Remark"
          name="PayWht.WhtRemark2"
          variant="outlined"
          margin="dense"
          rule={{
            maxLength: {
              value: 255,
              message: "maximum length is 255",
            },
          }}
        />
      ),
    },
  ];

  const formFieldsWhtDetail = [
    {
      size: 2,
      field: (
        <MuiAutosuggest
          label="* WHT. Code"
          name="WhtCode"
          optKey="WhtCode"
          optDesc="Description"
          options={lookupList["apWhtList"]}
          updateOtherField={[
            { key: "WhtDesc", optKey: "Description" },
            { key: "WhtRate", optKey: "WhtRate" },
          ]}
          rule={{
            required: {
              value: true,
              message: "* Required",
            },
          }}
        />
      ),
    },

    {
      size: 4,
      field: (
        <DescInForm
          style={{ marginTop: 8 }}
          name="WhtDesc"
          InputProps={{
            readOnly: true,
          }}
        />
      ),
    },
    {
      size: 2,
      field: <NumberFormatInForm label="Tax Rate (%)" name="WhtRate" decimal={SettingSystem.CurrencyBaseDecimal} />,
    },
    {
      size: 2,
      field: <NumberFormatInForm label="Total Base Amount" name="Amount" decimal={SettingSystem.CurrencyBaseDecimal} />,
    },
    {
      size: 2,
      field: (
        <NumberFormatInForm
          label="Tax Amount"
          name="TaxAmt"
          //InputProps={{ readOnly: true }}
          decimal={SettingSystem.CurrencyBaseDecimal}
        />
      ),
    },
  ];

  if (addMode) {
    return (
      <Create
        {...props}
        formFields={formFieldsEdit}
        formFieldsPaymentAccount={formFieldsPaymentAccount}
        formFieldsGainLossAccount={formFieldsGainLossAccount}
        formFiledWhtAccount={formFiledWhtAccount}
        formFieldsWht={formFieldsWht}
        formFieldsWhtDetail={formFieldsWhtDetail}
        useStyles={useStyles}
      />
    );
  } else {
    return (
      <Edit
        {...props}
        formFields={formFieldsEdit}
        formFieldsPaymentAccount={formFieldsPaymentAccount}
        formFieldsGainLossAccount={formFieldsGainLossAccount}
        formFiledWhtAccount={formFiledWhtAccount}
        formFieldsWht={formFieldsWht}
        formFieldsWhtDetail={formFieldsWhtDetail}
        useStyles={useStyles}
      />
    );
  }
};

export default {
  list: List,
  show: ViewMode,
  edit: SwitchActionMode,
  create: SwitchActionMode,
};
