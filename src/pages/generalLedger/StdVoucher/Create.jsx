/* eslint-disable eqeqeq */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useState, useEffect, useCallback } from "react";
import { GblContext } from "providers/formatter";
import { useStateWithCallbackLazy } from "use-state-with-callback";
import clsx from "clsx";
import { useRedirect, withTranslate } from "react-admin";
import { Paper, Grid } from "@material-ui/core";
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
import { createJvFrDetail } from "services/generalLedger";
import { getActiveDimListByModuleName } from "services/dimension";
import Model from "models/glJvFr";
import SnackbarUtils from "utils/SnackbarUtils";

const Create = (props) => {
  const classes = props.useStyles();
  const { basePath, formFields, formFieldsRecurring, formFieldsDetail, translate } = props;
  const redirect = useRedirect();
  const { settingAll, NumberFormat, ToNumber, FixedSumValue } = useContext(GblContext);
  const { SettingSystem } = settingAll;
  const [initData, setInitData] = useStateWithCallbackLazy(Model);

  const [initNewRow, setInitNewRow] = useState({
    index: -1,
    JvhSeq: -1,
    JvdSeq: -1,
    DeptCode: "",
    AccCode: "",
    Description: "",
    CurCode: SettingSystem.DefaultCurrencyCode,
    CurRate: SettingSystem.DefaultCurrencyRate,
    CrAmount: 0,
    CrBase: 0,
    DrAmount: 0,
    DrBase: 0,
    IsOverWrite: true,
    DimList: {
      Dim: [],
    },
  });

  const methods = useForm({ defaultValues: initData });

  const { handleSubmit, getValues } = methods;

  const disableFormEnter = (e) => {
    if (e.key === "Enter" && e.target.localName !== "textarea") e.preventDefault();
  };

  const onSubmit = () => {
    const values = getValues();
    if (values.Type === "Recurring") {
      let splitFromMonthYear = values.FJvhFrom.split("/");
      values.FJvhFromPr = splitFromMonthYear[0];
      values.FJvhFromYr = splitFromMonthYear[1];
      let splitToMonthYear = values.FJvhTo.split("/");
      values.FJvhToPr = splitToMonthYear[0];
      values.FJvhToYr = splitToMonthYear[1];
    } else {
      values.FJvhFreq = 0;
    }

    //Adjust parameter before save
    setInitData(
      (state) => ({
        ...state,
        ...values,
      }),
      (nextState) => {
        Save(nextState);
      }
    );
  };

  const menuControlProp = [
    { name: "Back", fnc: () => redirect("list", basePath) },
    { name: "Add", disabled: true },
    { name: "Edit", disabled: true },
    { name: "Delete", disabled: true },
    { name: "Print", disabled: true },
  ];

  const fetchDimHListByModule = useCallback(async () => {
    const { Data } = await getActiveDimListByModuleName(10, 1, "GL-H");
    setInitData((state) => ({
      ...state,
      DimHList: {
        Dim: Data,
      },
    }));
  }, []);

  const fetchDimListByModule = useCallback(async () => {
    const { Data } = await getActiveDimListByModuleName(10, 1, "GL-D");
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

  const AddNewRow = () => {
    setEditIndex("");
    setShowAdd(true);
  };

  const UpdateRow = (value) => {
    setEditIndex(value);
    setShowAdd(true);
  };

  const SaveFromPopup = (arr, row) => {
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
    setShowAdd(false);
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
      name: "AccCode",
      label: "Account #",
    },
    {
      name: "AccDesc",
      label: "Account Name",
    },
    {
      name: "Description",
      label: "Comment",
    },
    {
      name: "CurCode",
      label: "Currency",
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
      name: "DrAmount",
      label: "Dr Amount",
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
      name: "CrAmount",
      label: "Cr Amount",
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
      name: "DrBase",
      label: "Dr Base",
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
      name: "CrBase",
      label: "Cr Base",
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
    tableBodyHeight: "580px",
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
      let sumDrAmt = opts.data.reduce((accu, item) => {
        let s = ToNumber(accu) + ToNumber(item.data[7]);
        return NumberFormat(s ?? 0);
      }, 0);

      let sumCrAmt = opts.data.reduce((accu, item) => {
        let s = ToNumber(accu) + ToNumber(item.data[8]);
        return NumberFormat(s ?? 0);
      }, 0);

      let sumDrBase = opts.data.reduce((accu, item) => {
        let s = ToNumber(accu) + ToNumber(item.data[9]);
        return NumberFormat(s ?? 0);
      }, 0);

      let sumCrBase = opts.data.reduce((accu, item) => {
        let s = ToNumber(accu) + ToNumber(item.data[10]);
        return NumberFormat(s ?? 0);
      }, 0);
      return (
        <TableFooter className={footerClasses}>
          <TableRow>
            {/* Add TableCellEmpty For Summary Space */}
            <TableCell className={footerClasses} />
            {opts.columns.map((col, index) => {
              if (col.display === "true") {
                if (col.name === "DrAmount") {
                  return (
                    <TableCell key={index} className={footerClasses}>
                      {sumDrAmt}
                    </TableCell>
                  );
                } else if (col.name === "CrAmount") {
                  return (
                    <TableCell key={index} className={footerClasses}>
                      {sumCrAmt}
                    </TableCell>
                  );
                } else if (col.name === "DrBase") {
                  return (
                    <TableCell key={index} className={footerClasses}>
                      {sumDrBase}
                    </TableCell>
                  );
                } else if (col.name === "CrBase") {
                  return (
                    <TableCell key={index} className={footerClasses}>
                      {sumCrBase}
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
      for (var i = removeArray.length - 1; i >= 0; i--) initData.Detail.splice(removeArray[i], 1);
    },
  };

  const CustomHeader = (props) => {
    return (
      <>
        <TableHead>
          <TableRow>
            <TableCell align="center" colSpan={1}>
              <IconButton size={"small"} onClick={() => AddNewRow()} style={{ marginLeft: 6 }}>
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

  const CheckDrCr = (field, m, data) => {
    let CurRate = ToNumber(data["CurRate"]);
    let DrAmount = ToNumber(data["DrAmount"]);
    let CrAmount = ToNumber(data["CrAmount"]);
    m.setValue("CurRate", CurRate);
    m.setValue("DrBase", DrAmount * CurRate);
    m.setValue("CrBase", CrAmount * CurRate);
    if (field == "DrAmount" && data[field] != 0) {
      m.setValue("DrBase", DrAmount * CurRate);
      m.setValue("CrAmount", 0);
      m.setValue("CrBase", 0);
    }
    if (field == "CrAmount" && data[field] != 0) {
      m.setValue("CrBase", CrAmount * CurRate);
      m.setValue("DrAmount", 0);
      m.setValue("DrBase", 0);
    }
  };

  const Save = async (values) => {
    if (values.Type === "Recurring") {
      if (values.Detail.length > 0) {
        let sumDrAmt = values.Detail.reduce((total, cur) => {
          return FixedSumValue(total + ToNumber(cur.DrAmount));
        }, 0);
        let sumCrAmt = values.Detail.reduce((total, cur) => {
          return FixedSumValue(total + ToNumber(cur.CrAmount));
        }, 0);
        if (sumDrAmt !== sumCrAmt) {
          SnackbarUtils.warning("Unbalanced");
          return;
        }
        let foundZeroItem = values.Detail.filter(
          (item) => ToNumber(item.DrAmount) === 0 && ToNumber(item.CrAmount) === 0
        );
        if (foundZeroItem.length > 0) {
          let msg = `Amount cannot be zero, would you like to remove transaction(s) ? 
      Note: All transactions with no amounts will be deleted.`;
          let dialog = window.confirm(msg);
          if (dialog) {
            var indexList = foundZeroItem.map((i) => i.index);
            for (var i = indexList.length - 1; i >= 0; i--) {
              values.Detail.splice(indexList[i], 1);
            }
          } else {
            return;
          }
        }
      }
    }

    if (values.Detail.length === 0) {
      SnackbarUtils.toast(translate("ra.info.notransaction"));
      return;
    }

    const { Code, InternalMessage } = await createJvFrDetail(values);
    if (Code === 0) {
      redirect(`${InternalMessage}/show`);
    } else {
      console.log(InternalMessage);
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
          <BoxHeader header={"Standard Journal Voucher"} status={initData.Status} />
          <Grid container alignItems="flex-start" spacing={1}>
            {formFields
              ? formFields.map((item, idx) => (
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
            {formFieldsRecurring && methods.watch("Type") === "Recurring"
              ? formFieldsRecurring.map((item, idx) => (
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
                <PopupTable
                  initialValues={editIndex !== "" ? initData.Detail[editIndex] : initNewRow}
                  formFields={formFieldsDetail}
                  update={CheckDrCr}
                  open={showAdd}
                  save={(row) => SaveFromPopup(initData, row)}
                  cancel={CancelFromPopup}
                  showDim
                />
              )}
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
