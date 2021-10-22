/* eslint-disable eqeqeq */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useState, useEffect, useCallback } from "react";
import { GblContext } from "providers/formatter";
import { useStateWithCallbackLazy } from "use-state-with-callback";
import clsx from "clsx";
import { withStyles } from "@material-ui/core/styles";
import { useForm } from "react-hook-form";
import { useRedirect } from "react-admin";
import EditIcon from "@material-ui/icons/Edit";
import { Paper, Grid, Typography } from "@material-ui/core";
import { TableFooter, TableRow, TableCell, Tabs, Tab, Tooltip } from "@material-ui/core";
import NumberFormatInput from "components/NumberFormatInput";
import ActionMenu from "components/ActionMenu";
import BoxHeader from "components/BoxHeader";
import ButtonFooter from "components/ButtonFooter";
import NavRight from "components/NavRightSide";
import MUIDataTable from "mui-datatables";
import DialogChangeRevision from "./DialogChangeRevision";
import { createBudgetDetail } from "services/generalLedger";
import { getActiveDimListByModuleName } from "services/dimension";
import Model from "models/budget";
import { startOfMonth } from "date-fns";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <div>{children}</div>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const StyledTab = withStyles({
  root: {
    textTransform: "none",
  },
})((props) => <Tab {...props} />);



