import React, { useContext, useState, useEffect, useCallback } from "react";
import { GblContext } from "providers/formatter";
import clsx from "clsx";
import { Loading, Error, useRedirect, withTranslate } from "react-admin";
import { Paper, Grid } from "@material-ui/core";
import TableFooter from "@material-ui/core/TableFooter";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import MUIDataTable from "mui-datatables";
import TextTopInGrid from "components/TextTopInGrid";
import ActionMenu from "components/ActionMenu";
import BoxHeader from "components/BoxHeader";
import NavRight from "components/NavRightSide";
import DialogReceipt from "./DialogReceipt";
import VisibilityIcon from "@material-ui/icons/Visibility";
import { permissionName } from "utils/constants";
import { showReportByName } from "pages/Report/services";
import { getArInvoiceDetail, delArInvoiceDetail } from "services/accountReceivable";
import SnackbarUtils from "utils/SnackbarUtils";

const Show = (props) => {
  const classes = props.useStyles();
  const { settingAll, DateToString, NumberFormat, ToNumber } = useContext(GblContext);
  const { SettingClosePeriod } = settingAll;
  const { basePath, id, permissions, translate } = props;
  const redirect = useRedirect();
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);
  const [error] = useState();
  const [openDim, setOpenDim] = useState(false);
  const [dataDim, setDataDim] = useState();
  const [dataTax, setDataTax] = useState();
  const [openReceiptDialog, setOpenReceiptDialog] = useState(false);

  const CheckDisableBtn = () => data?.InvhStatus === "Void";

  const IsSettled = () => {
    // eslint-disable-next-line eqeqeq
    if (data.InvhTotal != data.InvhUnpaid) {
      return true;
    }
    return false;
  };

  const CheckEdit = () => {
    if (data.InvhDate < SettingClosePeriod.ClosePeriodAr) {
      //ปิด period ไปแล้ว
      SnackbarUtils.warning(translate("ra.closePeriod.warning", { name: "invoice", action: "edit" }));
    } else {
      //ยังไม่ถูกตัดจ่าย
      if (IsSettled() === false) {
        redirect("edit", basePath, id);
      }
      //ตัดจ่ายไปแล้ว
      else {
        SnackbarUtils.warning("This invoice has already have a receipt. Only Comment can process.");
      }
    }
  };

  const CheckDelete = () => {
    if (data.InvhDate < SettingClosePeriod.ClosePeriodAr) {
      //ปิด period ไปแล้ว
      SnackbarUtils.warning(translate("ra.closePeriod.warning", { name: "invoice", action: "void" }));
    } else {
      //ยังไม่ถูกตัดจ่าย
      if (IsSettled() === false) {
        DelOrVoid();
      }
      //ตัดจ่ายไปแล้ว
      else {
        SnackbarUtils.warning("This invoice has already have a receipt. Cannot void", {
          variant: "warning",
          autoHideDuration: 3000,
        });
      }
    }
  };

  const menuControlProp = [
    { name: "Back", fnc: () => redirect("list", basePath) },
    { name: "Add", fnc: () => redirect("create", basePath) },
    {
      name: "Edit",
      disabled: CheckDisableBtn(),
      fnc: CheckEdit,
    },
    { name: "Void", disabled: CheckDisableBtn(), fnc: CheckDelete },
    { name: "Copy", fnc: () => redirect(`copy`, basePath) },
    { name: "Print" , fnc: () => showReportByName("AR_Invoice", [{ Name: "InvhSeq", Value: id }]) },
    { name: "Receipt", fnc: () => setOpenReceiptDialog(true) },
  ];

  const fetchInvoiceById = useCallback(async (mounted) => {
    const response = await getArInvoiceDetail(id);
    if (response) {
      setData(response);
      let dataRow = response?.Detail[0];
      let tempDataTax = {
        ...dataRow,
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
    let msg = "Confirm Void ?";
    let dialog = window.confirm(msg);
    if (dialog) {
      const { Code, InternalMessage } = await delArInvoiceDetail(id);
      if (Code === 0) {
        redirect("list", basePath);
      } else {
        console.log(InternalMessage, "InternalMessage");
      }
    }
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
      name: "CrAcc",
      label: "Account #",
    },
    {
      name: "InvdDesc",
      label: "Comment",
    },
    {
      name: "Unit",
      label: "Unit",
    },
    {
      name: "Qty",
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
      name: "Price",
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
      name: "TaxAmt1",
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
      name: "TaxAmt2",
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
      name: "TotalAmt",
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
      name: "Unpaid",
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
                  case "TaxAmt1":
                    return (
                      <TableCell key={index} className={footerClasses}>
                        {sumTax1}
                      </TableCell>
                    );
                  case "TaxAmt2":
                    return (
                      <TableCell key={index} className={footerClasses}>
                        {sumTax2}
                      </TableCell>
                    );
                  case "TotalAmt":
                    return (
                      <TableCell key={index} className={footerClasses}>
                        {sumTotal}
                      </TableCell>
                    );
                  case "Unpaid":
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
        permission={permissions.find((i) => i.Name === permissionName["AR.Invoice"])}
      />

      <Paper className={classes.root}>
        <BoxHeader
          header={`Invoice`}
          status={data.InvhStatus !== "" ? data.InvhStatus : "Effective"}
          source={data.InvhSource !== "" ? data.InvhSource : "A/R"}
        />
        <Grid container alignItems="flex-start" spacing={1} style={{ marginBottom: 12 }}>
          <TextTopInGrid sizeSm={2} label="Invoice No." value={data.InvNo} />
          <TextTopInGrid sizeSm={2} label="Date" value={DateToString(data.InvhDate)} />
          <TextTopInGrid sizeSm={4} label="A/R No." value={`${data.ArNo} : ${data.Company}`} />
          <TextTopInGrid sizeSm={2} label="Currency" value={data.CurrCode} />
          <TextTopInGrid sizeSm={2} label="Rate" value={NumberFormat(data.CurrRate, "currency")} />
          <TextTopInGrid sizeSm={2} label="Tax Inv No." value={data.InvhTaxNo} />
          <TextTopInGrid sizeSm={2} label="Tax Status" value={data.TaxType} />
          <TextTopInGrid sizeSm={2} label="Due Date" value={DateToString(data.InvhDueDate)} />
          <TextTopInGrid sizeSm={4} label="Description" value={data.InvhDesc} />
        </Grid>
        <MUIDataTable data={data.Detail} columns={columns} options={options} />
      </Paper>

      <NavRight
        open={openDim}
        close={() => setOpenDim(false)}
        ShowDim={() => ShowDim()}
        dataDim={dataDim}
        dataTax={dataTax}
        module={"AR_Invoice"}
        moduleId={id}
      />
      <pre>{process.env.NODE_ENV === "development" ? JSON.stringify(data, 0, 2) : ""}</pre>
      {openReceiptDialog && (
        <DialogReceipt open={openReceiptDialog} onClose={() => setOpenReceiptDialog(false)} InvhSeq={data.InvhSeq} />
      )}
    </div>
  );
};

export default withTranslate(Show);
