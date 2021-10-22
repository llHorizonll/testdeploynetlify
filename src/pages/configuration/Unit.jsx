/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import MUIDataTable from "mui-datatables";
import ActionMenu from "components/ActionMenu";
import DialogItem from "./Dialog/Unit";
import CustomTablePagination from "components/CustomTablePagination";
import VisibilityIcon from "@material-ui/icons/Visibility";
import { getUnitSearchList } from "services/setting";
import ModelUriQueryString from "models/uriQueryString";

const useStyles = makeStyles((theme) => ({
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
  tabPanel: { width: "100%", margin: "0 20px" },
  button: { textTransform: "none" },
}));

const Unit = (props) => {
  const { children, value, index, ...other } = props;
  const classes = useStyles();
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
  const [itemId, setItemId] = useState(0);

  const handleModeView = (id) => {
    setItemId(id);
    setMode("view");
    setOpenDialog(true);
  };
  const handleCloseDialog = (value) => {
    setOpenDialog(false);
    if (typeof value === "number") {
      if (mode === "add") {
        uriQueryString.OrderBy = { LastModified: "desc" };
        fetchSearchList(uriQueryString);
      } else {
        fetchSearchList(uriQueryString);
      }
    }
  };

  const fetchSearchList = async (uriQueryString) => {
    const { Data, Paging } = await getUnitSearchList(uriQueryString);
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
    if (value === index) {
      fetchSearchList(uriQueryString);
    }
  }, [value]);

  const columns = [
    {
      name: "Id",
      label: " ",
      options: {
        filter: false,
        sort: false,
        viewColumns: false,
        customBodyRender: (value) => {
          return (
            <VisibilityIcon
              fontSize="small"
              color="primary"
              style={{ cursor: "pointer" }}
              onClick={() => handleModeView(value)}
            />
          );
        },
      },
    },
    {
      name: "UnitCode",
      label: "Code",
      options: {
        filter: true,
        sort: true,
      },
    },
    {
      name: "Description",
      label: "Description",
      options: {
        filter: true,
        sort: true,
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
          uriQueryString.WhereLikeFields = ["UnitCode", "UnitDesc"];
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

  const menuControlProp = [
    {
      name: "Add",
      fnc: () => {
        setItemId(0);
        setMode("add");
        setOpenDialog(true);
      },
    },
  ];

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
      className={classes.tabPanel}
    >
      {value === index && (
        <>
          <ActionMenu menuControl={menuControlProp} />
          <MUIDataTable title={"Unit"} data={Data} columns={columns} options={options} />
          {openDialog && (
            <DialogItem id={itemId} mode={mode} setMode={setMode} open={openDialog} onClose={handleCloseDialog} />
          )}
        </>
      )}
    </div>
  );
};

export default Unit;
