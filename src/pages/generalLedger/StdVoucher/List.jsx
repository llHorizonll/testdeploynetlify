/* eslint-disable eqeqeq */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { useRedirect } from "react-admin";
import { Loading, Error } from "react-admin";
import { makeStyles } from "@material-ui/core/styles";
import { Box, FormControl, Select, InputLabel, MenuItem } from "@material-ui/core";
import { getJvFrList, getGlPrefixSearchList } from "services/generalLedger";
import MUIDataTable from "mui-datatables";
import ActionMenu from "components/ActionMenu";
import CustomTablePagination from "components/CustomTablePagination";
import VisibilityIcon from "@material-ui/icons/Visibility";
import ModelUriQueryString from "models/uriQueryString";
import { permissionName } from "utils/constants";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  paper: {
    width: "100%",
    marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 750,
  },
  visuallyHidden: {
    border: 0,
    clip: "rect(0 0 0 0)",
    height: 1,
    margin: -1,
    overflow: "hidden",
    padding: 0,
    position: "absolute",
    top: 20,
    width: 1,
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
  const [prefix, setPrefix] = useState("All");

  const redirect = useRedirect();

  const handleFilterList = () => {
    uriQueryString.WhereGroupList = [
      {
        AndOr: "And",
        ConditionList: [],
      },
    ];
    if (prefix !== "All") {
      let condition = uriQueryString.WhereGroupList[0].ConditionList.find((item) => item.Field === "FPrefix");
      if (!condition) {
        uriQueryString.WhereGroupList[0].ConditionList.push({
          AndOr: "And",
          Field: "FPrefix",
          Operator: "=",
          Value: prefix,
        });
      }
    }
  };

  const columns = [
    {
      name: "FJvhSeq",
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
      name: "Prefix",
      label: "Prefix",
      options: {
        filter: false,
        sort: false,
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
  ];

  const fetchSearchList = async (uriQueryString) => {
    setLoading(true);
    handleFilterList();
    uriQueryString.Exclude = ["Detail", "DimHList"];
    const { Data, Paging } = await getJvFrList(uriQueryString);
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
  }, [prefix]);

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
          uriQueryString.WhereLikeFields = ["FPrefix", "FJvhDesc"];
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
      //TODO wait fix api sort
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
      </Box>
    );
  };

  return (
    <div className={classes.root}>
      <ActionMenu
        menuControl={menuControlProp}
        permission={permissions.find((i) => i.Name === permissionName["GL.StdJv"])}
      />
      <MUIDataTable
        title={"Standard JV"}
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
