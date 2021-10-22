/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext } from "react";
import { GblContext } from "providers/formatter";
import { makeStyles } from "@material-ui/core/styles";
import { TableHead, TableRow, TableCell } from "@material-ui/core";
import MUIDataTable, { TableHead as MuiTableHead } from "mui-datatables";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Typography from "@material-ui/core/Typography";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import Dialog from "@material-ui/core/Dialog";

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

const DialogARInvoice = (props) => {
  const classes = useStyles();
  const { DateToString, NumberFormat } = useContext(GblContext);
  const { onClose, open, data } = props;

  const columns = [
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
      label: "FirstName",
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: "LastName",
      label: "LastName",
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
      name: "InvNo",
      label: "Invoice No.",
      options: {
        filter: false,
        sort: true,
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
  ];

  const options = {
    filter: false, // show the filter icon in the toolbar (true by default)
    responsive: "standard",
    selectableRows: "none",
    search: false,
    download: false,
    print: false,
    viewColumns: false,
    setTableProps: () => {
      return {
        size: "small",
      };
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

  const CustomHeader = (props) => {
    return (
      <>
        <TableHead>
          <TableRow>
            <TableCell align="left" colSpan={1}>
              <Button variant="outlined" color="primary">
                Preview & Print Invoice
              </Button>
            </TableCell>
            <TableCell align="right" colSpan={10}></TableCell>
          </TableRow>
        </TableHead>
        <MuiTableHead {...props} />
      </>
    );
  };

  return (
    <Dialog fullWidth maxWidth="md" aria-labelledby="confirmation-dialog-title" open={open}>
      <DialogTitle id="customized-dialog-title" onClose={handleCancel}>
        A/R Invoice List
      </DialogTitle>
      <DialogContent dividers>
        <MUIDataTable
          data={data}
          columns={columns}
          options={options}
          components={{
            TableHead: CustomHeader,
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default DialogARInvoice;