const Create = (props) => {
  const classes = props.useStyles();
  const { basePath, formFields } = props;
  const redirect = useRedirect();
  const [initData, setInitData] = useStateWithCallbackLazy(Model);
  const [dataTab1, setDataTab1] = useStateWithCallbackLazy();
  const [dataTab2, setDataTab2] = useStateWithCallbackLazy();
  const [value, setValue] = useState(0);
  const [openDialogChangeRev, setOpenDialogChangeRev] = useState(false);
  const [revNo, setRevNo] = useState(0);
  const { settingAll, DateToString, NumberFormat, ToNumber } = useContext(GblContext);
  const { SettingClosePeriod, SettingSystem } = settingAll;
  const { ClosePeriodGl } = SettingClosePeriod;

  function createDataAnualBudget(dLastYear, amtLastYear, dThisYear, amtThisYear, dNextYear, amtNextYear) {
    let temp = [];
    for (let i = 1; i < 13; i++) {
      temp.push({
        Period: i,
        LastYear: DateToString(startOfMonth(new Date(dLastYear, i - 1, 1))),
        LastYearAmt: amtLastYear,
        ThisYear: DateToString(startOfMonth(new Date(dThisYear, i - 1, 1))),
        ThisYearAmt: amtThisYear,
        NextYear: DateToString(startOfMonth(new Date(dNextYear, i - 1, 1))),
        NextYearAmt: amtNextYear,
      });
    }
    return temp;
  }
  
  function createDataRevision(dThisYear, amtThisYear, rev1Amt, rev2Amt, rev3Amt, rev4Amt) {
    let temp = [];
    for (let i = 1; i < 13; i++) {
      temp.push({
        Period: i,
        ThisYearAmt: amtThisYear,
        ThisYear: DateToString(startOfMonth(new Date(dThisYear, i - 1, 1))),
        Revision1: rev1Amt,
        Revision2: rev2Amt,
        Revision3: rev3Amt,
        Revision4: rev4Amt,
      });
    }
    return temp;
  }


  const methods = useForm({ defaultValues: initData });
  const { handleSubmit, getValues } = methods;

  const disableFormEnter = (e) => {
    if (e.key === "Enter" && e.target.inputMode !== "numeric") e.preventDefault();
  };

  function AdjustAmtBeforeSave(data, keyName) {
    let obj = {};
    for (let i = 1; i < 13; i++) {
      obj[`Amt${i}`] = ToNumber(data[i - 1][keyName]);
    }
    return obj;
  }

  function AdjustRevisionBeforeSave(data, keyName) {
    let revision = {};
    for (let i = 1; i < 13; i++) {
      revision[`Amt${i}`] = ToNumber(data[i - 1][keyName]);
    }
    return revision;
  }

  const onSubmit = () => {
    const values = getValues();
    let newThisYearAmt = AdjustAmtBeforeSave(dataTab1, "ThisYearAmt");
    let newNextYearAmt = AdjustAmtBeforeSave(dataTab1, "NextYearAmt");
    let r1 = AdjustRevisionBeforeSave(dataTab2, "Revision1");
    r1.Revision = initData.Revisions[0].Revision;
    r1.Caption = initData.Revisions[0].Caption;
    let r2 = AdjustRevisionBeforeSave(dataTab2, "Revision2");
    r2.Revision = initData.Revisions[1].Revision;
    r2.Caption = initData.Revisions[1].Caption;
    let r3 = AdjustRevisionBeforeSave(dataTab2, "Revision3");
    r3.Revision = initData.Revisions[2].Revision;
    r3.Caption = initData.Revisions[2].Caption;
    let r4 = AdjustRevisionBeforeSave(dataTab2, "Revision4");
    r4.Revision = initData.Revisions[3].Revision;
    r4.Caption = initData.Revisions[3].Caption;

    //Adjust parameter before save
    setInitData(
      (state) => ({
        ...state,
        ThisYearAmt: newThisYearAmt,
        NextYearAmt: newNextYearAmt,
        Revisions: [r1, r2, r3, r4],
        ...values,
      }),
      (nextState) => {
        Save(nextState);
      }
    );
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);

    //Tab Revision
    if (newValue === 1) {
      for (let i = 0; i < dataTab2.length; i++) {
        dataTab2[i].ThisYearAmt = dataTab1[i].ThisYearAmt;
      }
      setDataTab2(dataTab2);
    }
  };

  const menuControlProp = [
    { name: "Back", fnc: () => redirect("list", basePath) },
    { name: "Add", disabled: true },
    { name: "Edit", disabled: true },
    { name: "Delete", disabled: true },
    //{ name: "Excel", disabled: true },
  ];

  const fetchDimListByModule = useCallback(async () => {
    const { Data } = await getActiveDimListByModuleName(10, 1, "BG");
    setInitData((state) => ({
      ...state,
      DimList: {
        Dim: Data,
      },
    }));
  }, []);

  useEffect(() => {
    fetchDimListByModule();
    setDataTab1(
      createDataAnualBudget(
        parseInt(new Date(ClosePeriodGl).getFullYear()) - 1,
        0,
        new Date(ClosePeriodGl).getFullYear(),
        0,
        parseInt(new Date(ClosePeriodGl).getFullYear()) + 1,
        0
      )
    );
    setDataTab2(createDataRevision(new Date(ClosePeriodGl).getFullYear(), 0, 0, 0, 0, 0));
  }, [fetchDimListByModule]);

  const [openDim, setOpenDim] = useState(false);
  const [dataDim, setDataDim] = useStateWithCallbackLazy();

  const TextFieldNumber = ({ index, name, disabled, value, updateValue }) => {
    let isRevisionBudget = name.search("Revision");

    const updateAnnual = (e) => {
      updateValue(e.target.value);
      let newArr = dataTab1;
      newArr[index][`${name}`] = ToNumber(e.target.value);
      setDataTab1(newArr);
    };

    const updateRevision = (e) => {
      updateValue(e.target.value);
      let newArr = dataTab2;
      newArr[index][`${name}`] = ToNumber(e.target.value);
      setDataTab2(newArr);
    };

    const handleKeyPressAnnual = (e) => {
      if (e.key === "Enter") {
        var nextElement = document.getElementsByName(`${name}${index + 1}`);
        if (nextElement.length > 0) {
          nextElement[0].value = e.target.value;
          nextElement[0].focus();
          let newArr = dataTab1;
          newArr[index + 1][`${name}`] = ToNumber(e.target.value);
          setDataTab1(newArr);
        }
      }
    };

    const handleKeyPressRevision = (e) => {
      if (e.key === "Enter") {
        var nextElement = document.getElementsByName(`${name}${index + 1}`);
        if (nextElement.length > 0) {
          nextElement[0].value = ToNumber(e.target.value);
          nextElement[0].focus();
          let newArr = dataTab2;
          newArr[index + 1][`${name}`] = ToNumber(e.target.value);
          setDataTab2(newArr);
        }
      }
    };

    const handleFocus = (e) => {
      updateValue(e.target.value);
      e.target.select();
      setTimeout(function () {
        e.target.setSelectionRange(0, e.target.value.length);
      }, 0);
    };

    return (
      <NumberFormatInput
        style={{
          textAlign: "right",
          fontSize: 14,
          paddingRight: 4,
          margin: 6,
        }}
        name={name + index}
        value={value}
        onChange={isRevisionBudget === -1 ? updateAnnual : updateRevision}
        onFocus={handleFocus}
        onKeyPress={isRevisionBudget === -1 ? handleKeyPressAnnual : handleKeyPressRevision}
        disabled={disabled}
        decimal={SettingSystem.CurrencyBaseDecimal}
      />
    );
  };

  const showDialogChangeRevName = (revNo) => {
    setRevNo(revNo);
    setOpenDialogChangeRev(!openDialogChangeRev);
  };

  const columns = [
    {
      name: "Period",
      label: "Period",
      options: {
        filter: false,
        sort: false,
        setCellHeaderProps: () => ({
          align: "center",
        }),
        setCellProps: () => ({
          style: {
            textAlign: "center",
          },
        }),
      },
    },
    {
      name: "LastYear",
      options: {
        filter: false,
        sort: false,
        customHeadLabelRender: () => `Year ${initData.Year - 1}`,
      },
    },
    {
      name: "LastYearAmt",
      label: " ",
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
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <TextFieldNumber
              index={tableMeta.rowIndex}
              name={tableMeta.columnData.name}
              value={value}
              updateValue={updateValue}
              disabled
            />
          );
        },
      },
    },
    {
      name: "ThisYear",
      options: {
        filter: false,
        sort: false,
        customHeadLabelRender: () => `Year ${initData.Year}`,
      },
    },
    {
      name: "ThisYearAmt",
      label: " ",
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
        customBodyRender: (value, tableMeta, updateValue) => {
          let closePeriodMonth = new Date(ClosePeriodGl).getMonth();
          return (
            <TextFieldNumber
              index={tableMeta.rowIndex}
              name={tableMeta.columnData.name}
              value={value}
              updateValue={updateValue}
              disabled={closePeriodMonth >= tableMeta.rowIndex ? true : false}
            />
          );
        },
      },
    },
    {
      name: "NextYear",
      options: {
        filter: false,
        sort: false,
        customHeadLabelRender: () => `Year ${parseInt(initData.Year) + 1}`,
      },
    },
    {
      name: "NextYearAmt",
      label: " ",
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
        customBodyRender: (value, tableMeta, updateValue) => (
          <TextFieldNumber
            index={tableMeta.rowIndex}
            name={tableMeta.columnData.name}
            value={value}
            updateValue={updateValue}
          />
        ),
      },
    },
  ];

  const columnsRevision = [
    {
      name: "Period",
      label: "Period",
      options: {
        filter: false,
        sort: false,
        setCellHeaderProps: () => ({
          align: "center",
        }),
        setCellProps: () => ({
          style: {
            textAlign: "center",
          },
        }),
      },
    },
    {
      name: "ThisYear",
      label: "ThisYear",
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: "ThisYearAmt",
      label: " ",
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
        customBodyRender: (value, tableMeta, updateValue) => (
          <TextFieldNumber
            index={tableMeta.rowIndex}
            name={tableMeta.columnData.name}
            value={value}
            updateValue={updateValue}
            disabled={true}
          />
        ),
      },
    },
    {
      name: "Revision1",
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
        customHeadLabelRender: () => {
          return (
            <div className={classes.flexRightSide}>
              <Typography variant="body2" display="inline">
                {initData.Revisions[0]?.Caption ?? "Revision1"}
              </Typography>
              <Tooltip title="Change Caption Revision">
                <EditIcon
                  fontSize="small"
                  style={{ cursor: "pointer", marginLeft: 10 }}
                  onClick={() => showDialogChangeRevName(0)}
                />
              </Tooltip>
            </div>
          );
        },
        customBodyRender: (value, tableMeta, updateValue) => {
          let closePeriodMonth = new Date(ClosePeriodGl).getMonth();
          return (
            <TextFieldNumber
              index={tableMeta.rowIndex}
              name={tableMeta.columnData.name}
              value={value}
              updateValue={updateValue}
              disabled={closePeriodMonth >= tableMeta.rowIndex ? true : false}
            />
          );
        },
      },
    },
    {
      name: "Revision2",
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
        customHeadLabelRender: () => {
          return (
            <div className={classes.flexRightSide}>
              <Typography variant="body2" display="inline">
                {initData.Revisions[1]?.Caption ?? "Revision2"}
              </Typography>
              <Tooltip title="Change Caption Revision">
                <EditIcon
                  fontSize="small"
                  style={{ cursor: "pointer", marginLeft: 10 }}
                  onClick={() => showDialogChangeRevName(1)}
                />
              </Tooltip>
            </div>
          );
        },
        customBodyRender: (value, tableMeta, updateValue) => {
          let closePeriodMonth = new Date(ClosePeriodGl).getMonth();
          return (
            <TextFieldNumber
              index={tableMeta.rowIndex}
              name={tableMeta.columnData.name}
              value={value}
              updateValue={updateValue}
              disabled={closePeriodMonth >= tableMeta.rowIndex ? true : false}
            />
          );
        },
      },
    },
    {
      name: "Revision3",
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
        customHeadLabelRender: () => {
          return (
            <div className={classes.flexRightSide}>
              <Typography variant="body2" display="inline">
                {initData.Revisions[2]?.Caption ?? "Revision3"}
              </Typography>
              <Tooltip title="Change Caption Revision">
                <EditIcon
                  fontSize="small"
                  style={{ cursor: "pointer", marginLeft: 10 }}
                  onClick={() => showDialogChangeRevName(2)}
                />
              </Tooltip>
            </div>
          );
        },
        customBodyRender: (value, tableMeta, updateValue) => {
          let closePeriodMonth = new Date(ClosePeriodGl).getMonth();
          return (
            <TextFieldNumber
              index={tableMeta.rowIndex}
              name={tableMeta.columnData.name}
              value={value}
              updateValue={updateValue}
              disabled={closePeriodMonth >= tableMeta.rowIndex ? true : false}
            />
          );
        },
      },
    },
    {
      name: "Revision4",
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
        customHeadLabelRender: () => {
          return (
            <div className={classes.flexRightSide}>
              <Typography variant="body2" display="inline">
                {initData.Revisions[3]?.Caption ?? "Revision4"}
              </Typography>
              <Tooltip title="Change Caption Revision">
                <EditIcon
                  fontSize="small"
                  style={{ cursor: "pointer", marginLeft: 10 }}
                  onClick={() => showDialogChangeRevName(3)}
                />
              </Tooltip>
            </div>
          );
        },
        customBodyRender: (value, tableMeta, updateValue) => {
          let closePeriodMonth = new Date(ClosePeriodGl).getMonth();
          return (
            <TextFieldNumber
              index={tableMeta.rowIndex}
              name={tableMeta.columnData.name}
              value={value}
              updateValue={updateValue}
              disabled={closePeriodMonth >= tableMeta.rowIndex ? true : false}
            />
          );
        },
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
    tableBodyHeight: "520px",
    search: false,
    download: false,
    filter: false,
    print: false,
    viewColumns: false,
    elevation: 0,
    setTableProps: () => {
      return {
        padding: "checkbox",
        size: "small",
      };
    },
    pagination: false,
    customTableBodyFooterRender: function (opts) {
      let sumLastYear = opts.data.reduce((accu, item) => {
        let s = ToNumber(accu) + ToNumber(item.data[2].props.value);
        return NumberFormat(s ?? 0);
      }, 0);
      let sumThisYear = opts.data.reduce((accu, item) => {
        let s = ToNumber(accu) + ToNumber(item.data[4].props.value);
        return NumberFormat(s ?? 0);
      }, 0);
      let sumNextYear = opts.data.reduce((accu, item) => {
        let s = ToNumber(accu) + ToNumber(item.data[6].props.value);
        return NumberFormat(s ?? 0);
      }, 0);

      return (
        <TableFooter className={footerClasses}>
          <TableRow>
            {opts.columns.map((col, index) => {
              if (col.display === "true") {
                if (col.name === "LastYearAmt") {
                  return (
                    <TableCell key={index} className={footerClasses}>
                      <span className={classes.pdrTextFooter}>{sumLastYear}</span>
                    </TableCell>
                  );
                } else if (col.name === "ThisYearAmt") {
                  return (
                    <TableCell key={index} className={footerClasses}>
                      <span className={classes.pdrTextFooter}>{sumThisYear}</span>
                    </TableCell>
                  );
                } else if (col.name === "NextYearAmt") {
                  return (
                    <TableCell key={index} className={footerClasses}>
                      <span className={classes.pdrTextFooter}>{sumNextYear}</span>
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

  const optionsRevision = {
    responsive: "standard",
    selectableRows: "none",
    serverSide: true,
    fixedHeader: true,
    tableBodyHeight: "520px",
    search: false,
    download: false,
    filter: false,
    print: false,
    viewColumns: false,
    elevation: 0,
    setTableProps: () => {
      return {
        padding: "checkbox",
        size: "small",
      };
    },
    pagination: false,
    customTableBodyFooterRender: function (opts) {
      let sumThisYear = opts.data.reduce((accu, item) => {
        let s = ToNumber(accu) + ToNumber(item.data[2].props.value);
        return NumberFormat(s ?? 0);
      }, 0);
      let sumRev1 = opts.data.reduce((accu, item) => {
        let s = ToNumber(accu) + ToNumber(item.data[3].props.value);
        return NumberFormat(s ?? 0);
      }, 0);
      let sumRev2 = opts.data.reduce((accu, item) => {
        let s = ToNumber(accu) + ToNumber(item.data[4].props.value);
        return NumberFormat(s ?? 0);
      }, 0);
      let sumRev3 = opts.data.reduce((accu, item) => {
        let s = ToNumber(accu) + ToNumber(item.data[5].props.value);
        return NumberFormat(s ?? 0);
      }, 0);
      let sumRev4 = opts.data.reduce((accu, item) => {
        let s = ToNumber(accu) + ToNumber(item.data[6].props.value);
        return NumberFormat(s ?? 0);
      }, 0);

      return (
        <TableFooter className={footerClasses}>
          <TableRow>
            {opts.columns.map((col, index) => {
              if (col.display === "true") {
                if (col.name === "ThisYearAmt") {
                  return (
                    <TableCell key={index} className={footerClasses}>
                      <span className={classes.pdrTextFooter}>{sumThisYear}</span>
                    </TableCell>
                  );
                } else if (col.name === "Revision1") {
                  return (
                    <TableCell key={index} className={footerClasses}>
                      <span className={classes.pdrTextFooter}>{sumRev1}</span>
                    </TableCell>
                  );
                } else if (col.name === "Revision2") {
                  return (
                    <TableCell key={index} className={footerClasses}>
                      <span className={classes.pdrTextFooter}>{sumRev2}</span>
                    </TableCell>
                  );
                } else if (col.name === "Revision3") {
                  return (
                    <TableCell key={index} className={footerClasses}>
                      <span className={classes.pdrTextFooter}>{sumRev3}</span>
                    </TableCell>
                  );
                } else if (col.name === "Revision4") {
                  return (
                    <TableCell key={index} className={footerClasses}>
                      <span className={classes.pdrTextFooter}>{sumRev4}</span>
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

  const Save = async (values) => {
    let modelCurrent = {
      Year: values.Year,
      DeptCode: values.DeptCode,
      AccCode: values.AccCode,
      ThisYearAmt: values.ThisYearAmt,
      Revisions: values.Revisions,
      DimList: values.DimList,
      UserModified: values.UserModified,
    };
    console.log(modelCurrent, "modelCurrent");
    const { Code, InternalMessage } = await createBudgetDetail(modelCurrent);
    if (Code === 0) {
      //save nextyearamt
      let sumNextYearAmt = Object.keys(values.NextYearAmt).reduce(
        (sum, key) => sum + parseFloat(values.NextYearAmt[key] || 0),
        0
      );
      if (sumNextYearAmt !== 0) {
        let modelNextYear = {
          Year: values.Year + 1,
          DeptCode: values.DeptCode,
          AccCode: values.AccCode,
          ThisYearAmt: values.NextYearAmt,
          Revisions: values.Revisions,
          DimList: values.DimList,
          UserModified: values.UserModified,
        };
        const { Code } = await createBudgetDetail(modelNextYear);
        if (Code === 0) {
          redirect(`${InternalMessage}/show`);
        }
      } else {
        redirect(`${InternalMessage}/show`);
      }
    }
  };

  const ShowDim = (values) => {
    if (!values) {
      setDataDim(initData.DimList.Dim);
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

      <Paper className={classes.root}>
        <BoxHeader header={"Budget Detail"} />
        <form onKeyDown={disableFormEnter}>
          <Grid container alignItems="flex-start" spacing={1}>
            <Grid item xs={2}>
              <Typography variant="body2">Year</Typography>
              <Typography variant="body1">{initData.Year}</Typography>
            </Grid>
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
          </Grid>
        </form>
        <Tabs
          value={value}
          onChange={handleChange}
          indicatorColor="primary"
          textColor="primary"
          style={{ marginBottom: 12 }}
        >
          <StyledTab label="Annual Budget" {...a11yProps(0)} />
          <StyledTab label="Revision Budget" {...a11yProps(1)} />
        </Tabs>
        <TabPanel value={value} index={0}>
          <MUIDataTable data={dataTab1} columns={columns} options={options} />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <MUIDataTable data={dataTab2} columns={columnsRevision} options={optionsRevision} />
        </TabPanel>
        <ButtonFooter SaveFnc={handleSubmit(onSubmit)} CancelFnc={CancelFnc} />
      </Paper>
      {initData?.Revisions && showDialogChangeRevName && (
        <DialogChangeRevision
          value={initData?.Revisions && initData?.Revisions[revNo]?.Caption}
          open={openDialogChangeRev}
          close={() => setOpenDialogChangeRev(false)}
          save={(newCaption) => {
            initData.Revisions.forEach((item, idx) => {
              if (idx === revNo) {
                item.Caption = newCaption;
              }
            });
            setInitData((state) => ({
              ...state,
              Revisions: initData.Revisions,
            }));
            setOpenDialogChangeRev(false);
          }}
        />
      )}
      <pre>{process.env.NODE_ENV === "development" ? JSON.stringify(initData, 0, 2) : ""}</pre>
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

export default Create;
