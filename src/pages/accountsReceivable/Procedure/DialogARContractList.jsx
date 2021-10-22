/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useState, useEffect } from "react";
import { GblContext } from "providers/formatter";
import { makeStyles } from "@material-ui/core/styles";
import { Box, Dialog, DialogActions, DialogContent, Button } from "@material-ui/core";
import { getArContractListByDate, applyContract } from "services/accountReceivable";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import MUIDataTable from "mui-datatables";
import Typography from "@material-ui/core/Typography";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import DatePickerFormat from "components/DatePickerFormat";
import DialogARInvoiceList from "./DialogARInvoiceList";
import gbl from "utils/formatter";

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
  textCancel: {
    color: theme.palette.type === "dark" ? theme.palette.grey[800] : "inherit",
    border: `1px solid rgba(0, 0, 0, 0.23)`,
  },
}));

const DialogARContractList = (props) => {
  const classes = useStyles();
  const { ToMySqlDate, DateToString, NumberFormat } = useContext(GblContext);
  const { onClose, open } = props;
  const [selectedRow, setSelectedRow] = useState([]);
  const [filterDate, setFilterDate] = useState(new Date());
  const [data, setData] = useState();
  const [invoiceData, setInvoiceData] = useState();
  const [invoicePaging, setInvoicePaging] = useState();

  const [openDialog, setOpenDialog] = useState(false);

  const fetchSearchList = async () => {
    let fromMySqlDate = ToMySqlDate(filterDate);
    console.log(fromMySqlDate);
    const r = await getArContractListByDate(fromMySqlDate);
    if (r) {
      setData(r);
      setSelectedRow([]);
    } else {
      setData([]);
    }
  };

  useEffect(() => {
    fetchSearchList();
  }, [filterDate]);

  const handleTableChange = (action, tableState) => {
    if (action === "rowSelectionChange") {
      let arrSelectedRows = tableState.selectedRows.data.map((i) => i.index);
      tableState.displayData.reduce((noneSelectedRows, _, index) => {
        if (!tableState.selectedRows.data.find((selectedRow) => selectedRow.index === index)) {
          data[index].IsSelect = false;
        } else {
          data[index].IsSelect = true;
        }
        return noneSelectedRows;
      }, []);

      let prevRow = tableState.previousSelectedRow;
      if (!prevRow) {
        //Check All
        if (tableState.curSelectedRows.length > 0) {
          data.forEach((item) => {
            item.IsSelect = true;
          });
        }
        //UnCheck All
        else {
          data.forEach((item) => {
            item.IsSelect = false;
          });
        }
      }

      setData([...data]);
      setSelectedRow(arrSelectedRows);
    }
  };

  const getSelectedRow = () => {
    return selectedRow;
  };

  const columns = [
    {
      name: "IsSelect",
      options: {
        display: false,
      },
    },
    {
      name: "ArNo",
      label: "A/R No.",
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: "ContractNo",
      label: "Contract No.",
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: "CurCode",
      label: "Currency",
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: "ConHDesc",
      label: "Description",
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: "ConStart",
      label: "Start Contract",
      options: {
        filter: false,
        sort: false,
        customBodyRender: (value) => {
          let v = new Date(value);
          return DateToString(v ?? new Date());
        },
      },
    },
    {
      name: "ConEnd",
      label: "End Contract",
      options: {
        filter: false,
        sort: false,
        customBodyRender: (value) => {
          if (value === null) {
            return null;
          }
          let v = new Date(value);
          return DateToString(v ?? new Date());
        },
      },
    },
    {
      name: "TotalBaseAmount",
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
      name: "PeriodicMonth",
      label: "Period (Month)",
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
      },
    },
  ];

  const options = {
    filter: false, // show the filter icon in the toolbar (true by default)
    responsive: "standard",
    selectableRows: "multiple",
    serverSide: true,
    viewColumns: false,
    print: false,
    download: false,
    search: false,
    onTableChange: (action, tableState) => handleTableChange(action, tableState),
    rowsSelected: getSelectedRow(),
    setTableProps: () => {
      return {
        size: "small",
      };
    },
    customToolbarSelect: () => "",
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

  const CustomFilterList = () => {
    return (
      <Box display="flex">
        <Box p={1}>
          <DatePickerFormat
            label="From"
            value={filterDate}
            onChange={(e) => {
              setFilterDate(e);
            }}
            style={{ width: 160, margin: "0 10px" }}
          />
        </Box>
      </Box>
    );
  };

  const ConfirmToSave = () => {
    let selectedData = data.filter((item) => item.IsSelect);
    var checkPosted = data.find((item) => item.IsApplyInvoice === true);
    if (checkPosted) {
      let msg = "This period contract has already applied. Do you want to remove the existing contract invoices ?";
      let dialog = window.confirm(msg);
      if (dialog) {
        return selectedData;
      } else {
        return false;
      }
    }
    return selectedData;
  };

  const handleSave = async () => {
    let selectedData = ConfirmToSave();

    if (selectedData.length > 0) {
      let paramArContractList = [];
      selectedData.forEach((element) => {
        paramArContractList.push({
          ArContractHId: element.ArContractHId,
          ConHDesc: element.ConHDesc,
          Active: element.Active,
          ArNo: element.ArNo,
          AVPayment: element.AVPayment,
          ConDue: element.ConDue,
          ConEnd: element.ConEnd,
          ConhStatus: element.ConhStatus,
          ConLive: element.ConLive,
          ConNext: element.ConNext,
          ConStart: element.ConStart,
          ContractDate: element.ContractDate,
          ContractNo: element.ContractNo,
          CurCode: element.CurCode,
          CurRate: element.CurRate,
          Detail: element.Detail,
          DtlNo: element.DtlNo,
          IsApplyInvoice: element.IsApplyInvoice ?? false,
          IsVoid: element.IsVoid ?? false,
          LastDue: element.LastDue,
          LastInvSeq: element.LastInvSeq ?? 0,
          Owner: element.Owner,
          ProjectCode: element.ProjectCode,
          PeriodicMonth: element.PeriodicMonth,
          Periodic: element.Periodic,
          RunNoType: element.RunNoType,
          RunTaxType: element.RunTaxType,
          TotalAmount: element.TotalAmount,
          TotalBaseAmount: element.TotalAmount * element.CurRate,
          UserModified: gbl.UserName,
        });
      });

      let param = { frDate: filterDate, ParamArContract: paramArContractList, UserModified: gbl.UserName };
      const r = await applyContract(param);
      if (r) {
        alert("Success");
        setInvoiceData(r.Data);
        setInvoicePaging(r.Paging);
        setOpenDialog(true);
      }
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog fullWidth maxWidth="xl" aria-labelledby="confirmation-dialog-title" open={open}>
      <DialogTitle id="customized-dialog-title" onClose={handleCancel}>
        AR Contract List
      </DialogTitle>
      <DialogContent dividers>
        <MUIDataTable
          data={data}
          columns={columns}
          options={options}
          components={{
            TableFilterList: CustomFilterList,
          }}
        />
      </DialogContent>
      {selectedRow.length > 0 && (
        <DialogActions>
          <Button variant="contained" onClick={handleSave} color="primary">
            Apply Contract
          </Button>
          <Button variant="outlined" className={classes.textCancel} onClick={handleCancel} color="primary">
            Cancel
          </Button>
        </DialogActions>
      )}
      {openDialog && (
        <DialogARInvoiceList
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          data={invoiceData}
          paging={invoicePaging}
        />
      )}
    </Dialog>
  );
};

export default DialogARContractList;
