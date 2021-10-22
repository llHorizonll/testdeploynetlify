import React, { useContext, useState, useEffect, useCallback } from "react";
import { GblContext } from "providers/formatter";
import { useAuthState, useRedirect } from "react-admin";
import { MuiAutosuggest, SelectInForm, DateInForm, DescInForm, NumberFormatInForm } from "components/Form";

import { getAccountCodeList, getDepartmentList } from "services/setting";

import { getAssetRegisterSearchList } from "services/asset";
import ModelUriQueryString from "models/uriQueryString";
import List from "./List";
import Show from "./Show";
import Edit from "./Edit";
import Create from "./Create";
import { DisposalTypeOptions } from "utils/options";
import { makeStyles } from "@material-ui/core/styles";
import { addDays } from "date-fns";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: 12,
    marginBottom: 12,
  },
  heading: {
    marginTop: 12,
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightBold,
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
  content: {
    padding: 0,
  },
}));

const ListMode = (props) => {
  const [openRegDialog, setOpenRegDialog] = useState(false);
  const redirect = useRedirect();
  const FncAddButton = () => {
    setOpenRegDialog(true);
  };

  const CloseRegisterDialog = (regId) => {
    setOpenRegDialog(false);
    if (regId) {
      localStorage.setItem("regId", regId);
      redirect(`create`, props.basePath);
    }
  };
  return <List {...props} open={openRegDialog} onClose={CloseRegisterDialog} FncAddButton={FncAddButton} />;
};

