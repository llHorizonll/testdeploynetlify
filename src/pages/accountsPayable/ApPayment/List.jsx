/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useState, useEffect } from "react";
import { GblContext } from "providers/formatter";
import clsx from "clsx";
import { useRedirect } from "react-admin";
import { Loading, Error } from "react-admin";
import { makeStyles } from "@material-ui/core/styles";
import { Box, FormControl, Select, InputLabel, MenuItem, Chip } from "@material-ui/core";
import { getApPaymentSearchList } from "services/accountPayable";
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
}));

const List = (props) => {
  const classes = useStyles();
  const { basePath, permissions } = props;
  const { settingAll, DateToString, NumberFormat, ToMySqlDate } = useContext(GblContext);
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
  const [status, setStatus] = useState("Effective");
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
            Field: "PyhDate",
            Operator: ">=",
            Value: fromMySqlDate,
          },
          {
            AndOr: "And",
            Field: "PyhDate",
            Operator: "<=",
            Value: toMySqlDate,
          },
        ],
      },
    ];
    uriQueryString.WhereLikeFields = ["PyhDate", "VnCode", "VnName", "AppyCode", "PyhChqFr", "PyhDesc", "CurCode"];
    if (status !== "All") {
      let condition = uriQueryString.WhereGroupList[0].ConditionList.find((item) => item.Field === "PyhStatus");
      let checkStatus;
      if (status === "Effective") {
        checkStatus = "E";
      } else if (status === "Printed") {
        checkStatus = "P";
      } else {
        checkStatus = "V";
      }
      if (!condition) {
        uriQueryString.WhereGroupList[0].ConditionList.push({
          AndOr: "And",
          Field: "PyhStatus",
          Operator: "=",
          Value: checkStatus,
        });
      }
    }
  };

  const fetchSearchList = async (uriQueryString) => {
    setLoading(true);

    handleFilterList();

    uriQueryString.Exclude = ["Detail", "PayWht", "DimHList"];
    const { Data, Paging } = await getApPaymentSearchList(uriQueryString);
    if (Data) {
      setData(Data);
      setPaging(Paging);
      setUriQueryString(uriQueryString);
    } else {
      setData([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchSearchList(uriQueryString);
  }, [uriQueryString, filterDate, status]);

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
      name: "PyhSeq",
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
      name: "PyhDate",
      label: "Payment Date",
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
      name: "AppyCode",
      label: "Payment Type",
      options: {
        filter: true,
        sort: false,
      },
    },
    {
      name: "PyhChqFr",
      label: "Cheque No",
      options: {
        filter: true,
        sort: true,
      },
    },
    {
      name: "PyhDesc",
      label: "Description",
      options: {
        filter: true,
        sort: true,
      },
    },
    {
      name: "CurCode",
      label: "Currency",
      options: {
        filter: true,
        sort: true,
      },
    },
    {
      name: "CurRate",
      label: "Rate",
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
          return NumberFormat(value, "currency");
        },
      },
    },
    {
      name: "PyhAmt",
      label: "Total Amount",
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
      name: "PyhStatus",
      label: "Status",
      options: {
        filter: true,
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
          uriQueryString.WhereLikeFields = [
            "PyhDate",
            "VnCode",
            "VnName",
            "AppyCode",
            "PyhChqFr",
            "PyhDesc",
            "CurCode",
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
        <Box p={1} display="flex" alignItems="center">
          Payment Date
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
            label="To"
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
              <MenuItem value={"Effective"}>Effective</MenuItem>
              <MenuItem value={"Printed"}>Printed</MenuItem>
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
        permission={permissions.find((i) => i.Name === permissionName["AP.Payment"])}
      />
      <MUIDataTable
        title={"A/P Payment"}
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
