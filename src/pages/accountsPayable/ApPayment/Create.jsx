/* eslint-disable eqeqeq */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useState, useEffect, useCallback } from "react";
import { GblContext } from "providers/formatter";
import { useRedirect, withTranslate } from "react-admin";
import { useStateWithCallbackLazy } from "use-state-with-callback";
import clsx from "clsx";
import { Paper, Grid, Button, Typography, TextField } from "@material-ui/core";
import { useForm } from "react-hook-form";
import { TableHead, TableFooter, TableRow, TableCell } from "@material-ui/core";
import Accordion from "@material-ui/core/Accordion";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import AddIcon from "@material-ui/icons/Add";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import MUIDataTable, { TableHead as MuiTableHead } from "mui-datatables";
import ActionMenu from "components/ActionMenu";
import BoxHeader from "components/BoxHeader";
import ButtonFooter from "components/ButtonFooter";
import NavRight from "components/NavRightSide";
import PopupTable from "components/PopupTable";
import PopupSettlement from "components/PopupSettlement";
import NumberFormatInput from "components/NumberFormatInput";
import { createPaymentDetail } from "services/accountPayable";
import { getActiveDimListByModuleName } from "services/dimension";
import Model from "models/apPayment";
import SnackbarUtils from "utils/SnackbarUtils";

