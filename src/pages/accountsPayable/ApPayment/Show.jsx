import React, { useContext, useState, useEffect, useCallback } from "react";
import { GblContext } from "providers/formatter";
import clsx from "clsx";
import { Loading, Error, useRedirect, withTranslate } from "react-admin";
import { Paper, Grid, Button } from "@material-ui/core";
import TableFooter from "@material-ui/core/TableFooter";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import Typography from "@material-ui/core/Typography";
import Accordion from "@material-ui/core/Accordion";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import MUIDataTable from "mui-datatables";
import TextTopInGrid from "components/TextTopInGrid";
import ActionMenu from "components/ActionMenu";
import BoxHeader from "components/BoxHeader";
import NavRight from "components/NavRightSide";
import VisibilityIcon from "@material-ui/icons/Visibility";
import { permissionName } from "utils/constants";
import { getPaymentDetail, delPaymentDetail, updatePaymentDetail } from "services/accountPayable";
import { showReportByName } from "pages/Report/services";
import SnackbarUtils from "utils/SnackbarUtils";

const Show = (props) => {
  const classes = props.useStyles();
  const { settingAll, DateToString, NumberFormat, ToNumber } = useContext(GblContext);
  const { SettingClosePeriod, SettingAp } = settingAll;
  const redirect = useRedirect();
  const [data, setData] = useState();
  const [sumInvAmt, setSumInvAmt] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error] = useState();
  const [openDim, setOpenDim] = useState(false);
  const [dataDim, setDataDim] = useState();

  const { basePath, id, permissions, translate } = props;

  const CheckDisableBtn = () => data?.PyhStatus === "Void" || data?.PyhStatus === "Printed";

  const CheckPeriod = (date) => {
    if (date < SettingClosePeriod.ClosePeriodAp) {
      return false;
    } else {
      return true;
    }
  };

  const CheckEdit = () => {
    var msgClosePeriod = translate("ra.closePeriod.warning", { name: "payment", action: "edit" });
    // eslint-disable-next-line default-case
    switch (SettingAp.PaymentPostingBy) {
      case "ChequeClearingDate":
        if (!CheckPeriod(data.PyhClearDt)) {
          SnackbarUtils.warning(msgClosePeriod);
        } else {
          if (data.PyhStatus === "Effective") {
            redirect("edit", basePath, id);
          }
        }
        break;
      case "ChequeDate":
        if (!CheckPeriod(data.PyhChqDt)) {
          SnackbarUtils.warning(msgClosePeriod);
        } else {
          if (data.PyhStatus === "Effective") {
            redirect("edit", basePath, id);
          }
        }
        break;
      case "PaymentDate":
        if (!CheckPeriod(data.PyhDate)) {
          SnackbarUtils.warning(msgClosePeriod);
        } else {
          if (data.PyhStatus === "Effective") {
            redirect("edit", basePath, id);
          }
        }
        break;
    }
  };

  const CheckVoid = () => {
    var msgClosePeriod = translate("ra.closePeriod.warning", { name: "payment", action: "void" });
    // eslint-disable-next-line default-case
    switch (SettingAp.PaymentPostingBy) {
      case "ChequeClearingDate":
        if (!CheckPeriod(data.PyhClearDt)) {
          SnackbarUtils.warning(msgClosePeriod);
        } else {
          DelOrVoid();
        }
        break;
      case "ChequeDate":
        if (!CheckPeriod(data.PyhChqDt)) {
          SnackbarUtils.warning(msgClosePeriod);
        } else {
          DelOrVoid();
        }
        break;
      case "PaymentDate":
        if (!CheckPeriod(data.PyhDate)) {
          SnackbarUtils.warning(msgClosePeriod);
        } else {
          DelOrVoid();
        }
        break;
    }
  };

  const CheckPrintCheque = () => {
    var msg = "Cheque number or cheque date cannot be empty.";
    if (!!data.PyhChqFr === false || !!data.PyhChqDt === false) {
      SnackbarUtils.warning(msg);
      return;
    }

    let action = (key) => (
      <>
        <Button
          variant="contained"
          onClick={async () => {
            SnackbarUtils.closeSnackbar(key);
            data.PyhStatus = "Printed";
            const { Code, InternalMessage } = await updatePaymentDetail(data);
            if (Code === 0) {
              fetchPaymentById(id);
            } else {
              console.log(InternalMessage, "InternalMessage");
            }
            showReportByName("AP_PaymentCheque", [{ Name: "PyhSeq", Value: id }]);
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

    SnackbarUtils.warning(translate("ra.question.confirmPrintCheque"), {
      variant: "warning",
      autoHideDuration: null,
      action,
    });
  };

  const menuControlProp = [
    { name: "Back", fnc: () => redirect("list", basePath) },
    { name: "Add", fnc: () => redirect("create", basePath) },
    {
      name: "Edit",
      disabled: CheckDisableBtn(),
      fnc: CheckEdit,
    },
    { name: "Void", disabled: CheckDisableBtn(), fnc: CheckVoid },
    {
      name: "Print",
      disabled: data?.PyhStatus === "Printed",
      fnc: () => showReportByName("AP_PaymentVoucher", [{ Name: "PyhSeq", Value: id }]),
    },
    { name: "Print Cheque", disabled: CheckDisableBtn(), fnc: CheckPrintCheque },
    {
      name: "Print WHT",
      disabled: CheckDisableBtn(),
      fnc: () => showReportByName("AP_PaymentWHT", [{ Name: "PyhSeq", Value: id }]),
    },
  ];

  const fetchPaymentById = useCallback(async (mounted) => {
    const response = await getPaymentDetail(id);
    if (response) {
      setData(response);
      setSumInvAmt(NumberFormat(response.CurPayAmt));
    }
    if (mounted) {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let mounted = true;
    fetchPaymentById(mounted);
    return function cleanup() {
      mounted = false;
    };
  }, [fetchPaymentById]);

  const DelOrVoid = async () => {
    let msg = translate("ra.question.confirmVoid");
    let action = (key) => (
      <>
        <Button
          variant="contained"
          onClick={async () => {
            SnackbarUtils.closeSnackbar(key);
            const { Code, InternalMessage } = await delPaymentDetail(id);
            if (Code === 0) {
              fetchPaymentById(id);
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
          return (
            <>
              <VisibilityIcon
                fontSize="small"
                color="primary"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  ShowDim(tableMeta.rowData[9].Dim);
                }}
              />
            </>
          );
        },
      },
    },
    {
      name: "Info",
      label: "Invoice No.",
      options: {
        customBodyRender: (value) => {
          return typeof value === "object" ? value?.InvhInvNo : "";
        },
      },
    },
    {
      name: "Info",
      label: "Date",
      options: {
        customBodyRender: (value) => {
          return typeof value === "object" ? DateToString(value?.InvhInvDate) : "";
        },
      },
    },
    {
      name: "Info",
      label: "Description",
      options: {
        customBodyRender: (value) => {
          return typeof value === "object" ? value?.InvdDesc : "";
        },
      },
    },
    {
      name: "Info",
      label: "Currency",
      options: {
        customBodyRender: (value) => {
          return typeof value === "object" ? value?.CurCode : "";
        },
      },
    },
    {
      name: "Info",
      label: "Rate",
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
          return typeof value === "object" ? NumberFormat(value?.CurRate, "currency") : "";
        },
      },
    },
    {
      name: "Info",
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
          return typeof value === "object" ? NumberFormat(value?.TotalPrice) : "";
        },
      },
    },
    {
      name: "Paid",
      label: "Paid",
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
      name: "PaidBAmt",
      label: "Base Amount",
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
    tableBodyHeight: "300px",
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
      let sumAmount = opts.data.reduce((accu, item) => {
        let s = ToNumber(accu) + ToNumber(item.data[6]);
        return NumberFormat(s ?? 0);
      }, 0);
      let sumPaid = opts.data.reduce((accu, item) => {
        let s = ToNumber(accu) + ToNumber(item.data[7]);
        return NumberFormat(s ?? 0);
      }, 0);

      let sumBase = opts.data.reduce((accu, item) => {
        let s = ToNumber(accu) + ToNumber(item.data[8]);
        return NumberFormat(s ?? 0);
      }, 0);

      return (
        <TableFooter className={footerClasses}>
          <TableRow>
            {opts.columns.map((col, index) => {
              if (col.display === "true") {
                if (col.label === "Amount") {
                  return (
                    <TableCell key={index} className={footerClasses}>
                      {sumAmount}
                    </TableCell>
                  );
                } else if (col.label === "Paid") {
                  return (
                    <TableCell key={index} className={footerClasses}>
                      {sumPaid}
                    </TableCell>
                  );
                } else if (col.label === "Base Amount") {
                  return (
                    <TableCell key={index} className={footerClasses}>
                      {sumBase}
                    </TableCell>
                  );
                } else {
                  return <TableCell key={index} className={footerClasses} />;
                }
              }
              return null;
            })}
          </TableRow>
        </TableFooter>
      );
    },
  };

  const columnsWht = [
    {
      name: "Id",
      label: " ",
      options: {
        filter: false,
        viewColumns: false,
        display: false,
      },
    },
    {
      name: "WhtCode",
      label: "Code",
    },
    {
      name: "WhtDesc",
      label: "Description",
    },
    {
      name: "WhtRate",
      label: "Tax Rate (%)",
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
      name: "Amount",
      label: "Total Base Amount",
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
      name: "TaxAmt",
      label: "Tax Amount",
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

  const optionsWht = {
    responsive: "standard",
    selectableRows: "none",
    serverSide: true,
    fixedHeader: true,
    tableBodyHeight: "200px",
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
      let sumTaxamt = opts.data.reduce((accu, item) => {
        let s = ToNumber(accu) + ToNumber(item.data[5]);
        return NumberFormat(s ?? 0);
      }, 0);
      return (
        <TableFooter className={footerClasses}>
          <TableRow>
            {opts.columns.map((col, index) => {
              if (col.display === "true") {
                if (col.label === "Tax Amount") {
                  return (
                    <TableCell key={index} className={footerClasses}>
                      {sumTaxamt}
                    </TableCell>
                  );
                } else {
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
      for (var i = removeArray.length - 1; i >= 0; i--) data.PayWht.Items.splice(removeArray[i], 1);
    },
  };

  const ShowDim = (values) => {
    if (!values) {
      setDataDim(data.DimHList.Dim);
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
        permission={permissions.find((i) => i.Name === permissionName["AP.Payment"])}
      />
      {/* Payment Form */}
      <Paper className={classes.root}>
        <BoxHeader header={`Payment`} status={data.PyhStatus !== "" ? data.PyhStatus : "Effective"} />
        <Grid container alignItems="flex-start" spacing={1} style={{ marginBottom: 6 }}>
          <TextTopInGrid sizeSm={2} label="Payment Date" value={DateToString(data.PyhDate)} />
          <TextTopInGrid sizeSm={4} label="Vendor" value={`${data.VnCode} : ${data.VnName}`} />
          <TextTopInGrid sizeSm={4} label="Payment Type" value={`${data.AppyCode} : ${data.AppyDesc}`} />
          <TextTopInGrid sizeSm={1} label="Currency" value={data.CurCode} />
          <TextTopInGrid sizeSm={1} label="Rate" value={NumberFormat(data.CurRate, "currency")} />
          <TextTopInGrid sizeSm={2} label="Cheq. No. From" value={data.PyhChqFr} />
          <TextTopInGrid sizeSm={2} label="Cheq. No. To" value={data.PyhChqTo} />
          <TextTopInGrid sizeSm={2} label="Cheq. Date" value={DateToString(data.PyhChqDt)} />
          <TextTopInGrid sizeSm={2} label="Clearing Date" value={DateToString(data.PyhClearDt)} />
          <TextTopInGrid sizeSm={4} label="Description" value={data.PyhDesc} />
        </Grid>
        <MUIDataTable data={data.Detail} columns={columns} options={options} />
      </Paper>
      {/* Withholding Tax */}
      <Paper elevation={1} style={{ marginBottom: 6 }}>
        <Accordion defaultExpanded={false}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1-content" id="panel1-header">
            <Typography className={classes.heading}>Withholding Tax</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container alignItems="flex-start" spacing={1} style={{ marginBottom: 6 }}>
              <TextTopInGrid sizeSm={2} label="WHT. Form" value={data.PayWht.WhtTypeCode} />
              <TextTopInGrid sizeSm={2} label="Tax ID." value={data.PayWht.TaxId} />
              <TextTopInGrid sizeSm={2} label="Title" value={data.PayWht.PrePayee} />
              <TextTopInGrid sizeSm={2} label="Payee" value={data.PayWht.Payee} />
              <TextTopInGrid sizeSm={4} label="Address" value={data.PayWht.Address} />
              <TextTopInGrid sizeSm={2} label="WHT. No" value={data.PayWht.WhtNo} />
              <TextTopInGrid sizeSm={4} label="Ref" value={data.PayWht.WhtRemark1} />
              <TextTopInGrid sizeSm={6} label="Remark" value={data.PayWht.WhtRemark2} />
              <Grid item xs={12}>
                <MUIDataTable data={data.PayWht.Items} columns={columnsWht} options={optionsWht} />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Paper>

      {/* Payment Account */}
      <Paper elevation={1} className={classes.root}>
        <Grid container alignItems="flex-start" spacing={1} style={{ marginBottom: 6 }}>
          <Grid item xs={8}>
            <Grid container spacing={1} alignItems="center"></Grid>
          </Grid>
          <Grid item xs={4}>
            <Typography className={classes.heading} gutterBottom>
              Summary
            </Typography>
          </Grid>
          <Grid item xs={8}>
            <Grid container spacing={1} alignItems="center"></Grid>
          </Grid>
          <Grid item xs={4}>
            <Grid container spacing={1} alignItems="center">
              <Grid item xs={6}>
                <Typography variant="body2" style={{ marginTop: 8 }}>
                  Payment Amount
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1" align="right">
                  {NumberFormat(data.CurAmt ?? 0)}
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={8}>
            <Grid container spacing={1} alignItems="center">
              <Grid item xs={3}>
                <Typography className={classes.heading}>Payment Account</Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="body2" className="wrapText">
                  {`${data.DeptPayCode} : ${data.DeptPayDesc}`}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" className="wrapText">
                  {`${data.PyhCr} : ${data.PyhCrDesc}`}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={4}>
            <Grid container spacing={1} alignItems="center">
              <Grid item xs={6}>
                <Typography variant="body2">Settlement Base Amount</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1" align="right">
                  {sumInvAmt}
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={8}>
            <Grid container spacing={1} alignItems="center">
              <Grid item xs={3}>
                <Typography className={classes.heading}>Gain/Loss Account</Typography>
              </Grid>

              <Grid item xs={3}>
                <Typography variant="body2" className="wrapText">
                  {`${data.GainLossDept} : ${data.GainLossDeptDesc}`}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" className="wrapText">
                  {`${data.GainLossAcc} : ${data.GainLossAccDesc}`}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={4}>
            <Grid container spacing={1} alignItems="center">
              <Grid item xs={6}>
                <Typography variant="body2">Gain/Loss</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1" align="right">
                  {NumberFormat(data.GainLossAmt ?? 0)}
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={8}>
            <Grid container spacing={1} alignItems="center">
              <Grid item xs={3}>
                <Typography className={classes.heading}>WHT Account</Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="body2" className="wrapText">
                  {data.PayWht.WhtDeptCode ? `${data.PayWht.WhtDeptCode} : ${data.PayWht.WhtDeptDesc}` : ""}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" className="wrapText">
                  {data.PayWht.WhtTaxCr ? `${data.PayWht.WhtTaxCr} : ${data.PayWht.WhtTaxCrDesc}` : ""}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={4}>
            <Grid container spacing={1} alignItems="center">
              <Grid item xs={6}>
                <Typography variant="body2">Witholding Tax</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1" align="right">
                  {NumberFormat(data.PayWht?.WhtTotalAmt ?? 0)}
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={8}>
            <Grid container spacing={1} alignItems="center"></Grid>
          </Grid>
          <Grid item xs={4}>
            <Grid container spacing={1} alignItems="center">
              <Grid item xs={6} style={{ margin: "8px 0 8px 0" }}>
                <Typography variant="body2">Net Payment</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1" align="right">
                  <b>{NumberFormat(data.PyhAmt)}</b>
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      <NavRight
        open={openDim}
        close={() => setOpenDim(false)}
        ShowDim={() => ShowDim()}
        dataDim={dataDim}
        module={"AP_Payment"}
        moduleId={id}
      />
      <pre>{process.env.NODE_ENV === "development" ? JSON.stringify(data, 0, 2) : ""}</pre>
    </div>
  );
};

export default withTranslate(Show);
