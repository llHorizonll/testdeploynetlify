/* eslint-disable eqeqeq */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useState, useEffect, useCallback } from "react";
import _ from "lodash";
import clsx from "clsx";
import { GblContext } from "providers/formatter";
import { useStateWithCallbackLazy } from "use-state-with-callback";
import { useForm } from "react-hook-form";
import { makeStyles } from "@material-ui/core/styles";
import MUIDataTable, { TableHead as MuiTableHead } from "mui-datatables";
import { TableHead, TableRow, TableFooter, TableCell, Box, Grid, Typography } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import AddIcon from "@material-ui/icons/Add";
import EditIcon from "@material-ui/icons/Edit";
import BoxHeader from "components/BoxHeader";
import PopupTable from "components/PopupTable";
import { getActiveDimListByModuleName } from "services/dimension";
import ModelDetail from "models/arContractDetail2";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  content: {
    padding: theme.spacing(0, 2),
  },
  list: {
    width: 980,
  },
  footerCell: {
    backgroundColor: theme.palette.background.paper,
    borderTop: "2px solid rgba(224, 224, 224, 1)",
    borderBottom: "none",
  },
  stickyFooterCell: {
    position: "sticky",
    bottom: 0,
    zIndex: 100,
    textAlign: "right",
    fontSize: "0.9rem",
    fontWeight: 600,
    color: theme.palette.primary.main,
  },
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  textCancel: {
    color: theme.palette.type === "dark" ? theme.palette.grey[800] : "inherit",
    border: `1px solid rgba(0, 0, 0, 0.23)`,
  },
}));

