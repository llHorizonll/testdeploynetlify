/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { useRedirect } from "react-admin";
import { Loading, Error } from "react-admin";
import { makeStyles } from "@material-ui/core/styles";
import { getBudgetList } from "services/generalLedger";
import MUIDataTable from "mui-datatables";
import ActionMenu from "components/ActionMenu";
import CustomTablePagination from "components/CustomTablePagination";
import VisibilityIcon from "@material-ui/icons/Visibility";
import ModelUriQueryString from "models/uriQueryString";
import { permissionName } from "utils/constants";

const useStyles = makeStyles({
  root: {
    width: "100%",
  },
});

const List = (props) => {
  const classes = useStyles();
  const { basePath, permissions } = props;
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

  const redirect = useRedirect();

  const fetchSearchList = async (uriQueryString) => {
    setLoading(true);

    uriQueryString.Exclude = ["LastYearAmt", "ThisYearAmt", "NextYearAmt", "Revisions", "DimList"];
    const { Data, Paging } = await getBudgetList(uriQueryString);
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
  }, []);

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
      name: "BudgetId",
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
      name: "Year",
      label: "Year",
      options: {
        filter: true,
        sort: true,
      },
    },
    {
      name: "DeptCode",
      label: "Department",
      options: {
        filter: true,
        sort: true,
      },
    },
    {
      name: "DeptDesc",
      label: "DepartmentName",
    },
    {
      name: "AccCode",
      label: "Account #",
      options: {
        filter: true,
        sort: true,
      },
    },
    {
      name: "AccDesc",
      label: "AccountName",
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
          uriQueryString.WhereLikeFields = ["DeptCode", "AccCode"];
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

  return (
    <div className={classes.root}>
      <ActionMenu
        menuControl={menuControlProp}
        permission={permissions.find((i) => i.Name === permissionName["GL.Budget"])}
      />
      <MUIDataTable title={"Budget"} data={Data} columns={columns} options={options} />
    </div>
  );
};

export default List;
