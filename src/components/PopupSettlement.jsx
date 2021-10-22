/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useState, useEffect, useCallback } from "react";
import { useTheme } from "@material-ui/core/styles";
import _ from "lodash";
import { GblContext } from "providers/formatter";
import clsx from "clsx";
import { withTranslate } from "react-admin";
import { useStateWithCallbackLazy } from "use-state-with-callback";
import { makeStyles } from "@material-ui/core/styles";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import { Button, Divider } from "@material-ui/core";
import MaterialTable from "material-table";
import NumberFormatInput from "components/NumberFormatInput";
import { getInvoiceUnpaid } from "services/accountPayable";
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
  paymentDate,
  children,
  open,
  save,
  cancel,
  initialValues,
  maxWidth = "md",
  translate,
}) => {
  const classes = useStyles();
  const { DateToString, NumberFormat, ToNumber } = useContext(GblContext);
  const [dataPopup, setDataPopup] = useStateWithCallbackLazy([]);
  const [originalData, setOriginalData] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const theme = useTheme();

  const fetchInvUppaidByVnCode = useCallback(
    async (mounted) => {
      //never select
      if (unselectInvoice.length === 0) {
        let allUnpaidList = await getInvoiceUnpaid(code);
        if (allUnpaidList.length === 0) {
          allUnpaidList = [];
        }
        let paymentDateString = new Date(paymentDate);
        let dd = paymentDateString.getDate();
        let MM = paymentDateString.getMonth() + 1;
        let yy = paymentDateString.getFullYear();
        var unpaidList = allUnpaidList.filter(
          (item) =>
            new Date(item.InvhInvDate) <=
            new Date(`${yy}-${MM < 10 ? "0" + MM : MM}-${dd < 10 ? "0" + dd : dd}T00:00:00`)
        );
        //keepOld Data before loop
        let original = _.cloneDeep(initialValues);
        setOriginalData(original);

        const newInit = initialValues.filter((element) => {
          var isHaveUnpaid = unpaidList.find((u) => u.InvhSeq === element.InvhSeq && u.InvdSeq === element.InvdSeq);
          var isHaveUnpaidIndex = unpaidList.findIndex(
            (u) => u.InvhSeq === element.InvhSeq && u.InvdSeq === element.InvdSeq
          );
          //invoice ถูกจ่ายไปหมดแล้ว
          if (!isHaveUnpaid) {
            element.IsPaid = true;
            element.tableData = { checked: true };
            element.Paid = element.PaidBAmt;
            element.Unpaid = element.PaidBAmt;
            if (element.Info) {
              element.InvhInvNo = element.Info.InvoiceHeader.InvhInvNo;
              element.InvhInvDate = element.Info.InvoiceHeader.InvhInvDate;
              element.InvdDesc = element.Info.InvoiceDetail.InvdDesc;
              element.TotalPrice = element.Info.InvoiceDetail.TotalPrice;
            }
          }
          // invoice ถูกจ่ายไปบางส่วน
          else {
            let newUnPaid = element.NewUnPaid;
            element["IsPaid"] = true;
            element.tableData = { checked: true };
            if (element.Info) {
              element.InvhInvNo = element.Info.InvoiceHeader.InvhInvNo;
              element.InvhInvDate = element.Info.InvoiceHeader.InvhInvDate;
              element.InvdDesc = element.Info.InvoiceDetail.InvdDesc;
              element.TotalPrice = element.Info.InvoiceDetail.TotalPrice;
              element.Unpaid =
                newUnPaid !== undefined
                  ? ToNumber(newUnPaid) + ToNumber(element.Paid)
                  : ToNumber(element.Info.InvoiceDetail.UnPaid) + ToNumber(element.Paid);
            } else {
              element.Unpaid =
                newUnPaid !== undefined
                  ? ToNumber(newUnPaid) + ToNumber(element.Paid)
                  : ToNumber(element.Unpaid) + ToNumber(element.Paid);
            }
            unpaidList.splice(isHaveUnpaidIndex, 1);
          }

          return element;
        });
        //console.log(initialValues);
        setDataPopup([...newInit, ...unpaidList]);
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
    fetchInvUppaidByVnCode(mounted);
    return function cleanup() {
      mounted = false;
    };
  }, []);

  const select = () => {
    let error = false;
    dataPopup.forEach((item) => {
      if (ToNumber(item.Paid) === 0) {
        item.IsPaid = false;
      } else {
        item.IsPaid = true;
        if (ToNumber(item.Paid) > item.Unpaid) {
          SnackbarUtils.error(translate("ra.apInvoice.invoiceAmountWarnning1"));
          error = true;
          return;
        }
      }
    });
    if (!error) {
      //update paid
      setDataPopup([...dataPopup]);
      const newData = Object.assign([], dataPopup);
      save(newData);
    }
  };

  const columns = [
    {
      title: "Invoice No.",
      field: "InvhInvNo",
      sorting: false,
      render: (rowData) => <div style={{ width: 100 }}>{rowData.InvhInvNo}</div>,
    },
    {
      title: "Invoice Date",
      field: "InvhInvDate",
      sorting: false,
      render: (rowData) =>
        typeof rowData.InvhDate === "object" ? (
          <div style={{ width: 100 }}>{DateToString(rowData?.InvhInvDate)}</div>
        ) : (
          <div style={{ width: 100 }}>{DateToString(rowData.InvhInvDate)}</div>
        ),
    },
    {
      title: "Description",
      field: "InvdDesc",
      sorting: false,
      render: (rowData) => (
        <div style={{ width: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {rowData.InvdDesc}
        </div>
      ),
    },
    { title: "Currency", field: "CurCode", sorting: false },
    { title: "Amount", field: "TotalPrice", sorting: false, render: (rowData) => NumberFormat(rowData.TotalPrice) },
    {
      title: "UnPaid",
      field: "Unpaid",
      type: "numeric",
      sorting: false,
      render: (rowData) => {
        let paid = ToNumber(rowData.Paid);
        if (rowData.Unpaid - paid < 0) {
          rowData.Unpaid = ToNumber(rowData.Unpaid);
          return NumberFormat(rowData.Unpaid);
        } else {
          rowData.NewUnPaid = ToNumber(rowData.Unpaid) - paid;
          return NumberFormat(rowData.Unpaid - paid);
        }
      },
    },
    {
      title: "Paid",
      field: "Paid",
      type: "numeric",
      sorting: false,
      render: (rowData) => {
        const checkValue = () => {
          if (rowData.Paid > rowData.Unpaid) {
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
              value={rowData.Paid ?? 0}
              onChange={(e) => {
                let value = ToNumber(e.target.value);
                dataPopup[rowData.tableData.id].Paid = value;
                setDataPopup([...dataPopup]);
                return value;
              }}
            />
          );
        } else {
          return <div style={{ width: 120 }}>{NumberFormat(rowData.Paid)}</div>;
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
                  selectedRows.Paid = ToNumber(selectedRows.Unpaid);
                } else {
                  selectedRows.Paid = 0;
                }
                dataPopup[selectedRows.tableData.id] = selectedRows;
                setDataPopup([...dataPopup]);
              }
              //Select All
              if (rows.length > 0 && !selectedRows) {
                dataPopup.forEach((item) => {
                  item.IsPaid = true;
                  item.Paid = item.Unpaid;
                });
                setDataPopup([...dataPopup]);
              }
              //UnSelect All
              if (rows.length === 0 && !selectedRows) {
                dataPopup.forEach((item) => {
                  item.IsPaid = false;
                  item.Paid = 0;
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
