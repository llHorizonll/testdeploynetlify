/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState } from "react";
import { Loading } from "react-admin";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import VisibilityIcon from "@material-ui/icons/Visibility";
import MUIDataTable from "mui-datatables";
import ActionMenu from "components/ActionMenu";
import DialogItem from "./Dialog/User";
import CustomTablePagination from "components/CustomTablePagination";
import { getUserSearchList } from "services/setting";
import ModelUriQueryString from "models/uriQueryString";

const useStyles = makeStyles((theme) => ({
  title: {
    padding: theme.spacing(2),
  },
  bullStatusActive: {
    height: 10,
    width: 10,
    backgroundColor: "green",
    borderRadius: "50%",
    display: "inline-block",
  },
  bullStatusInActive: {
    height: 10,
    width: 10,
    backgroundColor: "red",
    borderRadius: "50%",
    display: "inline-block",
  },
  tabPanel: { width: "100%" },
  button: { textTransform: "none" },
}));

const UserList = (props) => {
  const { children, value, index, ...other } = props;
  const classes = useStyles();
  const [loading, setLoading] = useState(true);
  const [Data, setData] = useState();
  const [Paging, setPaging] = useState();
  const [uriQueryString, setUriQueryString] = useState({
    Limit: ModelUriQueryString.Limit,
    Page: ModelUriQueryString.Page,
    OrderBy: ModelUriQueryString.OrderBy,
    WhereGroupList: ModelUriQueryString.WhereGroupList,
    Exclude: ModelUriQueryString.Exclude,
    WhereRaw: ModelUriQueryString.WhereRaw,
    WhereLike: ModelUriQueryString.WhereLike,
    WhereLikeFields: ModelUriQueryString.WhereLikeFields,
  });
  const [searchText, setSearchText] = useState();
  const [openDialog, setOpenDialog] = useState(false);
  const [mode, setMode] = useState("view");
  const [userName, setUserName] = useState("");

  const menuControlProp = [
    {
      name: "Add",
      fnc: () => {
        setUserName("");
        setMode("add");
        setOpenDialog(true);
      },
    },
  ];

  const handleModeView = (username) => {
    setUserName(username);
    setMode("view");
    setOpenDialog(true);
  };

  const handleCloseDialog = (value) => {
    setOpenDialog(false);
    if (typeof value === "number" || typeof value === "string") {
      if (mode === "add") {
        uriQueryString.OrderBy = { LastModified: "desc" };
        fetchSearchList(uriQueryString);
      } else {
        fetchSearchList(uriQueryString);
      }
    }
  };

  const fetchSearchList = async (uriQueryString) => {
    const { Data, Paging } = await getUserSearchList(uriQueryString);
    if (Data) {
      setData(Data);
      setPaging(Paging);
      setUriQueryString(uriQueryString);
    } else {
      setData([]);
    }
  };

  const handleRequestSort = (property, order) => {
    uriQueryString.OrderBy = { [property]: order };
    fetchSearchList(uriQueryString);
  };

  const handleChangePage = (e, newPage) => {
    uriQueryString.Page = newPage + 1;
    fetchSearchList(uriQueryString);
  };

  const handleChangeRowsPerPage = (e) => {
    let newRowsPerPage = parseInt(e.target.value);
    uriQueryString.Limit = newRowsPerPage;
    fetchSearchList(uriQueryString);
  };

  const handleTableChange = (action, tableState) => {
    if (action === "onSearchClose") {
      setSearchText();
      uriQueryString.WhereLike = "";
      fetchSearchList(uriQueryString);
    }
  };

  React.useEffect(() => {
    let mounted = true;
    if (value === index) {
      fetchSearchList(uriQueryString);
      if (mounted) {
        setLoading(false);
      }
    }
    return function cleanup() {
      mounted = false;
    };
  }, [value]);

  const columns = [
    {
      name: "UserId",
      label: " ",
      options: {
        filter: false,
        viewColumns: false,
        customBodyRender: (value, tableMeta) => {
          return (
            <>
              <VisibilityIcon
                fontSize="small"
                color="primary"
                style={{ cursor: "pointer" }}
                onClick={() => handleModeView(tableMeta.rowData[1])}
              />
            </>
          );
        },
      },
    },
    {
      name: "UserName",
      label: "Username",
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: "Email",
      label: "Email",
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: "Active",
      label: "Status",
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value) => {
          return (
            <>
              <span
                className={clsx({
                  [classes.bullStatusActive]: value,
                  [classes.bullStatusInActive]: !value,
                })}
              />
              {value ? " Active" : " In-Active"}
            </>
          );
        },
      },
    },
  ];

  const options = {
    filter: false, // show the filter icon in the toolbar (true by default)
    responsive: "standard",
    selectableRows: "none",
    serverSide: true,
    confirmFilters: true,
    searchText: searchText,
    searchProps: {
      onKeyUp: (e) => {
        if (e.keyCode === 13) {
          setSearchText(e.target.value);
          uriQueryString.WhereLike = `%${e.target.value}%`;
          uriQueryString.WhereLikeFields = ["Username", "Email"];
          fetchSearchList(uriQueryString);
        }
      },
    },
    onTableChange: (action, tableState) => handleTableChange(action, tableState),
    setTableProps: () => {
      return {
        size: "small",
      };
    },
    sortOrder: {
      name: Object.keys(uriQueryString.OrderBy)[0],
      direction: Object.values(uriQueryString.OrderBy)[0],
    },
    onColumnSortChange: (changedColumn, direction) => {
      handleRequestSort(changedColumn, direction);
    },
    customFooter: () => {
      return (
        <CustomTablePagination
          rowsPerPageOptions={[15, 50, 100]}
          component="div"
          count={Paging?.TotalRecordCount ?? 0}
          rowsPerPage={Paging?.Limit ?? 15}
          page={Paging?.Page ? Paging.Page - 1 : 0}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      );
    },
  };

  if (loading) return <Loading />;
  if (!Data) return null;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
      className={classes.tabPanel}
    >
      <ActionMenu menuControl={menuControlProp} />

      {Data && <MUIDataTable title={`Users`} data={Data} columns={columns} options={options} />}
      {openDialog && (
        <DialogItem username={userName} mode={mode} setMode={setMode} open={openDialog} onClose={handleCloseDialog} />
      )}
    </div>
  );
};

export default UserList;
