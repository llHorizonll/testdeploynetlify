import React, { useContext, useState, useEffect, useCallback } from "react";
import { GblContext } from "providers/formatter";
import clsx from "clsx";
import { Loading, Error, useRedirect, withTranslate } from "react-admin";
import { Paper, Grid, Button } from "@material-ui/core";
import TableFooter from "@material-ui/core/TableFooter";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import MUIDataTable from "mui-datatables";
import TextTopInGrid from "components/TextTopInGrid";
import ActionMenu from "components/ActionMenu";
import BoxHeader from "components/BoxHeader";
import NavRight from "components/NavRightSide";
import DialogPayment from "./DialogPayment";
import VisibilityIcon from "@material-ui/icons/Visibility";
import { permissionName } from "utils/constants";
import SnackbarUtils from "utils/SnackbarUtils";
import { showReportByName } from "pages/Report/services";
import { getInvoiceDetail, delInvoiceDetail } from "services/accountPayable";

const Show = (props) => {
  const classes = props.useStyles();
  const { settingAll, DateToString, ToNumber, NumberFormat } = useContext(GblContext);
  const { SettingClosePeriod, SettingAp } = settingAll;
  const redirect = useRedirect();
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);
  const [error] = useState();
  const [openDim, setOpenDim] = useState(false);
  const [dataDim, setDataDim] = useState();
  const [dataTax, setDataTax] = useState();
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);

  const { basePath, id, permissions, translate } = props;

  const IsSettled = () => {
    let sumTotal = data.Detail.reduce((accu, item) => {
      let s = ToNumber(accu) + ToNumber(item.TotalPrice);
      return s;
    }, 0);

    let sumUnpaid = data.Detail.reduce((accu, item) => {
      let s = ToNumber(accu) + ToNumber(item.UnPaid);
      return s;
    }, 0);

    // eslint-disable-next-line eqeqeq
    if (sumUnpaid != sumTotal) {
      return true;
    }
    return false;
  };

  const CheckEdit = () => {
    var msg = translate("ra.apInvoice.settleWarnning");

    const action = (key) => (
      <>
        <Button
          variant="contained"
          onClick={() => {
            SnackbarUtils.closeSnackbar(key);
            localStorage.setItem("IsSettled", true);
            redirect("edit", basePath, id);
          }}
        >
          Yes
        </Button>
        <Button
          onClick={() => {
            SnackbarUtils.closeSnackbar(key);
          }}
        >
          No
        </Button>
      </>
    );

    if (data.InvhDate < SettingClosePeriod.ClosePeriodAp) {
      //ปิด period ไปแล้ว
      SnackbarUtils.warning(msg, {
        variant: "warning",
        autoHideDuration: null,
        action,
      });
    } else {
      //ยังไม่ถูกตัดจ่าย
      if (IsSettled() === false) {
        if (data.InvhSource !== "" && data.InvhSource !== "A/P") {
          console.log("in allowEdit");
          if (SettingAp.AllowEditPostingInvoice ?? false) {
            redirect("edit", basePath, id);
          } else {
            SnackbarUtils.warning(msg, {
              variant: "warning",
              autoHideDuration: null,
              action,
            });
          }
        } else {
          redirect("edit", basePath, id);
        }
      }
      //ตัดจ่ายไปแล้ว
      else {
        SnackbarUtils.warning(msg, {
          variant: "warning",
          autoHideDuration: null,
          action,
        });
      }
    }
  };

  const CheckDelete = () => {
    if (data.InvhDate < SettingClosePeriod.ClosePeriodAp) {
      //ปิด period ไปแล้ว
      SnackbarUtils.warning(translate("ra.closePeriod.warning", { name: "invoice", action: "delete" }));
    } else {
      //ยังไม่ถูกตัดจ่าย
      if (IsSettled() === false) {
        if (data.InvhSource !== "" && data.InvhSource !== "A/P") {
          if (SettingAp.AllowDeletePostingInvoice) {
            DelOrVoid();
          } else {
            SnackbarUtils.error("Not allow delete invoice");
          }
        } else {
          DelOrVoid();
        }
      }
      //ตัดจ่ายไปแล้ว
      else {
        SnackbarUtils.warning(translate("ra.apInvoice.delInvoiceSettled"));
      }
    }
  };

  const menuControlProp = [
    { name: "Back", fnc: () => redirect("list", basePath) },
    { name: "Add", fnc: () => redirect("create", basePath) },
    {
      name: "Edit",
      fnc: CheckEdit,
    },
    { name: "Delete", fnc: CheckDelete },
    { name: "Copy", fnc: () => redirect(`copy`, basePath) },
    { name: "Print", fnc: () => showReportByName("AP_Invoice", [{ Name: "InvhSeq", Value: id }]) },
    { name: "Payment", fnc: () => setOpenPaymentDialog(true) },
  ];

  const fetchInvoiceById = useCallback(async (mounted) => {
    const response = await getInvoiceDetail(id);
    if (response) {
      setData(response);
      let dataRow = response?.Detail[0];
      let tempDataTax = {
        ...dataRow,
        DeptCode: dataRow.DeptCode,
        DeptDesc: dataRow.DeptDesc,
        DrAcc: dataRow.InvdBTaxDr,
        DrAccDesc: dataRow.InvdBTaxDrDesc,
        CrAcc: dataRow.InvdBTaxCr1,
        CrAccDesc: dataRow.InvdBTaxCr1Desc,
        NetBaseAmt: dataRow.NetAmt * response.CurRate,
        TaxBaseAmt1: dataRow.InvdTaxA1,
        TaxType1: dataRow.InvdTaxT1,
        TaxRate1: dataRow.InvdTaxR1,
        TaxOverwrite1: dataRow.InvdT1Cr,
        TaxAcc1: dataRow.InvdT1Dr,
        TaxAcc1Desc: dataRow.InvdT1DrDesc,
        TaxBaseAmt2: dataRow.InvdTaxA2,
        TaxType2: dataRow.InvdTaxT2,
        TaxRate2: dataRow.InvdTaxR2,
        TaxOverwrite2: dataRow.InvdT2Cr,
        TaxAcc2: dataRow.InvdT2Dr,
        TaxAcc2Desc: dataRow.InvdT2DrDesc,
      };
      setDataTax(tempDataTax);
    }
    if (mounted) {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let mounted = true;
    fetchInvoiceById(mounted);
    return function cleanup() {
      mounted = false;
    };
  }, [fetchInvoiceById]);

  const DelOrVoid = async () => {
    let msg = translate("ra.question.confirmDel");

    let action = (key) => (
      <>
        <Button
          variant="contained"
          onClick={async () => {
            SnackbarUtils.closeSnackbar(key);
            const { Code, InternalMessage } = await delInvoiceDetail(id);
            if (Code === 0) {
              redirect("list", basePath);
            } else {
              console.log(InternalMessage, "InternalMessage");
            }
          }}
        >
          Yes
        </Button>
        <Button
          onClick={() => {
            SnackbarUtils.closeSnackbar(key);
          }}
        >
          No
        </Button>
      </>
    );
    SnackbarUtils.warning(msg, {
      variant: "warning",
      autoHideDuration: null,
      action,
    });
  };

  const columns = [
    {
      name: "index",
      label: " ",
      options: {
        filter: false,
        viewColumns: false,
        customBodyRender: (value, tableMeta) => {
          let dataRow = data.Detail[tableMeta.rowIndex];
          let tempDataTax = {
            ...dataRow,
            DeptCode: dataRow.DeptCode,
            DeptDesc: dataRow.DeptDesc,
            DrAcc: dataRow.InvdBTaxDr,
            DrAccDesc: dataRow.InvdBTaxDrDesc,
            CrAcc: dataRow.InvdBTaxCr1,
            CrAccDesc: dataRow.InvdBTaxCr1Desc,
            NetBaseAmt: dataRow.NetAmt * data.CurRate,
            TaxBaseAmt1: dataRow.InvdTaxA1,
            TaxType1: dataRow.InvdTaxT1,
            TaxRate1: dataRow.InvdTaxR1,
            TaxOverwrite1: dataRow.InvdT1Cr,
            TaxAcc1: dataRow.InvdT1Dr,
            TaxAcc1Desc: dataRow.InvdT1DrDesc,
            TaxBaseAmt2: dataRow.InvdTaxA2,
            TaxType2: dataRow.InvdTaxT2,
            TaxRate2: dataRow.InvdTaxR2,
            TaxOverwrite2: dataRow.InvdT2Cr,
            TaxAcc2: dataRow.InvdT2Dr,
            TaxAcc2Desc: dataRow.InvdT2DrDesc,
          };
          return (
            <>
              <VisibilityIcon
                fontSize="small"
                color="primary"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  ShowDim(tableMeta.rowData[10].Dim);
                  setDataTax(tempDataTax);
                }}
              />
            </>
          );
        },
      },
    },
    {
      name: "DeptCode",
      label: "Dept.",
    },
    {
      name: "InvdBTaxDr",
      label: "Account #",
    },
    {
      name: "InvdDesc",
      label: "Comment",
    },
    {
      name: "UnitCode",
      label: "Unit",
    },
    {
      name: "InvdQty",
      label: "Qty",
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
          return NumberFormat(value, "qty");
        },
      },
    },
    {
      name: "InvdPrice",
      label: "Price/Unit",
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
          return NumberFormat(value, "unit");
        },
      },
    },
    {
      name: "NetAmt",
      label: "Net Amount",
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
      name: "InvdTaxC1",
      label: "Tax Amount 1",
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
      name: "InvdTaxC2",
      label: "Tax Amount 2",
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
      name: "TotalPrice",
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
    {
      name: "UnPaid",
      label: "Unpaid",
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
      name: "DimList",
      label: "DimList",
      options: {
        display: false,
      },
    },
  ];

  const footerClasses = clsx({
    [classes.footerCell]: true,
    [classes.stickyFooterCell]: true,
  });

  const options = {
    responsive: "standard",
    selectableRows: "none",
    serverSide: true,
    fixedHeader: true,
    tableBodyHeight: "500px",
    search: false,
    download: false,
    filter: false,
    print: false,
    viewColumns: false,
    elevation: 0,
    setTableProps: () => {
      return {
        size: "small",
      };
    },
    pagination: false,
    customTableBodyFooterRender: function (opts) {
      let sumNet = opts.data.reduce((accu, item) => {
        let s = ToNumber(accu) + ToNumber(item.data[7]);
        return NumberFormat(s ?? 0);
      }, 0);

      let sumTax1 = opts.data.reduce((accu, item) => {
        let s = ToNumber(accu) + ToNumber(item.data[8]);
        return NumberFormat(s ?? 0);
      }, 0);

      let sumTax2 = opts.data.reduce((accu, item) => {
        let s = ToNumber(accu) + ToNumber(item.data[9]);
        return NumberFormat(s ?? 0);
      }, 0);

      let sumTotal = opts.data.reduce((accu, item) => {
        let s = ToNumber(accu) + ToNumber(item.data[10]);
        return NumberFormat(s ?? 0);
      }, 0);

      let sumUnpaid = opts.data.reduce((accu, item) => {
        let s = ToNumber(accu) + ToNumber(item.data[11]);
        return NumberFormat(s ?? 0);
      }, 0);
      return (
        <TableFooter className={footerClasses}>
          <TableRow>
            {opts.columns.map((col, index) => {
              if (col.display === "true") {
                switch (col.name) {
                  case "NetAmt":
                    return (
                      <TableCell key={index} className={footerClasses}>
                        {sumNet}
                      </TableCell>
                    );
                  case "InvdTaxC1":
                    return (
                      <TableCell key={index} className={footerClasses}>
                        {sumTax1}
                      </TableCell>
                    );
                  case "InvdTaxC2":
                    return (
                      <TableCell key={index} className={footerClasses}>
                        {sumTax2}
                      </TableCell>
                    );
                  case "TotalPrice":
                    return (
                      <TableCell key={index} className={footerClasses}>
                        {sumTotal}
                      </TableCell>
                    );
                  case "UnPaid":
                    return (
                      <TableCell key={index} className={footerClasses}>
                        {sumUnpaid}
                      </TableCell>
                    );
                  default:
                    return <TableCell key={index} className={footerClasses} />;
                }
              }
              return null;
            })}
          </TableRow>
        </TableFooter>
      );
    },
    onRowsDelete: (rowsDeleted) => {
      const removeArray = rowsDeleted.data.map((i) => i.index);
      for (var i = removeArray.length - 1; i >= 0; i--) data.Detail.splice(removeArray[i], 1);
    },
  };

  const ShowDim = (values) => {
    if (!values) {
      setDataDim(data.Detail[0].DimList.Dim);
      setOpenDim(true);
    } else {
      setDataDim(values);
      setOpenDim(true);
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error />;
  if (!data) return null;
  return (
    <div
      className={clsx(classes.drawer, {
        [classes.drawerOpen]: openDim,
        [classes.drawerClose]: !openDim,
      })}
    >
      <ActionMenu
        menuControl={menuControlProp}
        permission={permissions.find((i) => i.Name === permissionName["AP.Invoice"])}
      />

      <Paper className={classes.root}>
        <BoxHeader header={`Invoice`} status={data.InvhSource ? data.InvhSource : "A/P"} />
        <Grid container alignItems="flex-start" spacing={1} style={{ marginBottom: 6 }}>
          <TextTopInGrid sizeSm={2} label="Invoice No." value={data.InvhInvNo} />
          <TextTopInGrid sizeSm={4} label="Vendor" value={`${data.VnCode} : ${data.VnName}`} />
          <TextTopInGrid sizeSm={2} label="Currency" value={data.CurCode} />
          <TextTopInGrid sizeSm={4} label="Rate" value={NumberFormat(data.CurRate, "currency")} />
          <TextTopInGrid sizeSm={2} label="Input Date" value={DateToString(data.InvhDate)} />
          <TextTopInGrid sizeSm={2} label="Invoice Date" value={DateToString(data.InvhInvDate)} />
          <TextTopInGrid sizeSm={2} label="Credit" value={data.InvhCredit} />
          <TextTopInGrid sizeSm={2} label="Due Date" value={DateToString(data.InvhDueDate)} />
          <TextTopInGrid sizeSm={4} label="Description" value={data.InvhDesc} />
          <TextTopInGrid sizeSm={2} label="Tax Inv No." value={data.InvhTInvNo} />
          <TextTopInGrid sizeSm={2} label="Tax Status" value={data.TaxStatus} />
          <TextTopInGrid sizeSm={2} label="Tax Invoice Date" value={DateToString(data.InvhTInvDt)} />
          <TextTopInGrid sizeSm={2} label="Period" value={data.TaxPeriod} />
        </Grid>
        <MUIDataTable data={data.Detail} columns={columns} options={options} />
      </Paper>

      <NavRight
        open={openDim}
        close={() => setOpenDim(false)}
        ShowDim={() => ShowDim()}
        dataDim={dataDim}
        dataTax={dataTax}
        module={"AP_Invoice"}
        moduleId={id}
      />
      <pre>{process.env.NODE_ENV === "development" ? JSON.stringify(data, 0, 2) : ""}</pre>
      {openPaymentDialog && (
        <DialogPayment open={openPaymentDialog} onClose={() => setOpenPaymentDialog(false)} InvhSeq={data.InvhSeq} />
      )}
    </div>
  );
};

export default withTranslate(Show);
