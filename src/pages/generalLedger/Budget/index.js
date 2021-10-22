import React, { useState, useEffect, useCallback } from "react";
import { useAuthState } from "react-admin";
import { MuiAutosuggest, DescInForm } from "components/Form";
import { getAccountCodeList, getDepartmentList } from "services/setting";
import List from "./List";
import Show from "./Show";
import Edit from "./Edit";
import Create from "./Create";
import { makeStyles } from "@material-ui/core/styles";

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
  pdrTextFooter: {
    paddingRight: "10px !important",
  },
  flexRightSide: {
    display: "flex",
    justifyContent: "flex-end",
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
  const addMode = props.location.pathname.search("create") !== -1;
  const [lookupList, setLookupList] = useState({
    accountCode: [],
    department: [],
  });
  const fetchAccLookup = useCallback(async () => {
    const { Data } = await getAccountCodeList("Gl");
    setLookupList((state) => ({
      ...state,
      accountCode: Data,
    }));
  }, []);
  const fetchDeptLookup = useCallback(async () => {
    const { Data } = await getDepartmentList();
    setLookupList((state) => ({
      ...state,
      department: Data,
    }));
  }, []);

  useEffect(() => {
    if (authenticated) {
      fetchAccLookup();
      fetchDeptLookup();
    }
  }, [authenticated, fetchAccLookup, fetchDeptLookup]);

  const formFieldsEdit = [
    {
      size: 2,
      field: (
        <MuiAutosuggest
          label="* Department"
          name="DeptCode"
          optKey="DeptCode"
          optDesc="Description"
          options={lookupList["department"]}
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
      size: 2,
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
      size: 2,
      field: (
        <MuiAutosuggest
          label="* Account #"
          name="AccCode"
          optKey="AccCode"
          optDesc="Description"
          options={lookupList["accountCode"]}
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
      size: 2,
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
  ];

  if (addMode) {
    return <Create {...props} formFields={formFieldsEdit} lookupList={lookupList} useStyles={useStyles} />;
  } else {
    return <Edit {...props} formFields={formFieldsEdit} lookupList={lookupList} useStyles={useStyles} />;
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
