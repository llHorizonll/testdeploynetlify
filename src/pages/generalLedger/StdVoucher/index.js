import React, { useContext, useState, useEffect, useCallback } from "react";
import { GblContext } from "providers/formatter";
import { useAuthState } from "react-admin";
import { TextFieldInForm, SelectInForm, DescInForm, MuiAutosuggest, NumberFormatInForm } from "components/Form";
import { getGlPrefix } from "services/generalLedger";
import { getAccountCodeList, getDepartmentList, getCurrencyList } from "services/setting";
import { makeStyles } from "@material-ui/core/styles";
import List from "./List";
import Show from "./Show";
import Edit from "./Edit";
import Create from "./Create";
import { PeriodList } from "utils/options";

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
}));

const SwitchActionMode = (props) => {
  const { authenticated } = useAuthState();
  const { settingAll } = useContext(GblContext);
  const { SettingSystem } = settingAll;
  const addMode = props.location.pathname.search("create") !== -1;
  const [lookupList, setLookupList] = useState({
    prefixList: [],
    accountCodeList: [],
    departmentList: [],
    currencyList: [],
  });
  const fetchPrefixLookup = useCallback(async () => {
    const { Data } = await getGlPrefix();
    setLookupList((state) => ({
      ...state,
      prefixList: Data,
    }));
  }, []);
  const fetchAccLookup = useCallback(async () => {
    const { Data } = await getAccountCodeList("Gl");
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

  useEffect(() => {
    if (authenticated) {
      fetchPrefixLookup();
      fetchAccLookup();
      fetchDeptLookup();
      fetchCurrencyLookup();
    }
  }, [authenticated, fetchPrefixLookup, fetchAccLookup, fetchDeptLookup, fetchCurrencyLookup]);

  const formFieldsEdit = [
    {
      size: 2,
      field: (
        <MuiAutosuggest
          label="* Prefix"
          name="Prefix"
          optKey="PrefixName"
          optDesc="Description"
          options={lookupList["prefixList"]}
          updateOtherField={[{ key: "PrefixDesc", optKey: "Description" }]}
          disabled={!addMode}
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
      field: <SelectInForm label="Type" name="Type" options={["Template", "Recurring"]} />,
    },
    {
      size: 8,
      field: (
        <TextFieldInForm
          label="Description"
          name="Description"
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

  const formFieldsRecurring = [
    {
      size: 2,
      field: <SelectInForm label="From" name="FJvhFrom" options={PeriodList()} />,
      style: { marginTop: -20 },
    },
    {
      size: 2,
      field: <SelectInForm label="To" name="FJvhTo" options={PeriodList()} />,
      style: { marginTop: -20 },
    },
    {
      size: 2,
      field: (
        <SelectInForm
          label="Recurring Every Period"
          name="FJvhFreq"
          options={["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]}
        />
      ),
      style: { marginTop: -20 },
    },
  ];

  const formFieldsDetail = [
    {
      size: 6,
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
      size: 6,
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
      field: (
        <MuiAutosuggest
          label="* Account #"
          name="AccCode"
          optKey="AccCode"
          optDesc="Description"
          options={lookupList["accountCodeList"]}
          updateOtherField={[{ key: "AccDesc", optKey: "Description" }]}
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
      size: 6,
      name: "AccDesc",
      field: (
        <DescInForm
          style={{ marginTop: 8 }}
          name="AccDesc"
          InputProps={{
            readOnly: true,
          }}
        />
      ),
    },
    {
      size: 12,
      field: (
        <TextFieldInForm
          label="Comment"
          name="Description"
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
      size: 6,
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
      size: 6,
      field: (
        <NumberFormatInForm
          label="* Amount Dr."
          name="DrAmount"
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
      size: 6,
      field: (
        <NumberFormatInForm
          label="* Amount Cr."
          name="CrAmount"
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
      size: 6,
      field: (
        <NumberFormatInForm
          label="Base Dr."
          name="DrBase"
          readOnly={true}
          decimal={SettingSystem.CurrencyBaseDecimal}
        />
      ),
    },
    {
      size: 6,
      field: (
        <NumberFormatInForm
          label="Base Cr."
          name="CrBase"
          readOnly={true}
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
        formFieldsDetail={formFieldsDetail}
        formFieldsRecurring={formFieldsRecurring}
        lookupList={lookupList}
        useStyles={useStyles}
      />
    );
  } else {
    return (
      <Edit
        {...props}
        formFields={formFieldsEdit}
        formFieldsDetail={formFieldsDetail}
        formFieldsRecurring={formFieldsRecurring}
        lookupList={lookupList}
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
