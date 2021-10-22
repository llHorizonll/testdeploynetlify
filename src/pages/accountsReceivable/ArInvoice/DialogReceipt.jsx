/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useState } from "react";
import { GblContext } from "providers/formatter";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import { getArReceiptSearchList } from "services/accountReceivable";
import MUIDataTable from "mui-datatables";
import { Dialog, Chip } from "@material-ui/core";
import CustomTablePagination from "components/CustomTablePagination";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Typography from "@material-ui/core/Typography";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
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

const DialogReceipt = (props) => {
  const classes = useStyles();
  const { DateToString, NumberFormat } = useContext(GblContext);

  const { onClose, open, InvhSeq } = props;
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

  const fetchSearchList = async (uriQueryString) => {
    uriQueryString.Exclude = ["Detail", "UserModified"];
    let whereGroupList = [
      {
        AndOr: "And",
        ConditionList: [
          {
            AndOr: "And",
            Field: "InvhSeq",
            Operator: "=",
            Value: InvhSeq,
          },
        ],
      },
    ];
    uriQueryString.WhereGroupList = whereGroupList;
    const { Data, Paging } = await getArReceiptSearchList(uriQueryString);
    if (Data) {
      setData(Data);
      setPaging(Paging);
      setUriQueryString(uriQueryString);
    } else {
      setData([]);
    }
  };

  React.useEffect(() => {
    if (open) {
      fetchSearchList(uriQueryString);
    }
  }, [open]);

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

  const columns = [
    {
      name: "RcpthSeq",
      label: " ",
      options: {
        filter: false,
        display: false,
      },
    },
    {
      name: "RcpthDate",
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
      name: "RcptRefNo",
      label: "Ref No.",
      options: {
        filter: true,
        sort: true,
      },
    },
    {
      name: "ArNo",
      label: "A/R No.",
      options: {
        filter: true,
        sort: true,
      },
    },
    {
      name: "FirstName",
      label: "First Name",
      options: {
        filter: true,
        sort: true,
      },
    },
    {
      name: "LastName",
      label: "Last Name",
      options: {
        filter: true,
        sort: false,
      },
    },
    {
      name: "Company",
      label: "Company",
      options: {
        filter: true,
        sort: true,
      },
    },
    {
      name: "RcptDesc",
      label: "Description",
      options: {
        filter: true,
        sort: true,
      },
    },
    {
      name: "BaseAmt",
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
      name: "PayType",
      label: "Pay. Type",
      options: {
        filter: true,
        sort: true,
      },
    },

    {
      name: "RcpthStatus",
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
    viewColumns: false,
    print: false,
    download: false,
    searchText: searchText,
    searchProps: {
      onKeyUp: (e) => {
        if (e.keyCode === 13) {
          setSearchText(e.target.value);
          uriQueryString.WhereLike = `%${e.target.value}%`;
          uriQueryString.WhereLikeFields = ["RcpthDate", "RcptRefNo", "ArNo", "PayType", "RcptDesc"];
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
    // setRowProps: (rowData, dataIndex) => ({
    //   onDoubleClick: (event) => {
    //     //data column1 = FJvhSeq
    //     console.log(rowData[0]);
    //     handleOk(rowData[0]);
    //   },
    // }),
    customFooter: () => {
      return (
        <CustomTablePagination
          rowsPerPageOptions={[15, 50, 100]}
          component="div"
          count={Paging?.TotalRecordCount ?? 0}
          rowsPerPage={Paging?.Limit ?? 15}
          page={Paging?.Page - 1}
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
    onClose();
  };

  // const handleOk = (FJvhSeq) => {
  //   onClose(FJvhSeq);
  // };

  return (
    <Dialog fullWidth maxWidth="md" aria-labelledby="confirmation-dialog-title" open={open}>
      <DialogTitle id="customized-dialog-title" onClose={handleCancel}>
        A/R Receipt List
      </DialogTitle>
      <DialogContent dividers>
        <MUIDataTable data={Data} columns={columns} options={options} />
      </DialogContent>
      {/* <DialogActions>
        <Button variant="contained" onClick={handleOk} color="primary">
          Ok
        </Button>
        <Button autoFocus onClick={handleCancel} color="primary">
          Cancel
        </Button>
      </DialogActions> */}
    </Dialog>
  );
};

export default DialogReceipt;
