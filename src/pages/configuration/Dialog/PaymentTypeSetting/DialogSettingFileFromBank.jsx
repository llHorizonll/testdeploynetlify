/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { getGblFileFromBank, delGblFileFromBankDetail } from "services/setting";
import MUIDataTable from "mui-datatables";
import ActionMenu from "components/ActionMenu";
import DialogItem from "./DialogItem";
import Icon from "@material-ui/core/Icon";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import Dialog from "@material-ui/core/Dialog";
import ModelUriQueryString from "models/uriQueryString";
import SnackbarUtils from "utils/SnackbarUtils";

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

const DialogList = (props) => {
  const classes = useStyles();
  const { onClose, open } = props;
  const [Data, setData] = useState();
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
  const [itemId, setItemId] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);

  const handleOpenDialog = (id) => {
    setItemId(id);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    fetchSearchList(uriQueryString);
  };

  const fetchSearchList = async (uriQueryString) => {
    const { Data } = await getGblFileFromBank(uriQueryString);
    if (Data) {
      setData(Data);
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

  const handleTableChange = (action, tableState) => {
    if (action === "onSearchClose") {
      uriQueryString.WhereLike = "";
      fetchSearchList(uriQueryString);
    }
  };

  const columns = [
    {
      name: "FileId",
      label: " ",
      options: {
        filter: false,
        viewColumns: false,
        sort: false,
        customBodyRender: (value) => {
          return (
            <div style={{ display: "flex" }}>
              <IconButton
                fontSize="small"
                color="primary"
                style={{ cursor: "pointer", padding: 3 }}
                onClick={() => handleOpenDialog(value)}
              >
                <Icon>edit</Icon>
              </IconButton>
              <IconButton
                size="small"
                color="primary"
                style={{ cursor: "pointer", marginLeft: 10 }}
                onClick={async () => {
                  let msg = "Confirm deletion ?";
                  let dialog = window.confirm(msg);
                  if (dialog) {
                    const { Code, InternalMessage } = await delGblFileFromBankDetail(value);
                    if (Code === 0) {
                      SnackbarUtils.success("Success");
                      fetchSearchList();
                    } else {
                      console.log(InternalMessage, "InternalMessage");
                    }
                  }
                }}
              >
                <Icon>delete</Icon>
              </IconButton>
            </div>
          );
        },
      },
    },
    {
      name: "AppyCode",
      label: "Payment Type",
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: "ColumnOfCheqNo",
      label: "ColumnOfCheqNo",
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: "ColumnOfClearingDate",
      label: "ColumnOfClearingDate",
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: "ColumnOfClearingAmount",
      label: "ColumnOfClearingAmount",
      options: {
        filter: false,
        sort: false,
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
    search: false,
    onTableChange: (action, tableState) => handleTableChange(action, tableState),
    setTableProps: () => {
      return {
        size: "small",
      };
    },
    onColumnSortChange: (changedColumn, direction) => {
      //TODO wait fix api sort
      handleRequestSort(changedColumn, direction);
    },
  };

  const menuControlProp = [
    {
      name: "Add",
      fnc: () => {
        handleOpenDialog(0);
      },
    },
  ];

  const DialogTitle = (props) => {
    const { children, onClose, ...other } = props;
    return (
      <MuiDialogTitle disableTypography className={classes.rootTitle} {...other}>
        <Typography variant="h6">{children}</Typography>
        {onClose ? (
          <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
            <Icon>close</Icon>
          </IconButton>
        ) : null}
      </MuiDialogTitle>
    );
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog fullWidth maxWidth="md" aria-labelledby="confirmation-dialog-title" open={open}>
      <DialogTitle id="customized-dialog-title" onClose={handleCancel}>
        Setting File From Bank
      </DialogTitle>

      <DialogContent dividers>
        <ActionMenu menuControl={menuControlProp} />
        <MUIDataTable data={Data} columns={columns} options={options} />
        {openDialog && <DialogItem id={itemId} open={openDialog} onClose={handleCloseDialog} />}
      </DialogContent>
    </Dialog>
  );
};

export default DialogList;
