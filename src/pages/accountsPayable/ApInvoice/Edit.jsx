/* eslint-disable eqeqeq */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useState, useEffect, useCallback } from "react";
import { GblContext } from "providers/formatter";
import { Loading, useRedirect, withTranslate } from "react-admin";
import { useStateWithCallbackLazy } from "use-state-with-callback";
import clsx from "clsx";
import { Paper, Grid, Box, Typography } from "@material-ui/core";
import { useForm } from "react-hook-form";
import { TableHead, TableFooter, TableRow, TableCell } from "@material-ui/core";
import MUIDataTable, { TableHead as MuiTableHead } from "mui-datatables";
import ActionMenu from "components/ActionMenu";
import BoxHeader from "components/BoxHeader";
import ButtonFooter from "components/ButtonFooter";
import NavRight from "components/NavRightSide";
import PopupTable from "components/PopupTable";
import IconButton from "@material-ui/core/IconButton";
import AddIcon from "@material-ui/icons/Add";
import EditIcon from "@material-ui/icons/Edit";
import { addDays, format } from "date-fns";
import { createInvoiceDetail, getInvoiceDetail, updateInvoiceDetail } from "services/accountPayable";
import { getActiveDimListByModuleName } from "services/dimension";
import Model from "models/apInvoice";
import ModelDetail from "models/apInvoiceDetail";
import SnackbarUtils from "utils/SnackbarUtils";

