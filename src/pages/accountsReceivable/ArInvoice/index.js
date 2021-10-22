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

import { getAccountCodeList, getDepartmentList, getCurrencyList, getUnitList } from "services/setting";
import { getArProfileList } from "services/accountReceivable";
import List from "./List";
import Show from "./Show";
import Edit from "./Edit";
import Create from "./Create";
import { VatTypeOptions, VatTypeAR } from "utils/options";
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

const SwitchActionMode = (props) => {
  const { authenticated } = useAuthState();
  const { settingAll } = useContext(GblContext);
  const { SettingClosePeriod, SettingSystem } = settingAll;
  const { ClosePeriodAr } = SettingClosePeriod;
  let newClosePeriodAr = addDays(new Date(ClosePeriodAr), 1);
  const addMode = props.location.pathname.search("create") !== -1;
  const copyMode = props.location.pathname.search("copy") !== -1;
  const [lookupList, setLookupList] = useState({
    accountCodeList: [],
    departmentList: [],
    currencyList: [],
    arProfileList: [],
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
      fetchUnitLookup();
    }
  }, [authenticated, fetchAccLookup, fetchDeptLookup, fetchArProfileLookup, fetchCurrencyLookup, fetchUnitLookup]);

  const formFieldsEdit = [
    {
      size: 2,
      field: (
        <TextFieldInForm
          label="Invoice No."
          name="InvNo"
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
      field: <CheckBoxInForm label="Auto" name="RunNoType" disabled={!addMode && !copyMode} />,
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
          updateOtherField={[
            { key: "Company", optKey: "Company" },
            { key: "CreditTerm", optKey: "CreditTerm" },
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
      size: 1,
      name: "CreditTerm",
      field: (
        <DescInForm
          name="CreditTerm"
          InputProps={{
            readOnly: true,
          }}
        />
      ),
      style: { display: "none" },
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
      size: 2,
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
          label="Tax Invoice No."
          name="InvhTaxNo"
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
      field: <SelectInForm label="Tax Status" name="TaxType" options={VatTypeAR} />,
    },
    {
      size: 2,
      field: (
        <DateInForm
          label="Date"
          name="InvhDate"
          minDate={new Date(newClosePeriodAr)}
          minDateMessage={"Date must be more than close period"}
          required
        />
      ),
    },
    {
      size: 2,
      field: (
        <DateInForm
          label="Due Date"
          name="InvhDueDate"
          minDate={new Date(newClosePeriodAr)}
          minDateMessage={"Date must be more than close period"}
          required
        />
      ),
    },
    {
      size: 4,
      field: (
        <TextFieldInForm
          label="Description"
          name="InvhDesc"
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
      size: 4,
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

    {
      size: 2,
      field: (
        <TextFieldInForm style={{ marginTop: 8 }} label="GroupNo" name="GroupNo" variant="outlined" margin="dense" />
      ),
    },
    {
      size: 2,
      field: (
        <DateInForm
          label="Date"
          name="InvdDate"
          minDate={new Date(newClosePeriodAr)}
          minDateMessage={"Date must be more than close period"}
          required
        />
      ),
    },
    {
      size: 2,
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
          name="Unit"
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
          name="Qty"
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
          name="Price"
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
      field: <SelectInForm label="Tax Type 1" name="TaxType1" options={VatTypeOptions} />,
    },
    {
      size: 2,
      field: (
        <MuiAutosuggest
          label="Cr Acc (Tax1)"
          name="TaxAcc1"
          optKey="AccCode"
          optDesc="Description"
          options={lookupList["accountCodeList"]}
          updateOtherField={[{ key: "TaxAcc1Desc", optKey: "Description" }]}
        />
      ),
    },
    {
      size: 2,
      name: "TaxAcc1Desc",
      field: (
        <DescInForm
          style={{ marginTop: 8 }}
          name="TaxAcc1Desc"
          InputProps={{
            readOnly: true,
          }}
        />
      ),
    },
    {
      size: 2,
      field: <NumberFormatInForm label="Tax Rate 1" name="TaxRate1" decimal={SettingSystem.CurrencyBaseDecimal} />,
    },
    {
      size: 2,
      field: (
        <NumberFormatInForm
          label="* Tax Amount 1"
          name="TaxAmt1"
          rule={{
            required: {
              value: true,
              message: "* Required",
            },
          }}
          decimal={SettingSystem.CurrencyBaseDecimal}
        />
      ),
    },
    {
      size: 2,
      field: <CheckBoxInForm label="Overwrite" name="TaxOverwrite1" />,
    },
    {
      size: 2,
      field: <SelectInForm label="Tax Type 2" name="TaxType2" options={VatTypeOptions} />,
    },
    {
      size: 2,
      field: (
        <MuiAutosuggest
          label="Cr Acc (Tax2)"
          name="TaxAcc2"
          optKey="AccCode"
          optDesc="Description"
          options={lookupList["accountCodeList"]}
          updateOtherField={[{ key: "TaxAcc2Desc", optKey: "Description" }]}
        />
      ),
    },
    {
      size: 2,
      name: "TaxAcc2Desc",
      field: (
        <DescInForm
          //style={{ marginTop: 8 }}
          name="TaxAcc2Desc"
          InputProps={{
            readOnly: true,
          }}
        />
      ),
    },
    {
      size: 2,
      field: <NumberFormatInForm label="Tax Rate 2" name="TaxRate2" decimal={SettingSystem.CurrencyBaseDecimal} />,
    },
    {
      size: 2,
      field: <NumberFormatInForm label="Tax Amount 2" name="TaxAmt2" decimal={SettingSystem.CurrencyBaseDecimal} />,
    },
    {
      size: 2,
      field: <CheckBoxInForm label="Overwrite" name="TaxOverwrite2" />,
    },
  ];

  if (addMode) {
    return (
      <Create
        {...props}
        formFields={formFieldsEdit}
        formFieldsDetail={formFieldsDetail}
        arProfileList={lookupList["arProfileList"]}
        useStyles={useStyles}
      />
    );
  } else {
    return (
      <Edit
        {...props}
        copyMode={copyMode}
        formFields={formFieldsEdit}
        formFieldsDetail={formFieldsDetail}
        arProfileList={lookupList["arProfileList"]}
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
