/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useState, useEffect, useCallback } from "react";
import { useTheme } from "@material-ui/core/styles";
import _ from "lodash";
import { GblContext } from "providers/formatter";
import clsx from "clsx";
import { withTranslate } from "react-admin";
import { makeStyles } from "@material-ui/core/styles";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import { Button, Divider } from "@material-ui/core";
import MaterialTable from "material-table";
import NumberFormatInput from "components/NumberFormatInput";
import DatePickerFormat from "components/DatePickerFormat";
import { getArInvoiceUnpaid } from "services/accountReceivable";
import { addDays } from "date-fns";
import SnackbarUtils from "utils/SnackbarUtils";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    margin: 30,
  },
  appBar: {
    position: "relative",
    backgroundColor: theme.palette.primary.main,
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
  content: {
    padding: 6,
  },
  numberBox: {
    textAlign: "right",
    fontSize: 14,
    paddingRight: 4,
    margin: 0,
    width: 120,
  },
  numberBoxError: {
    border: "2px solid red !important",
    "&:hover, &:focus": {
      outline: "none",
      outlineOffset: 0,
      border: "2px solid red !important",
    },
  },
  textCancel: {
    color: theme.palette.type === "dark" ? theme.palette.grey[800] : "inherit",
    border: `1px solid rgba(0, 0, 0, 0.23)`,
  },
  statusNormal: {
    backgroundColor: "#2196f3",
    color: "white",
    cursor: "pointer",
  },
}));