export default function DialogContract(props) {
  const classes = useStyles();
  const { open, cancel, formFields, formFieldsDetail, initialValues, save } = props;
  const { settingAll, NumberFormat, ToNumber, FindTaxAmount } = useContext(GblContext);
  const { SettingAr } = settingAll;
  const [originalData, setOriginalData] = useState([]);
  const [initNewRow, setInitNewRow] = useStateWithCallbackLazy(ModelDetail);
  const [showAdd, setShowAdd] = useState(false);
  const [editIndex, setEditIndex] = useState("");
  const [newCurrencyRate, setNewCurrencyRate] = useState(initialValues.CurRate);
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

  const fetchDimListByModule = useCallback(async () => {
    const { Data } = await getActiveDimListByModuleName(10, 1, "AR-CD");
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

  const methods = useForm({ defaultValues: initialValues });

  const { handleSubmit, watch } = methods;

  //set default value
  useEffect(() => {
    ModelDetail.Unit = SettingAr.DefaultUnit;
    ModelDetail.DeptCode = SettingAr.InvoiceDeptCode;
    ModelDetail.DeptDesc = SettingAr.InvoiceDeptDesc;
    ModelDetail.DrAcc = SettingAr.InvoiceDrAcc;
    ModelDetail.DrAccDesc = SettingAr.InvoiceDrAccDesc;
    ModelDetail.CrAcc = SettingAr.InvoiceCrAcc;
    ModelDetail.CrAccDesc = SettingAr.InvoiceCrAccDesc;
    ModelDetail.TaxType1 = SettingAr.TaxType1;
    ModelDetail.TaxRate1 = SettingAr.TaxRate1;
    ModelDetail.TaxAcc1 = SettingAr.TaxAcc1;
    ModelDetail.TaxAcc1Desc = SettingAr.TaxAcc1Desc;
    ModelDetail.TaxType2 = SettingAr.TaxType2;
    ModelDetail.TaxRate2 = SettingAr.TaxRate2;
    ModelDetail.TaxAcc2 = SettingAr.TaxAcc2;
    ModelDetail.TaxAcc2Desc = SettingAr.TaxAcc2Desc;
    setInitNewRow(ModelDetail);
    //keepOld Data before loop
    let original = _.cloneDeep(initialValues);
    setOriginalData(original);
  }, []);

  const onSubmit = (newFormValue) => {
    if (!newFormValue.PeriodicMonth) {
      newFormValue.PeriodicMonth = 1;
    }
    const newArr = Object.assign({}, initialValues, newFormValue);

    newArr.Detail.forEach((item) => {
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

    let sumAmount = newArr.Detail.reduce((accu, item) => {
      let s = ToNumber(accu) + ToNumber(item.TotalAmt);
      return NumberFormat(s ?? 0);
    }, 0);

    let sumBaseAmount = newArr.Detail.reduce((accu, item) => {
      let s = ToNumber(accu) + ToNumber(item.TotalBaseAmt);
      return NumberFormat(s ?? 0);
    }, 0);

    newArr.TotalAmount = sumAmount;
    newArr.TotalBaseAmount = sumBaseAmount;
    console.log(newArr);
    save(newArr);
  };

  const updateForm = (e) => {
    if (e.target.name === "CurRate") {
      let newRate = e.target.value;
      initialValues.Detail.forEach((item) => {
        item.NetBaseAmt = item.NetAmt * ToNumber(newRate);
        item.TaxBaseAmt1 = item.TaxAmt1 * ToNumber(newRate);
        item.TaxBaseAmt2 = item.TaxAmt2 * ToNumber(newRate);
        item.TotalBaseAmt = item.TotalAmt * ToNumber(newRate);
      });
      setNewCurrencyRate(newRate);
    }
  };

  const DialogTitle = (props) => {
    const { children, onClose, ...other } = props;
    return (
      <MuiDialogTitle disableTypography className={classes.rootTitle} {...other}>
        {children}
        {onClose ? (
          <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
            <CloseIcon />
          </IconButton>
        ) : null}
      </MuiDialogTitle>
    );
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
      name: "ConDDesc",
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
      for (var i = removeArray.length - 1; i >= 0; i--) initialValues.Detail.splice(removeArray[i], 1);
    },
  };

  const CustomHeader = (props) => {
    return (
      <>
        <TableHead>
          <TableRow>
            <TableCell align="left" colSpan={1}>
              <IconButton size={"small"} onClick={AddNewRow} style={{ marginLeft: 8 }}>
                <AddIcon />
              </IconButton>
            </TableCell>
            <TableCell align="right" colSpan={8}></TableCell>
          </TableRow>
        </TableHead>
        <MuiTableHead {...props} />
      </>
    );
  };

  const AddNewRow = () => {
    initialValues.CurRate = newCurrencyRate;
    setInitNewRow(
      (state) => ({
        ...state,
      }),
      () => {
        setEditIndex("");
        setShowAdd(true);
      }
    );
  };

  const UpdateRow = (index) => {
    let dataRow = initialValues.Detail.find((i) => i.index === index);
    initialValues.CurRate = newCurrencyRate;
    setSummaryValue({
      netAmt: ToNumber(dataRow["NetAmt"]),
      taxAmt1: ToNumber(dataRow["TaxAmt1"]),
      taxAmt2: ToNumber(dataRow["TaxAmt2"]),
      total: ToNumber(dataRow["TotalAmt"]),
      baseNetAmt: ToNumber(dataRow["NetAmt"] * newCurrencyRate),
      baseTaxAmt1: ToNumber(dataRow["TaxAmt1"] * newCurrencyRate),
      baseTaxAmt2: ToNumber(dataRow["TaxAmt2"] * newCurrencyRate),
      baseTotal: ToNumber(dataRow["TotalAmt"] * newCurrencyRate),
    });
    setEditIndex(index);
    setShowAdd(true);
  };

  const SaveFromPopup = (arr, row) => {
    const index = arr.Detail.findIndex((el) => el.index === editIndex);
    row.Price = ToNumber(row.Price);
    row.NetAmt = ToNumber(summaryValue.netAmt);
    row.TaxAmt1 = ToNumber(summaryValue.taxAmt1);
    row.TaxAmt2 = ToNumber(summaryValue.taxAmt2);
    row.TotalAmt = ToNumber(summaryValue.total);
    row.NetBaseAmt = ToNumber(summaryValue.baseNetAmt);
    row.TaxBaseAmt1 = ToNumber(summaryValue.baseTaxAmt1);
    row.TaxBaseAmt2 = ToNumber(summaryValue.baseTaxAmt2);
    row.TotalBaseAmt = ToNumber(summaryValue.baseTotal);

    if (row.TaxOverwrite1 === "") {
      row.TaxOverwrite1 = false;
    }

    if (row.TaxOverwrite2 === "") {
      row.TaxOverwrite2 = false;
    }

    if (editIndex !== "") {
      //update
      arr.Detail[index] = row;
      //reset(arr.Detail);
      setShowAdd(false);
    } else {
      //create
      if (arr.Detail) {
        row.index = arr.Detail.length;
        arr.Detail = [...arr.Detail, row];
        //reset(arr.Detail);
        setShowAdd(false);
      }
    }

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
    initialValues.CurRate = originalData.CurRate;
    setShowAdd(false);
  };

  const CheckTaxType = (m, data) => {
    if (data["TaxType1"] !== "None" && !!data["TaxAcc1"] === false) {
      m.setError("TaxAcc1", {
        type: "required",
        message: "* Required",
      });
    }
    if (data["TaxType2"] !== "None" && !!data["TaxAcc2"] === false) {
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
    let CurRate = initialValues.CurRate;
    let Qty = ToNumber(data["Qty"]);
    let Price = ToNumber(data["Price"]);
    let TaxRate1 = ToNumber(data.InvdTaxT1 !== "None" ? data["TaxRate1"] : 0);
    let TaxRate2 = ToNumber(data.InvdTaxT2 !== "None" ? data["TaxRate2"] : 0);
    let NetAmt = Qty * Price;
    let TaxAmt1 = FindTaxAmount(data["TaxType1"], TaxRate1, NetAmt);
    let TaxAmt2 = FindTaxAmount(data["TaxType2"], TaxRate2, NetAmt);

    CheckTaxType(m, data);

    if (data.TaxOverwrite1 || data.TaxOverwrite1 === "O") {
      m.setValue("TaxAmt1", data["TaxAmt1"]);
      TaxAmt1 = ToNumber(data["TaxAmt1"]);
    } else {
      m.setValue("TaxAmt1", TaxAmt1);
    }

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
      baseNetAmt: ToNumber(NetAmt * CurRate),
      baseTaxAmt1: ToNumber(TaxAmt1 * CurRate),
      baseTaxAmt2: ToNumber(TaxAmt2 * CurRate),
      baseTotal: ToNumber(Total * CurRate),
    }));
  };

  return (
    <Dialog open={open} onClose={cancel} maxWidth="lg">
      <DialogTitle id="customized-dialog-title" onClose={cancel}>
        <BoxHeader header={`A/R Contract`} />
      </DialogTitle>
      <DialogContent dividers>
        <form>
          <Grid container spacing={1} justifyContent="flex-start" alignItems="flex-start">
            {formFields
              ? formFields.map((item, idx) => (
                  <Grid item xs={item.size} key={idx}>
                    {item.field.props.name == "ContractNo"
                      ? React.createElement(item.field.type, {
                          ...{
                            ...item.field.props,
                            methods,
                            key: item.field.props.name,
                            onChange: updateForm,
                            disabled: initialValues.ArContractHId !== 0 ? true : false,
                          },
                        })
                      : React.createElement(item.field.type, {
                          ...{
                            ...item.field.props,
                            methods,
                            key: item.field.props.name,
                            onChange: updateForm,
                          },
                        })}
                  </Grid>
                ))
              : ""}
          </Grid>

          <MUIDataTable
            data={initialValues.Detail}
            columns={columns}
            options={options}
            components={{
              TableHead: CustomHeader,
            }}
          />
          {showAdd && (
            <PopupTable
              initialValues={editIndex !== "" ? initialValues.Detail.find((i) => i.index === editIndex) : initNewRow}
              formFields={formFieldsDetail}
              checkTaxType={CheckTaxType}
              update={UpdateFromPopup}
              open={showAdd}
              save={(row) => SaveFromPopup(initialValues, row)}
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
                          Rate : {NumberFormat(initialValues.CurRate, "currency")}
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
        </form>
        <pre>{process.env.NODE_ENV === "development" ? JSON.stringify(watch(), 0, 2) : ""}</pre>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="primary" type="submit" onClick={handleSubmit(onSubmit)}>
          Save
        </Button>
        <Button variant="outlined" className={classes.textCancel} onClick={cancel}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
