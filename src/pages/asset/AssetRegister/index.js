import React, { useContext, useState, useEffect, useCallback } from "react";
import { GblContext } from "providers/formatter";
import { useAuthState } from "react-admin";
import {
  TextFieldInForm,
  MuiAutosuggest,
  SelectInForm,
  DateInForm,
  DescInForm,
  NumberFormatInForm,
} from "components/Form";

import { getAstCategory, getAstDepartment, getAstLocation } from "services/asset";

import { getApVendorList } from "services/accountPayable";

import { getAccountCodeList, getDepartmentList, getCurrencyList, getUnitList } from "services/setting";

import List from "./List";
import Show from "./Show";
import Edit from "./Edit";
import Create from "./Create";
import { AssetLifeOptions } from "utils/options";
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
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightBold,
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
  const { ClosePeriodAsset } = SettingClosePeriod;
  let newClosePeriodAsset = addDays(new Date(ClosePeriodAsset), 1);
  const addMode = props.location.pathname.search("create") !== -1;
  const [lookupList, setLookupList] = useState({
    accountCodeList: [],
    departmentList: [],
    currencyList: [],
    vendorList: [],
    unitList: [],
    astCategoryList: [],
    astDepartmentList: [],
    astLocationList: [],
  });

  const fetchAccLookup = useCallback(async () => {
    const { Data } = await getAccountCodeList("Asset");
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
  const fetchUnitLookup = useCallback(async () => {
    const { Data } = await getUnitList();
    setLookupList((state) => ({
      ...state,
      unitList: Data,
    }));
  }, []);
  const fetchVendorLookup = useCallback(async () => {
    const { Data } = await getApVendorList();
    setLookupList((state) => ({
      ...state,
      vendorList: Data,
    }));
  }, []);

  const fetchAstCategoryLookup = useCallback(async () => {
    const { Data } = await getAstCategory();
    setLookupList((state) => ({
      ...state,
      astCategoryList: Data,
    }));
  }, []);

  const fetchAstDepartmentLookup = useCallback(async () => {
    const { Data } = await getAstDepartment();
    setLookupList((state) => ({
      ...state,
      astDepartmentList: Data,
    }));
  }, []);

  const fetchAstLocationLookup = useCallback(async () => {
    const { Data } = await getAstLocation();
    setLookupList((state) => ({
      ...state,
      astLocationList: Data,
    }));
  }, []);

  useEffect(() => {
    if (authenticated) {
      fetchAccLookup();
      fetchDeptLookup();
      fetchCurrencyLookup();
      fetchUnitLookup();
      fetchVendorLookup();
      fetchAstCategoryLookup();
      fetchAstDepartmentLookup();
      fetchAstLocationLookup();
    }
  }, [
    authenticated,
    fetchAccLookup,
    fetchDeptLookup,
    fetchCurrencyLookup,
    fetchUnitLookup,
    fetchVendorLookup,
    fetchAstCategoryLookup,
    fetchAstDepartmentLookup,
    fetchAstLocationLookup,
  ]);

  const formFieldsEdit = [
    {
      size: 3,
      field: (
        <TextFieldInForm
          label="* Asset No."
          name="Id"
          variant="outlined"
          margin="dense"
          disabled={!addMode}
          rule={{
            required: {
              value: true,
              message: "* Required",
            },
            maxLength: {
              value: 16,
              message: "maximum length is 16",
            },
          }}
        />
      ),
    },
    {
      size: 1,
      field: (
        <TextFieldInForm
          label=""
          name="No"
          variant="outlined"
          margin="dense"
          disabled={!addMode}
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
          label="* Asset Name"
          name="Name"
          variant="outlined"
          margin="dense"
          rule={{
            required: {
              value: true,
              message: "* Required",
            },
            maxLength: {
              value: 50,
              message: "maximum length is 50",
            },
          }}
        />
      ),
    },
    {
      size: 4,
      field: (
        <TextFieldInForm
          label="BarCode"
          name="Barcode"
          variant="outlined"
          margin="dense"
          rule={{
            maxLength: {
              value: 13,
              message: "maximum length is 13",
            },
          }}
        />
      ),
    },
    {
      size: 2,
      field: (
        <DateInForm
          label="* Input Date"
          name="InputDate"
          minDate={new Date(newClosePeriodAsset)}
          minDateMessage={"Date must be more than close period"}
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
        <DateInForm
          label="* Acquire Date"
          name="AcquireDate"
          minDate={new Date(newClosePeriodAsset)}
          customMinDate={"InputDate"}
          minDateMessage={"Date must be more than close period"}
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
        <MuiAutosuggest
          label="* Category"
          name="CategoryCode"
          optKey="CateCode"
          optDesc="Description"
          options={lookupList["astCategoryList"]}
          updateOtherField={[{ key: "AstCateDesc", optKey: "Description" }]}
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
      name: "AstCateDesc",
      field: (
        <DescInForm
          style={{ marginTop: 8 }}
          name="AstCateDesc"
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
          label="* Department"
          name="DepartmentCode"
          optKey="DepartmentCode"
          optDesc="Description"
          options={lookupList["astDepartmentList"]}
          updateOtherField={[{ key: "AstDeptDesc", optKey: "Description" }]}
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
      name: "AstDeptDesc",
      field: (
        <DescInForm
          style={{ marginTop: 8 }}
          name="AstDeptDesc"
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
          label="* Location"
          name="LocationCode"
          optKey="LocCode"
          optDesc="Description"
          options={lookupList["astLocationList"]}
          updateOtherField={[{ key: "AstLocDesc", optKey: "Description" }]}
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
      name: "AstLocDesc",
      field: (
        <DescInForm
          style={{ marginTop: 8 }}
          name="AstLocDesc"
          InputProps={{
            readOnly: true,
          }}
        />
      ),
    },
    {
      size: 2,
      field: (
        <DateInForm
          label="Transfer Date"
          name="TransferDate"
          minDate={new Date(newClosePeriodAsset)}
          minDateMessage={"Date must be more than close period"}
          required
        />
      ),
    },
    {
      size: 2,
      field: (
        <MuiAutosuggest
          label="Vendor"
          name="VnCode"
          optKey="VnCode"
          optDesc="VnName"
          options={lookupList["vendorList"]}
          updateOtherField={[{ key: "VnName", optKey: "VnName" }]}
        />
      ),
    },
    {
      size: 4,
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
        <TextFieldInForm
          label="Invoice No."
          name="InvoiceNo"
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
          label="Serial No."
          name="SerialNo"
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
      size: 3,
      field: (
        <TextFieldInForm
          label="Specification"
          name="Spec"
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
      size: 4,
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
  ];

  const formFieldsRegister = [
    {
      size: 3,
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
      size: 3,
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
      size: 3,
      field: (
        <NumberFormatInForm
          label="* Amount/Unit"
          name="Amount"
          rule={{
            required: {
              value: true,
              message: "* Required",
            },
            min: {
              value: true,
              message: "Amount must be more than zero",
            },
          }}
          decimal={SettingSystem.CostPerUnitBaseDecimal}
        />
      ),
    },
    {
      size: 3,
      field: (
        <NumberFormatInForm label="Base Amt." name="BaseAmount" readOnly decimal={SettingSystem.CurrencyBaseDecimal} />
      ),
    },
    {
      size: 3,
      field: (
        <MuiAutosuggest
          label="Unit"
          name="UnitCode"
          optKey="UnitCode"
          optDesc="Description"
          options={lookupList["unitList"]}
        />
      ),
    },
    {
      size: 3,
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
      size: 3,
      field: (
        <NumberFormatInForm
          label="* Salvage"
          name="Salvage"
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
      size: 3,
      field: (
        <NumberFormatInForm
          label="Total Salvage"
          name="TotalSalvage"
          readOnly
          decimal={SettingSystem.CurrencyBaseDecimal}
        />
      ),
    },
    {
      size: 2,
      field: <SelectInForm label="AssetLife" name="LifeType" options={AssetLifeOptions} />,
    },
    {
      size: 1,
      field: <NumberFormatInForm label="" name="Life" decimal={0} />,
    },
    {
      size: 3,
      field: (
        <NumberFormatInForm
          label="* Init Accu Depre"
          name="InitAccu"
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
      size: 3,
      field: (
        <NumberFormatInForm
          label="Net Book Value"
          name="RemainNet"
          readOnly
          decimal={SettingSystem.CurrencyBaseDecimal}
        />
      ),
    },
    {
      size: 3,
      field: (
        <NumberFormatInForm
          label="* Total Value"
          name="TotalCost"
          variant="outlined"
          margin="dense"
          readOnly
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
  ];

  const formFieldsRemainValue = [
    {
      size: 12,
      field: (
        <NumberFormatInForm label="Qty" name="RemainInfo.Qty" readOnly decimal={SettingSystem.CurrencyBaseDecimal} />
      ),
    },
    {
      size: 12,
      field: <NumberFormatInForm label="Life (Days)" name="RemainInfo.Life" readOnly decimal={0} />,
    },
    {
      size: 12,
      field: (
        <NumberFormatInForm
          label="Total Value"
          name="RemainInfo.TotalValue"
          readOnly
          decimal={SettingSystem.CurrencyBaseDecimal}
        />
      ),
    },
    {
      size: 12,
      field: (
        <NumberFormatInForm
          label="Accu. Depre"
          name="RemainInfo.AccuDepre"
          readOnly
          decimal={SettingSystem.CurrencyBaseDecimal}
        />
      ),
    },
    {
      size: 12,
      field: (
        <NumberFormatInForm
          label="Net Book Value"
          name="RemainInfo.NetBookValue"
          readOnly
          decimal={SettingSystem.CurrencyBaseDecimal}
        />
      ),
    },
  ];

  const formFieldsAccount = [
    {
      size: 2,
      field: (
        <MuiAutosuggest
          label="* Cost Dept."
          name="CostDeptCode"
          optKey="DeptCode"
          optDesc="Description"
          options={lookupList["departmentList"]}
          updateOtherField={[{ key: "CostDeptDesc", optKey: "Description" }]}
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
      name: "CostDeptDesc",
      field: (
        <DescInForm
          name="CostDeptDesc"
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
          label="* Accu Dept."
          name="AccuDeptCode"
          optKey="DeptCode"
          optDesc="Description"
          options={lookupList["departmentList"]}
          updateOtherField={[{ key: "AccuDeptDesc", optKey: "Description" }]}
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
      name: "AccuDeptDesc",
      field: (
        <DescInForm
          name="AccuDeptDesc"
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
          label="* Depre Dept."
          name="DepreDeptCode"
          optKey="DeptCode"
          optDesc="Description"
          options={lookupList["departmentList"]}
          updateOtherField={[{ key: "DepreDeptDesc", optKey: "Description" }]}
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
      name: "DepreDeptDesc",
      field: (
        <DescInForm
          name="DepreDeptDesc"
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
          label="* Cost Account"
          name="CostAccCode"
          optKey="AccCode"
          optDesc="Description"
          options={lookupList["accountCodeList"]}
          updateOtherField={[{ key: "CostAccDesc", optKey: "Description" }]}
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
      name: "CostAccDesc",
      field: (
        <DescInForm
          name="CostAccDesc"
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
          label="* Accu Account."
          name="AccuAccCode"
          optKey="AccCode"
          optDesc="Description"
          options={lookupList["accountCodeList"]}
          updateOtherField={[{ key: "AccuAccDesc", optKey: "Description" }]}
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
      name: "AccuAccDesc",
      field: (
        <DescInForm
          name="AccuAccDesc"
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
          label="* Depre Account."
          name="DepreAccCode"
          optKey="AccCode"
          optDesc="Description"
          options={lookupList["accountCodeList"]}
          updateOtherField={[{ key: "DepreAccDesc", optKey: "Description" }]}
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
      name: "DepreAccDesc",
      field: (
        <DescInForm
          name="DepreAccDesc"
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
        formFieldsRegister={formFieldsRegister}
        formFieldsAccount={formFieldsAccount}
        vendorLookup={lookupList["vendorList"]}
        useStyles={useStyles}
      />
    );
  } else {
    return (
      <Edit
        {...props}
        formFields={formFieldsEdit}
        formFieldsRegister={formFieldsRegister}
        formFieldsRemainValue={formFieldsRemainValue}
        formFieldsAccount={formFieldsAccount}
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
