/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useState, useEffect } from "react";
import { GblContext } from "providers/formatter";
import clsx from "clsx";
import { useRedirect } from "react-admin";
import { Loading, Error } from "react-admin";
import { makeStyles } from "@material-ui/core/styles";
import { Box, FormControl, Select, InputLabel, MenuItem, Chip } from "@material-ui/core";
import { getArInvoiceSearchList } from "services/accountReceivable";
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
  const { settingAll, NumberFormat, DateToString, ToMySqlDate } = useContext(GblContext);
  const { SettingClosePeriod } = settingAll;
  const { ClosePeriodAr } = SettingClosePeriod;
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
    from: startOfMonth(addDays(new Date(ClosePeriodAr), 1)),
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
            Field: "InvhDate",
            Operator: ">=",
            Value: fromMySqlDate,
          },
          {
            AndOr: "And",
            Field: "InvhDate",
            Operator: "<=",
            Value: toMySqlDate,
          },
        ],
      },
    ];
    uriQueryString.WhereLikeFields = ["InvhDate", "InvNo", "ArNo", "FirstName", "LastName", "Company", "InvhStatus"];
    if (status !== "All") {
      let condition = uriQueryString.WhereGroupList[0].ConditionList.find((item) => item.Field === "InvhStatus");
      let checkStatus;
      if (status === "Effective") {
        checkStatus = "E";
      } else {
        checkStatus = "V";
      }
      if (!condition) {
        uriQueryString.WhereGroupList[0].ConditionList.push({
          AndOr: "And",
          Field: "InvhStatus",
          Operator: "=",
          Value: checkStatus,
        });
      }
    }
  };

  const fetchSearchList = async (uriQueryString) => {
    setLoading(true);

    handleFilterList();

    uriQueryString.Exclude = ["Detail", "UserModified"];
    const { Data, Paging } = await getArInvoiceSearchList(uriQueryString);
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
      name: "InvhSeq",
      label: " ",
      options: {
        filter: false,
        viewColumns: false,
        customBodyRender: (value) => {
          return (
            //add a href for click new tab
            <a href={`#${basePath}/${value}/show`}>
              <VisibilityIcon
                fontSize="small"
                color="primary"
                style={{ cursor: "pointer" }}
                onClick={() => redirect("show", basePath, value)}
              />
            </a>
          );
        },
      },
    },
    {
      name: "InvhDate",
      label: "Date",
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
      name: "InvhDueDate",
      label: "Due Date",
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
      name: "InvNo",
      label: "Invoice No.",
      options: {
        filter: false,
        sort: true,
      },
    },
    {
      name: "ArNo",
      label: "A/R No.",
      options: {
        filter: false,
        sort: true,
      },
    },
    {
      name: "FirstName",
      label: "First Name",
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: "LastName",
      label: "Last Name",
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: "Company",
      label: "Company",
      options: {
        filter: true,
        sort: false,
      },
    },
    {
      name: "InvhTotal",
      label: "Total",
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
      name: "InvhUnpaid",
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
        customBodyRender: (value) => {
          return NumberFormat(value);
        },
      },
    },
    {
      name: "InvhStatus",
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
            "VnCode",
            "VnName",
            "InvhDate",
            "InvhInvNo",
            "InvhDesc",
            "CurCode",
            "CurRate",
            "InvhTotalAmt",
            "InvhStatus",
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
          Date
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
        permission={permissions.find((i) => i.Name === permissionName["AR.Invoice"])}
      />
      <MUIDataTable
        title={"A/R Invoice"}
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
