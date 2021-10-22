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
  getApPaymentTypeList,
  getUnitList,
} from "services/setting";
import { getApVendorList } from "services/accountPayable";
import List from "./List";
import Show from "./Show";
import Edit from "./Edit";
import Create from "./Create";
import { VatTypeOptions, InvoiceTaxStatusOptions, PeriodList } from "utils/options";
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
  content: {
    padding: 0,
  },
}));

const SwitchActionMode = (props) => {
  const { authenticated } = useAuthState();
  const { settingAll } = useContext(GblContext);
  const { SettingClosePeriod, SettingSystem } = settingAll;
  const { ClosePeriodAp } = SettingClosePeriod;
  let newClosePeriodAp = addDays(new Date(ClosePeriodAp), 1);

  const addMode = props.location.pathname.search("create") !== -1;
  const copyMode = props.location.pathname.search("copy") !== -1;
  const IsSettled = JSON.parse(localStorage.getItem("IsSettled") ?? false);
  const [lookupList, setLookupList] = useState({
    accountCodeList: [],
    departmentList: [],
    currencyList: [],
    vendorList: [],
    apPaymentTypeList: [],
    unitList: [],
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
      fetchVendorLookup();
      fetchCurrencyLookup();
      fetchPaymentTypeLookup();
      fetchUnitLookup();
    }
  }, [
    authenticated,
    fetchAccLookup,
    fetchDeptLookup,
    fetchVendorLookup,
    fetchCurrencyLookup,
    fetchPaymentTypeLookup,
    fetchUnitLookup,
  ]);

  const formFieldsEdit = [
    {
      size: 2,
      field: (
        <TextFieldInForm
          label="Seq No."
          name="InvhSeq"
          variant="outlined"
          margin="dense"
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
        <TextFieldInForm
          label="* Invoice No."
          name="InvhInvNo"
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
          disabled={IsSettled}
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
            { key: "InvhCredit", optKey: "VnTerm" },
            { key: "BranchNo", optKey: "BranchNo" },
            { key: "TaxId", optKey: "VnTaxNo" },
          ]}
          rule={{
            required: {
              value: true,
              message: "* Required",
            },
          }}
          disabled={IsSettled}
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
          disabled={IsSettled}
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
          disabled={IsSettled}
        />
      ),
    },
    {
      size: 2,
      field: (
        <DateInForm
          label="Input Date"
          name="InvhDate"
          minDate={!IsSettled ?? new Date(newClosePeriodAp)}
          minDateMessage={"Date must be more than close period"}
          required
          disabled={IsSettled}
        />
      ),
    },
    {
      size: 2,
      field: (
        <DateInForm
          label="Invoice Date"
          name="InvhInvDate"
          // minDate={new Date(ClosePeriodAp)}
          // minDateMessage={"Date must be more than close period"}
          required
          disabled={IsSettled}
        />
      ),
    },
    {
      size: 2,
      field: (
        <NumberFormatInForm
          label="Credit"
          name="InvhCredit"
          decimal={0}
          rule={{
            maxLength: {
              value: 3,
              message: "maximum length is 3",
            },
          }}
          disabled={IsSettled}
        />
      ),
    },
    {
      size: 2,
      field: (
        <DateInForm
          label="Due Date"
          name="InvhDueDate"
          // minDate={new Date(ClosePeriodAp)}
          // minDateMessage={"Date must be more than close period"}
          required
          disabled={IsSettled}
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
      size: 4,
      field: (
        <TextFieldInForm
          label="Description"
          name="InvhDesc"
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
          name="InvhTInvNo"
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
      style: { marginTop: -70 },
    },
    {
      size: 2,
      field: (
        <DateInForm
          label="Tax Invoice Date"
          name="InvhTInvDt"
          // minDate={new Date(ClosePeriodAp)}
          // minDateMessage={"Date must be more than close period"}
          required
        />
      ),
      style: { marginTop: -70 },
    },
    {
      size: 2,
      field: <SelectInForm label="Tax Status" name="TaxStatus" options={InvoiceTaxStatusOptions} />,
      style: { marginTop: -70 },
    },
    {
      size: 2,
      field: <SelectInForm label="Tax Period" name="TaxPeriod" options={PeriodList()} />,
      style: { marginTop: -70 },
    },
  ];

  const formFieldsDetail = [
    {
      size: 2,
      field: (
        <MuiAutosuggest
          label="* Department"
          name="DeptCode"
          optKey="DeptCode"
          optDesc="Description"
          options={lookupList["departmentList"]}
          updateOtherField={[{ key: "DeptDesc", optKey: "Description" }]}
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
      name: "DeptDesc",
      field: (
        <DescInForm
          style={{ marginTop: 8 }}
          name="DeptDesc"
          InputProps={{
            readOnly: true,
          }}
        />
      ),
    },
    {
      size: 6,
      field: <TextFieldInForm label="Comment" name="InvdDesc" variant="outlined" margin="dense" />,
    },
    {
      size: 2,
      field: (
        <MuiAutosuggest
          label="* Dr Acc. Code"
          name="InvdBTaxDr"
          optKey="AccCode"
          optDesc="Description"
          options={lookupList["accountCodeList"]}
          updateOtherField={[{ key: "InvdBTaxDrDesc", optKey: "Description" }]}
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
      name: "InvdBTaxDrDesc",
      field: (
        <DescInForm
          style={{ marginTop: 8 }}
          name="InvdBTaxDrDesc"
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
          name="InvdBTaxCr1"
          optKey="AccCode"
          optDesc="Description"
          options={lookupList["accountCodeList"]}
          updateOtherField={[{ key: "InvdBTaxCr1Desc", optKey: "Description" }]}
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
      name: "InvdBTaxCr1Desc",
      field: (
        <DescInForm
          style={{ marginTop: 8 }}
          name="InvdBTaxCr1Desc"
          InputProps={{
            readOnly: true,
          }}
        />
      ),
    },
    {
      size: 6,
      field: <div></div>,
      implementation: "css",
      smDown: true,
      component: { Hidden },
    },
    {
      size: 2,
      field: (
        <MuiAutosuggest
          label="* Unit"
          name="UnitCode"
          optKey="UnitCode"
          optDesc="Description"
          options={lookupList["unitList"]}
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
          label="* Qty"
          name="InvdQty"
          rule={{
            required: {
              value: true,
              message: "* Required",
            },
          }}
          decimal={SettingSystem.BaseQtyDecimal}
        />
      ),
    },
    {
      size: 2,
      field: (
        <NumberFormatInForm
          label="* Price/Unit"
          name="InvdPrice"
          rule={{
            required: {
              value: true,
              message: "* Required",
            },
          }}
          decimal={SettingSystem.CostPerUnitBaseDecimal}
        />
      ),
    },
    // {
    //   size: 2,
    //   name: "TotalPrice",
    //   field: (
    //     <DescInForm
    //       style={{ marginTop: 8 }}
    //       name="TotalPrice"
    //       InputProps={{
    //         readOnly: true,
    //       }}
    //     />
    //   ),
    // },
    // {
    //   size: 2,
    //   name: "UnPaid",
    //   field: (
    //     <DescInForm
    //       style={{ marginTop: 8 }}
    //       name="UnPaid"
    //       InputProps={{
    //         readOnly: true,
    //       }}
    //     />
    //   ),
    // },
    {
      size: 2,
      field: <SelectInForm label="Tax Type 1" name="InvdTaxT1" options={VatTypeOptions} />,
    },
    {
      size: 2,
      field: (
        <MuiAutosuggest
          label="Dr Acc. Code (Tax1)"
          name="InvdT1Dr"
          optKey="AccCode"
          optDesc="Description"
          options={lookupList["accountCodeList"]}
          updateOtherField={[{ key: "InvdT1DrDesc", optKey: "Description" }]}
        />
      ),
    },
    {
      size: 2,
      name: "InvdT1DrDesc",
      field: (
        <DescInForm
          style={{ marginTop: 8 }}
          name="InvdT1DrDesc"
          InputProps={{
            readOnly: true,
          }}
        />
      ),
    },
    {
      size: 2,
      field: <NumberFormatInForm label="Tax Rate 1" name="InvdTaxR1" decimal={SettingSystem.CurrencyBaseDecimal} />,
    },
    {
      size: 2,
      field: <NumberFormatInForm label="Tax Amount 1" name="InvdTaxC1" decimal={SettingSystem.CurrencyBaseDecimal} />,
    },
    {
      size: 2,
      field: <CheckBoxInForm label="Overwrite" name="InvdT1Cr" />,
    },
    {
      size: 2,
      field: <SelectInForm label="Tax Type 2" name="InvdTaxT2" options={VatTypeOptions} />,
    },
    {
      size: 2,
      field: (
        <MuiAutosuggest
          label="Dr Acc. Code (Tax2)"
          name="InvdT2Dr"
          optKey="AccCode"
          optDesc="Description"
          options={lookupList["accountCodeList"]}
          updateOtherField={[{ key: "DrAccTax2Desc", optKey: "Description" }]}
        />
      ),
    },
    {
      size: 2,
      name: "DrAccTax2Desc",
      field: (
        <DescInForm
          //style={{ marginTop: 8 }}
          name="DrAccTax2Desc"
          InputProps={{
            readOnly: true,
          }}
        />
      ),
    },
    {
      size: 2,
      field: <NumberFormatInForm label="Tax Rate 2" name="InvdTaxR2" decimal={SettingSystem.CurrencyBaseDecimal} />,
    },
    {
      size: 2,
      field: <NumberFormatInForm label="Tax Amount 2" name="InvdTaxC2" decimal={SettingSystem.CurrencyBaseDecimal} />,
    },
    {
      size: 2,
      field: <CheckBoxInForm label="Overwrite" name="InvdT2Cr" />,
    },
  ];

  if (addMode) {
    return (
      <Create
        {...props}
        formFields={formFieldsEdit}
        formFieldsDetail={formFieldsDetail}
        vendorLookup={lookupList["vendorList"]}
        useStyles={useStyles}
      />
    );
  } else {
    return (
      <Edit
        {...props}
        copyMode={copyMode}
        isSettled={IsSettled}
        formFields={formFieldsEdit}
        formFieldsDetail={formFieldsDetail}
        vendorLookup={lookupList["vendorList"]}
        useStyles={useStyles}
      />
    );
  }
};

const ViewMode = (props) => {
  return <Show {...props} useStyles={useStyles} />;
};

export default {
  list: List,
  show: ViewMode,
  edit: SwitchActionMode,
  create: SwitchActionMode,
};
