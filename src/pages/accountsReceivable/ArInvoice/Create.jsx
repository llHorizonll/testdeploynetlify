/* eslint-disable eqeqeq */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useState, useEffect, useCallback } from "react";
import { GblContext } from "providers/formatter";
import { useStateWithCallbackLazy } from "use-state-with-callback";
import clsx from "clsx";
import { useRedirect,withTranslate } from "react-admin";
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
import { createArInvoiceDetail } from "services/accountReceivable";
import { getActiveDimListByModuleName } from "services/dimension";
import { addDays } from "date-fns";
import Model from "models/arInvoice";
import ModelDetail from "models/arInvoiceDetail";
import SnackbarUtils from "utils/SnackbarUtils";

const Create = (props) => {
  const classes = props.useStyles();
  const { basePath, formFields, formFieldsDetail, translate } = props;
  const redirect = useRedirect();

  const { settingAll, NumberFormat, ToNumber, FindTaxAmount } = useContext(GblContext);
  const { SettingSystem, SettingAr } = settingAll;

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

  const [showAdd, setShowAdd] = useState(false);
  const [editIndex, setEditIndex] = useState("");
  const [openDim, setOpenDim] = useState(false);
  const [dataDim, setDataDim] = useState();

  const methods = useForm({ defaultValues: initData });

  const { handleSubmit, getValues, setValue, reset } = methods;

  useEffect(() => {
    initData.Detail = [];
    initData.CurrCode = SettingSystem.DefaultCurrencyCode;
    initData.CurrRate = SettingSystem.DefaultCurrencyRate;
    initNewRow.Unit = SettingAr.DefaultUnit;
    setInitNewRow(initNewRow);
    setInitData(Model);
    reset(Model);
  }, []);

  const disableFormEnter = (e) => {
    if (e.key === "Enter" && e.target.localName !== "textarea") e.preventDefault();
  };

  const onSubmit = () => {
    const values = getValues();
    //ConvertToNumber
    initData.Detail.forEach((item) => {
      item.NetAmt = ToNumber(item.NetAmt);
      item.NetBaseAmt = ToNumber(item.NetBaseAmt);
      item.Price = ToNumber(item.Price);
      item.TaxAmt1 = ToNumber(item.TaxAmt1);
      item.TaxAmt2 = ToNumber(item.TaxAmt2);
      item.TaxBaseAmt1 = ToNumber(item.TaxBaseAmt1);
      item.TaxBaseAmt2 = ToNumber(item.TaxBaseAmt2);
      item.TotalAmt = ToNumber(item.TotalAmt);
      item.TotalBaseAmt = ToNumber(item.TotalBaseAmt);
      item.Unpaid = ToNumber(item.Unpaid);
    });

    let sumTotal = initData.Detail.reduce((accu, item) => {
      let s = ToNumber(accu) + ToNumber(item.TotalAmt);
      return NumberFormat(s ?? 0);
    }, 0);

    let sumUnpaid = initData.Detail.reduce((accu, item) => {
      let s = ToNumber(accu) + ToNumber(item.Unpaid);
      return NumberFormat(s ?? 0);
    }, 0);

    //TODO : Adjust parameter before save
    setInitData(
      (state) => ({
        ...state,
        ...values,
        CurrRate: ToNumber(values.CurrRate),
        InvhTotal: ToNumber(sumTotal),
        InvhUnpaid: ToNumber(sumUnpaid),
      }),
      (nextState) => Save(nextState)
    );
  };

  const menuControlProp = [
    { name: "Back", fnc: () => redirect("list", basePath) },
    { name: "Add", disabled: true },
    { name: "Edit", disabled: true },
    { name: "Void", disabled: true },
    { name: "Copy", disabled: true },
    { name: "Print", disabled: true },
  ];

  const fetchDimListByModule = useCallback(async () => {
    const { Data } = await getActiveDimListByModuleName(10, 1, "AR-ID");
    setInitNewRow((state) => ({
      ...state,
      DimList: {
        Dim: Data,
      },
    }));
  }, []);

  useEffect(() => {
    fetchDimListByModule();
  }, [fetchDimListByModule]);

  const AddNewRow = () => {
    setEditIndex("");
    setShowAdd(true);
  };

  const UpdateRow = (index) => {
    let dataRow = initData.Detail[index];
    let CurrRate = getValues("CurrRate");
    let Qty = ToNumber(dataRow["Qty"]);
    let Price = ToNumber(dataRow["Price"]);
    let TaxRate1 = ToNumber(dataRow.TaxType1 !== "None" ? dataRow["TaxRate1"] : 0);
    let TaxRate2 = ToNumber(dataRow.TaxType2 !== "None" ? dataRow["TaxRate2"] : 0);
    let NetAmt = Qty * Price;
    //check TaxType
    let TaxAmt1 = FindTaxAmount(dataRow["TaxType1"], TaxRate1, NetAmt);
    let TaxAmt2 = FindTaxAmount(dataRow["TaxType2"], TaxRate2, NetAmt);

    if (dataRow["TaxType1"] === "Include") {
      NetAmt = NetAmt - TaxAmt1;
    }
    if (dataRow["TaxType2"] === "Include") {
      NetAmt = NetAmt - TaxAmt2;
    }
    //check overwrite
    if (dataRow["TaxOverwrite1"]) {
      TaxAmt1 = ToNumber(dataRow["TaxAmt1"]);
    }
    if (dataRow["TaxOverwrite2"]) {
      TaxAmt2 = ToNumber(dataRow["TaxAmt2"]);
    }
    let Total = NetAmt + TaxAmt1 + TaxAmt2;

    setSummaryValue((state) => ({
      ...state,
      netAmt: ToNumber(NetAmt),
      taxAmt1: ToNumber(TaxAmt1),
      taxAmt2: ToNumber(TaxAmt2),
      total: ToNumber(Total),
      baseNetAmt: ToNumber(NetAmt * CurrRate),
      baseTaxAmt1: ToNumber(TaxAmt1 * CurrRate),
      baseTaxAmt2: ToNumber(TaxAmt2 * CurrRate),
      baseTotal: ToNumber(Total * CurrRate),
    }));

    setEditIndex(index);
    setShowAdd(true);
  };

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
      for (var i = removeArray.length - 1; i >= 0; i--) initData.Detail.splice(removeArray[i], 1);
    },
  };

  const CheckSelectedArNo = () => {
    let arNo = getValues("ArNo");
    let CurrRate = getValues("CurrRate");
    if (arNo && arNo !== "") {
      setSummaryValue((state) => ({
        ...state,
        netAmt: ToNumber(state.netAmt),
        taxAmt1: ToNumber(state.taxAmt1),
        taxAmt2: ToNumber(state.taxAmt2),
        total: ToNumber(state.netAmt + state.taxAmt1 + state.taxAmt2),
        baseNetAmt: ToNumber(state.netAmt * CurrRate),
        baseTaxAmt1: ToNumber(state.taxAmt1 * CurrRate),
        baseTaxAmt2: ToNumber(state.taxAmt2 * CurrRate),
        baseTotal: ToNumber((state.netAmt + state.taxAmt1 + state.taxAmt2) * CurrRate),
      }));
      setInitNewRow(
        (state) => ({
          ...state,
          DeptCode: SettingAr.InvoiceDeptCode,
          DeptDesc: SettingAr.InvoiceDeptDesc,
          DrAcc: SettingAr.InvoiceDrAcc,
          DrAccDesc: SettingAr.InvoiceDrAccDesc,
          CrAcc: SettingAr.InvoiceCrAcc,
          CrAccDesc: SettingAr.InvoiceCrAccDesc,
          TaxType1: SettingAr.TaxType1,
          TaxAcc1: SettingAr.TaxAcc1,
          TaxAcc1Desc: SettingAr.TaxAcc1Desc,
          TaxRate1: SettingAr.TaxRate1,
          TaxType2: SettingAr.TaxType2,
          TaxAcc2: SettingAr.TaxAcc2,
          TaxAcc2Desc: SettingAr.TaxAcc2Desc,
          TaxRate2: SettingAr.TaxRate2,
        }),
        () => AddNewRow()
      );
    } else {
      SnackbarUtils.warning(translate("ra.permission.selectProfileFirst"));
    }
  };

  const CustomHeader = (props) => {
    return (
      <>
        <TableHead>
          <TableRow>
            <TableCell align="center" colSpan={1}>
              <IconButton size={"small"} onClick={CheckSelectedArNo} style={{ marginLeft: 6 }}>
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

  const SaveFromPopup = (arr, row) => {
    row.NetAmt = NumberFormat(summaryValue.netAmt);
    row.NetBaseAmt = NumberFormat(summaryValue.baseNetAmt);
    row.TaxAmt1 = NumberFormat(summaryValue.taxAmt1);
    row.TaxBaseAmt1 = NumberFormat(summaryValue.baseTaxAmt1);
    row.TaxAmt2 = NumberFormat(summaryValue.baseTaxAmt2);
    row.TaxBaseAmt2 = NumberFormat(summaryValue.baseTaxAmt2);
    row.TotalAmt = NumberFormat(summaryValue.total);
    row.TotalBaseAmt = NumberFormat(summaryValue.baseTotal);
    row.Unpaid = NumberFormat(summaryValue.total);

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
    if (data["TaxType1"] !== "None" && !!data["TaxAcc1"] === false) {
      m.setError("TaxAcc1", {
        type: "required",
        message: "* Required",
      });
    }
    if (data["InvdTaxT2"] !== "None" && !!data["TaxAcc2"] === false) {
      m.setError("TaxAcc2", {
        type: "required",
        message: "* Required",
      });
    }
    if (data["TaxType1"] !== "None" && ToNumber(data["TaxRate1"]) === 0) {
      m.setError("TaxRate1", {
        type: "required",
        message: "* Required",
      });
    } else {
      m.clearErrors("TaxRate1");
    }
    if (data["TaxType2"] !== "None" && ToNumber(data["TaxRate2"]) === 0) {
      m.setError("TaxRate2", {
        type: "required",
        message: "* Required",
      });
    } else {
      m.clearErrors("TaxRate2");
    }
    if (data["TaxType1"] === "None") {
      m.clearErrors("TaxAcc1");
      m.clearErrors("TaxRate1");
      m.setValue("TaxAcc1", "");
      m.setValue("TaxRate1", 0);
    }
    if (data["TaxType2"] === "None") {
      m.clearErrors("TaxAcc2");
      m.clearErrors("TaxRate2");
      m.setValue("TaxAcc2", "");
      m.setValue("TaxRate2", 0);
    }
    if (!!data["TaxAcc1"]) {
      m.clearErrors("TaxAcc1");
    }
    if (!!data["TaxAcc2"]) {
      m.clearErrors("TaxAcc2");
    }
  };

  const UpdateFromPopup = (currentField, m, data) => {
    //Verify & Set Detail to FormValue
    let CurrRate = getValues("CurrRate");
    let Qty = ToNumber(data["Qty"]);
    let Price = ToNumber(data["Price"]);
    let TaxRate1 = ToNumber(data.TaxType1 !== "None" ? data["TaxRate1"] : 0);
    let TaxRate2 = ToNumber(data.TaxType2 !== "None" ? data["TaxRate2"] : 0);
    let NetAmt = Qty * Price;
    let TaxAmt1 = FindTaxAmount(data["TaxType1"], TaxRate1, NetAmt);
    let TaxAmt2 = FindTaxAmount(data["TaxType2"], TaxRate2, NetAmt);

    CheckTaxType(m, data);

    //TaxOverwrite1
    if (data["TaxOverwrite1"] || data["TaxOverwrite1"] === "O") {
      m.setValue("TaxAmt1", data["TaxAmt1"]);
      TaxAmt1 = ToNumber(data["TaxAmt1"]);
    } else {
      m.setValue("TaxAmt1", TaxAmt1);
    }
    //TaxOverwrite2
    if (data.TaxOverwrite2 || data.TaxOverwrite2 === "O") {
      m.setValue("TaxAmt2", data["TaxAmt2"]);
      TaxAmt2 = ToNumber(data["TaxAmt2"]);
    } else {
      m.setValue("TaxAmt2", TaxAmt2);
    }

    if (data["TaxType1"] === "Include") {
      NetAmt = NetAmt - TaxAmt1;
    }
    if (data["TaxType2"] === "Include") {
      NetAmt = NetAmt - TaxAmt2;
    }

    let Total = NetAmt + TaxAmt1 + TaxAmt2;
    setSummaryValue((state) => ({
      ...state,
      netAmt: ToNumber(NetAmt),
      taxAmt1: ToNumber(TaxAmt1),
      taxAmt2: ToNumber(TaxAmt2),
      total: ToNumber(Total),
      baseNetAmt: ToNumber(NetAmt * CurrRate),
      baseTaxAmt1: ToNumber(TaxAmt1 * CurrRate),
      baseTaxAmt2: ToNumber(TaxAmt2 * CurrRate),
      baseTotal: ToNumber(Total * CurrRate),
    }));
  };

  const UpdateForm = (e) => {
    const values = getValues();

    //set some input readonly
    if (e.target.name === "RunNoType") {
      if (e.target.value === "true") {
        document.getElementsByName("InvNo")[0].parentNode.parentNode.firstChild.classList.remove("Mui-disabled");
        document.getElementsByName("InvNo")[0].parentNode.classList.remove("Mui-disabled");
        document.getElementsByName("InvNo")[0].disabled = false;
        document.getElementsByName("InvNo")[0].focus();
        setValue("InvNo", "");
        // setValue("TaxRate", 0);
        // setValue("TaxAmt", 0);
        // setValue("TaxBaseAmt", 0);
      } else {
        document.getElementsByName("InvNo")[0].parentNode.parentNode.firstChild.classList.add("Mui-disabled");
        document.getElementsByName("InvNo")[0].parentNode.classList.add("Mui-disabled");
        document.getElementsByName("InvNo")[0].disabled = true;
        setValue("InvNo", "Auto");
      }
    }

    if (e.target.name === "CurrRate") {
      let rate = ToNumber(e.target.value);
      initData.Detail.forEach((item) => {
        item.NetBaseAmt = item.NetAmt * ToNumber(rate);
        item.TaxBaseAmt1 = item.TaxAmt1 * ToNumber(rate);
        item.TaxBaseAmt2 = item.TaxAmt2 * ToNumber(rate);
        item.TotalBaseAmt = item.TotalAmt * ToNumber(rate);
      });
    }
    if (ToNumber(values.CreditTerm) !== 0) {
      let newDueDate = addDays(new Date(), parseInt(values.CreditTerm));
      setValue("InvhDueDate", newDueDate);
    }
    if (e.target.name === "InvhDate") {
      let newDate = new Date(e.target.value);
      let creditTerm = parseInt(values.CreditTerm);
      let newDueDate = addDays(newDate, parseInt(creditTerm));
      setValue("InvhDate", newDate);
      setValue("InvhDueDate", newDueDate);
    }
  };
  const Save = async (values) => {
    //Validate & CheckDetail
    console.log(values, "save");
    if (values.Detail.length > 0) {
      values.Detail.forEach((item) => {
        if (item["TaxOverwrite1"]) {
          item["TaxOverwrite1"] = "O";
        } else {
          item["TaxOverwrite1"] = "";
        }
        if (item["TaxOverwrite2"]) {
          item["TaxOverwrite2"] = "O";
        } else {
          item["TaxOverwrite2"] = "";
        }
      });
      const { Code, InternalMessage } = await createArInvoiceDetail(values);
      if (Code === 0) {
        redirect(`${InternalMessage}/show`);
      }
    } else {
      SnackbarUtils.toast(translate("ra.info.notransaction"));
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
        <Paper style={{ padding: 16 }}>
          <BoxHeader header={`Invoice`} status={initData.InvhSource ? initData.InvhSource : "A/R"} />
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
              update={UpdateFromPopup}
              checkTaxType={CheckTaxType}
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
                          Rate : {NumberFormat(getValues("CurrRate"), "currency")}
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
