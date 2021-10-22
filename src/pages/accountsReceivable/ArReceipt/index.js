import React, { useContext, useState, useEffect, useCallback } from "react";
import { GblContext } from "providers/formatter";
import { useAuthState } from "react-admin";
import {
  TextFieldInForm,
  NumberFormatInForm,
  MuiAutosuggest,
  DateInForm,
  DescInForm,
  SelectInForm,
  CheckBoxInForm,
} from "components/Form";

import {
  getAccountCodeList,
  getDepartmentList,
  getCurrencyList,
  getArPaymentTypeList,
  getUnitList,
} from "services/setting";
import { getArProfileList } from "services/accountReceivable";
import List from "./List";
import Show from "./Show";
import Edit from "./Edit";
import Create from "./Create";
import Hidden from "@material-ui/core/Hidden";
import { makeStyles } from "@material-ui/core/styles";
import { addDays } from "date-fns";
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
}));

const ViewMode = (props) => {
  return <Show {...props} useStyles={useStyles} />;
};

const SwitchActionMode = (props) => {
  const { authenticated } = useAuthState();
  const { settingAll } = useContext(GblContext);
  const { SettingClosePeriod, SettingSystem } = settingAll;
  const { ClosePeriodAr } = SettingClosePeriod;
  let newClosePeriodAr = addDays(new Date(ClosePeriodAr), 1);
  const addMode = props.location.pathname.search("create") !== -1;
  const [lookupList, setLookupList] = useState({
    accountCodeList: [],
    departmentList: [],
    currencyList: [],
    arProfileList: [],
    arPaymentTypeList: [],
    unitList: [],
  });
  const fetchAccLookup = useCallback(async () => {
    const { Data } = await getAccountCodeList("Ar");
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
  const fetchArProfileLookup = useCallback(async () => {
    const { Data } = await getArProfileList();
    setLookupList((state) => ({
      ...state,
      arProfileList: Data,
    }));
  }, []);
  const fetchPaymentTypeLookup = useCallback(async () => {
    const { Data } = await getArPaymentTypeList();
    setLookupList((state) => ({
      ...state,
      arPaymentTypeList: Data,
    }));
  }, []);
  const fetchUnitLookup = useCallback(async () => {
    const { Data } = await getUnitList();
    setLookupList((state) => ({
      ...state,
      unitList: Data,
    }));
  }, []);

  useEffect(() => {
    if (authenticated) {
      fetchAccLookup();
      fetchDeptLookup();
      fetchArProfileLookup();
      fetchCurrencyLookup();
      fetchPaymentTypeLookup();
      fetchUnitLookup();
    }
  }, [
    authenticated,
    fetchAccLookup,
    fetchDeptLookup,
    fetchArProfileLookup,
    fetchCurrencyLookup,
    fetchPaymentTypeLookup,
    fetchUnitLookup,
  ]);

  const formFieldsEdit = [
    {
      size: 2,
      field: (
        <TextFieldInForm
          label="Receipt Ref. No."
          name="RcptRefNo"
          variant="outlined"
          margin="dense"
          rule={{
            required: {
              value: true,
              message: "* Required",
            },
            maxLength: {
              value: 30,
              message: "maximum length is 30",
            },
          }}
          disabled={true}
        />
      ),
    },
    {
      size: 1,
      field: <CheckBoxInForm label="Auto" name="RunNoType" disabled={!addMode} />,
    },
    {
      size: 2,
      field: (
        <DateInForm
          label="Receipt Date"
          name="RcpthDate"
          minDate={new Date(newClosePeriodAr)}
          minDateMessage={"Date must be more than close period"}
          required
        />
      ),
    },
    {
      size: 2,
      field: (
        <MuiAutosuggest
          label="* A/R No."
          name="ArNo"
          optKey="ArNo"
          optDesc="Company"
          options={lookupList["arProfileList"]}
          disabled={!addMode}
          updateOtherField={[
            { key: "Company", optKey: "Company" },
            { key: "BillToName", optKey: "FirstName" },
            { key: "BillToCompany", optKey: "Company" },
            { key: "AddressInfo", optKey: "AddressInfo" },
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
      size: 2,
      name: "Company",
      field: (
        <DescInForm
          style={{ marginTop: 8 }}
          name="Company"
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
          name="CurrCode"
          optKey="CurCode"
          optDesc="CurRate"
          options={lookupList["currencyList"]}
          updateOtherField={[{ key: "CurrRate", optKey: "CurRate" }]}
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
      size: 1,
      field: (
        <NumberFormatInForm
          label="* Rate"
          name="CurrRate"
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
          label="Pay Ref No."
          name="PayRefNo"
          variant="outlined"
          margin="dense"
          rule={{
            maxLength: {
              value: 30,
              message: "maximum length is 30",
            },
          }}
        />
      ),
    },
    {
      size: 1,
      field: <div></div>,
      implementation: "css",
      smDown: true,
      component: { Hidden },
    },
    {
      size: 2,
      field: (
        <DateInForm
          label="Pay Date"
          name="PayDate"
          minDate={new Date(newClosePeriodAr)}
          minDateMessage={"Date must be more than close period"}
          required
        />
      ),
    },
    {
      size: 2,
      field: (
        <MuiAutosuggest
          label="* Pay Type"
          name="PayType"
          optKey="Code"
          optDesc="Desc"
          options={lookupList["arPaymentTypeList"]}
          updateOtherField={[{ key: "PayDesc", optKey: "Desc" }]}
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
      name: "PayDesc",
      field: (
        <DescInForm
          style={{ marginTop: 8 }}
          name="PayDesc"
          InputProps={{
            readOnly: true,
          }}
        />
      ),
    },
    // {
    //   size: 4,
    //   field: <div></div>,
    //   implementation: "css",
    //   smDown: true,
    //   component: { Hidden },
    // },
    {
      size: 3,
      field: (
        <TextFieldInForm
          label="Description"
          name="RcptDesc"
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
        <TextFieldInForm
          label="Tax Invoice No."
          name="TaxInvNo"
          variant="outlined"
          margin="dense"
          rule={{
            maxLength: {
              value: 30,
              message: "maximum length is 30",
            },
          }}
          disabled={true}
        />
      ),
      style: { marginTop: -70 },
    },
    {
      size: 1,
      field: <CheckBoxInForm label="Auto" name="RunTaxType" />,
      style: { marginTop: -70 },
    },
    {
      size: 2,
      field: <NumberFormatInForm label="Rate (%)" name="TaxRate" decimal={SettingSystem.CurrencyBaseDecimal} />,
      style: { marginTop: -70 },
    },
    {
      size: 2,
      field: (
        <NumberFormatInForm label="Amount" name="TaxAmt" decimal={SettingSystem.CurrencyBaseDecimal} disabled={true} />
      ),
      style: { marginTop: -70 },
    },
    {
      size: 1,
      field: <CheckBoxInForm label="Overwrite" name="TaxOverwrite" />,
      style: { marginTop: -70 },
    },
  ];

  const formFieldsReceiptAccount = [
    {
      size: 3,
      field: (
        <MuiAutosuggest
          label="* Dr Dept. Code"
          name="DeptDr"
          optKey="DeptCode"
          optDesc="Description"
          options={lookupList["departmentList"]}
          updateOtherField={[{ key: "DeptDrDesc", optKey: "Description" }]}
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
      name: "DeptDrDesc",
      field: (
        <DescInForm
          style={{ marginTop: 8 }}
          name="DeptDrDesc"
          InputProps={{
            readOnly: true,
          }}
        />
      ),
    },
    {
      size: 3,
      field: (
        <MuiAutosuggest
          label="* Dr Acc. Code"
          name="DrAcc"
          optKey="AccCode"
          optDesc="Description"
          options={lookupList["accountCodeList"]}
          updateOtherField={[{ key: "DrAccDesc", optKey: "Description" }]}
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
      name: "DrAccDesc",
      field: (
        <DescInForm
          style={{ marginTop: 8 }}
          name="DrAccDesc"
          InputProps={{
            readOnly: true,
          }}
        />
      ),
    },
    {
      size: 3,
      field: (
        <MuiAutosuggest
          label="* Cr Dept. Code"
          name="DeptCr"
          optKey="DeptCode"
          optDesc="Description"
          options={lookupList["departmentList"]}
          updateOtherField={[{ key: "DeptCrDesc", optKey: "Description" }]}
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
      name: "DeptCrDesc",
      field: (
        <DescInForm
          style={{ marginTop: 8 }}
          name="DeptCrDesc"
          InputProps={{
            readOnly: true,
          }}
        />
      ),
    },
    {
      size: 3,
      field: (
        <MuiAutosuggest
          label="* Cr Acc. Code"
          name="CrAcc"
          optKey="AccCode"
          optDesc="Description"
          options={lookupList["accountCodeList"]}
          updateOtherField={[{ key: "CrAccDesc", optKey: "Description" }]}
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
      name: "CrAccDesc",
      field: (
        <DescInForm
          style={{ marginTop: 8 }}
          name="CrAccDesc"
          InputProps={{
            readOnly: true,
          }}
        />
      ),
    },
  ];

  const formFieldsGainLossAccount = [
    {
      size: 3,
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
          style={{ marginTop: 8 }}
          name="GainLossDeptDesc"
          InputProps={{
            readOnly: true,
          }}
        />
      ),
    },
    {
      size: 3,
      field: (
        <MuiAutosuggest
          label="Acc. Code"
          name="GainLossAcc"
          optKey="AccCode"
          optDesc="Description"
          options={lookupList["accountCodeList"]}
          updateOtherField={[{ key: "GainLossDesc", optKey: "Description" }]}
          clearable
        />
      ),
    },
    {
      size: 3,
      name: "GainLossDesc",
      field: (
        <DescInForm
          style={{ marginTop: 8 }}
          name="GainLossDesc"
          InputProps={{
            readOnly: true,
          }}
        />
      ),
    },
  ];

  const formFieldsBank = [
    {
      size: 3,
      field: (
        <MuiAutosuggest
          label="Dept. Code"
          name="BankChargeDept"
          optKey="DeptCode"
          optDesc="Description"
          options={lookupList["departmentList"]}
          updateOtherField={[{ key: "BankChargeDeptDesc", optKey: "Description" }]}
        />
      ),
    },
    {
      size: 3,
      name: "BankChargeDeptDesc",
      field: (
        <DescInForm
          style={{ marginTop: 8 }}
          name="BankChargeDeptDesc"
          InputProps={{
            readOnly: true,
          }}
        />
      ),
    },
    {
      size: 3,
      field: (
        <MuiAutosuggest
          label="Acc. Code"
          name="BankChargeAcc"
          optKey="AccCode"
          optDesc="Description"
          options={lookupList["accountCodeList"]}
          updateOtherField={[{ key: "BankChargeAccDesc", optKey: "Description" }]}
        />
      ),
    },
    {
      size: 3,
      name: "BankChargeAccDesc",
      field: (
        <DescInForm
          style={{ marginTop: 8 }}
          name="BankChargeAccDesc"
          InputProps={{
            readOnly: true,
          }}
        />
      ),
    },
  ];

  const formFieldsBilling = [
    {
      size: 2,
      field: (
        <TextFieldInForm
          label="Name"
          name="BillToName"
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
          label="Company"
          name="BillToCompany"
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
      size: 2,
      field: <SelectInForm label="Billing To" name="Billto" options={["Address1", "Address2", "Address3"]} />,
    },
    {
      size: 4,
      field: (
        <TextFieldInForm
          label="Address"
          name="BillToAddress"
          variant="outlined"
          margin="dense"
          multiline
          rows={4}
          rule={{
            maxLength: {
              value: 255,
              message: "maximun length is 255",
            },
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
          label="Dept."
          name="WhtDept"
          optKey="DeptCode"
          optDesc="Description"
          options={lookupList["departmentList"]}
          updateOtherField={[{ key: "WhtDeptDesc", optKey: "Description" }]}
        />
      ),
    },
    {
      size: 2,
      name: "WhtDeptDesc",
      field: (
        <DescInForm
          style={{ marginTop: 8 }}
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
          name="WhtAcc"
          optKey="AccCode"
          optDesc="Description"
          options={lookupList["accountCodeList"]}
          updateOtherField={[{ key: "WhtAccDesc", optKey: "Description" }]}
        />
      ),
    },
    {
      size: 2,
      name: "WhtAccDesc",
      field: (
        <DescInForm
          style={{ marginTop: 8 }}
          name="WhtAccDesc"
          InputProps={{
            readOnly: true,
          }}
        />
      ),
    },
  ];

  if (addMode) {
    return (
      <Create
        {...props}
        formFields={formFieldsEdit}
        formFieldsReceiptAccount={formFieldsReceiptAccount}
        formFieldsGainLossAccount={formFieldsGainLossAccount}
        formFieldsBank={formFieldsBank}
        formFieldsBilling={formFieldsBilling}
        formFieldsWht={formFieldsWht}
        arProfileList={lookupList["arProfileList"]}
        useStyles={useStyles}
      />
    );
  } else {
    return (
      <Edit
        {...props}
        formFields={formFieldsEdit}
        formFieldsReceiptAccount={formFieldsReceiptAccount}
        formFieldsGainLossAccount={formFieldsGainLossAccount}
        formFieldsBank={formFieldsBank}
        formFieldsBilling={formFieldsBilling}
        formFieldsWht={formFieldsWht}
        arProfileList={lookupList["arProfileList"]}
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
