/* eslint-disable eqeqeq */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useState, useEffect } from "react";
import { GblContext } from "providers/formatter";
import clsx from "clsx";
import { useRedirect, Loading, Error } from "react-admin";
import { makeStyles } from "@material-ui/core/styles";
import { Box, FormControl, Select, InputLabel, MenuItem, Chip } from "@material-ui/core";
import DatePickerFormat from "components/DatePickerFormat";
import { getJvList, getGlPrefixSearchList } from "services/generalLedger";
import MUIDataTable from "mui-datatables";
import ActionMenu from "components/ActionMenu";
import CustomTablePagination from "components/CustomTablePagination";
import VisibilityIcon from "@material-ui/icons/Visibility";
import { permissionName } from "utils/constants";
import { addDays, startOfMonth, endOfMonth } from "date-fns";
import ModelUriQueryString from "models/uriQueryString";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  statusDraft: {
    backgroundColor: theme.palette.grey,
    color: theme.palette.text.primary,
  },
  statusNormal: {
    backgroundColor: "#2196f3",
    color: "white",
  },
  statusVoid: {
    backgroundColor: "#e57373",
    color: "white",
  },
  divComment: {
    position: "relative",
    height: "20px",
    width: "40vw",
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

const List = (props) => {
  const classes = useStyles();
  const { basePath, permissions } = props;
  const { settingAll, DateToString, ToMySqlDate } = useContext(GblContext);
  const { SettingClosePeriod } = settingAll;
  const { ClosePeriodGl } = SettingClosePeriod;
  const [prefixList, setPrefixList] = useState();
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
  const [loading, setLoading] = useState(true);
  const [error] = useState();
  const [mode, setMode] = useState("Open Period");
  const [status, setStatus] = useState("Normal");
  const [prefix, setPrefix] = useState("All");
  const [filterDate, setFilterDate] = useState({
    from: startOfMonth(addDays(new Date(ClosePeriodGl), 1)),
    to: endOfMonth(new Date()),
  });

  const redirect = useRedirect();

  const handleFilterList = () => {
    let currentGl = addDays(new Date(ClosePeriodGl), 1);
    let mySqlDate = ToMySqlDate(currentGl);
    switch (mode) {
      case "Open Period":
        let whereGroupList = [
          {
            AndOr: "And",
            ConditionList: [
              {
                AndOr: "And",
                Field: "JvhDate",
                Operator: ">=",
                Value: mySqlDate,
              },
            ],
          },
        ];
        uriQueryString.WhereGroupList = whereGroupList;
        break;
      case "Period Date":
        let fromMySqlDate = ToMySqlDate(filterDate.from);
        let toMySqlDate = ToMySqlDate(addDays(filterDate.to, 1));
        let whereGroupList2 = [
          {
            AndOr: "And",
            ConditionList: [
              {
                AndOr: "And",
                Field: "JvhDate",
                Operator: ">=",
                Value: fromMySqlDate,
              },
              {
                AndOr: "And",
                Field: "JvhDate",
                Operator: "<=",
                Value: toMySqlDate,
              },
            ],
          },
        ];
        uriQueryString.WhereGroupList = whereGroupList2;
        break;
      default:
        uriQueryString.WhereGroupList = [
          {
            AndOr: "And",
            ConditionList: [],
          },
        ];
        break;
    }
    if (status !== "All") {
      let condition = uriQueryString.WhereGroupList[0].ConditionList.find((item) => item.Field === "Status");
      if (!condition) {
        uriQueryString.WhereGroupList[0].ConditionList.push({
          AndOr: "And",
          Field: "Status",
          Operator: "=",
          Value: status === "Normal" ? 1 : 9,
        });
      }
    }
    if (prefix !== "All") {
      let condition = uriQueryString.WhereGroupList[0].ConditionList.find((item) => item.Field === "Prefix");
      if (!condition) {
        uriQueryString.WhereGroupList[0].ConditionList.push({
          AndOr: "And",
          Field: "Prefix",
          Operator: "=",
          Value: prefix,
        });
      }
    }
  };

  const fetchSearchList = async (uriQueryString) => {
    setLoading(true);

    handleFilterList();

    uriQueryString.Exclude = ["Detail", "DimHList"];
    const { Data, Paging } = await getJvList(uriQueryString);
    if (Data) {
      setData(Data);
      setPaging(Paging);
      setUriQueryString(uriQueryString);
    } else {
      setData([]);
    }
    setLoading(false);
  };

  const fetchPrefixLookup = async () => {
    const { Data } = await getGlPrefixSearchList({ Limit: 200, OrderBy: { PrefixName: "asc" } });
    setPrefixList(Data);
  };

  useEffect(() => {
    fetchPrefixLookup();
  }, []);

  useEffect(() => {
    fetchSearchList(uriQueryString);
  }, [mode, filterDate, status, prefix]);

  const handleRequestSort = (property, order) => {
    uriQueryString.OrderBy = { [property]: order };
    fetchSearchList(uriQueryString);
  };

  if (loading) return <Loading />;
  if (error) return <Error />;
  if (!Data) return null;

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

  const columns = [
    {
      name: "JvhSeq",
      label: " ",
      options: {
        filter: false,
        viewColumns: false,
        customBodyRender: (value) => {
          return (
            <>
              <VisibilityIcon
                fontSize="small"
                color="primary"
                style={{ cursor: "pointer" }}
                onClick={() => redirect("show", basePath, value)}
              />
            </>
          );
        },
      },
    },
    {
      name: "JvhDate",
      label: "Date",
      options: {
        filter: false,
        sort: true,
        customBodyRender: (value) => {
          let v = new Date(value);
          return DateToString(v ?? new Date());
        },
      },
    },
    {
      name: "Prefix",
      label: "Prefix",
      options: {
        filter: true,
        filterList: [],
        filterOptions: {
          names: ["JV", "AR", "AC"],
        },
        sort: true,
      },
    },
    {
      name: "JvhNo",
      label: "J.v. No.",
      options: {
        filter: false,
        sort: true,
      },
    },
    {
      name: "Description",
      label: "Description",
      options: {
        filter: false,
        sort: false,
        customBodyRender: (val) => {
          return (
            <div className={classes.divComment}>
              <div className={classes.parentStyle}>
                <div className={classes.cellStyleEllipsis}>{val}</div>
              </div>
            </div>
          );
        },
      },
    },
    {
      name: "JvhSource",
      label: "Source",
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: "Status",
      label: "Status",
      options: {
        filter: true,
        filterList: ["Normal"],
        filterOptions: {
          names: ["Normal", "Void"],
        },
        sort: true,
        customBodyRender: (value) => {
          return (
            <Chip
              label={value}
              size="small"
              className={clsx(classes.statusDraft, {
                [classes.statusNormal]: value === "Normal",
                [classes.statusVoid]: value === "Void",
              })}
            />
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
          uriQueryString.WhereLikeFields = ["Prefix", "JvhNo", "JvhDesc", "concat(Prefix, JvhNo)"];
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

  const menuControlProp = [{ name: "Add", fnc: () => redirect("create", basePath) }];

  const CustomFilterList = () => {
    let currentGl = addDays(new Date(ClosePeriodGl), 1);
    let oPrefixList = prefixList?.map((item) => item.PrefixName) ?? [];

    return (
      <Box display="flex">
        <Box p={1}>
          <FormControl variant="outlined">
            <InputLabel id="prefix">Prefix</InputLabel>
            <Select
              variant="outlined"
              margin="dense"
              labelId="prefix"
              label="Prefix"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              style={{ width: 160 }}
            >
              <MenuItem value="All">All</MenuItem>
              {oPrefixList
                ? oPrefixList.map((item, idx) => (
                    <MenuItem key={idx} value={item}>
                      {item}
                    </MenuItem>
                  ))
                : ""}
            </Select>
          </FormControl>
        </Box>
        <Box p={1}>
          <FormControl variant="outlined">
            <InputLabel id="viewMode">View</InputLabel>
            <Select
              variant="outlined"
              margin="dense"
              labelId="viewMode"
              label="View"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              style={{ width: 160 }}
            >
              <MenuItem value={"All"}>All</MenuItem>
              <MenuItem value={"Open Period"}>Open Period</MenuItem>
              <MenuItem value={"Period Date"}>Period Date</MenuItem>
            </Select>
          </FormControl>
          {mode === "Open Period" ? (
            <FormControl variant="outlined" style={{ margin: 8 }}>
              {DateToString(currentGl)}
            </FormControl>
          ) : (
            ""
          )}
          {mode === "Period Date" ? (
            <>
              <DatePickerFormat
                label="From"
                value={filterDate.from}
                onChange={(e) => {
                  setFilterDate((state) => ({
                    ...state,
                    from: e,
                  }));
                }}
                style={{ width: 160, margin: "0 10px" }}
              />
              <DatePickerFormat
                label="to"
                value={filterDate.to}
                onChange={(e) => {
                  setFilterDate((state) => ({
                    ...state,
                    to: e,
                  }));
                }}
                style={{ width: 160, margin: "0 10px" }}
              />
            </>
          ) : (
            ""
          )}
        </Box>
        <Box p={1}>
          <FormControl variant="outlined">
            <InputLabel id="status">Status</InputLabel>
            <Select
              variant="outlined"
              margin="dense"
              labelId="status"
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{ width: 160 }}
            >
              <MenuItem value={"All"}>All</MenuItem>
              <MenuItem value={"Normal"}>Normal</MenuItem>
              <MenuItem value={"Void"}>Void</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
    );
  };

  return (
    <div className={classes.root}>
      <ActionMenu
        menuControl={menuControlProp}
        permission={permissions.find((i) => i.Name === permissionName["GL.Jv"])}
      />
      <MUIDataTable
        title={"Journal Voucher"}
        data={Data}
        columns={columns}
        options={options}
        components={{
          TableFilterList: CustomFilterList,
        }}
      />
    </div>
  );
};

export default List;
