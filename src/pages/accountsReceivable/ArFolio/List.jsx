/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useState, useEffect } from "react";
import { GblContext } from "providers/formatter";
import { Loading, Error } from "react-admin";
import { makeStyles } from "@material-ui/core/styles";
import { Box } from "@material-ui/core";
import { getArFolioSearchList } from "services/accountReceivable";
import MUIDataTable from "mui-datatables";
import CustomTablePagination from "components/CustomTablePagination";
import DatePickerFormat from "components/DatePickerFormat";
import { addDays, startOfMonth } from "date-fns";
import ModelUriQueryString from "models/uriQueryString";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
}));

const List = () => {
  const classes = useStyles();
  const { settingAll, DateToString, ToMySqlDate, NumberFormat } = useContext(GblContext);
  const { ClosePeriodAr } = settingAll.SettingClosePeriod;
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
  const [filterDate, setFilterDate] = useState({
    from: startOfMonth(addDays(new Date(ClosePeriodAr), 1)),
    to: new Date(),
  });

  const handleFilterList = () => {
    let fromMySqlDate = ToMySqlDate(filterDate.from);
    let toMySqlDate = ToMySqlDate(addDays(filterDate.to, 1));
    uriQueryString.WhereGroupList = [
      {
        AndOr: "And",
        ConditionList: [
          {
            AndOr: "And",
            Field: "FolioDate",
            Operator: ">=",
            Value: fromMySqlDate,
          },
          {
            AndOr: "And",
            Field: "FolioDate",
            Operator: "<=",
            Value: toMySqlDate,
          },
        ],
      },
    ];
    uriQueryString.WhereLikeFields = ["FolioNo", "GuestNo", "FolioDate", "ArNo", "Description", "Remark", "Source"];
  };

  const fetchSearchList = async (uriQueryString) => {
    setLoading(true);

    handleFilterList();

    uriQueryString.Exclude = ["UserModified"];
    const { Data, Paging } = await getArFolioSearchList(uriQueryString);
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
  }, [uriQueryString, filterDate]);

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
      name: "PfmSeq",
      label: " ",
      options: {
        filter: false,
        viewColumns: false,
        display: false,
      },
    },
    {
      name: "FolioDate",
      label: "Folio Date",
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
      name: "FolioNo",
      label: "Folio No.",
      options: {
        filter: false,
        sort: true,
      },
    },
    {
      name: "GuestNo",
      label: "Guest No.",
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
      name: "Description",
      label: "Description",
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: "Remark",
      label: "Remark",
      options: {
        filter: true,
        sort: false,
      },
    },
    {
      name: "Qty",
      label: "Qty",
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
          return NumberFormat(value, "qty");
        },
      },
    },
    {
      name: "Unit",
      label: "Unit",
      options: {
        filter: true,
        sort: false,
      },
    },
    {
      name: "Amount",
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
      name: "TotalAmt",
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
      name: "Source",
      label: "Source",
      options: {
        filter: true,
        sort: true,
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
            "FolioNo",
            "GuestNo",
            "FolioDate",
            "ArNo",
            "Description",
            "Remark",
            "Source",
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
      </Box>
    );
  };

  return (
    <div className={classes.root}>
      <MUIDataTable
        title={"A/R Folio"}
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
