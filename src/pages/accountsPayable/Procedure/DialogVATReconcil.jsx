/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useState, useEffect } from "react";
import { useTheme } from "@material-ui/core/styles";
import { GblContext } from "providers/formatter";
import { makeStyles } from "@material-ui/core/styles";
import { Button, DialogActions, FormControl, InputLabel, Select, MenuItem, TextField } from "@material-ui/core";
import { getVatReconcile, addBatchVatReconcile } from "services/reconcile";
import { showReportByName } from "pages/Report/services";
import { Grid, Icon, IconButton } from "@material-ui/core";
import MaterialTable from "material-table";
import Typography from "@material-ui/core/Typography";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import Dialog from "@material-ui/core/Dialog";
import DatePickerFormat from "components/DatePickerFormat";
import ActionMenu from "components/ActionMenu";
import gbl from "utils/formatter";
import DialogOptions from "./DialogOptions";
import { InvoiceTaxStatusOptions } from "utils/options";
import { addDays, startOfMonth, lastDayOfMonth } from "date-fns";
import SnackbarUtils from "utils/SnackbarUtils";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
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
  textFooter: {
    textAlign: "right",
    fontSize: "0.9rem",
    fontWeight: 600,
    color: theme.palette.primary.main,
  },
  textCancel: {
    color: theme.palette.type === "dark" ? theme.palette.grey[800] : "inherit",
    border: `1px solid rgba(0, 0, 0, 0.23)`,
  },
}));