const PopupSettlement = ({
  code,
  unselectInvoice,
  checkSettleDate,
  rcpthDate,
  children,
  open,
  save,
  cancel,
  initialValues,
  maxWidth = "xl",
  translate,
}) => {
  const classes = useStyles();
  const { settingAll, DateToString, NumberFormat, ToNumber } = useContext(GblContext);
  const { SettingClosePeriod } = settingAll;
  const { ClosePeriodAr } = SettingClosePeriod;
  let newClosePeriodAr = addDays(new Date(ClosePeriodAr), 1);
  const [dataPopup, setDataPopup] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const theme = useTheme();

  const fetchArInvUppaidByArCode = useCallback(
    async (mounted) => {
      //never select
      if (unselectInvoice.length === 0) {
        let allUnpaidList = await getArInvoiceUnpaid(code);
        if (allUnpaidList.length === 0) {
          allUnpaidList = [];
        }
        // let paymentDateString = new Date(paymentDate);
        // let dd = paymentDateString.getDate();
        // let MM = paymentDateString.getMonth() + 1;
        // let yy = paymentDateString.getFullYear();
        // console.log(paymentDateString, paymentDate);
        // var unpaidList = allUnpaidList.filter(
        //   (item) =>
        //     new Date(item.InvhDate) <= new Date(`${yy}-${MM < 10 ? "0" + MM : MM}-${dd < 10 ? "0" + dd : dd}T00:00:00`)
        // );
        //console.log(unpaidList, allUnpaidList);

        //keepOld Data before loop
        let original = _.cloneDeep(initialValues);
        setOriginalData(original);

        const newInit = initialValues.filter((element) => {
          var isHaveUnpaid = allUnpaidList.find((u) => u.InvhSeq === element.InvhSeq && u.InvdSeq === element.InvdSeq);
          var isHaveUnpaidIndex = allUnpaidList.findIndex(
            (u) => u.InvhSeq === element.InvhSeq && u.InvdSeq === element.InvdSeq
          );

          //invoice ถูกจ่ายไปหมดแล้ว
          if (!isHaveUnpaid) {
            element["IsPaid"] = true;
            element.tableData = { checked: true };
            element["RcptPaid"] = element["InvAmount"];
            element["UnPaid"] = element["InvAmount"];
            if (element.Info) {
              element.InvhDate = element.Info.InvoiceHeader.InvhDate;
              element.InvdDesc = element.Info.InvoiceDetail.InvdDesc;
              element.RcptdCurrCode = element.Info.InvoiceHeader.CurrCode;
              element.RcptdCurrRate = element.Info.InvoiceHeader.CurrRate;
            }
            //element.RcptPaid = element.Paid;
            element.TotalAmt = element.InvAmount;
          }
          // invoice ถูกจ่ายไปบางส่วน
          else {
            let newUnPaid = element.NewUnPaid;
            element["IsPaid"] = true;
            element.tableData = { checked: true };
            if (element.Info) {
              element.UnPaid =
                newUnPaid !== undefined
                  ? ToNumber(newUnPaid) + ToNumber(element.RcptPaid)
                  : ToNumber(element.Info.InvoiceDetail.Unpaid) + ToNumber(element.RcptPaid);
            } else {
              element.UnPaid =
                newUnPaid !== undefined
                  ? ToNumber(newUnPaid) + ToNumber(element.RcptPaid)
                  : ToNumber(element.UnPaid) + ToNumber(element.RcptPaid);
            }
            allUnpaidList.splice(isHaveUnpaidIndex, 1);
          }

          return element;
        });

        //console.log(initialValues);
        setDataPopup([...newInit, ...allUnpaidList]);
      } else {
        //keepOld Data before loop
        let original = _.cloneDeep(initialValues);
        let newDataPopup = _.cloneDeep([...initialValues, ...unselectInvoice]);
        setOriginalData(original);
        setDataPopup(newDataPopup);
      }
      if (mounted) {
        setLoading(false);
      }
    },
    [code]
  );

  useEffect(() => {
    let mounted = true;
    fetchArInvUppaidByArCode(mounted);
    return function cleanup() {
      mounted = false;
    };
  }, [fetchArInvUppaidByArCode]);

  const select = () => {
    let error = false;
    dataPopup.forEach((item) => {
      if (ToNumber(item.RcptPaid) === 0) {
        item.IsPaid = false;
      } else {
        item.IsPaid = true;
        if (ToNumber(item.RcptPaid) > ToNumber(item.UnPaid)) {
          if (!error) {
            SnackbarUtils.error(translate("ra.apInvoice.invoiceAmountWarnning1"));
          }
          error = true;
          return;
        }
      }
    });

    if (!error) {
      setDataPopup([...dataPopup]);

      dataPopup.forEach((item) => {
        if (item.Info) {
          item.InvhDate = item.Info.InvoiceHeader.InvhDate;
          item.InvdDesc = item.Info.InvoiceDetail.InvdDesc;
          item.TaxAmt1 = item.Info.InvoiceDetail.TaxAmt1;
          item.TaxAmt2 = item.Info.InvoiceDetail.TaxAmt2;
          item.TaxBaseAmt1 = item.Info.InvoiceDetail.TaxBaseAmt1;
          item.TaxBaseAmt2 = item.Info.InvoiceDetail.TaxBaseAmt2;
          item.TaxRate1 = item.Info.InvoiceDetail.TaxRate1;
          item.TaxRate2 = item.Info.InvoiceDetail.TaxRate2;
          item.TaxType1 = item.Info.InvoiceDetail.TaxType1;
          item.TaxType2 = item.Info.InvoiceDetail.TaxType2;
        }
      });

      const newData = Object.assign([], dataPopup);
      save(newData);
    }
  };

  const columns = [
    {
      title: "Invoice No.",
      field: "InvNo",
      sorting: false,
      render: (rowData) => <div style={{ width: 60 }}>{rowData.InvNo}</div>,
    },
    {
      title: "Invoice Date",
      field: "InvhDate",
      sorting: false,
      render: (rowData) =>
        typeof rowData.InvhDate === "object" ? (
          <div style={{ width: 60 }}>{DateToString(rowData?.InvhDate)}</div>
        ) : (
          <div style={{ width: 60 }}>{DateToString(rowData.InvhDate)}</div>
        ),
    },
    {
      title: "Description",
      field: "InvdDesc",
      sorting: false,
      render: (rowData) => (
        <div style={{ width: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {rowData.InvdDesc}
        </div>
      ),
    },
    { title: "Currency", field: "CurrCode", sorting: false },
    { title: "Amount", field: "TotalAmt", sorting: false, render: (rowData) => NumberFormat(rowData.TotalAmt) },
    {
      title: "UnPaid",
      field: "UnPaid",
      type: "numeric",
      sorting: false,
      render: (rowData) => {
        let paid = ToNumber(rowData.RcptPaid);
        if (rowData.UnPaid - paid < 0) {
          rowData.UnPaid = ToNumber(rowData.UnPaid);
          return NumberFormat(rowData.UnPaid);
        } else {
          rowData.NewUnPaid = ToNumber(rowData.UnPaid) - paid;
          return NumberFormat(rowData.UnPaid - paid);
        }
      },
    },
    {
      title: "Paid",
      field: "RcptPaid",
      type: "numeric",
      sorting: false,
      render: (rowData) => {
        const checkValue = () => {
          if (rowData.RcptPaid > rowData.UnPaid) {
            return true;
          } else {
            return false;
          }
        };
        if (rowData.tableData.checked) {
          return (
            <NumberFormatInput
              className={clsx(classes.numberBox, {
                [classes.numberBoxError]: checkValue(),
              })}
              value={rowData.RcptPaid ?? 0}
              onChange={(e) => {
                console.log(rowData);
                let value = ToNumber(e.target.value);
                dataPopup[rowData.tableData.id].RcptPaid = value;
                setDataPopup([...dataPopup]);
                return value;
              }}
            />
          );
        } else {
          return <div style={{ width: 120 }}>{NumberFormat(rowData.RcptPaid)}</div>;
        }
      },
    },
    {
      title: "Settle On",
      field: "RcptdDate",
      sorting: false,
      render: (rowData) => {
        if (rowData.tableData.checked) {
          return (
            <DatePickerFormat
              label={"Settle On"}
              value={rowData?.RcptdDate}
              minDate={new Date(newClosePeriodAr)}
              minDateMessage={"Date must be more than close period"}
              showTodayButton
              onChange={(e) => {
                dataPopup[rowData.tableData.id].RcptdDate = e;
                setDataPopup([...dataPopup]);
              }}
              style={{ width: 120 }}
            />
          );
        } else {
          return typeof rowData.RcptdDate === "object" ? (
            <div style={{ width: 120 }}>{DateToString(rowData?.RcptdDate)}</div>
          ) : (
            <div style={{ width: 120 }}>{DateToString(rowData.RcptdDate)}</div>
          );
        }
      },
    },
  ];

  const options = {
    headerStyle: {
      backgroundColor: theme.palette.primary.main,
      color: "#FFF",
    },
    paging: false,
    selection: true,
    selectionProps: () => ({
      color: "primary",
    }),
  };

  const handleCancel = () => {
    setDataPopup(originalData);
    cancel(originalData);
  };

  return (
    <div>
      <Dialog open={open} onClose={handleCancel} scroll={"paper"} maxWidth={maxWidth} disableBackdropClick>
        <DialogTitle id="scroll-dialog-title">
          {dataPopup?.InvdSeq > 0 ? `Edit Transaction ${dataPopup?.InvdSeq}` : "Add Transaction"}
        </DialogTitle>
        <DialogContent dividers className={classes.content}>
          <MaterialTable
            title=""
            columns={columns}
            data={dataPopup}
            options={options}
            isLoading={isLoading}
            onSelectionChange={(rows, selectedRows) => {
              //Select or UnSelect 1 Item
              if (selectedRows) {
                if (selectedRows.tableData.checked) {
                  selectedRows["IsPaid"] = true;
                  selectedRows.RcptPaid = ToNumber(selectedRows.UnPaid);
                  selectedRows.RcptdDate = checkSettleDate ? rcpthDate : new Date();
                } else {
                  selectedRows.RcptPaid = 0;
                  selectedRows.RcptdDate = null;
                }
                dataPopup[selectedRows.tableData.id] = selectedRows;
                setDataPopup([...dataPopup]);
              }
              //Select All
              if (rows.length > 0 && !selectedRows) {
                dataPopup.forEach((item) => {
                  item.IsPaid = true;
                  item.RcptPaid = item.UnPaid;
                  item.RcptdDate = checkSettleDate ? rcpthDate : new Date();
                });
                setDataPopup([...dataPopup]);
              }
              //UnSelect All
              if (rows.length === 0 && !selectedRows) {
                dataPopup.forEach((item) => {
                  item.IsPaid = false;
                  item.RcptPaid = 0;
                  item.RcptdDate = null;
                });
                setDataPopup([...dataPopup]);
              }
            }}
          />
          {children}
          <Divider />
          <pre>{process.env.NODE_ENV === "development" ? JSON.stringify(dataPopup, 0, 2) : ""}</pre>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="primary" onClick={select}>
            Select
          </Button>
          <Button variant="outlined" className={classes.textCancel} onClick={handleCancel}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default withTranslate(PopupSettlement);
