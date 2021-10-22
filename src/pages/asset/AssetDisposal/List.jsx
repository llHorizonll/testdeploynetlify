/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useState, useEffect } from "react";
import { GblContext } from "providers/formatter";
import { useRedirect } from "react-admin";
import { Loading, Error } from "react-admin";
import { makeStyles } from "@material-ui/core/styles";
import { getAssetDisposalSearchList } from "services/asset";
import DialogAssetRegister from "./DialogAssetRegister";
import MUIDataTable from "mui-datatables";
import ActionMenu from "components/ActionMenu";
import CustomTablePagination from "components/CustomTablePagination";
import VisibilityIcon from "@material-ui/icons/Visibility";
import { permissionName } from "utils/constants";
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
  const { DateToString } = useContext(GblContext);
  const { basePath, permissions } = props;
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

  const redirect = useRedirect();

  const fetchSearchList = async (uriQueryString) => {
    setLoading(true);

    uriQueryString.Exclude = [
      "LastCost",
      "Qty",
      "TotalCost",
      "NetBook",
      "SaleAmt",
      "AstAmt",
      "ReduceAmt",
      "Depre",
      "AccuDepreAmt",
      "SaleDeptCode",
      "SaleAccCode",
      "GainLostDeptCode",
      "GainLostAccCode",
      "CategoryCode",
      "DepartmentCode",
      "LocationCode",
      "AstPhoto",
      "SerialNo",
      "Spec",
      "Remark",
      "UserModified",
      "LastModified",
    ];
    const { Data, Paging } = await getAssetDisposalSearchList(uriQueryString);
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
      name: "DisposalId",
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
      name: "DisposalDate",
      label: "Disposal Date",
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
          uriQueryString.WhereLikeFields = ["DisposalDate", "AstId", "AstNo", "AstName", "AstRemark"];
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

  const menuControlProp = [{ name: "Add", fnc: props.FncAddButton }];

  return (
    <div className={classes.root}>
      <ActionMenu
        menuControl={menuControlProp}
        permission={permissions.find((i) => i.Name === permissionName["Ast.Disposal"])}
      />
      <MUIDataTable title={"Asset Disposal"} data={Data} columns={columns} options={options} />
      <DialogAssetRegister open={props.open} onClose={props.onClose} basePath={basePath} />
    </div>
  );
};

export default List;
