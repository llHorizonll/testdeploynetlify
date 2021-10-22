import React, { useContext, useState, useEffect, useCallback } from "react";
import { GblContext } from "providers/formatter";
import clsx from "clsx";
import { Loading, Error, useRedirect, withTranslate } from "react-admin";
import { Paper, Grid } from "@material-ui/core";
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
import { getArReceiptDetail, delArReceiptDetail } from "services/accountReceivable";
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

  const CheckDisableBtn = () => data?.RcpthStatus === "Void";

  const CheckEdit = () => {
    var msgClosePeriod = translate("ra.closePeriod.warning", { name: "receipt", action: "edit" });
    if (data.RcpthDate < SettingClosePeriod.ClosePeriodAr) {
      //if (data.RcpthDate < SettingClosePeriod.ClosePeriodAr || ToNumber(data.AvlCrBaseAmt) === 0) {
      //ปิด period ไปแล้ว
      SnackbarUtils.warning(msgClosePeriod);
      return;
    } else {
      redirect("edit", basePath, id);
    }
  };

  const CheckDelete = () => {
    var msgClosePeriod = translate("ra.closePeriod.warning", { name: "receipt", action: "void" });
    if (data.RcpthDate < SettingClosePeriod.ClosePeriodAr) {
      //if (data.RcpthDate < SettingClosePeriod.ClosePeriodAr || ToNumber(data.AvlCrBaseAmt) === 0) {
      //ปิด period ไปแล้ว
      SnackbarUtils.warning(msgClosePeriod);
    } else {
      DelOrVoid();
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
    { name: "Print" },
  ];

  const fetchReceiptById = useCallback(async (mounted) => {
    const response = await getArReceiptDetail(id);
    if (response) {
      setData(response);
    }
    if (mounted) {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let mounted = true;
    fetchReceiptById(mounted);
    return function cleanup() {
      mounted = false;
    };
  }, [fetchReceiptById]);

  const DelOrVoid = async () => {
    let msg = "Confirm Void ?";
    let dialog = window.confirm(msg);
    if (dialog) {
      const { Code, InternalMessage } = await delArReceiptDetail(id);
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
          return typeof value === "object" ? value?.InvoiceHeader.InvNo : "";
        },
      },
    },
    {
      name: "RcptdDate",
      label: "Date",
      options: {
        customBodyRender: (value) => {
          return typeof value === "object" ? DateToString(value?.InvoiceHeader.InvhDate) : DateToString(value);
        },
      },
    },
    {
      name: "Info",
      label: "Description",
      options: {
        customBodyRender: (value) => {
          return typeof value === "object" ? value?.InvoiceDetail.InvdDesc : "";
        },
      },
    },
    {
      name: "Info",
      label: "Currency",
      options: {
        customBodyRender: (value) => {
          return typeof value === "object" ? value?.InvoiceHeader.CurrCode : "";
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
          return typeof value === "object" ? NumberFormat(value?.InvoiceHeader.CurrRate, "currency") : "";
        },
      },
    },
    {
      name: "InvAmount",
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
        customBodyRender: (value) => NumberFormat(value),
      },
    },
    {
      name: "RcptdAmount",
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
        customBodyRender: (value) => NumberFormat(value),
      },
    },
    {
      name: "RcptdBaseAmount",
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
        customBodyRender: (value) => NumberFormat(value),
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
                switch (col.name) {
                  case "RcptdAmount":
                    return (
                      <TableCell key={index} className={footerClasses}>
                        {sumPaid}
                      </TableCell>
                    );
                  case "RcptdBaseAmount":
                    return (
                      <TableCell key={index} className={footerClasses}>
                        {sumBase}
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
        permission={permissions.find((i) => i.Name === permissionName["AR.Receipt"])}
      />
      {/* Payment Form */}
      <Paper className={classes.root}>
        <BoxHeader header={`Receipt`} status={data.RcpthStatus ? data.RcpthStatus : "Effective"} />
        <Grid container alignItems="flex-start" spacing={1} style={{ marginBottom: 6 }}>
          <TextTopInGrid sizeSm={2} label="Receipt Ref. No." value={data.RcptRefNo} />
          <TextTopInGrid sizeSm={2} label="Receipt Date" value={DateToString(data.RcpthDate)} />
          <TextTopInGrid sizeSm={4} label="A/R No." value={data.ArNo && `${data.ArNo} : ${data.Company}`} />
          <TextTopInGrid sizeSm={2} label="Currency" value={data.CurrCode} />
          <TextTopInGrid sizeSm={2} label="Rate" value={NumberFormat(data.CurrRate ?? 0, "currency")} />
          <TextTopInGrid sizeSm={2} label="Pay Ref No." value={data.PayRefNo} />
          <TextTopInGrid sizeSm={2} label="Pay Date" value={DateToString(data.PayDate)} />
          <TextTopInGrid sizeSm={4} label="Pay Type" value={data.PayType} />
          <TextTopInGrid sizeSm={4} label="Description" value={data.RcptDesc} />
          <TextTopInGrid sizeSm={2} label="Tax Inv No." value={data.TaxInvNo} />
          <TextTopInGrid sizeSm={2} label="Rate (%)" value={NumberFormat(data.TaxRate)} />
          <TextTopInGrid sizeSm={2} label="Amount" value={NumberFormat(data.TaxAmt)} />
        </Grid>
        <MUIDataTable data={data.Detail} columns={columns} options={options} />
      </Paper>
      {/* Withholding Tax */}
      <Paper elevation={1} style={{ marginBottom: 12 }}>
        <Accordion defaultExpanded={false}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="Wht-content" id="Wht-header">
            <Typography className={classes.heading}>Withholding Tax</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container alignItems="flex-start" spacing={1} style={{ marginBottom: 6 }}>
              <TextTopInGrid sizeSm={3} label="Dept." value={data.WhtDept && `${data.WhtDept} : ${data.WhtDeptDesc}`} />
              <TextTopInGrid sizeSm={3} label="Acc." value={data.WhtAcc && `${data.WhtAcc} : ${data.WhtAccDesc}`} />
              <TextTopInGrid sizeSm={2} label="Total Amount" value={NumberFormat(data.AmtBfWht)} />
              <TextTopInGrid sizeSm={2} label="Rate" value={NumberFormat(data.WhtRate)} />
              <TextTopInGrid sizeSm={2} label="Amount" value={NumberFormat(data.WhtAmt)} />
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Paper>
      {/* Billing To */}
      <Paper elevation={1} style={{ marginBottom: 12 }}>
        <Accordion defaultExpanded={false}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="Billing-Content" id="Billing-header">
            <Typography className={classes.heading}>Billing To</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container alignItems="flex-start" spacing={1} style={{ marginBottom: 6 }}>
              <TextTopInGrid sizeSm={3} label="Name" value={data.BillToName} />
              <TextTopInGrid sizeSm={2} label="Billing To" value={data.BillTo} />
              <TextTopInGrid sizeSm={3} label="Company" value={data.BillToCompany} />
              <TextTopInGrid sizeSm={4} label="Address" value={data.BillToAddress} />
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Paper>
      {/* Receipt Account */}
      <Paper className={classes.root}>
        <Grid container alignItems="flex-start" spacing={1} style={{ marginBottom: 6 }}>
          <Grid item xs={8}>
            <Grid container spacing={1} alignItems="flex-start">
              <Grid item xs={12}>
                <Typography className={classes.heading}>Receipt Account</Typography>
              </Grid>
              <TextTopInGrid
                sizeSm={6}
                label="Dr Dept. Code"
                value={data.DeptDr && `${data.DeptDr} : ${data.DeptDrDesc}`}
              />
              <TextTopInGrid
                sizeSm={6}
                label="Dr Acc. Code"
                value={data.DrAcc && `${data.DrAcc} : ${data.DrAccDesc}`}
              />
              <TextTopInGrid
                sizeSm={6}
                label="Cr Dept. Code"
                value={data.DeptCr && `${data.DeptCr} : ${data.DeptCrDesc}`}
              />
              <TextTopInGrid
                sizeSm={6}
                label="Cr Acc. Code"
                value={data.CrAcc && `${data.CrAcc} : ${data.CrAccDesc}`}
              />

              {data.BankChargeAcc ? (
                <React.Fragment>
                  <Grid item xs={12}>
                    <Typography className={classes.heading}>BankCharge Account</Typography>
                  </Grid>
                  <TextTopInGrid
                    sizeSm={6}
                    label="Dept. Code"
                    value={data.BankChargeDept && `${data.BankChargeDept} : ${data.BankChargeDeptDesc}`}
                  />
                  <TextTopInGrid
                    sizeSm={6}
                    label="Acc. Code"
                    value={`${data.BankChargeAcc} : ${data.BankChargeAccDesc}`}
                  />
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <Grid item xs={6}></Grid>
                  <Grid item xs={6}></Grid>
                </React.Fragment>
              )}

              {data.GainLossAcc ? (
                <React.Fragment>
                  <Grid item xs={12}>
                    <Typography className={classes.heading}>Gain/Loss Account</Typography>
                  </Grid>
                  <TextTopInGrid
                    sizeSm={6}
                    label="Dept. Code"
                    value={data.DeptGL && `${data.DeptGL} : ${data.DeptGLDesc}`}
                  />
                  <TextTopInGrid sizeSm={6} label="Acc. Code" value={`${data.GainLossAcc} : ${data.GainLossAccDesc}`} />
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <Grid item xs={6}></Grid>
                  <Grid item xs={6}></Grid>
                </React.Fragment>
              )}
            </Grid>
          </Grid>

          <Grid item xs={4}>
            <Grid container spacing={1} alignItems="flex-start">
              <Grid item xs={12}>
                <Typography className={classes.heading}>Summary</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <b>Payment Amount</b>
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1" align="right">
                  {NumberFormat(data.Amount ?? 0)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <b>Settlement Base Amount</b>
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1" align="right">
                  {NumberFormat(data.BaseAmt ?? 0)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <b>Gain/Loss</b>
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1" align="right">
                  {NumberFormat(data.GainLossAmt ?? 0)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <b>Witholding Tax</b>
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1" align="right">
                  {NumberFormat(data.WhtAmt ?? 0)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <b>Bank Charge</b>
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1" align="right">
                  {NumberFormat(data.BankChargeAmt ?? 0)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <b>Net Payment</b>
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1" align="right">
                  {NumberFormat(data.NetBaseAmt)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <b>Avaliable Credit</b>
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1" align="right">
                  {NumberFormat(data.AvlCrBaseAmt)}
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
        module={"AR_Receipt"}
        moduleId={id}
      />
      <pre>{process.env.NODE_ENV === "development" ? JSON.stringify(data, 0, 2) : ""}</pre>
    </div>
  );
};

export default withTranslate(Show);
