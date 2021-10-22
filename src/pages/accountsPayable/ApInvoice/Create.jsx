/* eslint-disable eqeqeq */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useState, useEffect, useCallback } from "react";
import { GblContext } from "providers/formatter";
import { useRedirect, withTranslate } from "react-admin";
import { useStateWithCallbackLazy } from "use-state-with-callback";
import clsx from "clsx";
import { Paper, Grid, Box, Typography } from "@material-ui/core";
import { useForm } from "react-hook-form";
import { TableHead, TableFooter, TableRow, TableCell } from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import AddIcon from "@material-ui/icons/Add";
import EditIcon from "@material-ui/icons/Edit";
import MUIDataTable, { TableHead as MuiTableHead } from "mui-datatables";
import ActionMenu from "components/ActionMenu";
import BoxHeader from "components/BoxHeader";
import ButtonFooter from "components/ButtonFooter";
import NavRight from "components/NavRightSide";
import PopupTable from "components/PopupTable";
import { addDays, format } from "date-fns";
import { createInvoiceDetail } from "services/accountPayable";
import { getActiveDimListByModuleName } from "services/dimension";
import Model from "models/apInvoice";
import ModelDetail from "models/apInvoiceDetail";
import SnackbarUtils from "utils/SnackbarUtils";

const Create = (props) => {
  const classes = props.useStyles();
  const { basePath, formFields, formFieldsDetail, vendorLookup, translate } = props;
  const redirect = useRedirect();

  const { settingAll, NumberFormat, ToNumber, FindTaxAmount } = useContext(GblContext);
  const { SettingSystem, SettingAp } = settingAll;

  const [initData, setInitData] = useStateWithCallbackLazy(Model);
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

  const menuControlProp = [
    { name: "Back", fnc: () => redirect("list", basePath) },
    { name: "Add", disabled: true },
    { name: "Edit", disabled: true },
    { name: "Void", disabled: true },
    { name: "Copy", disabled: true },
    { name: "Print", disabled: true },
  ];

  const methods = useForm({ defaultValues: initData });

  const { handleSubmit, getValues, setValue, reset } = methods;

  useEffect(() => {
    Model.CurCode = SettingSystem.DefaultCurrencyCode;
    Model.CurRate = SettingSystem.DefaultCurrencyRate;
    ModelDetail.UnitCode = SettingAp.DefaultUnit;
    setInitData(Model);
    reset(Model);
  }, []);

  const disableFormEnter = (e) => {
    if (e.key === "Enter" && e.target.localName !== "textarea") e.preventDefault();
  };

  const onSubmit = () => {
    const values = getValues();
    //Adjust parameter before save
    setInitData(
      (state) => ({
        ...state,
        ...values,
        CurRate: ToNumber(values.CurRate),
      }),
      (nextState) => Save(nextState)
    );
  };

  const fetchDimHListByModule = useCallback(async () => {
    const { Data } = await getActiveDimListByModuleName(10, 1, "AP-IH");
    setInitData((state) => ({
      ...state,
      DimHList: {
        Dim: Data,
      },
    }));
  }, []);

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
    fetchDimHListByModule();
    fetchDimListByModule();
  }, [fetchDimHListByModule, fetchDimListByModule]);

  const [showAdd, setShowAdd] = useState(false);
  const [editIndex, setEditIndex] = useState("");
  const [openDim, setOpenDim] = useState(false);
  const [dataDim, setDataDim] = useState();

  const columns = [
    {
      name: "index",
      label: " ",
      options: {
        filter: false,
        viewColumns: false,
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
    selectableRows: "multiple",
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
            <TableCell className={footerClasses} />
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
      for (var i = removeArray.length - 1; i >= 0; i--) initData.Detail.splice(removeArray[i], 1);
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
          InvdT1DrDesc: vnItem.VnVat1DrAccDesc,
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
        <MuiTableHead {...props} />
      </>
    );
  };

  const AddNewRow = () => {
    setEditIndex("");
    setShowAdd(true);
  };

  const UpdateRow = (index) => {
    let dataRow = initData.Detail[index];
    let CurRate = getValues("CurRate");
    let Qty = ToNumber(dataRow["InvdQty"]);
    let Price = ToNumber(dataRow["InvdPrice"]);
    let TaxRate1 = ToNumber(dataRow["InvdTaxR1"]);
    let TaxRate2 = ToNumber(dataRow["InvdTaxR2"]);
    let NetAmt = Qty * Price;
    let TaxAmt1 = FindTaxAmount(dataRow["InvdTaxT1"], TaxRate1, NetAmt);
    let TaxAmt2 = FindTaxAmount(dataRow["InvdTaxT2"], TaxRate2, NetAmt);
    if (dataRow["InvdTaxT1"] === "Include") {
      NetAmt = NetAmt - TaxAmt1;
    }
    if (dataRow["InvdTaxT2"] === "Include") {
      NetAmt = NetAmt - TaxAmt2;
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
      setInitData(arr);
      setShowAdd(false);
    } else {
      //create
      if (arr.Detail) {
        row.index = arr.Detail.length;
        arr.Detail = [...arr.Detail, row];
        setInitData(arr);
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
      initData.Detail.forEach((row) => {
        if (row.InvdTaxT1 === "Include") {
          row.InvdAbfTax = row.InvdPrice * row.InvdQty * rate - row.InvdTaxC1;
        } else {
          row.InvdAbfTax = row.InvdPrice * row.InvdQty * rate;
        }
        row.InvdTaxA1 = row.InvdTaxC1 * rate;
        row.InvdTaxA2 = row.InvdTaxC2 * rate;
      });
    }
    //add only
    if (e.target.name === "InvhInvNo") {
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
    if (values.Detail.length > 0) {
      values.Detail.forEach((item) => {
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
      const { Code, InternalMessage } = await createInvoiceDetail(values);
      if (Code === 0) {
        redirect(`${InternalMessage}/show`);
      }
    } else {
      SnackbarUtils.toast(translate("ra.info.notransaction"));
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
          <BoxHeader header={"Invoice"} status={initData.InvhSource} />
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
            <PopupTable
              initialValues={editIndex !== "" ? initData.Detail[editIndex] : initNewRow}
              formFields={formFieldsDetail}
              checkTaxType={CheckTaxType}
              update={UpdateFromPopup}
              open={showAdd}
              save={(row) => SaveFromPopup(initData, row)}
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
                          Total Amount
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
                          Total Amount
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
