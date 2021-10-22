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
  SwitchInForm,
} from "components/Form";

import {
  getAccountCodeList,
  getDepartmentList,
  getCurrencyList,
  getArPaymentTypeList,
  getUnitList,
} from "services/setting";
import { getArTitleList, getArTypeList, getArProjectList, getArOwnerList } from "services/accountReceivable";

import List from "./List";
import Show from "./Show";
import Edit from "./Edit";
import Create from "./Create";
import { VatTypeOptions } from "utils/options";
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
  borderTableTop: {
    borderTop: "1px solid rgba(224, 224, 224, 1)",
  },
  borderTable: {
    border: "1px solid rgba(224, 224, 224, 1)",
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightBold,
  },
  pdLeft0: {
    paddingLeft: 0,
  },
  content: {
    padding: 0,
  },
  drawerOpen: {
    marginRight: drawerWidth,
  },
  drawerClose: {
    marginRight: 54,
  },
}));

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
    arTitleList: [],
    arTypeList: [],
    arProjectList: [],
    arOwnerList: [],
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
  const fetchPaymentTypeLookup = useCallback(async () => {
    const { Data } = await getArPaymentTypeList();
    setLookupList((state) => ({
      ...state,
      arPaymentTypeList: Data,
    }));
  }, []);
  const fetchArTitleLookup = useCallback(async () => {
    const { Data } = await getArTitleList();
    setLookupList((state) => ({
      ...state,
      arTitleList: Data,
    }));
  }, []);
  const fetchArTypeLookup = useCallback(async () => {
    const { Data } = await getArTypeList();
    setLookupList((state) => ({
      ...state,
      arTypeList: Data,
    }));
  }, []);
  const fetchArProjectLookup = useCallback(async () => {
    const { Data } = await getArProjectList();
    setLookupList((state) => ({
      ...state,
      arProjectList: Data,
    }));
  }, []);
  const fetchArOwnerLookup = useCallback(async () => {
    const { Data } = await getArOwnerList();
    setLookupList((state) => ({
      ...state,
      arOwnerList: Data,
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
      fetchCurrencyLookup();
      fetchPaymentTypeLookup();
      fetchArTitleLookup();
      fetchArTypeLookup();
      fetchArProjectLookup();
      fetchArOwnerLookup();
      fetchUnitLookup();
    }
  }, [
    authenticated,
    fetchAccLookup,
    fetchDeptLookup,
    fetchCurrencyLookup,
    fetchPaymentTypeLookup,
    fetchArTitleLookup,
    fetchArTypeLookup,
    fetchArProjectLookup,
    fetchArOwnerLookup,
    fetchUnitLookup,
  ]);

  const formFieldsEdit = [
    {
      size: 2,
      field: (
        <TextFieldInForm
          label="* A/R No."
          name="ArNo"
          variant="outlined"
          margin="dense"
          rule={{
            required: {
              value: true,
              message: "* Required",
            },
            maxLength: {
              value: 20,
              message: "maximum length is 20",
            },
          }}
          disabled={!addMode}
        />
      ),
    },
    {
      size: 2,
      field: <DateInForm label="Register Date" name="RegDate" required />,
    },
    {
      size: 2,
      field: (
        <MuiAutosuggest
          label="Title"
          name="Title"
          optKey="ArTitleCode"
          optDesc="Description"
          options={lookupList["arTitleList"]}
        />
      ),
    },
    {
      size: 2,
      field: (
        <MuiAutosuggest
          label="* Type"
          name="ArType"
          optKey="ArTypeCode"
          optDesc="Description"
          options={lookupList["arTypeList"]}
          updateOtherField={[{ key: "ArTypeDesc", optKey: "Description" }]}
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
      name: "ArTypeDesc",
      field: (
        <DescInForm
          style={{ marginTop: 8 }}
          name="ArTypeDesc"
          InputProps={{
            readOnly: true,
          }}
        />
      ),
    },
    {
      size: 2,
      name: "Active",
      field: <SwitchInForm name="Active" defaultChecked />,
    },
    {
      size: 3,
      field: (
        <TextFieldInForm
          label="First Name"
          name="FirstName"
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
      size: 3,
      field: (
        <TextFieldInForm
          label="Last Name"
          name="LastName"
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
          label="Company Name"
          name="Company"
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

  const formFieldsInfo = [
    {
      size: 6,
      field: (
        <TextFieldInForm
          label="Position"
          name="Position"
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
      size: 3,
      field: (
        <TextFieldInForm
          label="Tel"
          name="Tel"
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
      size: 3,
      field: (
        <TextFieldInForm
          label="Fax"
          name="Fax"
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
      size: 3,
      field: (
        <TextFieldInForm
          label="Tax ID."
          name="TaxNo"
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
      size: 3,
      field: (
        <TextFieldInForm
          label="Email"
          name="Email"
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
          name="Remark"
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
          label="Address1"
          name="AddressInfo.Address1"
          variant="outlined"
          margin="dense"
          multiline
          rows={5}
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
          label="Address2"
          name="AddressInfo.Address2"
          variant="outlined"
          margin="dense"
          multiline
          rows={5}
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
          label="Address3"
          name="AddressInfo.Address3"
          variant="outlined"
          margin="dense"
          multiline
          rows={5}
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

  const formFieldsBilling = [
    {
      size: 2,
      field: <SelectInForm label="Billing To" name="Billto" options={["Address1", "Address2", "Address3"]} />,
    },
    {
      size: 2,
      field: (
        <SelectInForm
          label="Mailing To"
          name="Mailto"
          options={["Address1", "Address2", "Address3"]}
          defaultValue="Address1"
        />
      ),
    },
    {
      size: 3,
      field: (
        <SelectInForm
          label="Tax Invoice Address"
          name="Taxto"
          options={["Address1", "Address2", "Address3"]}
          defaultValue="Address1"
        />
      ),
    },
    {
      size: 4,
      field: <div></div>,
      implementation: "css",
      smDown: true,
      component: { Hidden },
    },
    {
      size: 2,
      field: (
        <MuiAutosuggest
          label="* Payment Type"
          name="PaymentCode"
          optKey="Code"
          optDesc="Desc"
          options={lookupList["arPaymentTypeList"]}
          updateOtherField={[{ key: "PaymentDesc", optKey: "Desc" }]}
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
      name: "PaymentDesc",
      field: (
        <DescInForm
          style={{ marginTop: 8 }}
          name="PaymentDesc"
          InputProps={{
            readOnly: true,
          }}
        />
      ),
    },
    {
      size: 2,
      field: <NumberFormatInForm label="Credit Limit" name="CreditLimit" decimal={SettingSystem.CurrencyBaseDecimal} />,
    },
    {
      size: 1,
      field: <div style={{ marginTop: 12 }}>THB</div>,
    },
    {
      size: 2,
      field: (
        <NumberFormatInForm
          label="Credit Term"
          name="CreditTerm"
          decimal={0}
          rule={{
            max: 999,
            maxLength: {
              value: 3,
              message: "maximum length is 3",
            },
          }}
        />
      ),
    },
    {
      size: 1,
      field: <div style={{ marginTop: 12 }}>Day</div>,
    },
  ];

  const formFieldsDetail = [
    {
      size: 2,
      field: (
        <TextFieldInForm
          label="* Contract No."
          name="ContractNo"
          variant="outlined"
          margin="dense"
          rule={{
            maxLength: {
              value: 30,
              message: "maximum length is 30",
            },
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
        <DateInForm
          label="StartDate"
          name="ConStart"
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
          label="EndDate"
          name="ConEnd"
          minDate={new Date(newClosePeriodAr)}
          customMinDate={"ConStart"}
          minDateMessage={"Date must be more than close period"}
          clearable
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
      name: "Active",
      field: <SwitchInForm name="Active" defaultChecked />,
    },
    {
      size: 2,
      field: (
        <MuiAutosuggest
          label="Owner"
          name="Owner"
          optKey="ArOwnerCode"
          optDesc="Description"
          options={lookupList["arOwnerList"]}
          updateOtherField={[{ key: "OwnerDesc", optKey: "Description" }]}
        />
      ),
    },
    {
      size: 2,
      name: "OwnerDesc",
      field: (
        <DescInForm
          style={{ marginTop: 8 }}
          name="OwnerDesc"
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
          label="Project"
          name="ProjectCode"
          optKey="ArPrjCode"
          optDesc="Description"
          options={lookupList["arProjectList"]}
          updateOtherField={[{ key: "ProjectDesc", optKey: "Description" }]}
        />
      ),
    },
    {
      size: 2,
      name: "ProjectDesc",
      field: (
        <DescInForm
          style={{ marginTop: 8 }}
          name="ProjectDesc"
          InputProps={{
            readOnly: true,
          }}
        />
      ),
    },
    {
      size: 2,
      field: (
        <NumberFormatInForm
          label="Charge Every Month"
          name="PeriodicMonth"
          decimal={0}
          rule={{
            min: {
              value: 1,
              message: "* Charge Every 1 - 12 Month",
            },
            max: {
              value: 12,
              message: "* Charge Every 1 - 12 Month",
            },
            maxLength: 2,
          }}
        />
      ),
    },
    {
      size: 12,
      field: <TextFieldInForm label="Description" name="ConHDesc" variant="outlined" margin="dense" />,
    },
  ];

  const formFieldsContractDetail = [
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
      field: <TextFieldInForm label="Comment" name="ConDDesc" variant="outlined" margin="dense" />,
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
              message: "*Required",
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
            min: {
              value: 1,
              message: "* Required",
            },
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
            min: {
              value: 1,
              message: "* Required",
            },
            required: {
              value: true,
              message: "* Required",
            },
          }}
          decimal={SettingSystem.CostPerUnitBaseDecimal}
        />
      ),
    },
    {
      size: 2,
      field: <SelectInForm label="Tax Type 1" name="TaxType1" options={VatTypeOptions} />,
    },
    {
      size: 2,
      field: (
        <MuiAutosuggest
          label="Dr Acc. Code (Tax1)"
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
          label="Tax Amount 1"
          name="TaxAmt1"
          rule={{
            required: {
              value: true,
              message: "*Required",
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
          label="Dr Acc. Code (Tax2)"
          name="TaxAcc2"
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
          style={{ marginTop: 8 }}
          name="DrAccTax2Desc"
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
      field: (
        <NumberFormatInForm
          label="Tax Amount 2"
          name="TaxAmt2"
          rule={{
            required: {
              value: true,
              message: "*Required",
            },
          }}
          decimal={SettingSystem.CurrencyBaseDecimal}
        />
      ),
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
        formFieldsInfo={formFieldsInfo}
        formFieldsBilling={formFieldsBilling}
        formFieldsDetail={formFieldsDetail}
        formFieldsContractDetail={formFieldsContractDetail}
        useStyles={useStyles}
      />
    );
  } else {
    return (
      <Edit
        {...props}
        formFields={formFieldsEdit}
        formFieldsInfo={formFieldsInfo}
        formFieldsBilling={formFieldsBilling}
        formFieldsDetail={formFieldsDetail}
        formFieldsContractDetail={formFieldsContractDetail}
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
