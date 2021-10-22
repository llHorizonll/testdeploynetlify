/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useState, useEffect } from "react";
import { GblContext } from "providers/formatter";
import { useRedirect } from "react-admin";
import { Loading, Error } from "react-admin";
import { makeStyles } from "@material-ui/core/styles";
import { Box, Select, MenuItem } from "@material-ui/core";
import { getApInvoiceSearchList } from "services/accountPayable";
import MUIDataTable from "mui-datatables";
import ActionMenu from "components/ActionMenu";
import CustomTablePagination from "components/CustomTablePagination";
import DatePickerFormat from "components/DatePickerFormat";
import VisibilityIcon from "@material-ui/icons/Visibility";
import { permissionName } from "utils/constants";
import { addDays, startOfMonth } from "date-fns";
import ModelUriQueryString from "models/uriQueryString";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  divComment: {
    position: "relative",
    height: "20px",
    width: "50vw",
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
  const { settingAll, NumberFormat, DateToString, ToMySqlDate } = useContext(GblContext);
  const { SettingClosePeriod } = settingAll;
  const { ClosePeriodAp } = SettingClosePeriod;
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
  const [optionDate, setOptionDate] = useState("Input Date");
  const [filterDate, setFilterDate] = useState({
    from: startOfMonth(addDays(new Date(ClosePeriodAp), 1)),
    to: new Date(),
  });

  const redirect = useRedirect();

  const handleFilterList = () => {
    let fromMySqlDate = ToMySqlDate(filterDate.from);
    let toMySqlDate = ToMySqlDate(addDays(filterDate.to, 1));
    uriQueryString.WhereGroupList = [
      {
        AndOr: "And",
        ConditionList: [
          {
            AndOr: "And",
            Field: optionDate === "Input Date" ? "InvhDate" : "InvhInvDate",
            Operator: ">=",
            Value: fromMySqlDate,
          },
          {
            AndOr: "And",
            Field: optionDate === "Input Date" ? "InvhDate" : "InvhInvDate",
            Operator: "<=",
            Value: toMySqlDate,
          },
        ],
      },
    ];
    uriQueryString.WhereLikeFields = [
      "VnCode",
      "VnName",
      "InvhDate",
      "InvhInvDate",
      "InvhInvNo",
      "InvhDesc",
      "CurCode",
      "CurRate",
      "InvhTotalAmt",
    ];
  };

  const fetchSearchList = async (uriQueryString, mounted = true) => {
    handleFilterList();
    uriQueryString.Exclude = ["Detail", "InvWht", "DimHList"];
    const { Data, Paging } = await getApInvoiceSearchList(uriQueryString);
    if (Data) {
      setData(Data);
      setPaging(Paging);
      setUriQueryString(uriQueryString);
      localStorage.removeItem("IsSettled");
    } else {
      setData([]);
    }

    if (mounted) {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    fetchSearchList(uriQueryString, mounted);
    return function cleanup() {
      mounted = false;
    };
  }, [uriQueryString, filterDate, optionDate]);

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
      name: "InvhSeq",
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
      name: "InvhDate",
      label: "Input Date",
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value) => {
          let v = new Date(value);
          return DateToString(v ?? new Date());
        },
      },
    },
    {
      name: "VnCode",
      label: "Vendor",
      options: {
        filter: true,
        sort: true,
      },
    },
    {
      name: "VnName",
      label: "Vendor Name",
      options: {
        filter: true,
        sort: true,
      },
    },
    {
      name: "InvhInvNo",
      label: "INV. No.",
      options: {
        filter: true,
        sort: false,
      },
    },
    {
      name: "InvhInvDate",
      label: "INV. Date",
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value) => {
          let v = new Date(value);
          return DateToString(v ?? new Date());
        },
      },
    },
    // {
    //   name: "InvhTInvNo",
    //   label: "Tax INV. No.",
    //   options: {
    //     filter: true,
    //     sort: true,
    //   },
    // },
    // {
    //   name: "InvhTInvDt",
    //   label: "Tax INV. Date",
    //   options: {
    //     filter: true,
    //     sort: true,
    //     customBodyRender: (value) => {
    //       let v = new Date(value);
    //       return DateToString(v ?? new Date());
    //     },
    //   },
    // },
    {
      name: "InvhDesc",
      label: "Description",
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: "InvhTotalAmt",
      label: "Amount",
      options: {
        filter: false,
        sort: false,
        setCellHeaderProps: () => ({
          align: "right",
        }),
        setCellProps: () => ({
          style: {
            textAlign: "right",
          },
        }),
        customBodyRender: (value) => {
          return NumberFormat(value);
        },
      },
    },
    {
      name: "SumPaid",
      label: "Unpaid",
      options: {
        filter: false,
        sort: false,
        setCellHeaderProps: () => ({
          align: "right",
        }),
        setCellProps: () => ({
          style: {
            textAlign: "right",
          },
        }),
        customBodyRender: (value, tableMeta) => {
          return NumberFormat(tableMeta.rowData[7] - tableMeta.rowData[8]);
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
          uriQueryString.WhereLikeFields = [
            "VnCode",
            "VnName",
            "InvhInvNo",
            "InvhDate",
            "InvhDesc",
            "CurCode",
            "CurRate",
            "InvhTotalAmt",
          ];
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
    return (
      <Box display="flex">
        <Box p={1}>
          <Select
            labelId="demo-simple-select-bu"
            id="demo-simple-select"
            variant="outlined"
            margin="dense"
            value={optionDate}
            defaultValue={optionDate}
            onChange={(e) => {
              setOptionDate(e.target.value);
            }}
          >
            {["Invoice Date", "Input Date"].map((item, idx) => (
              <MenuItem key={idx} value={item}>
                {item}
              </MenuItem>
            ))}
          </Select>
        </Box>
        <Box p={1}>
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
        </Box>
      </Box>
    );
  };

  return (
    <div className={classes.root}>
      <ActionMenu
        menuControl={menuControlProp}
        permission={permissions.find((i) => i.Name === permissionName["AP.Invoice"])}
      />
      <MUIDataTable
        title={"A/P Invoice"}
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
