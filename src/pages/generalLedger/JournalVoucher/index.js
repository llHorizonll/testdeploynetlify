import React, { useContext, useState, useEffect, useCallback } from "react";
import { GblContext } from "providers/formatter";
import { useAuthState, withTranslate } from "react-admin";
import { TextFieldInForm, MuiAutosuggest, DateInForm, DescInForm, NumberFormatInForm } from "components/Form";
import { getGlPrefix } from "services/generalLedger";
import { getAccountCodeList, getDepartmentList, getCurrencyList } from "services/setting";
import List from "./List";
import Show from "./Show";
import Edit from "./Edit";
import Create from "./Create";
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
  divComment: {
    position: "relative",
    height: "20px",
    width: "140px",
  },
  parentStyle: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    boxSizing: "border-box",
    display: "block",
    width: "100%",
  },
  cellStyleEllipsis: {
    boxSizing: "border-box",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
}));

const SwitchActionMode = (props) => {
  const { translate } = props;
  const { authenticated } = useAuthState();
  const { settingAll } = useContext(GblContext);
  const { SettingClosePeriod, SettingSystem } = settingAll;
  const { ClosePeriodGl } = SettingClosePeriod;
  let newClosePeriodGl = addDays(new Date(ClosePeriodGl), 1);

  const addMode = props.location.pathname.search("create") !== -1;
  const viewMode = props.location.pathname.search("show") !== -1;

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
    if (authenticated && !viewMode) {
      fetchPrefixLookup();
      fetchAccLookup();
      fetchDeptLookup();
      fetchCurrencyLookup();
    }
  }, [authenticated, viewMode, fetchPrefixLookup, fetchAccLookup, fetchDeptLookup, fetchCurrencyLookup]);

  const labelList = {
    Prefix: translate("ra.fieldAbbr.prefix"),
    "Voucher No.": translate("ra.fieldAbbr.vouNo"),
    Date: translate("ra.fieldAbbr.date"),
    Description: translate("ra.fieldAbbr.desc"),
    Department: translate("ra.fieldAbbr.dept"),
    "Account #": translate("ra.fieldAbbr.account1"),
    Comment: translate("ra.fieldAbbr.comment"),
    Currency: translate("ra.fieldAbbr.currency"),
    Rate: translate("ra.fieldAbbr.rate"),
    Amount: translate("ra.fieldAbbr.amount"),
    Base: translate("ra.fieldAbbr.base"),
    "Dr.": translate("ra.fieldAbbr.dr"),
    "Cr.": translate("ra.fieldAbbr.cr"),
  };

  const formFieldsEdit = [
    {
      size: 2,
      field: (
        <MuiAutosuggest
          label={`* ${labelList["Prefix"]}`}
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
          // InputProps={{
          //   startAdornment: (
          //     <InputAdornment position="start">
          //       <IconButton
          //         size={"small"}
          //         onClick={() => console.log("opendialog")}
          //       >
          //         <AddIcon />
          //       </IconButton>
          //     </InputAdornment>
          //   ),
          // }}
        />
      ),
    },
    {
      size: 2,
      field: (
        <TextFieldInForm
          label={labelList["Voucher No."]}
          name="JvhNo"
          variant="outlined"
          margin="dense"
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
          label={labelList["Date"]}
          name="JvhDate"
          minDate={new Date(newClosePeriodGl)}
          minDateMessage={"Date must be more than close period"}
          required
        />
      ),
    },
    {
      size: 6,
      field: (
        <TextFieldInForm
          label={labelList["Description"]}
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

  const formFieldsDetail = [
    {
      size: 6,
      field: (
        <MuiAutosuggest
          label={`* ${labelList["Department"]}`}
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
          label={`* ${labelList["Account #"]}`}
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
          label={`${labelList["Comment"]}`}
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
          label={`* ${labelList["Currency"]}`}
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
          label={`* ${labelList["Rate"]}`}
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
          label={`* ${labelList["Amount"]} ${labelList["Dr."]}`}
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
          label={`* ${labelList["Amount"]} ${labelList["Cr."]}`}
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
          label={`* ${labelList["Base"]} ${labelList["Dr."]}`}
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
          label={`* ${labelList["Base"]} ${labelList["Cr."]}`}
          name="CrBase"
          readOnly={true}
          decimal={SettingSystem.CurrencyBaseDecimal}
        />
      ),
    },
  ];

  if (addMode) {
    let copyMode = localStorage.getItem("jvCopyMode") != null ? parseInt(localStorage.getItem("jvCopyMode")) : 0;
    let templateId = localStorage.getItem("templateId") != null ? parseInt(localStorage.getItem("templateId")) : 0;
    return (
      <Create
        {...props}
        copyMode={copyMode ?? 0}
        templateId={templateId ?? 0}
        formFields={formFieldsEdit}
        formFieldsDetail={formFieldsDetail}
        lookupList={lookupList}
        useStyles={useStyles}
      />
    );
  } else if (viewMode) {
    return <Show {...props} useStyles={useStyles} />;
  } else {
    return (
      <Edit
        {...props}
        formFields={formFieldsEdit}
        formFieldsDetail={formFieldsDetail}
        lookupList={lookupList}
        useStyles={useStyles}
      />
    );
  }
};

export default {
  list: withTranslate(List),
  show: withTranslate(SwitchActionMode),
  edit: withTranslate(SwitchActionMode),
  create: withTranslate(SwitchActionMode),
};