const DialogVATRec = (props) => {
  const classes = useStyles();
  const { settingAll, DateToString, NumberFormat, ToMySqlDate, ToNumber } = useContext(GblContext);
  const { SettingClosePeriod, SettingAp } = settingAll;
  const { ClosePeriodAp } = SettingClosePeriod;
  let newClosePeriodAp = addDays(new Date(ClosePeriodAp), 1);
  const { onClose, open, defaultTaxPeriod, taxPeriodList } = props;
  const theme = useTheme();
  const [selectedRow, setSelectedRow] = useState([]);
  const [Data, setData] = useState();
  const [summaryData, setSummaryData] = useState({
    totalNetAmt: 0,
    totalTaxAmt: 0,
    totalTotalAmt: 0,
  });
  const [isLoading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);

  const menuControlProp = [{ name: "Print", fnc: () => setOpenDialog(true) }];

  const fetchSearchList = async (mounted) => {
    let startDay = ToMySqlDate(startOfMonth(new Date()));
    let lastDay = ToMySqlDate(lastDayOfMonth(new Date()));
    const { Data } = await getVatReconcile(startDay, lastDay);
    if (Data) {
      let sumNetAmount = Data.reduce((accu, item) => {
        let s = ToNumber(accu) + ToNumber(item.BfTaxAmt);
        return NumberFormat(s ?? 0);
      }, 0);
      let sumTaxAmount = Data.reduce((accu, item) => {
        let s = ToNumber(accu) + ToNumber(item.TaxAmt);
        return NumberFormat(s ?? 0);
      }, 0);

      let sumTotal = Data.reduce((accu, item) => {
        let s = ToNumber(accu) + ToNumber(item.TotalAmt);
        return NumberFormat(s ?? 0);
      }, 0);
      setSummaryData({
        totalNetAmt: sumNetAmount,
        totalTaxAmt: sumTaxAmount,
        totalTotalAmt: sumTotal,
      });
      setData(Data);
      setSelectedRow([]);
    } else {
      setData([]);
    }
    if (mounted) {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    fetchSearchList(mounted);
    return function cleanup() {
      mounted = false;
    };
  }, []);

  const selectionChange = (rows, selectedRows) => {
    //Select or UnSelect 1 Item
    if (selectedRows) {
      if (selectedRows.tableData.checked) {
        selectedRows.IsSelect = true;
        selectedRows.OldTaxStatus = selectedRows.TaxStatus;
        selectedRows.OldTaxPeriod = selectedRows.TaxPeriod;
        selectedRows.OldInvhTInvNo = selectedRows.InvhTInvNo;
        selectedRows.OldInvhTInvDt = selectedRows.InvhTInvDt;
        selectedRows.TaxStatus = "Confirm";
        selectedRows.TaxPeriod = defaultTaxPeriod;
      } else {
        selectedRows.IsSelect = false;
        selectedRows.TaxStatus = selectedRows.OldTaxStatus;
        selectedRows.TaxPeriod = selectedRows.OldTaxPeriod;
        selectedRows.InvhTInvNo = selectedRows.OldInvhTInvNo;
        selectedRows.InvhTInvDt = selectedRows.OldInvhTInvDt;
      }
      Data[selectedRows.tableData.id] = selectedRows;
      setData([...Data]);
    }
    //Select All
    if (rows.length > 0 && !selectedRows) {
      //Check All
      const newRows = rows.filter((item) => {
        item.IsSelect = true;
        item.tableData = { checked: true };
        item.OldTaxStatus = item.TaxStatus;
        item.OldTaxPeriod = item.TaxPeriod;
        item.OldInvhTInvNo = item.InvhTInvNo;
        item.OldInvhTInvDt = item.InvhTInvDt;
        item.TaxStatus = "Confirm";
        item.TaxPeriod = defaultTaxPeriod;
        return item;
      });
      setData([...newRows]);
    }
    //UnSelect All
    if (rows.length === 0 && !selectedRows) {
      Data.forEach((item) => {
        item.IsSelect = false;
        item.tableData = { checked: false };
        item.TaxStatus = item.OldTaxStatus;
        item.TaxPeriod = item.OldTaxPeriod;
        item.InvhTInvNo = item.OldInvhTInvNo;
        item.InvhTInvDt = item.OldInvhTInvDt;
      });
      setData([...Data]);
    }
    let arrIndex = Array.from(rows.keys());
    setSelectedRow(arrIndex);
  };

  const columns = [
    {
      title: "Tax Status",
      field: "Tax Status",
      sorting: false,
      render: (rowData) => {
        if (rowData.tableData.checked) {
          return (
            <FormControl variant="outlined" fullWidth>
              <InputLabel id="label">Tax Status</InputLabel>
              <Select
                labelId="label"
                variant="outlined"
                margin="dense"
                label="Tax Status"
                style={{ width: 120 }}
                value={rowData.TaxStatus}
                onChange={(e) => {
                  rowData.TaxStatus = e.target.value;
                  setData([...Data]);
                }}
              >
                {InvoiceTaxStatusOptions
                  ? InvoiceTaxStatusOptions.filter((x) => x !== "None").map((item, idx) => (
                      <MenuItem key={idx} value={item}>
                        {item}
                      </MenuItem>
                    ))
                  : ""}
              </Select>
            </FormControl>
          );
        } else {
          return rowData.TaxStatus;
        }
      },
    },
    {
      title: "Tax Period",
      field: "TaxPeriod",
      sorting: false,
      render: (rowData) => {
        if (rowData.tableData.checked) {
          return (
            <FormControl variant="outlined" fullWidth>
              <InputLabel id="label2">Period</InputLabel>
              <Select
                labelId="label2"
                variant="outlined"
                margin="dense"
                label="Period"
                style={{ width: 120 }}
                value={rowData.tableData.Period}
                defaultValue={defaultTaxPeriod}
                onChange={(e) => {
                  rowData.TaxPeriod = e.target.value;
                  setData([...Data]);
                }}
              >
                {taxPeriodList
                  ? taxPeriodList.map((item, idx) => (
                      <MenuItem key={idx} value={item}>
                        {item}
                      </MenuItem>
                    ))
                  : ""}
              </Select>
            </FormControl>
          );
        } else {
          return rowData.TaxPeriod;
        }
      },
    },
    { title: "Invoice No.", field: "InvhInvNo", sorting: false },
    {
      title: "Tax Invoice No.",
      field: "InvhTInvNo",
      sorting: false,
      render: (rowData) => {
        if (rowData.tableData.checked) {
          return (
            <TextField
              fullWidth
              variant="outlined"
              margin="dense"
              label="Tax Inv No."
              value={rowData.InvhTInvNo}
              onChange={(e) => {
                let value = e.target.value;
                Data[rowData.tableData.id].InvhTInvNo = value;
                setData([...Data]);
              }}
              style={{ width: 120 }}
            />
          );
        } else {
          return rowData.InvhTInvNo;
        }
      },
    },
    {
      title: "Tax Invoice Date.",
      field: "InvhTInvDt",
      sorting: false,
      render: (rowData) => {
        let value = rowData.InvhTInvDt;
        if (!rowData.InvhTInvDt) {
          return null;
        }
        if (rowData.tableData.checked) {
          return (
            <DatePickerFormat
              label="Tax Inv Date"
              minDate={new Date(newClosePeriodAp)}
              minDateMessage={"Date must be more than close period"}
              value={value}
              onChange={(e) => {
                Data[rowData.tableData.id].InvhTInvDt = new Date(e);
                setData([...Data]);
              }}
              style={{ width: 120 }}
            />
          );
        } else {
          return DateToString(value ?? new Date());
        }
      },
    },
    { title: "Vendor", field: "VnCode", sorting: false },
    { title: "Name", field: "VnName", sorting: false },
    {
      title: "Net Amount",
      field: "BfTaxAmt",
      sorting: false,
      type: "numeric",
      render: (rowData) => NumberFormat(rowData.BfTaxAmt),
    },
    {
      title: "Tax Amount",
      field: "TaxAmt",
      sorting: false,
      type: "numeric",
      render: (rowData) => NumberFormat(rowData.TaxAmt),
    },
    {
      title: "Total Amount",
      field: "TotalAmt",
      sorting: false,
      type: "numeric",
      render: (rowData) => NumberFormat(rowData.TotalAmt),
    },
  ];

  const options = {
    headerStyle: {
      backgroundColor: theme.palette.primary.main,
      color: "#FFF",
    },
    padding: "dense",
    paging: false,
    selection: true,
    selectionProps: () => ({
      color: "primary",
    }),
  };

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

  const ConfirmSetting = () => {
    console.log(SettingAp.AutoPostingToGl);
    if (SettingAp.AutoPostingToGl) {
      let msg = "reconciliation will automatic post to GL, Do you need to preceed?";
      let dialog = window.confirm(msg);
      if (dialog) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  };

  const ConfirmToSave = () => {
    let selectedData = Data.filter((item) => item.IsSelect);
    if (selectedData.length > 0) {
      let numOfConfirm = Data.filter((x) => x.TaxStatus === "Confirm").length;
      let numOfPending = Data.filter((x) => x.TaxStatus === "Pending").length;
      let numOfUnclaim = Data.filter((x) => x.TaxStatus === "UnClaim").length;

      let all = numOfConfirm + numOfPending + numOfUnclaim;

      let msg = `Found updated data : ${all} transactions
      (Y) Confirm : ${numOfConfirm}
      (N) Not Confirm : ${numOfPending}
      (U) Unclaim : ${numOfUnclaim}`;
      let dialog = window.confirm(msg);
      if (dialog) {
        return selectedData;
      } else {
        return [];
      }
    }
  };

  const handleSave = async () => {
    if (ConfirmSetting()) {
      let selectedData = ConfirmToSave();
      if (selectedData.length > 0) {
        let paramVAT = [];
        selectedData.forEach((item) => {
          paramVAT.push({
            InvhSeq: item.InvhSeq,
            TaxStatus: item.TaxStatus,
            TaxPeriod: item.TaxPeriod,
            GlAutoPost: SettingAp.AutoPostingToGl,
            GlDrAccCode: SettingAp.PostingAccount,
            GlDrDeptCode: SettingAp.PostingDepartment,
            FrDate: item.FrDate,
            ToDate: item.ToDate,
            InvhTInvNo: item.InvhTInvNo,
            InvhTInvDt: item.InvhTInvDt,
            InvhDesc: item.InvhDesc,
            VnName: item.VnName,
            BfTaxAmt: item.BfTaxAmt,
            TaxAmt: item.TaxAmt,
            TotalAmt: item.TotalAmt,
            TaxId: item.TaxId,
            BranchNo: item.BranchNo,
            UserModified: gbl.UserName,
          });
        });
        console.log(paramVAT);
        const { Code, UserMessage } = await addBatchVatReconcile(paramVAT);
        if (Code === 0) {
          SnackbarUtils.success("Success");
          fetchSearchList();
        } else {
          SnackbarUtils.error(UserMessage);
          fetchSearchList();
        }
      }
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const onCloseDialog = (period) => {
    let splitPeriod = period.split("/");
    let frDate = `${splitPeriod[1]}-${splitPeriod[0]}-01`;
    let toDate = `${splitPeriod[1]}-${splitPeriod[0]}-30`;
    let param = `'${frDate}','${toDate}'`;
    showReportByName("AP_InputVAT", param);
    setOpenDialog(false);
  };

  return (
    <Dialog fullWidth maxWidth="lg" aria-labelledby="confirmation-dialog-title" open={open}>
      <DialogTitle id="customized-dialog-title" onClose={handleCancel}>
        Reconciliation
      </DialogTitle>
      <DialogContent dividers>
        <ActionMenu justifyContent="flex-start" menuControl={menuControlProp} />

        <MaterialTable
          title=""
          columns={columns}
          data={Data}
          options={options}
          isLoading={isLoading}
          onSelectionChange={selectionChange}
        />
        <Grid container justifyContent="flex-end" style={{ paddingRight: 14, paddingTop: 20 }}>
          <Grid item className={classes.textFooter} style={{ width: `calc(8vw)`, textAlign: "right" }}>
            {summaryData.totalNetAmt}
          </Grid>
          <Grid item className={classes.textFooter} style={{ width: `calc(8vw)` }}>
            {summaryData.totalTaxAmt}
          </Grid>
          <Grid item className={classes.textFooter} style={{ width: `calc(8vw)` }}>
            {summaryData.totalTotalAmt}
          </Grid>
        </Grid>

        {openDialog && (
          <DialogOptions
            open={openDialog}
            onClose={onCloseDialog}
            options={taxPeriodList}
            headerText="Select Period"
            isPeriodDialog
          />
        )}
      </DialogContent>
      <DialogActions>
        {selectedRow.length > 0 ? (
          <>
            <Button variant="contained" onClick={handleSave} color="primary">
              Save
            </Button>
            <Button variant="outlined" className={classes.textCancel} onClick={handleCancel}>
              Cancel
            </Button>
          </>
        ) : (
          <div style={{ margin: 18 }}></div>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default DialogVATRec;
