/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useState, useEffect } from "react";
import { GblContext } from "providers/formatter";
import { useRedirect, Loading, Error } from "react-admin";
import { makeStyles } from "@material-ui/core/styles";
import { Box } from "@material-ui/core";
import DatePickerFormat from "components/DatePickerFormat";
import { getAssetRegisterSearchList } from "services/asset";
import MUIDataTable from "mui-datatables";
import ActionMenu from "components/ActionMenu";
import CardImage from "components/CardImage";
import PreviewImage from "assets/previewImage.png";
import CustomTablePagination from "components/CustomTablePagination";
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
  const { settingAll, DateToString, ToMySqlDate } = useContext(GblContext);
  const { SettingClosePeriod } = settingAll;
  const { ClosePeriodAsset } = SettingClosePeriod;
  const [Data, setData] = useState();
  const [Paging, setPaging] = useState();
  const [loading, setLoading] = useState(true);
  const [error] = useState();
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
  const [filterDate, setFilterDate] = useState({
    from: startOfMonth(addDays(new Date(ClosePeriodAsset), 1)),
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
            Field: "AstInputDate",
            Operator: ">=",
            Value: fromMySqlDate,
          },
          {
            AndOr: "And",
            Field: "AstInputDate",
            Operator: "<=",
            Value: toMySqlDate,
          },
        ],
      },
    ];
    uriQueryString.WhereLikeFields = ["AstInputDate", "AstId", "AstNo", "AstName", "AstRemark"];
  };

  const fetchSearchList = async (uriQueryString) => {
    setLoading(true);

    handleFilterList();

    uriQueryString.Exclude = [
      "Barcode",
      "Spec",
      "SerialNo",
      "CurRate",
      "Qty",
      "Salvage",
      "InitAccu",
      "TotalCost",
      "Life",
      "LifeType",
      "RemainDay",
      "RemainNet",
      "RemainTotalCost",
      "DimList",
      "RemainInfo",
    ];

    const { Data, Paging } = await getAssetRegisterSearchList(uriQueryString);
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
      name: "RegId",
      label: " ",
      options: {
        filter: false,
        viewColumns: false,
        setCellProps: () => {
          return {
            style: {
              width: "2vw",
            },
          };
        },
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
      name: "AstPhoto",
      label: " ",
      options: {
        filter: false,
        sort: false,
        setCellProps: () => {
          return {
            style: {
              width: "8vw",
            },
          };
        },
        customBodyRender: (value) => {
          return <CardImage base64Src={value ? value : undefined} imgSrc={PreviewImage} customSize={{ height: 60 }} />;
        },
      },
    },
    {
      name: "InputDate",
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
      name: "AcquireDate",
      label: "Acquire Date",
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
      name: "Id",
      label: "Code",
      options: {
        filter: true,
        sort: true,
      },
    },
    {
      name: "No",
      label: "No.",
      options: {
        filter: true,
        sort: true,
      },
    },
    {
      name: "Name",
      label: "Name",
      options: {
        filter: true,
        sort: true,
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
          uriQueryString.WhereLikeFields = ["AstInputDate", "AstId", "AstNo", "AstName", "AstRemark"];
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
          Input Date
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
        permission={permissions.find((i) => i.Name === permissionName["Ast.Register"])}
      />
      <MUIDataTable
        title={"Asset Register"}
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