const ViewMode = (props) => {
  const [openRegDialog, setOpenRegDialog] = useState(false);
  const redirect = useRedirect();
  const FncAddButton = () => {
    setOpenRegDialog(true);
  };

  const CloseRegisterDialog = (regId) => {
    setOpenRegDialog(false);
    if (regId) {
      localStorage.setItem("regId", regId);
      redirect(`create`, props.basePath);
    }
  };
  return (
    <Show
      {...props}
      open={openRegDialog}
      onClose={CloseRegisterDialog}
      FncAddButton={FncAddButton}
      useStyles={useStyles}
    />
  );
};

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
    assetRegList: [],
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
  const fetchAssRegLookup = useCallback(async () => {
    ModelUriQueryString.Exclude = [
      "Barcode",
      "Spec",
      "SerialNo",
      "AstPhoto",
      "CurRate",
      "Qty",
      "Salvage",
      "InitAccu",
      "TotalCost",
      "Life",
      "LifeType",
      "RemainDay",
      "RemainNet",
      "RemainTotalCost",
      "DimList",
      "RemainInfo",
    ];
    const { Data } = await getAssetRegisterSearchList(ModelUriQueryString);
    setLookupList((state) => ({
      ...state,
      assetRegList: Data,
    }));
  }, []);

  useEffect(() => {
    if (authenticated) {
      fetchAccLookup();
      fetchDeptLookup();
      fetchAssRegLookup();
    }
  }, [authenticated, fetchAccLookup, fetchDeptLookup, fetchAssRegLookup]);

  const formFieldsDisposalCreate = [
    {
      size: 12,
      field: <SelectInForm label="Disposal Type" name="Type" options={DisposalTypeOptions} />,
    },
    {
      size: 12,
      field: (
        <DateInForm
          label="DisposalDate"
          name="DisposalDate"
          minDate={new Date(newClosePeriodAsset)}
          minDateMessage={"Date must be more than close period"}
          required
        />
      ),
    },
    {
      size: 12,
      field: (
        <NumberFormatInForm label="Amt/Unit" name="AstAmt" readOnly decimal={SettingSystem.CostPerUnitBaseDecimal} />
      ),
      style: { marginTop: -4 },
    },
    {
      size: 12,
      field: <NumberFormatInForm label="Qty" name="Qty" decimal={SettingSystem.BaseQtyDecimal} />,
      style: { marginTop: -4 },
    },
    {
      size: 12,
      field: (
        <NumberFormatInForm
          label="Total Asset Value"
          name="TotalCost"
          readOnly
          decimal={SettingSystem.CurrencyBaseDecimal}
        />
      ),
      style: { marginTop: -3 },
    },
  ];

  const formFieldsDisposalUpdate = [
    {
      size: 12,
      field: <SelectInForm label="Disposal Type" name="Type" options={DisposalTypeOptions} disabled />,
    },
    {
      size: 12,
      field: (
        <DateInForm
          label="DisposalDate"
          name="DisposalDate"
          minDate={new Date(newClosePeriodAsset)}
          minDateMessage={"Date must be more than close period"}
          disabled
        />
      ),
    },
    {
      size: 12,
      field: <NumberFormatInForm label="Amt/Unit" name="AstAmt" readOnly decimal={SettingSystem.CurrencyBaseDecimal} />,
      style: { marginTop: -4 },
    },
    {
      size: 12,
      field: <NumberFormatInForm label="Qty" name="Qty" decimal={0} />,
      style: { marginTop: -4 },
    },
    {
      size: 12,
      field: (
        <NumberFormatInForm
          label="Total Asset Value"
          name="TotalCost"
          readOnly
          decimal={SettingSystem.CurrencyBaseDecimal}
        />
      ),
      style: { marginTop: -3 },
    },
  ];

  const formFieldsSale = [
    {
      size: 12,
      field: <NumberFormatInForm label="Sale Amount" name="SaleAmt" decimal={SettingSystem.CurrencyBaseDecimal} />,
      style: { marginTop: -3 },
    },
    {
      size: 12,
      field: (
        <NumberFormatInForm
          label="Net Book Value"
          name="NetBook"
          readOnly
          decimal={SettingSystem.CurrencyBaseDecimal}
        />
      ),
      style: { marginTop: -3 },
    },
    {
      size: 12,
      field: (
        <NumberFormatInForm
          label="Gain/Loss Amount"
          name="GainLossAmt"
          readOnly
          decimal={SettingSystem.CurrencyBaseDecimal}
        />
      ),
      style: { marginTop: -3 },
    },
  ];

  const formFieldsAccount = [
    {
      size: 3,
      field: (
        <MuiAutosuggest
          label="GainLoss Dept."
          name="GainLostDeptCode"
          optKey="DeptCode"
          optDesc="Description"
          options={lookupList["departmentList"]}
          updateOtherField={[{ key: "AstGlDeptDesc", optKey: "Description" }]}
          clearable
        />
      ),
    },
    {
      size: 3,
      name: "AstGlDeptDesc",
      field: (
        <DescInForm
          name="AstGlDeptDesc"
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
          label="* Sale Dept."
          name="SaleDeptCode"
          optKey="DeptCode"
          optDesc="Description"
          options={lookupList["departmentList"]}
          updateOtherField={[{ key: "AstSaleDeptDesc", optKey: "Description" }]}
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
      name: "AstSaleDeptDesc",
      field: (
        <DescInForm
          name="AstSaleDeptDesc"
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
          label="GainLoss Account"
          name="GainLostAccCode"
          optKey="AccCode"
          optDesc="Description"
          options={lookupList["accountCodeList"]}
          updateOtherField={[{ key: "AstGlAccDesc", optKey: "Description" }]}
          clearable
        />
      ),
    },
    {
      size: 3,
      name: "AstGlAccDesc",
      field: (
        <DescInForm
          name="AstGlAccDesc"
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
          label="* Sale Account"
          name="SaleAccCode"
          optKey="AccCode"
          optDesc="Description"
          options={lookupList["accountCodeList"]}
          updateOtherField={[{ key: "AstSaleAccDesc", optKey: "Description" }]}
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
      name: "AstSaleAccDesc",
      field: (
        <DescInForm
          name="AstSaleAccDesc"
          InputProps={{
            readOnly: true,
          }}
        />
      ),
    },
  ];

  if (addMode) {
    let regId = localStorage.getItem("regId");
    return (
      <Create
        {...props}
        regId={regId ?? 0}
        formFieldsDisposal={formFieldsDisposalCreate}
        formFieldsSale={formFieldsSale}
        formFieldsAccount={formFieldsAccount}
        useStyles={useStyles}
      />
    );
  } else {
    return (
      <Edit
        {...props}
        formFieldsDisposal={formFieldsDisposalUpdate}
        formFieldsSale={formFieldsSale}
        formFieldsAccount={formFieldsAccount}
        useStyles={useStyles}
      />
    );
  }
};

export default {
  list: ListMode,
  show: ViewMode,
  edit: SwitchActionMode,
  create: SwitchActionMode,
};
