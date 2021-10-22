/* eslint-disable eqeqeq */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useState, useEffect } from "react";
import { GblContext } from "providers/formatter";
import { useStateWithCallbackLazy } from "use-state-with-callback";
import clsx from "clsx";
import { useRedirect, withTranslate } from "react-admin";
import { Paper, Grid, Button, TextField, Typography, Checkbox } from "@material-ui/core";
import { useForm } from "react-hook-form";
import { TableHead, TableFooter, TableRow, TableCell, FormControlLabel } from "@material-ui/core";
import Accordion from "@material-ui/core/Accordion";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import AddIcon from "@material-ui/icons/Add";
import MUIDataTable, { TableHead as MuiTableHead } from "mui-datatables";
import ActionMenu from "components/ActionMenu";
import BoxHeader from "components/BoxHeader";
import ButtonFooter from "components/ButtonFooter";
import NavRight from "components/NavRightSide";
import PopupSettlementAr from "components/PopupSettlementAr";
import NumberFormatInput from "components/NumberFormatInput";
import { createArReceiptDetail } from "services/accountReceivable";
import Model from "models/arReceipt";
import SnackbarUtils from "utils/SnackbarUtils";

const Create = (props) => {
  const classes = props.useStyles();
  const {
    basePath,
    formFields,
    formFieldsReceiptAccount,
    formFieldsGainLossAccount,
    formFieldsBank,
    formFieldsBilling,
    formFieldsWht,
    arProfileList,

    translate,
  } = props;
  const redirect = useRedirect();

  const { settingAll, DateToString, NumberFormat, ToNumber, FindTaxAmount } = useContext(GblContext);
  const { SettingSystem, SettingAr } = settingAll;

  const [initData, setInitData] = useStateWithCallbackLazy(Model);
  const [initDataDetail, setInitDataDetail] = useState([]);
  const [unselectInvoice, setUnselectInvoice] = useState([]);
  const [sumInvAmt, setSumInvAmt] = useState(0);
  const [showWhtOw, setShowWhtOw] = useState(false);
  const [checkSettleDate, setCheckSettleDate] = useState(false);

  const methods = useForm({ defaultValues: initData });

  const { handleSubmit, getValues, setValue, reset } = methods;

  useEffect(() => {
    Model.CurrCode = SettingSystem.DefaultCurrencyCode;
    Model.CurrRate = SettingSystem.DefaultCurrencyRate;
    Model.DeptDr = SettingAr.ReceiptDeptCode;
    Model.DeptDrDesc = SettingAr.ReceiptDeptDesc;
    Model.DeptCr = SettingAr.ReceiptDeptCode;
    Model.DeptCrDesc = SettingAr.ReceiptDeptDesc;
    Model.DrAcc = SettingAr.ReceiptDrAcc;
    Model.DrAccDesc = SettingAr.ReceiptDrAccDesc;
    Model.CrAcc = SettingAr.ReceiptCrAcc;
    Model.CrAccDesc = SettingAr.ReceiptCrAccDesc;
    Model.TaxType = SettingAr.ReceiptTaxType;
    Model.TaxRate = SettingAr?.ReceiptTaxRate ?? 0;
    setCheckSettleDate(Model.SetAsSettleDate);
    setInitData(Model);
    setInitDataDetail(Model.Detail);
    reset(Model);
  }, []);

  const disableFormEnter = (e) => {
    if (e.key === "Enter" && e.target.localName !== "textarea") e.preventDefault();
  };

  //FIXME: can't get methods erros before submit

  const onSubmit = () => {
    CheckGLAccount();
    CheckBankAccount();
    CheckWhtAccount();
    //TODO : Adjust parameter before save
    if (checkSettleDate) {
      initData.Detail.forEach((element) => {
        element.InvhDate = element.RcptdDate;
      });
    }

    if (Object.keys(methods.errors).length === 0) {
      const values = getValues();
      setInitData(
        (state) => ({
          ...state,
          ...values,
          SetAsSettleDate: checkSettleDate,
          CurrRate: ToNumber(values.CurrRate),
          GainLossAmt: ToNumber(state.GainLossAmt),
          Amount: ToNumber(state.Amount),
          NetBaseAmt: ToNumber(state.NetBaseAmt),
          TaxRate: ToNumber(values.TaxRate),
          TaxAmt: ToNumber(values.TaxAmt),
          TaxBaseAmt: ToNumber(values.TaxBaseAmt),
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

  const [showAdd, setShowAdd] = useState(false);
  const [openDim, setOpenDim] = useState(false);
  const [dataDim, setDataDim] = useState();

  const AddNewRow = () => {
    setShowAdd(true);
  };

  const SaveFromPopup = (arr, rows) => {
    var arrayOfNewRows = [];
    //adjustRows
    rows.forEach((item) => {
      arrayOfNewRows.push({
        ...item,
        InvAmount: item.InvAmount ? item.InvAmount : item.TotalAmt,
        RcptdDate: item.RcptdDate,
        RcptdCurrCode: item.RcptdCurrCode ? item.RcptdCurrCode : item.CurrCode,
        RcptdCurrRate: item.RcptdCurrRate ? item.RcptdCurrRate : ToNumber(item.CurrRate),
        RcptdAmount: item.RcptPaid,
        RcptdBaseAmount: item.RcptPaid * ToNumber(item.CurrRate),
        RcptPaid: item.RcptPaid,
        RcptPaidBaseAmount: item.RcptPaid * ToNumber(item.CurrRate),
      });
    });

    //selected
    let selected = arrayOfNewRows.filter((item) => item.IsPaid);

    //unselect
    let unselect = arrayOfNewRows.filter((item) => !item.IsPaid);
    arr.Detail = [...selected];
    setUnselectInvoice(unselect);

    if (selected.length > 0) {
      CalculateTax(selected);
    }
    CalculatePayment(arr, "afterselect");
    setShowAdd(false);
  };

  const CancelFromPopup = (resetData) => {
    setInitData((state) => ({
      ...state,
      Detail: resetData,
    }));
    setShowAdd(false);
  };

  const CalculateTax = (rows) => {
    let countHaveTax = 0;
    let sumTaxAmt1 = rows.reduce((accu, item) => {
      let s = ToNumber(accu) + ToNumber(item.TaxAmt1);
      return ToNumber(s ?? 0);
    }, 0);
    let sumTaxBaseAmt1 = rows.reduce((accu, item) => {
      let s = ToNumber(accu) + ToNumber(item.TaxBaseAmt1);
      return ToNumber(s ?? 0);
    }, 0);
    let sumTaxRate1 = rows.reduce((accu, item) => {
      let s = ToNumber(accu) + ToNumber(item.TaxRate1);
      countHaveTax++;
      return ToNumber(s ?? 0);
    }, 0);
    setValue("TaxRate", sumTaxRate1 / countHaveTax);
    setValue("TaxAmt", sumTaxAmt1);
    setValue("TaxBaseAmt", sumTaxBaseAmt1);
    setValue("RunTaxType", sumTaxBaseAmt1 > 0 ? true : false);
    setValue("TaxInvNo", sumTaxBaseAmt1 > 0 ? "Auto" : "");
  };

  const CalculateWhtAmt = (t, r) => {
    let whtTotal = ToNumber(t);
    let whtRate = ToNumber(r);
    let whtAmt = FindTaxAmount("Add", whtRate, whtTotal);
    setInitData((state) => ({
      ...state,
      AmtBfWht: whtTotal,
      WhtRate: whtRate,
      WhtAmt: whtAmt,
    }));

    if (whtAmt !== 0) {
      CheckWhtAccount(whtAmt);
    }
  };

  const CalculatePayment = (data, checkAfterSelectSettle) => {
    if (data) {
      let numCurRate = ToNumber(methods.watch("CurrRate"));
      let sumPaidAmt = data.Detail.reduce((accu, item) => {
        let s = ToNumber(accu) + ToNumber(item.RcptPaid);
        return NumberFormat(s ?? 0);
      }, 0);
      let sumPaidBAmt = data.Detail.reduce((accu, item) => {
        let s = ToNumber(accu) + ToNumber(item.RcptPaidBaseAmount);
        return NumberFormat(s ?? 0);
      }, 0);
      let numInvAmt = ToNumber(sumPaidBAmt);
      let numCurAmt = ToNumber(sumPaidAmt);
      let numWhtAmt = ToNumber(data.WhtAmt ?? 0);
      let numBankChargeAmt = ToNumber(data.BankChargeAmt ?? 0);
      if (checkAfterSelectSettle) {
        data.Amount = NumberFormat(sumPaidAmt);
      }
      data.GainLossAmt = NumberFormat(numInvAmt - numCurAmt * numCurRate);
      data.NetBaseAmt = NumberFormat(numCurAmt * numCurRate - numWhtAmt - numBankChargeAmt);
      setSumInvAmt(sumPaidBAmt);
      setInitData(data);
    }
  };

  const AdjustPaymentAmount = (numInvAmt, numCurAmt, numWhtAmt, numBankChargeAmt) => {
    let numCurRate = ToNumber(methods.watch("CurrRate"));
    let newCurAmt = ToNumber(numCurAmt);
    let newPayAmt = newCurAmt * numCurRate;
    setInitData((state) => ({
      ...state,
      Amount: numCurAmt,
      BaseAmt: newPayAmt,
      GainLossAmt: NumberFormat(numInvAmt - newPayAmt),
      NetAmt: (newPayAmt - numWhtAmt) / numCurRate,
      NetBaseAmt: NumberFormat(newPayAmt - numWhtAmt - numBankChargeAmt),
    }));
    if (numInvAmt - newPayAmt !== 0) {
      CheckGLAccount(numInvAmt - newPayAmt);
    } else {
      methods.clearErrors("GainLossDept");
      methods.clearErrors("GainLossAcc");
    }
  };

  const UpdateForm = (e) => {
    let arNo = getValues("ArNo");
    let billTo = getValues("Billto");

    if (e.target.name === "RcpthDate") {
      //setValue("RcpthDate", e.target.value);
      setInitData((state) => ({
        ...state,
        RcpthDate: e.target.value,
      }));
    }

    //set some input readonly
    if (e.target.name === "RunNoType") {
      if (e.target.value === "true") {
        document.getElementsByName("RcptRefNo")[0].parentNode.parentNode.firstChild.classList.remove("Mui-disabled");
        document.getElementsByName("RcptRefNo")[0].parentNode.classList.remove("Mui-disabled");
        document.getElementsByName("RcptRefNo")[0].classList.remove("Mui-disabled");
        document.getElementsByName("RcptRefNo")[0].disabled = false;
        document.getElementsByName("RcptRefNo")[0].focus();
        setValue("RcptRefNo", "");
        // setValue("TaxRate", 0);
        // setValue("TaxAmt", 0);
        // setValue("TaxBaseAmt", 0);
      } else {
        document.getElementsByName("RcptRefNo")[0].parentNode.parentNode.firstChild.classList.add("Mui-disabled");
        document.getElementsByName("RcptRefNo")[0].parentNode.classList.add("Mui-disabled");
        document.getElementsByName("RcptRefNo")[0].classList.add("Mui-disabled");
        document.getElementsByName("RcptRefNo")[0].disabled = true;
        setValue("RcptRefNo", "Auto");
        methods.clearErrors("RcptRefNo");
      }
    }

    if (e.target.name === "RunTaxType") {
      if (e.target.value === "false") {
        document.getElementsByName("TaxInvNo")[0].parentNode.parentNode.firstChild.classList.add("Mui-disabled");
        document.getElementsByName("TaxInvNo")[0].parentNode.classList.add("Mui-disabled");
        document.getElementsByName("TaxInvNo")[0].disabled = true;
        setValue("TaxInvNo", initData.RcptRefNo);
      } else {
        document.getElementsByName("TaxInvNo")[0].parentNode.parentNode.firstChild.classList.remove("Mui-disabled");
        document.getElementsByName("TaxInvNo")[0].parentNode.classList.remove("Mui-disabled");
        document.getElementsByName("TaxInvNo")[0].disabled = false;
        document.getElementsByName("TaxInvNo")[0].focus();
        setValue("TaxInvNo", "");
        setValue("TaxRate", 0);
        setValue("TaxAmt", 0);
      }
    }

    if (e.target.name === "TaxOverwrite") {
      if (e.target.value === "false") {
        document.getElementsByName("TaxAmt")[0].parentNode.parentNode.firstChild.classList.remove("Mui-disabled");
        document.getElementsByName("TaxAmt")[0].parentNode.classList.remove("Mui-disabled");
        document.getElementsByName("TaxAmt")[0].disabled = false;
        document.getElementsByName("TaxAmt")[0].focus();
      } else {
        document.getElementsByName("TaxAmt")[0].parentNode.parentNode.firstChild.classList.add("Mui-disabled");
        document.getElementsByName("TaxAmt")[0].parentNode.classList.add("Mui-disabled");
        document.getElementsByName("TaxAmt")[0].disabled = true;
        let numCurRate = ToNumber(methods.watch("CurrRate"));
        let taxAmt = FindTaxAmount("Include", ToNumber(initData.TaxRate), ToNumber(initData.Amount));
        setValue("TaxAmt", taxAmt);
        setValue("TaxBaseAmt", taxAmt * numCurRate);
      }
    }

    if (arNo && arNo !== initData.ArNo) {
      let arItem = arProfileList.find((item) => item.ArNo == arNo);
      let address = arItem.AddressInfo[`${arItem.Billto}`];
      setValue("ArNo", arItem.ArNo);
      setValue("Billto", arItem.Billto);
      setValue("BillToAddress", address);
      setValue("PayType", arItem.PaymentCode);
      setValue("PayDesc", arItem.PaymentDesc);
      setValue("RunTaxType", false);
      setValue("TaxInvNo", "");
      setSumInvAmt(0);
      setInitData((state) => ({
        ...state,
        ArNo: arItem.ArNo,
        Detail: [],
        Amount: 0,
        GainLossAmt: 0,
        NetAmt: 0,
        NetBaseAmt: 0,
        AvlCrAmt: 0,
        AvlCrBaseAmt: 0,
      }));
    }

    if (e.target.name === "TaxRate") {
      let numCurRate = ToNumber(methods.watch("CurrRate"));
      let taxAmt = FindTaxAmount("Include", ToNumber(e.target.value), ToNumber(initData.Amount));
      setValue("TaxAmt", taxAmt);
      setValue("TaxBaseAmt", taxAmt * numCurRate);
    }
    if (e.target.name === "CurrRate") {
      let numSumInvAmt = ToNumber(sumInvAmt);
      let numWhtAmt = ToNumber(initData.WhtAmt ?? 0);
      let numPayAmt = initData.Amount;
      let numBankChargeAmt = ToNumber(initData.BankChargeAmt ?? 0);
      AdjustPaymentAmount(numSumInvAmt, numPayAmt, numWhtAmt, numBankChargeAmt);
    }
    if (billTo && billTo !== initData.Billto) {
      let arItem = arProfileList.find((item) => item.ArNo == arNo);
      let address = arItem.AddressInfo[`${billTo}`];
      setValue("Billto", billTo);
      setValue("BillToAddress", address);
      setInitData((state) => ({
        ...state,
        Billto: billTo,
        BillToAddress: address,
      }));
    }
    //set some input readonly
    //SetDisableInput(values);
  };

  // const SetDisableInput = (values) => {
  //   if (values.TaxOverwrite) {
  //     document.getElementsByName("TaxAmt")[0].disabled = false;
  //   } else {
  //     let numCurRate = ToNumber(methods.watch("CurrRate"));
  //     let taxAmt = FindTaxAmount("Include", ToNumber(initData.TaxRate), ToNumber(initData.Amount));
  //     setValue("TaxAmt", taxAmt);
  //     setValue("TaxBaseAmt", taxAmt * numCurRate);
  //     document.getElementsByName("TaxAmt")[0].disabled = true;
  //   }
  // };

  const CheckGLAccount = (glAmt) => {
    const vGlDept = getValues("GainLossDept");
    const vGlAcc = getValues("GainLossAcc");
    var gainLossAmt = glAmt ? ToNumber(glAmt) : ToNumber(initData.GainLossAmt);
    if (Number.isInteger(gainLossAmt)) {
      if (!!vGlDept === false && gainLossAmt !== 0) {
        methods.setError("GainLossDept", {
          type: "required",
          message: "* Required",
        });
      }
      if (!!vGlAcc === false && gainLossAmt !== 0) {
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

  const CheckBankAccount = (bankAmt) => {
    const vBankDept = getValues("BankChargeDept");
    const vBankAcc = getValues("BankChargeAcc");
    var bankAmount = bankAmt ? ToNumber(bankAmt) : ToNumber(initData.BankChargeAmt);
    if (Number.isInteger(bankAmount)) {
      if (!!vBankDept === false && bankAmount !== 0) {
        methods.setError("BankChargeDept", {
          type: "required",
          message: "*Required",
        });
      }
      if (!!vBankAcc === false && bankAmount !== 0) {
        methods.setError("BankChargeAcc", {
          type: "required",
          message: "*Required",
        });
      }
      if (!!vBankDept === true) {
        methods.clearErrors("BankChargeDept");
      }
      if (!!vBankAcc === true) {
        methods.clearErrors("BankChargeAcc");
      }
    }
  };

  const CheckWhtAccount = (whtAmt) => {
    const vWhtDept = getValues("WhtDept");
    const vWhtAcc = getValues("WhtAcc");
    var whtAmount = whtAmt ? ToNumber(whtAmt) : ToNumber(initData.WhtAmt);
    if (Number.isInteger(whtAmount)) {
      if (!!vWhtDept === false && whtAmount !== 0) {
        methods.setError("WhtDept", {
          type: "required",
          message: "*Required",
        });
      }
      if (!!vWhtAcc === false && whtAmount !== 0) {
        methods.setError("WhtAcc", {
          type: "required",
          message: "*Required",
        });
      }
      if (!!vWhtDept == true) {
        methods.clearErrors("WhtDept");
      }
      if (!!vWhtAcc == true) {
        methods.clearErrors("WhtAcc");
      }
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
      name: "InvNo",
      label: "Invoice No.",
      options: {
        sort: false,
        customBodyRender: (value) => {
          return typeof value === "object" ? value?.InvoiceHeader.InvNo : value;
        },
      },
    },
    {
      name: "RcptdDate",
      label: "Settle on",
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
        customBodyRender: (value) => {
          return typeof value === "object" ? value?.InvoiceDetail.InvdDesc : value;
        },
      },
    },
    {
      name: "CurrCode",
      label: "Currency",
      options: {
        sort: false,
        customBodyRender: (value) => {
          return typeof value === "object" ? value?.InvoiceHeader.CurrCode : value;
        },
      },
    },
    {
      name: "CurrRate",
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
          return typeof value === "object"
            ? NumberFormat(value?.InvoiceHeader.CurrRate, "currency")
            : NumberFormat(value, "currency");
        },
      },
    },
    {
      name: "TotalAmt",
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
          return typeof value === "object" ? NumberFormat(value?.InvoiceDetail.TotalAmt) : NumberFormat(value);
        },
      },
    },
    {
      name: "RcptPaid",
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
      name: "RcptPaidBaseAmount",
      label: "Base Amount Paid",
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
      let sumPaid = opts.data.reduce((accu, item) => {
        let s = ToNumber(accu) + ToNumber(item.data[7]);
        return NumberFormat(s ?? 0);
      }, 0);

      let sumBasePaid = opts.data.reduce((accu, item) => {
        let s = ToNumber(accu) + ToNumber(item.data[8]);
        return NumberFormat(s ?? 0);
      }, 0);
      return (
        <TableFooter className={footerClasses}>
          <TableRow>
            {opts.columns.map((col, index) => {
              if (col.display === "true") {
                switch (col.label) {
                  case "Paid":
                    return (
                      <TableCell key={index} className={footerClasses}>
                        {sumPaid}
                      </TableCell>
                    );
                  case "Base Amount Paid":
                    return (
                      <TableCell key={index} className={footerClasses}>
                        {sumBasePaid}
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
      for (var i = removeArray.length - 1; i >= 0; i--) initData.Detail.splice(removeArray[i], 1);
    },
  };

  const CheckSelectedArNo = () => {
    let arNo = getValues("ArNo");
    if (arNo && arNo !== "") {
      AddNewRow();
    } else {
      SnackbarUtils.warning(translate("ra.permission.selectProfileFirst"));
    }
  };

  const CustomHeader = (props) => {
    return (
      <>
        <TableHead>
          <TableRow>
            <TableCell colSpan={9} style={{ paddingLeft: 0 }}>
              <Button variant="outlined" onClick={CheckSelectedArNo} startIcon={<AddIcon />}>
                Select Invoice For Settlement
              </Button>
              <FormControlLabel
                style={{ marginLeft: 10 }}
                control={
                  <Checkbox
                    checked={checkSettleDate}
                    color="primary"
                    onChange={(e, newValue) => {
                      if (newValue && initData.Detail.length > 0) {
                        let msg = `All Settle date will be update to ${DateToString(
                          initData.RcpthDate
                        )}. Do you want to continue?`;
                        let dialog = window.confirm(msg);
                        if (dialog) {
                          initData.Detail.forEach((element) => {
                            element.RcptdDate = initData.RcpthDate;
                          });
                          setCheckSettleDate(true);
                        } else {
                          setCheckSettleDate(false);
                        }
                      } else {
                        setCheckSettleDate(newValue);
                      }
                    }}
                  />
                }
                label="Set as settle date"
              />
            </TableCell>
          </TableRow>
        </TableHead>
        <MuiTableHead {...props} />
      </>
    );
  };

  const Save = async (values) => {
    //TODO : Validate & CheckDetail
    console.log(values, "save");
    const { Code, InternalMessage } = await createArReceiptDetail(values);
    if (Code === 0) {
      redirect(`${InternalMessage}/show`);
    }
  };

  const ShowDim = (values) => {
    if (values) {
      setDataDim(values);
    }
    setOpenDim(true);
  };
  const CancelFnc = () => {
    redirect("list", basePath);
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
          <BoxHeader header={"Receipt"} status={initData.RcpthStatus} />
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
            </Grid>
          </Grid>
          {showAdd && (
            <PopupSettlementAr
              initialValues={initDataDetail.length === 0 ? initData.Detail : initDataDetail}
              unselectInvoice={unselectInvoice}
              checkSettleDate={checkSettleDate}
              code={getValues("ArNo")}
              rcpthDate={getValues("RcpthDate")}
              open={showAdd}
              save={(row) => SaveFromPopup(initData, row)}
              cancel={CancelFromPopup}
              maxWidth={"xl"}
            />
          )}
        </Paper>
        {/* Withholding Tax */}
        <Paper elevation={1} style={{ marginBottom: 12 }}>
          <Accordion defaultExpanded={false}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel2-content" id="panel2-header">
              <Typography className={classes.heading}>Withholding Tax</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container alignItems="flex-start" spacing={1} style={{ marginBottom: 6 }}>
                <Grid item xs={12}>
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
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <Grid container spacing={1} alignItems="flex-start">
                    <Grid item xs={2}>
                      <TextField
                        label="Total Amount"
                        name="AmtBfWht"
                        variant="outlined"
                        margin="dense"
                        InputProps={{ inputComponent: NumberFormatInput }}
                        inputProps={{
                          style: { textAlign: "right" },
                          maxLength: 18,
                          decimal: 2,
                        }}
                        defaultValue={0}
                        value={NumberFormat(initData.AmtBfWht ?? 0)}
                        onChange={(e) => {
                          let total = ToNumber(e.target.value);
                          let rate = ToNumber(initData.WhtRate);
                          CalculateWhtAmt(total, rate);
                        }}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <TextField
                        label="Rate"
                        name="WhtRate"
                        variant="outlined"
                        margin="dense"
                        InputProps={{ inputComponent: NumberFormatInput }}
                        inputProps={{
                          style: { textAlign: "right" },
                          maxLength: 18,
                          decimal: 2,
                        }}
                        defaultValue={0}
                        value={NumberFormat(initData.WhtRate ?? 0)}
                        onChange={(e) => {
                          let total = ToNumber(initData.AmtBfWht);
                          let rate = ToNumber(e.target.value);
                          CalculateWhtAmt(total, rate);
                        }}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <TextField
                        label="Amount"
                        name="WhtAmt"
                        variant="outlined"
                        margin="dense"
                        InputProps={{ inputComponent: NumberFormatInput }}
                        inputProps={{
                          style: { textAlign: "right" },
                          maxLength: 18,
                          decimal: 2,
                        }}
                        defaultValue={0}
                        value={NumberFormat(initData.WhtAmt ?? 0)}
                        onChange={(e) => {
                          setInitData((state) => ({
                            ...state,
                            WhtAmt: e.target.value,
                          }));
                        }}
                        disabled={!showWhtOw}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={showWhtOw}
                            color="primary"
                            onChange={(e, newValue) => {
                              console.log(newValue);
                              if (!newValue) {
                                let total = ToNumber(initData.AmtBfWht);
                                let rate = ToNumber(initData.WhtRate);
                                CalculateWhtAmt(total, rate);
                              }
                              setShowWhtOw(newValue);
                            }}
                          />
                        }
                        label="Overwrite"
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Paper>
        {/* Billing To */}
        <Paper elevation={1} style={{ marginBottom: 12 }}>
          <Accordion defaultExpanded={false}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel3-content" id="panel3-header">
              <Typography className={classes.heading}>Billing To</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container alignItems="flex-start" spacing={1} style={{ marginBottom: 6 }}>
                {formFieldsBilling
                  ? formFieldsBilling.map((item, idx) => (
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
            </AccordionDetails>
          </Accordion>
        </Paper>
        <Paper elevation={1} className={classes.root}>
          <Grid container alignItems="flex-start" spacing={1} style={{ marginBottom: 6 }}>
            <Grid item xs={8}>
              <Grid container spacing={1} alignItems="flex-start">
                <Grid item xs={12}>
                  <Typography className={classes.heading}>Receipt Account</Typography>
                </Grid>
                <Grid container alignItems="flex-start" spacing={1}>
                  {formFieldsReceiptAccount
                    ? formFieldsReceiptAccount.map((item, idx) => (
                        <Grid item xs={item.size} key={idx} style={item.style}>
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

                <Grid item xs={12}>
                  <Typography className={classes.heading}>BankCharge Account</Typography>
                </Grid>
                <Grid container alignItems="flex-start" spacing={1}>
                  {formFieldsBank
                    ? formFieldsBank.map((item, idx) => (
                        <Grid item xs={item.size} key={idx} style={item.style}>
                          {React.createElement(item.field.type, {
                            ...{
                              ...item.field.props,
                              methods,
                              key: item.field.props.name,
                              onChange: CheckBankAccount,
                            },
                          })}
                        </Grid>
                      ))
                    : ""}
                </Grid>
                <Grid item xs={12}>
                  <Typography className={classes.heading}>Gain/Loss Account</Typography>
                </Grid>
                <Grid container alignItems="flex-start" spacing={1}>
                  {formFieldsGainLossAccount
                    ? formFieldsGainLossAccount.map((item, idx) => (
                        <Grid item xs={item.size} key={idx} style={item.style}>
                          {React.createElement(item.field.type, {
                            ...{
                              ...item.field.props,
                              methods,
                              key: item.field.props.name,
                              onChange: CheckGLAccount,
                            },
                          })}
                        </Grid>
                      ))
                    : ""}
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={4}>
              <Grid container spacing={1} alignItems="flex-start">
                <Grid item xs={12}>
                  <Typography className={classes.heading}>Summary</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" style={{ marginTop: 12 }}>
                    <b>Payment Amount</b>
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    name="Amount"
                    variant="outlined"
                    margin="dense"
                    InputProps={{ inputComponent: NumberFormatInput }}
                    inputProps={{
                      style: { textAlign: "right" },
                      maxLength: 18,
                      decimal: 2,
                    }}
                    defaultValue={0}
                    value={NumberFormat(initData.Amount ?? 0)}
                    onChange={(e) => {
                      let numInvAmt = ToNumber(sumInvAmt);
                      let numCurAmt = ToNumber(e.target.value);
                      let numWhtAmt = ToNumber(initData.WhtAmt ?? 0);
                      let numBankChargeAmt = ToNumber(initData.BankChargeAmt ?? 0);
                      AdjustPaymentAmount(numInvAmt, numCurAmt, numWhtAmt, numBankChargeAmt);
                    }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <b>Settlement Base Amount</b>
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1" align="right" style={{ marginRight: 14 }}>
                    {NumberFormat(initData.BaseAmt ?? 0)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <b>Gain/Loss</b>
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1" align="right" style={{ marginRight: 14 }}>
                    {NumberFormat(initData.GainLossAmt ?? 0)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <b>Witholding Tax</b>
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1" align="right" style={{ marginRight: 14 }}>
                    {NumberFormat(initData.WhtAmt ?? 0)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" style={{ marginTop: 12 }}>
                    <b>Bank Charge</b>
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    name="BankChargeAmt"
                    variant="outlined"
                    margin="dense"
                    InputProps={{ inputComponent: NumberFormatInput }}
                    inputProps={{
                      style: { textAlign: "right" },
                      maxLength: 18,
                      decimal: 2,
                    }}
                    defaultValue={0}
                    value={NumberFormat(initData.BankChargeAmt ?? 0)}
                    onChange={(e) => {
                      setInitData((state) => ({
                        ...state,
                        BankChargeAmt: e.target.value,
                      }));
                      if (ToNumber(e.target.value) !== 0) {
                        CheckBankAccount(ToNumber(e.target.value));
                      } else {
                        methods.clearErrors("BankChargeDept");
                        methods.clearErrors("BankChargeAcc");
                      }
                    }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <b>Net Payment</b>
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1" align="right" style={{ marginRight: 14 }}>
                    {NumberFormat(initData.NetBaseAmt)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <b>Avaliable Credit</b>
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1" align="right" style={{ marginRight: 14 }}>
                    {NumberFormat(initData.AvlCrBaseAmt)}
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
