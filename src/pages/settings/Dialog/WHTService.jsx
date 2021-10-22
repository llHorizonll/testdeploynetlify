/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useState } from "react";
import { GblContext } from "providers/formatter";
import { makeStyles } from "@material-ui/core/styles";
import { getApWhtServiceSearchList } from "services/accountPayable";
import MUIDataTable from "mui-datatables";
import ActionMenu from "components/ActionMenu";
import DialogItem from "./WHTServiceItem";
import CustomTablePagination from "components/CustomTablePagination";
import VisibilityIcon from "@material-ui/icons/Visibility";
import { Typography, Dialog, DialogContent } from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import ModelUriQueryString from "models/uriQueryString";

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
  rootTitle: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
}));

const DialogWHTService = (props) => {
  const classes = useStyles();
  const { NumberFormat } = useContext(GblContext);
  const { onClose, open } = props;
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
    console.log(id);
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
    const { Data, Paging } = await getApWhtServiceSearchList(uriQueryString);
    if (Data) {
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
    if (open) {
      fetchSearchList(uriQueryString);
    }
  }, [open]);

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
      name: "WhtCode",
      label: "Code",
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
      name: "WhtRate",
      label: "Rate (%)",
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
          uriQueryString.WhereLikeFields = ["WhtCode", "WhtDesc"];
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

  const DialogTitle = (props) => {
    const { children, onClose, ...other } = props;
    return (
      <MuiDialogTitle disableTypography className={classes.rootTitle} {...other}>
        <Typography variant="h6">{children}</Typography>
        {onClose ? (
          <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
            <CloseIcon />
          </IconButton>
        ) : null}
      </MuiDialogTitle>
    );
  };

  const handleCancel = () => {
    setSearchText();
    uriQueryString.WhereLike = "";
    onClose();
  };

  const menuControlProp = [
    {
      name: "Add",
      fnc: () => {
        setItemId(0);
        setMode("add");
        setOpenDialog(true);
      },
    },
  ];

  return (
    <Dialog fullWidth maxWidth="md" aria-labelledby="confirmation-dialog-title" open={open}>
      <DialogTitle id="customized-dialog-title" onClose={handleCancel}>
        {props.title}
      </DialogTitle>
      <DialogContent dividers>
        <ActionMenu menuControl={menuControlProp} />
        <MUIDataTable data={Data} columns={columns} options={options} />
        {openDialog && (
          <DialogItem id={itemId} mode={mode} setMode={setMode} open={openDialog} onClose={handleCloseDialog} />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DialogWHTService;