const Edit = (props) => {
  const classes = props.useStyles();
  const { basePath, id, formFields, formFieldsDetail, vendorLookup, copyMode, isSettled, translate } = props;
  const redirect = useRedirect();

  const { settingAll, NumberFormat, ToNumber, FindTaxAmount } = useContext(GblContext);
  const { SettingClosePeriod } = settingAll;

  const [data, setData] = useStateWithCallbackLazy();
  const [initNewRow, setInitNewRow] = useStateWithCallbackLazy(ModelDetail);
  const [summaryValue, setSummaryValue] = useState({
    netAmt: 0,
    taxAmt1: 0,
    taxAmt2: 0,
    total: 0,
    baseNetAmt: 0,
    baseTaxAmt1: 0,
    baseTaxAmt2: 0,
    baseTotal: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editIndex, setEditIndex] = useState("");
  const [openDim, setOpenDim] = useState(false);
  const [dataDim, setDataDim] = useState();

  const IsSettled = (data) => {
    let sumTotal = data.Detail.reduce((accu, item) => {
      let s = ToNumber(accu) + ToNumber(item.TotalPrice);
      return s;
    }, 0);

    let sumUnpaid = data.Detail.reduce((accu, item) => {
      let s = ToNumber(accu) + ToNumber(item.UnPaid);
      return s;
    }, 0);
    if (sumUnpaid !== sumTotal) {
      localStorage.setItem("IsSettled", true);
    } else {
      if (!data.InvhDate < SettingClosePeriod.ClosePeriodAp) {
        localStorage.setItem("IsSettled", false);
      }
    }
  };

  const menuControlProp = [
    { name: "Back", fnc: () => redirect("list", basePath) },
    { name: "Add", disabled: true },
    { name: "Edit", disabled: true },
    { name: "Void", disabled: true },
    { name: "Copy", disabled: true },
    { name: "Print", disabled: true },
  ];

  const methods = useForm({ defaultValues: data });

  const { handleSubmit, getValues, setValue, reset } = methods;

  const fetchInvoiceById = useCallback(async () => {
    setLoading(true);
    const response = await getInvoiceDetail(id);
    if (response) {
      //Switch Copy Mode
      if (copyMode) {
        response.InvhSeq = "Auto";
        response.InvhInvNo = Model.InvhInvNo;
        response.TaxId = Model.TaxId;
        response.InvhDate = Model.InvhDate;
        response.InvhInvDate = Model.InvhInvDate;
        response.InvhDueDate = Model.InvhDueDate;
        response.InvhTInvNo = Model.InvhTInvNo;
        response.InvhTInvDt = Model.InvhTInvDt;
        response.TaxStatus = Model.TaxStatus;
        response.TaxPeriod = Model.TaxPeriod;
        response.InvhSource = "";
      } else {
        IsSettled(response);
      }
      if (response?.Detail.length > 0) {
        response.Detail.forEach((item) => {
          if (copyMode) {
            item.InvhSeq = -1;
            item.InvdSeq = -1;
            item.UnPaid = item.TotalPrice;
          }
          if (item.InvdT1Cr === "O") {
            item.InvdT1Cr = true;
          }
          if (item.InvdT2Cr === "O") {
            item.InvdT2Cr = true;
          }
        });
      }
      setData(response);
      reset(response);
    }
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, [id, reset]);

  const fetchDimListByModule = useCallback(async () => {
    const { Data } = await getActiveDimListByModuleName(10, 1, "AP-ID");
    setInitNewRow((state) => ({
      ...state,
      DimList: {
        Dim: Data,
      },
    }));
  }, []);

  useEffect(() => {
    fetchInvoiceById();
    fetchDimListByModule();
  }, [fetchInvoiceById, fetchDimListByModule]);

  const disableFormEnter = (e) => {
    if (e.key === "Enter" && e.target.localName !== "textarea") e.preventDefault();
  };

  const onSubmit = () => {
    const values = getValues();
    setData(
      (state) => ({
        ...state,
        ...values,
      }),
      (nextState) => Save(nextState)
    );
  };

  const columns = [
    {
      name: "index",
      label: " ",
      options: {
        filter: false,
        viewColumns: false,
        display: !isSettled,
        customBodyRender: (value) => {
          return (
            <>
              <EditIcon
                fontSize="small"
                color="primary"
                style={{ cursor: "pointer", marginLeft: 10 }}
                onClick={() => UpdateRow(value)}
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
      label: "Total Amount",
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
    selectableRows: !isSettled ? "multiple" : "none",
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
            {/* Add TableCellEmpty For Summary Space */}
            {!isSettled && <TableCell className={footerClasses} />}
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

  const CheckSelectedVendor = () => {
    let vnCode = getValues("VnCode");
    let CurRate = getValues("CurRate");
    let vnItem = vendorLookup.find((item) => item.VnCode == vnCode);
    if (vnCode && vnCode !== "") {
      setSummaryValue((state) => ({
        ...state,
        netAmt: ToNumber(state.netAmt),
        taxAmt1: ToNumber(state.taxAmt1),
        taxAmt2: ToNumber(state.taxAmt2),
        total: ToNumber(state.netAmt + state.taxAmt1 + state.taxAmt2),
        baseNetAmt: ToNumber(state.netAmt * CurRate),
        baseTaxAmt1: ToNumber(state.taxAmt1 * CurRate),
        baseTaxAmt2: ToNumber(state.taxAmt2 * CurRate),
        baseTotal: ToNumber((state.netAmt + state.taxAmt1 + state.taxAmt2) * CurRate),
      }));
      setInitNewRow(
        (state) => ({
          ...state,
          InvdBTaxCr1: vnItem.VnVatCrAccCode,
          InvdBTaxCr1Desc: vnItem.VnVatCrAccDesc,
          InvdTaxT1: vnItem.VnVat1,
          InvdT1Dr: vnItem.VnVat1DrAccCode,
          DrAccTax1Desc: vnItem.VnVat1DrAccDesc,
          InvdTaxR1: vnItem.VnTaxR1,
          InvdTaxT2: vnItem.VnVat2,
          InvdT2Dr: vnItem.VnVat2DrAccCode,
          DrAccTax2Desc: vnItem.VnVat2DrAccDesc,
          InvdTaxR2: vnItem.VnTaxR2,
        }),
        () => AddNewRow()
      );
    } else {
      SnackbarUtils.warning(translate("ra.permission.selectVendorFirst"));
    }
  };

  const CustomHeader = (props) => {
    return (
      <>
        {!isSettled && (
          <TableHead>
            <TableRow>
              <TableCell align="center" colSpan={1}>
                <IconButton size={"small"} onClick={CheckSelectedVendor} style={{ marginLeft: 6 }}>
                  <AddIcon />
                </IconButton>
              </TableCell>
              <TableCell align="right" colSpan={10}></TableCell>
            </TableRow>
          </TableHead>
        )}
        <MuiTableHead {...props} />
      </>
    );
  };

  const AddNewRow = () => {
    setEditIndex("");
    setShowAdd(true);
  };

  const UpdateRow = (index) => {
    let dataRow = data.Detail[index];
    let CurRate = getValues("CurRate");
    let Qty = ToNumber(dataRow["InvdQty"]);
    let Price = ToNumber(dataRow["InvdPrice"]);
    let TaxRate1 = ToNumber(dataRow["InvdTaxR1"]);
    let TaxRate2 = ToNumber(dataRow["InvdTaxR2"]);
    let NetAmt = Qty * Price;
    //check TaxType
    let TaxAmt1 = FindTaxAmount(dataRow["InvdTaxT1"], TaxRate1, NetAmt);
    let TaxAmt2 = FindTaxAmount(dataRow["InvdTaxT2"], TaxRate2, NetAmt);
    if (dataRow["InvdTaxT1"] === "Include") {
      NetAmt = NetAmt - TaxAmt1;
    }
    if (dataRow["InvdTaxT2"] === "Include") {
      NetAmt = NetAmt - TaxAmt2;
    }
    //check overwrite
    if (dataRow["InvdT1Cr"]) {
      TaxAmt1 = ToNumber(dataRow["InvdTaxC1"]);
    }
    if (dataRow["InvdT2Cr"]) {
      TaxAmt2 = ToNumber(dataRow["InvdTaxC2"]);
    }
    let Total = NetAmt + TaxAmt1 + TaxAmt2;

    setSummaryValue({
      netAmt: ToNumber(NetAmt),
      taxAmt1: ToNumber(TaxAmt1),
      taxAmt2: ToNumber(TaxAmt2),
      total: ToNumber(Total),
      baseNetAmt: ToNumber(NetAmt * CurRate),
      baseTaxAmt1: ToNumber(TaxAmt1 * CurRate),
      baseTaxAmt2: ToNumber(TaxAmt2 * CurRate),
      baseTotal: ToNumber(Total * CurRate),
    });
    setEditIndex(index);
    setShowAdd(true);
  };

  const SaveFromPopup = (arr, row) => {
    row.InvdAbfTax = NumberFormat(summaryValue.netAmt);
    row.NetAmt = NumberFormat(summaryValue.netAmt);
    row.InvdTaxA1 = NumberFormat(summaryValue.baseTaxAmt1);
    row.InvdTaxA2 = NumberFormat(summaryValue.baseTaxAmt2);
    row.TotalPrice = NumberFormat(summaryValue.total);
    row.UnPaid = NumberFormat(summaryValue.total);
    if (editIndex !== "") {
      //update
      arr.Detail[editIndex] = row;
      setData(arr);
      setShowAdd(false);
    } else {
      //create
      if (arr.Detail) {
        row.index = arr.Detail.length;
        arr.Detail = [...arr.Detail, row];
        setData(arr);
        setShowAdd(false);
      }
    }
  };

  const CancelFromPopup = () => {
    setSummaryValue({
      netAmt: ToNumber(0),
      taxAmt1: ToNumber(0),
      taxAmt2: ToNumber(0),
      total: ToNumber(0),
      baseNetAmt: ToNumber(0),
      baseTaxAmt1: ToNumber(0),
      baseTaxAmt2: ToNumber(0),
      baseTotal: ToNumber(0),
    });
    setShowAdd(false);
  };

  const CheckTaxType = (m, data) => {
    if (data["InvdTaxT1"] !== "None" && !!data["InvdT1Dr"] === false) {
      m.setError("InvdT1Dr", {
        type: "required",
        message: "* Required",
      });
    }
    if (data["InvdTaxT2"] !== "None" && !!data["InvdT2Dr"] === false) {
      m.setError("InvdT2Dr", {
        type: "required",
        message: "* Required",
      });
    }
    if (data["InvdTaxT1"] !== "None" && ToNumber(data["InvdTaxR1"]) === 0) {
      m.setError("InvdTaxR1", {
        type: "required",
        message: "* Required",
      });
    } else {
      m.clearErrors("InvdTaxR1");
    }
    if (data["InvdTaxT2"] !== "None" && ToNumber(data["InvdTaxR2"]) === 0) {
      m.setError("InvdTaxR2", {
        type: "required",
        message: "* Required",
      });
    } else {
      m.clearErrors("InvdTaxR2");
    }
    if (data["InvdTaxT1"] === "None") {
      m.clearErrors("InvdT1Dr");
      m.clearErrors("InvdTaxR1");
      m.setValue("InvdT1Dr", "");
      m.setValue("InvdTaxR1", 0);
    }
    if (data["InvdTaxT2"] === "None") {
      m.clearErrors("InvdT2Dr");
      m.clearErrors("InvdTaxR2");
      m.setValue("InvdT2Dr", "");
      m.setValue("InvdTaxR2", 0);
    }
    if (!!data["InvdT1Dr"]) {
      m.clearErrors("InvdT1Dr");
    }
    if (!!data["InvdT2Dr"]) {
      m.clearErrors("InvdT2Dr");
    }
  };

  const UpdateFromPopup = (currentField, m, data) => {
    //Verify & Set Detail to FormValue
    let CurRate = getValues("CurRate");
    let Qty = ToNumber(data["InvdQty"]);
    let Price = ToNumber(data["InvdPrice"]);
    let TaxRate1 = ToNumber(data.InvdTaxT1 !== "None" ? data["InvdTaxR1"] : 0);
    let TaxRate2 = ToNumber(data.InvdTaxT2 !== "None" ? data["InvdTaxR2"] : 0);
    let NetAmt = Qty * Price;
    let TaxAmt1 = FindTaxAmount(data["InvdTaxT1"], TaxRate1, NetAmt);
    let TaxAmt2 = FindTaxAmount(data["InvdTaxT2"], TaxRate2, NetAmt);

    CheckTaxType(m, data);

    //InvdT1Cr = Overwrite Tax1
    if (data.InvdT1Cr || data.InvdT1Cr === "O") {
      m.setValue("InvdTaxC1", data["InvdTaxC1"]);
      TaxAmt1 = ToNumber(data["InvdTaxC1"]);
    } else {
      m.setValue("InvdTaxC1", TaxAmt1);
    }
    //InvdT2Cr = Overwrite Tax2
    if (data.InvdT2Cr || data.InvdT2Cr === "O") {
      m.setValue("InvdTaxC2", data["InvdTaxC2"]);
      TaxAmt2 = ToNumber(data["InvdTaxC2"]);
    } else {
      m.setValue("InvdTaxC2", TaxAmt2);
    }

    if (data["InvdTaxT1"] === "Include") {
      NetAmt = NetAmt - TaxAmt1;
    }
    if (data["InvdTaxT2"] === "Include") {
      NetAmt = NetAmt - TaxAmt2;
    }

    let Total = NetAmt + TaxAmt1 + TaxAmt2;
    setSummaryValue((state) => ({
      ...state,
      netAmt: ToNumber(NetAmt),
      taxAmt1: ToNumber(TaxAmt1),
      taxAmt2: ToNumber(TaxAmt2),
      total: ToNumber(Total),
      baseNetAmt: ToNumber(NetAmt * CurRate),
      baseTaxAmt1: ToNumber(TaxAmt1 * CurRate),
      baseTaxAmt2: ToNumber(TaxAmt2 * CurRate),
      baseTotal: ToNumber(Total * CurRate),
    }));
  };

  const UpdateForm = (e) => {
    const values = getValues();
    if (e.target.name === "CurRate") {
      let rate = ToNumber(e.target.value);
      data.Detail.forEach((row) => {
        if (row.InvdTaxT1 === "Include") {
          row.InvdAbfTax = row.InvdPrice * row.InvdQty * rate - row.InvdTaxC1;
        } else {
          row.InvdAbfTax = row.InvdPrice * row.InvdQty * rate;
        }
        row.InvdTaxA1 = row.InvdTaxC1 * rate;
        row.InvdTaxA2 = row.InvdTaxC2 * rate;
      });
    }
    //copymode only
    if (e.target.name === "InvhInvNo" && copyMode) {
      setValue("InvhTInvNo", e.target.value);
    }
    if (e.target.name === "InvhDate") {
      let newDate = new Date(e.target.value);
      let creditTerm = values.InvhCredit;
      let newDueDate = addDays(new Date(newDate), parseInt(creditTerm));
      setValue("InvhDate", newDate);
      setValue("InvhInvDate", newDate);
      setValue("InvhTInvDt", newDate);
      setValue("InvhDueDate", newDueDate);
      setValue("TaxPeriod", format(newDate, "MM/yyyy"));
    }
    if (e.target.name === "InvhInvDate") {
      let newDate = new Date(e.target.value);
      let creditTerm = values.InvhCredit;
      let newDueDate = addDays(new Date(newDate), parseInt(creditTerm));
      setValue("InvhInvDate", newDate);
      setValue("InvhTInvDt", newDate);
      setValue("InvhDueDate", newDueDate);
      setValue("TaxPeriod", format(newDate, "MM/yyyy"));
    }
    if (e.target.name === "InvhTInvDt") {
      let taxInvDate = new Date(e.target.value);
      setValue("TaxPeriod", format(taxInvDate, "MM/yyyy"));
    }
    if (e.target.name === "InvhCredit") {
      let creditTerm = values.InvhCredit;
      let newDueDate = addDays(new Date(values.InvhInvDate), parseInt(creditTerm));
      setValue("InvhDueDate", newDueDate);
    } else {
      let { name, value } = e.target;
      if (name) {
        setValue(name, value);
      }
    }
  };

  const Save = async (values) => {
    //Validate & CheckDetail

    if (values.Detail?.length > 0) {
      values.Detail.forEach((item) => {
        delete item.LastModified;
        if (item["InvdT1Cr"]) {
          item["InvdT1Cr"] = "O";
        } else {
          item["InvdT1Cr"] = "";
        }
        if (item["InvdT2Cr"]) {
          item["InvdT2Cr"] = "O";
        } else {
          item["InvdT2Cr"] = "";
        }
      });
    } else {
      SnackbarUtils.toast(translate("ra.info.notransaction"));
    }
    //Update
    if (!copyMode) {
      setLoading(true);
      const { Code, InternalMessage } = await updateInvoiceDetail(values);
      if (Code === 0) {
        setLoading(false);
        redirect("show", basePath, id, values);
      } else {
        setLoading(false);
        console.log(id, InternalMessage);
      }
    }
    //Copy
    else {
      setLoading(true);
      const { Code, InternalMessage } = await createInvoiceDetail(values);
      if (Code === 0) {
        setLoading(false);
        redirect("show", basePath, InternalMessage, values);
      }
    }
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

  const CancelFnc = () => {
    localStorage.removeItem("IsSettled");
    redirect("show", basePath, id);
  };

  if (loading) return <Loading />;
  if (!data) return null;

  return (
    <div
      className={clsx(classes.drawer, {
        [classes.drawerOpen]: openDim,
        [classes.drawerClose]: !openDim,
      })}
    >
      <ActionMenu menuControl={menuControlProp} />

      <form onSubmit={handleSubmit(onSubmit)} onKeyDown={disableFormEnter}>
        <Paper style={{ padding: 16 }}>
          <BoxHeader header={`Invoice`} status={data.InvhSource ? data.InvhSource : "A/P"} />
          <Grid container alignItems="flex-start" spacing={1}>
            {formFields
              ? formFields.map((item, idx) => (
                  <Grid item xs={item.size} key={idx} style={item.style}>
                    {item.field.props.name === "InvhDate" && data.InvhSource.toUpperCase() === "INVT"
                      ? React.createElement(item.field.type, {
                          ...{
                            ...item.field.props,
                            methods,
                            key: item.field.props.name,
                            onChange: UpdateForm,
                            disabled: true,
                          },
                        })
                      : React.createElement(item.field.type, {
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
            <Grid item xs={12}>
              <MUIDataTable
                data={data.Detail}
                columns={columns}
                options={options}
                components={{
                  TableHead: CustomHeader,
                }}
              />
              {showAdd && (
                <PopupTable
                  initialValues={editIndex !== "" ? data.Detail[editIndex] : initNewRow}
                  formFields={formFieldsDetail}
                  checkTaxType={CheckTaxType}
                  update={UpdateFromPopup}
                  open={showAdd}
                  save={(row) => SaveFromPopup(data, row)}
                  cancel={CancelFromPopup}
                  maxWidth={"md"}
                  showDim
                >
                  <Box style={{ margin: 30 }}>
                    <Grid container spacing={1} alignItems="flex-start">
                      <Grid item xs={6}>
                        <Box display="flex">
                          <Box flexGrow={1}>
                            <Typography variant="h6" gutterBottom>
                              Summary
                            </Typography>
                          </Box>
                        </Box>
                        <Grid container spacing={1} justifyContent="center" alignItems="center">
                          <Grid item xs={6}>
                            <Typography variant="body1" gutterBottom>
                              Net Amount
                            </Typography>
                          </Grid>
                          <Grid item xs={5}>
                            <Typography variant="body1" align="right" gutterBottom>
                              {NumberFormat(summaryValue.netAmt)}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body1" gutterBottom>
                              Tax Amount 1
                            </Typography>
                          </Grid>
                          <Grid item xs={5}>
                            <Typography variant="body1" align="right" gutterBottom>
                              {NumberFormat(summaryValue.taxAmt1)}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body1" gutterBottom>
                              Tax Amount 2
                            </Typography>
                          </Grid>
                          <Grid item xs={5}>
                            <Typography variant="body1" align="right" gutterBottom>
                              {NumberFormat(summaryValue.taxAmt2)}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body1" gutterBottom>
                              Total
                            </Typography>
                          </Grid>
                          <Grid item xs={5}>
                            <Typography variant="body1" align="right" gutterBottom>
                              {NumberFormat(summaryValue.total)}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item xs={6}>
                        <Box display="flex">
                          <Box flexGrow={1}>
                            <Typography variant="h6" gutterBottom>
                              Base Summary
                            </Typography>
                          </Box>
                          <Box style={{ marginRight: 18 }}>
                            <Typography variant="body1" gutterBottom>
                              Rate : {NumberFormat(getValues("CurRate"), "currency")}
                            </Typography>
                          </Box>
                        </Box>
                        <Grid container spacing={1} justifyContent="center" alignItems="center">
                          <Grid item xs={6}>
                            <Typography variant="body1" gutterBottom>
                              Net Amount
                            </Typography>
                          </Grid>
                          <Grid item xs={5}>
                            <Typography variant="body1" align="right" gutterBottom>
                              {NumberFormat(summaryValue.baseNetAmt)}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body1" gutterBottom>
                              Tax Amount 1
                            </Typography>
                          </Grid>
                          <Grid item xs={5}>
                            <Typography variant="body1" align="right" gutterBottom>
                              {NumberFormat(summaryValue.baseTaxAmt1)}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body1" gutterBottom>
                              Tax Amount 2
                            </Typography>
                          </Grid>
                          <Grid item xs={5}>
                            <Typography variant="body1" align="right" gutterBottom>
                              {NumberFormat(summaryValue.baseTaxAmt2)}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body1" gutterBottom>
                              Total
                            </Typography>
                          </Grid>
                          <Grid item xs={5}>
                            <Typography variant="body1" align="right" gutterBottom>
                              {NumberFormat(summaryValue.baseTotal)}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Box>
                </PopupTable>
              )}
            </Grid>
          </Grid>
        </Paper>
        <pre>{process.env.NODE_ENV === "development" ? JSON.stringify(data, 0, 2) : ""}</pre>
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

export default withTranslate(Edit);
