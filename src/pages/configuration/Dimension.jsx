/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import Typography from "@material-ui/core/Typography";
import MUIDataTable from "mui-datatables";
import ActionMenu from "components/ActionMenu";
import DialogItem from "./Dialog/Dimension";
import CustomTablePagination from "components/CustomTablePagination";
import VisibilityIcon from "@material-ui/icons/Visibility";
import { getDimensionSearchList } from "services/setting";
import { getDimensionModuleList } from "services/dimension";
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

const Dimension = (props) => {
  const { children, value, index, ...other } = props;
  const classes = useStyles();
  const [moduleList, setModuleList] = useState([]);
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
    const r = await getDimensionModuleList();
    if (r) {
      var arr = [];
      Object.entries(r).forEach(([key, value]) => {
        arr.push({
          key: key,
          value: value,
        });
      });
      setModuleList(arr);
    }
    const { Data, Paging } = await getDimensionSearchList(uriQueryString);
    if (Data) {
      Data.forEach((item) => {
        let tmp = [];
        item.Module.forEach((ii) => tmp.push(arr.find((i) => i.key === ii)));
        let displayModule = tmp.map((iii) => iii.value).join();
        item.DisplayModule = displayModule;
      });

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
      name: "Caption",
      label: "Caption",
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <Typography variant="body2" component={"span"} noWrap={true}>
              {value}
            </Typography>
          );
        },
      },
    },
    {
      name: "Type",
      label: "Type",
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: "DisplayModule",
      label: "Module",
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value) => {
          //console.log(value, moduleList);
          return <>{value}</>;
        },
      },
    },
    {
      name: "Value",
      label: "Default Value",
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
          uriQueryString.WhereLikeFields = ["AppyCode", "AppyDesc"];
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
        console.log("in");
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
          {/* FIXME: wait for fix select module */}
          <ActionMenu menuControl={menuControlProp} />
          <MUIDataTable title={"Dimension"} data={Data} columns={columns} options={options} />
          {openDialog && (
            <DialogItem
              id={itemId}
              mode={mode}
              setMode={setMode}
              moduleList={moduleList}
              open={openDialog}
              onClose={handleCloseDialog}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Dimension;