const Create = (props) => {
  const classes = props.useStyles();
  const {
    basePath,
    formFields,
    formFieldsPaymentAccount,
    formFieldsGainLossAccount,
    formFiledWhtAccount,
    formFieldsWht,
    formFieldsWhtDetail,
    translate,
  } = props;
  const redirect = useRedirect();

  const { settingAll, DateToString, NumberFormat, ToNumber } = useContext(GblContext);
  const { SettingSystem } = settingAll;
  const [initData, setInitData] = useStateWithCallbackLazy(Model);
  const [initDataDetail, setInitDataDetail] = useState([]);
  const [unselectInvoice, setUnselectInvoice] = useState([]);
  const [sumInvAmt, setSumInvAmt] = useState(0);

  const [initNewWhtRow, setInitNewWhtRow] = useState({
    Id: 0,
    PyhSeq: 0,
    WhtCode: "",
    WhtDesc: "",
    WhtRate: 0,
    Amount: sumInvAmt,
    TaxAmt: 0,
  });

  const methods = useForm({ defaultValues: initData });

  const { handleSubmit, getValues, reset } = methods;

  useEffect(() => {
    Model.CurCode = SettingSystem.DefaultCurrencyCode;
    Model.CurRate = SettingSystem.DefaultCurrencyRate;
    setInitData(Model);
    setInitDataDetail(Model.Detail);
    reset(Model);
  }, []);

  const disableFormEnter = (e) => {
    if (e.key === "Enter" && e.target.localName !== "textarea") e.preventDefault();
  };

  const onSubmit = () => {
    CheckGLAccount();
    CheckWhtAccount();
    //Adjust parameter before save
    if (Object.keys(methods.errors).length === 0) {
      const values = getValues();
      setInitData(
        (state) => ({
          ...state,
          ...values,
          PayWht: {
            ...values.PayWht,
            WhtTypeCode: values.WhtTypeCode,
            WhtDeptCode: values.WhtDeptCode,
            WhtTaxCr: values.WhtTaxCr,
            WhtTotalAmt: ToNumber(state.PayWht.WhtTotalAmt),
            Items: [...state.PayWht.Items],
          },
          CurRate: ToNumber(values.CurRate),
          GainLossAmt: ToNumber(state.GainLossAmt),
          PyhAmt: ToNumber(state.PyhAmt),
        }),
        (nextState) => Save(nextState)
      );
    } else {
      return false;
    }
  };

  const menuControlProp = [
    { name: "Back", fnc: () => redirect("list", basePath) },
    { name: "Add", disabled: true },
    { name: "Edit", disabled: true },
    { name: "Void", disabled: true },
    { name: "Print", disabled: true },
  ];

  const fetchDimHListByModule = useCallback(async () => {
    const { Data } = await getActiveDimListByModuleName(10, 1, "AP-PH");
    setInitData((state) => ({
      ...state,
      DimHList: {
        Dim: Data,
      },
    }));
  }, []);

  useEffect(() => {
    fetchDimHListByModule();
  }, [fetchDimHListByModule]);

  const [showAdd, setShowAdd] = useState(false);
  const [showWhtService, setShowWhtService] = useState(false);
  const [editWhtIndex, setEditWhtIndex] = useState("");
  const [openDim, setOpenDim] = useState(false);
  const [dataDim, setDataDim] = useState();

  const CheckSelectedVendor = () => {
    let vnCode = getValues("VnCode");
    if (vnCode && vnCode !== "") {
      AddNewRow();
    } else {
      SnackbarUtils.warning(translate("ra.permission.selectVendorFirst"));
    }
  };

  const CustomHeader = (props) => {
    return (
      <>
        <TableHead>
          <TableRow>
            <TableCell colSpan={6} style={{ paddingLeft: 0 }}>
              <Button variant="outlined" onClick={CheckSelectedVendor} startIcon={<AddIcon />}>
                Select Invoice For Settlement
              </Button>
            </TableCell>
            <TableCell align="right" colSpan={5}></TableCell>
          </TableRow>
        </TableHead>
        <MuiTableHead {...props} />
      </>
    );
  };

  const AddNewRow = () => {
    setShowAdd(true);
  };

  const SaveFromPopup = (arr, rows) => {
    const arrayOfNewRows = [];
    //adjustRows
    rows.forEach((item) => {
      arrayOfNewRows.push({
        ...item,
        PydSeq: item.PydSeq ? item.PydSeq : undefined,
        PyhSeq: item.PyhSeq ? item.PyhSeq : undefined,
        InvhSeq: item.InvhSeq,
        InvdSeq: item.InvdSeq,
        CurCode: item.CurCode,
        CurRate: item.CurRate,
        Paid: item.Paid,
        PaidBAmt: item.Paid * item.CurRate,
        TotalPrice: item.TotalPrice,
        IsPaid: item.IsPaid,
      });
    });
    //selected
    let selected = arrayOfNewRows.filter((item) => item.IsPaid);
    //unselect
    let unselect = arrayOfNewRows.filter((item) => !item.IsPaid);
    arr.Detail = [...selected];

    setUnselectInvoice(unselect);
    CalculatePayment(arr, "afterselect");
    setShowAdd(false);
    console.log(selected);
  };

  const CancelFromPopup = (resetData) => {
    setInitData((state) => ({
      ...state,
      Detail: resetData,
    }));
    setShowAdd(false);
  };

  const CalculatePayment = (data, checkAfterSelectSettle) => {
    if (data) {
      let numCurRate = ToNumber(methods.watch("CurRate"));
      let sumPaidAmt = data.Detail.reduce((accu, item) => {
        let s = ToNumber(accu) + ToNumber(item.Paid);
        return NumberFormat(s ?? 0);
      }, 0);
      let sumPaidBAmt = data.Detail.reduce((accu, item) => {
        let s = ToNumber(accu) + ToNumber(item.PaidBAmt);
        return NumberFormat(s ?? 0);
      }, 0);
      let numInvAmt = ToNumber(sumPaidBAmt);
      let numCurAmt = ToNumber(sumPaidAmt);
      let numWhtAmt = ToNumber(data.PayWht?.WhtTotalAmt ?? 0);
      if (checkAfterSelectSettle) {
        data.CurAmt = NumberFormat(sumPaidAmt);
      }
      data.GainLossAmt = NumberFormat(numInvAmt - numCurAmt * numCurRate);
      data.PyhAmt = NumberFormat(numCurAmt * numCurRate - numWhtAmt);
      setSumInvAmt(sumPaidBAmt);
      setInitNewWhtRow((state) => ({ ...state, Amount: sumPaidBAmt }));
      setInitData(data);
    }
  };

  const AdjustPaymentAmount = (numInvAmt, numCurAmt, numWhtAmt) => {
    let numCurRate = ToNumber(methods.watch("CurRate"));
    let newCurAmt = ToNumber(numCurAmt);
    let newPayAmt = newCurAmt * numCurRate;
    setInitData((state) => ({
      ...state,
      CurAmt: numCurAmt,
      CurPayAmt: newPayAmt,
      GainLossAmt: NumberFormat(numInvAmt - newPayAmt),
      PyhAmt: NumberFormat(newPayAmt - numWhtAmt),
    }));
    if (numInvAmt - newPayAmt !== 0) {
      CheckGLAccount(numInvAmt - newPayAmt);
      CheckWhtAccount();
    } else {
      methods.clearErrors("GainLossDept");
      methods.clearErrors("GainLossAcc");
    }
  };

  const UpdateForm = (e) => {
    const values = getValues();
    if (values.VnCode !== "") {
      methods.clearErrors();
    }
    let vnCode = getValues("VnCode");
    if (vnCode && vnCode !== initData.VnCode) {
      setSumInvAmt(0);
      setInitData((state) => ({
        ...state,
        VnCode: vnCode,
        Detail: [],
        CurAmt: 0,
        CurPayAmt: 0,
        GainLossAmt: 0,
        PyhAmt: 0,
      }));
    }

    if (e.target.name === "CurRate") {
      let numSumInvAmt = ToNumber(sumInvAmt);
      let numWhtAmt = ToNumber(initData.PayWht?.WhtTotalAmt ?? 0);
      let numPayAmt = initData.CurAmt;
      AdjustPaymentAmount(numSumInvAmt, numPayAmt, numWhtAmt);
    }
  };

  const CheckGLAccount = (glAmt) => {
    const vGlDept = getValues("GainLossDept");
    const vGlAcc = getValues("GainLossAcc");
    var gainLossAmt = glAmt ? glAmt : ToNumber(initData.GainLossAmt);
    if (Number.isInteger(gainLossAmt)) {
      if (!!vGlDept === false && ToNumber(gainLossAmt) !== 0) {
        methods.setError("GainLossDept", {
          type: "required",
          message: "* Required",
        });
      }
      if (!!vGlAcc === false && ToNumber(gainLossAmt) !== 0) {
        methods.setError("GainLossAcc", {
          type: "required",
          message: "* Required",
        });
      }
      if (!!vGlDept == true) {
        methods.clearErrors("GainLossDept");
      }
      if (!!vGlAcc == true) {
        methods.clearErrors("GainLossAcc");
      }
    }
  };

  const CheckWhtAccount = () => {
    const whtDept = getValues("WhtDeptCode");
    const whtAcc = getValues("WhtTaxCr");
    const whtType = getValues("WhtTypeCode");

    if (ToNumber(initData.PayWht?.WhtTotalAmt) !== 0) {
      if (!!whtDept == false) {
        methods.setError("WhtDeptCode", {
          type: "required",
          message: "* Required",
        });
      }
    }
    if (ToNumber(initData.PayWht?.WhtTotalAmt) !== 0) {
      if (!!whtAcc == false) {
        methods.setError("WhtTaxCr", {
          type: "required",
          message: "* Required",
        });
      }
    }
    if (ToNumber(initData.PayWht?.WhtTotalAmt) !== 0) {
      if (!!whtType == false) {
        methods.setError("WhtTypeCode", {
          type: "required",
          message: "* Required",
        });
      }
    }

    if (!!whtDept || ToNumber(initData.PayWht?.WhtTotalAmt) === 0) {
      methods.clearErrors("WhtDeptCode");
    }
    if (!!whtAcc || ToNumber(initData.PayWht?.WhtTotalAmt) === 0) {
      methods.clearErrors("WhtTaxCr");
    }
    if (!!whtType || ToNumber(initData.PayWht?.WhtTotalAmt) === 0) {
      methods.clearErrors("WhtTypeCode");
    }
  };

  const columns = [
    {
      name: "index",
      label: " ",
      options: {
        display: false,
        filter: false,
        viewColumns: false,
      },
    },
    {
      name: "InvhInvNo",
      label: "Invoice No.",
      options: {
        sort: false,
      },
    },
    {
      name: "InvhInvDate",
      label: "Date",
      options: {
        sort: false,
        customBodyRender: (value) => {
          return DateToString(value);
        },
      },
    },
    {
      name: "InvdDesc",
      label: "Description",
      options: {
        sort: false,
      },
    },
    {
      name: "CurCode",
      label: "Currency",
      options: {
        sort: false,
      },
    },
    {
      name: "CurRate",
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
          return NumberFormat(value, "currency");
        },
      },
    },
    {
      name: "TotalPrice",
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
          return NumberFormat(value?.TotalPrice);
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
    tableId: "detail",
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
        customBodyRender: (value, tableMeta) => {
          return (
            <>
              <EditIcon
                fontSize="small"
                color="primary"
                style={{ cursor: "pointer", marginLeft: 10 }}
                onClick={() => UpdateWhtRow(value)}
              />
              <DeleteIcon
                fontSize="small"
                color="primary"
                style={{ cursor: "pointer", marginLeft: 10 }}
                onClick={() => {
                  initData.PayWht.Items.splice(tableMeta.rowIndex, 1);
                  if (initData.PayWht.Items.length > 0) {
                    let sumWhtAmt = initData.PayWht.Items.reduce((accu, item) => {
                      let s = ToNumber(accu) + ToNumber(item.TaxAmt);
                      return NumberFormat(s ?? 0);
                    }, 0);
                    initData.PayWht.WhtTotalAmt = sumWhtAmt;
                  } else {
                    initData.PayWht.WhtTotalAmt = 0;
                  }
                  CalculatePayment(initData);
                  setInitData(initData);
                  CheckWhtAccount();
                }}
              />
            </>
          );
        },
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
    tableId: "detailWht",
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
      const removeArray = rowsDeleted.data.map((i) => i.Id);
      for (var i = removeArray.length - 1; i >= 0; i--) initData.PayWht.Items.splice(removeArray[i], 1);
    },
  };

  const AddNewWhtRow = () => {
    setEditWhtIndex("");
    setShowWhtService(true);
  };

  const UpdateWhtRow = (value) => {
    setEditWhtIndex(value);
    setShowWhtService(true);
  };

  const SaveFromPopupWht = (arr, row) => {
    if (editWhtIndex !== "") {
      //update
      arr.PayWht.Items[editWhtIndex] = row;
    } else {
      //create
      if (arr.PayWht.Items) {
        row.index = arr.PayWht.Items.length;
        arr.PayWht.Items = [...arr.PayWht.Items, row];
      }
    }
    if (arr.PayWht.Items.length > 0) {
      let sumWhtAmt = arr.PayWht.Items.reduce((accu, item) => {
        let s = ToNumber(accu) + ToNumber(item.TaxAmt);
        return NumberFormat(s ?? 0);
      }, 0);
      arr.PayWht.WhtTotalAmt = sumWhtAmt;
      setInitData((state) => ({
        ...state,
        PayWht: {
          ...state.PayWht,
          WhtTotalAmt: sumWhtAmt,
          Items: [...arr.PayWht.Items],
        },
      }));
    } else {
      arr.PayWht.WhtTotalAmt = 0;
    }
    CalculatePayment(arr);
    CheckWhtAccount();
    setShowWhtService(false);
  };

  const CancelFromPopupWht = () => {
    setShowWhtService(false);
  };

  const CustomHeaderWht = (props) => {
    return (
      <>
        <TableHead>
          <TableRow>
            <TableCell colSpan={6} style={{ paddingLeft: 0 }}>
              <Button variant="outlined" onClick={AddNewWhtRow} startIcon={<AddIcon />}>
                WHT. Service Type
              </Button>
            </TableCell>
          </TableRow>
        </TableHead>
        <MuiTableHead {...props} />
      </>
    );
  };

  const Save = async (values) => {
    //Validate & CheckDetail
    console.log(values);
    const { Code, InternalMessage } = await createPaymentDetail(values);
    if (Code === 0) {
      redirect(`${InternalMessage}/show`);
    }
  };

  const ShowDim = (values) => {
    if (!values) {
      setDataDim(initData.DimHList.Dim);
      setOpenDim(true);
    } else {
      setDataDim(values);
      setOpenDim(true);
    }
  };

  const CancelFnc = () => {
    redirect("list", basePath);
  };

  const OnChangeWht = (field, m, data) => {
    let WhtRate = ToNumber(data["WhtRate"]);
    let Amount = ToNumber(data["Amount"]);
    if (field !== "TaxAmt") {
      m.setValue("TaxAmt", (Amount * WhtRate) / 100);
    }
  };

  return (
    <div
      className={clsx(classes.drawer, {
        [classes.drawerOpen]: openDim,
        [classes.drawerClose]: !openDim,
      })}
    >
      <ActionMenu menuControl={menuControlProp} />

      <form onSubmit={handleSubmit(onSubmit)} onKeyDown={disableFormEnter}>
        <Paper className={classes.root}>
          <BoxHeader header={"Payment"} status={initData.PyhStatus} />
          <Grid container alignItems="flex-start" spacing={1}>
            {formFields
              ? formFields.map((item, idx) => (
                  <Grid item xs={item.size} key={idx} style={item.style}>
                    {React.createElement(item.field.type, {
                      ...{
                        ...item.field.props,
                        methods,
                        key: item.field.props.name,
                        onChange: UpdateForm,
                      },
                    })}
                  </Grid>
                ))
              : ""}
          </Grid>
          <Grid container alignItems="flex-start">
            <Grid item xs={12}>
              <MUIDataTable
                data={initData.Detail}
                columns={columns}
                options={options}
                components={{
                  TableHead: CustomHeader,
                }}
              />
              {showAdd && (
                <PopupSettlement
                  initialValues={initDataDetail.length === 0 ? initData.Detail : initDataDetail}
                  unselectInvoice={unselectInvoice}
                  code={getValues("VnCode")}
                  paymentDate={getValues("PyhDate")}
                  open={showAdd}
                  save={(row) => SaveFromPopup(initData, row)}
                  cancel={CancelFromPopup}
                  maxWidth={"md"}
                />
              )}
            </Grid>
          </Grid>
        </Paper>
        <Paper elevation={1} style={{ marginBottom: 6 }}>
          <Accordion defaultExpanded={false}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1-content" id="panel1-header">
              <Typography className={classes.heading}>Withholding Tax</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container alignItems="flex-start" spacing={1} style={{ marginBottom: 6 }}>
                {formFieldsWht
                  ? formFieldsWht.map((item, idx) => (
                      <Grid item xs={item.size} key={idx} style={item.style}>
                        {React.createElement(item.field.type, {
                          ...{
                            ...item.field.props,
                            methods,
                            key: item.field.props.name,
                            onChange: CheckWhtAccount,
                          },
                        })}
                      </Grid>
                    ))
                  : ""}
                <Grid item xs={12}>
                  <MUIDataTable
                    data={initData.PayWht.Items}
                    columns={columnsWht}
                    options={optionsWht}
                    components={{
                      TableHead: CustomHeaderWht,
                    }}
                  />
                </Grid>
                {showWhtService && (
                  <PopupTable
                    initialValues={editWhtIndex !== "" ? initData.PayWht.Items[editWhtIndex] : initNewWhtRow}
                    formFields={formFieldsWhtDetail}
                    update={OnChangeWht}
                    open={showWhtService}
                    save={(row) => SaveFromPopupWht(initData, row)}
                    cancel={CancelFromPopupWht}
                    maxWidth={"md"}
                  />
                )}
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Paper>

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
                  <TextField
                    name="CurAmt"
                    variant="outlined"
                    margin="dense"
                    InputProps={{
                      inputComponent: NumberFormatInput,
                    }}
                    inputProps={{
                      style: { textAlign: "right" },
                      maxLength: 18,
                      decimal: 2,
                    }}
                    defaultValue={0}
                    value={NumberFormat(initData.CurAmt ?? 0)}
                    onChange={(e) => {
                      let numInvAmt = ToNumber(sumInvAmt);
                      let numCurAmt = ToNumber(e.target.value);
                      let numWhtAmt = ToNumber(initData.PayWht?.WhtTotalAmt ?? 0);
                      AdjustPaymentAmount(numInvAmt, numCurAmt, numWhtAmt);
                    }}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={8}>
              <Grid container spacing={1} alignItems="center">
                {formFieldsPaymentAccount
                  ? formFieldsPaymentAccount.map((item, idx) => (
                      <Grid item xs={item.size} key={idx}>
                        {React.createElement(item.field.type, {
                          ...{
                            ...item.field.props,
                            methods,
                            key: item.field.props.name,
                          },
                        })}
                      </Grid>
                    ))
                  : ""}
              </Grid>
            </Grid>
            <Grid item xs={4} style={{ marginTop: 10}}>
              <Grid container spacing={1} alignItems="center">
                <Grid item xs={6}>
                  <Typography variant="body2">Settlement Base Amount</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1" align="right" style={{ marginRight: 14 }}>
                    {NumberFormat(initData.CurPayAmt)}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={8}>
              <Grid container spacing={1} alignItems="center">
                {formFieldsGainLossAccount
                  ? formFieldsGainLossAccount.map((item, idx) => (
                      <Grid item xs={item.size} key={idx}>
                        {React.createElement(item.field.type, {
                          ...{
                            ...item.field.props,
                            methods,
                            key: item.field.props.name,
                          },
                        })}
                      </Grid>
                    ))
                  : ""}
              </Grid>
            </Grid>
            <Grid item xs={4}  style={{ marginTop: 10}}>
              <Grid container spacing={1} alignItems="center">
                <Grid item xs={6}>
                  <Typography variant="body2">Gain/Loss</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1" align="right" style={{ marginRight: 14 }}>
                    {NumberFormat(initData.GainLossAmt ?? 0)}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={8}>
              <Grid container spacing={1} alignItems="center">
                {formFiledWhtAccount
                  ? formFiledWhtAccount.map((item, idx) => (
                      <Grid item xs={item.size} key={idx}>
                        {React.createElement(item.field.type, {
                          ...{
                            ...item.field.props,
                            methods,
                            key: item.field.props.name,
                          },
                        })}
                      </Grid>
                    ))
                  : ""}
              </Grid>
            </Grid>
            <Grid item xs={4} style={{ marginTop: 10}}>
              <Grid container spacing={1} alignItems="center">
                <Grid item xs={6}>
                  <Typography variant="body2">Witholding Tax</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1" align="right" style={{ marginRight: 14 }}>
                    {NumberFormat(initData.PayWht?.WhtTotalAmt ?? 0)}
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
                  <Typography variant="body1" align="right" style={{ marginRight: 14 }}>
                    <b>{NumberFormat(initData.PyhAmt)}</b>
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Paper>

        <pre>{process.env.NODE_ENV === "development" ? JSON.stringify(initData, 0, 2) : ""}</pre>
        <ButtonFooter CancelFnc={CancelFnc} />
      </form>

      <NavRight
        open={openDim}
        close={() => setOpenDim(false)}
        ShowDim={() => ShowDim()}
        dataDim={dataDim}
        modify
        update={(item, value) => {
          dataDim.forEach((i) => {
            if (i.Id === item.Id) {
              i.Value = value;
              if (i.Type === "Date") {
                i.Value = new Date(value);
              }
            }
          });
          setDataDim(dataDim);
          methods.trigger();
        }}
      />
    </div>
  );
};

export default withTranslate(Create);
