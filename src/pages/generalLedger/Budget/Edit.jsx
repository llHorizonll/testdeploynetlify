/* eslint-disable eqeqeq */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useState, useEffect, useCallback } from "react";
import { GblContext } from "providers/formatter";
import { useStateWithCallbackLazy } from "use-state-with-callback";
import clsx from "clsx";
import { withStyles } from "@material-ui/core/styles";
import { Loading, Error, useRedirect } from "react-admin";
import EditIcon from "@material-ui/icons/Edit";
import { Paper, Grid, Typography } from "@material-ui/core";
import { TableFooter, TableRow, TableCell, Tabs, Tab, Tooltip } from "@material-ui/core";
import NumberFormatInput from "components/NumberFormatInput";
import TextTopInGrid from "components/TextTopInGrid";
import ActionMenu from "components/ActionMenu";
import BoxHeader from "components/BoxHeader";
import ButtonFooter from "components/ButtonFooter";
import NavRight from "components/NavRightSide";
import MUIDataTable from "mui-datatables";
import DialogChangeRevision from "./DialogChangeRevision";
import { getBudgetDetail, getBudgetList, createBudgetDetail, updateBudgetDetail } from "services/generalLedger";
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

const Edit = (props) => {
  const classes = props.useStyles();
  const { basePath, id } = props;
  const redirect = useRedirect();
  const [data, setData] = useStateWithCallbackLazy();
  const [loading, setLoading] = useState(true);
  const [error] = useState();
  const [value, setValue] = useState(0);
  const [openDialogChangeRev, setOpenDialogChangeRev] = useState(false);
  const [revNo, setRevNo] = useState(0);
  const { settingAll, DateToString, NumberFormat, ToNumber } = useContext(GblContext);
  const { SettingClosePeriod, SettingSystem } = settingAll;
  const { ClosePeriodGl } = SettingClosePeriod;
  const handleChange = (event, newValue) => {
    setValue(newValue);
    //Tab Revision
    if (newValue === 1) {
      for (let i = 0; i < data.ArrRevisionAmt.length; i++) {
        data.ArrRevisionAmt[i].ThisYearAmt = data.ArrAmt[i].ThisYearAmt;
      }
      setData(data);
    }
  };

  const menuControlProp = [
    { name: "Back", fnc: () => redirect("list", basePath) },
    { name: "Add", disabled: true },
    { name: "Edit", disabled: true },
    { name: "Delete", disabled: true },
    // { name: "Excel", disabled: true },
  ];

  const [openDim, setOpenDim] = useState(false);
  const [dataDim, setDataDim] = useStateWithCallbackLazy();

  const TextFieldNumber = ({ index, name, disabled, value, updateValue }) => {
    let isRevisionBudget = name.search("Revision");
    let newArr = data;

    const updateAnnual = (e) => {
      updateValue(e.target.value);
      newArr.ArrAmt[index][`${name}`] = ToNumber(e.target.value);
      setData(newArr);
    };

    const updateRevision = (e) => {
      updateValue(e.target.value);
      newArr.ArrRevisionAmt[index][`${name}`] = ToNumber(e.target.value);
      setData(newArr);
    };

    const handleKeyPressAnnual = (e) => {
      if (e.key === "Enter") {
        var nextElement = document.getElementsByName(`${name}${index + 1}`);
        if (nextElement.length > 0) {
          nextElement[0].value = e.target.value;
          nextElement[0].focus();
          newArr.ArrAmt[index + 1][`${name}`] = ToNumber(e.target.value);
          setData(newArr);
        }
      }
    };

    const handleKeyPressRevision = (e) => {
      if (e.key === "Enter") {
        var nextElement = document.getElementsByName(`${name}${index + 1}`);
        if (nextElement.length > 0) {
          nextElement[0].value = ToNumber(e.target.value);
          nextElement[0].focus();
          newArr.ArrRevisionAmt[index + 1][`${name}`] = ToNumber(e.target.value);
          setData(newArr);
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

  const fetchBudgetById = useCallback(
    async (mounted) => {
      const response = await getBudgetDetail(id);
      if (response) {
        var temp = [];
        var temp2 = [];
        for (let i = 1; i < 13; i++) {
          temp.push({
            Period: i,
            LastYear: DateToString(startOfMonth(new Date(response.Year - 1, i - 1, 1))),
            LastYearAmt: response.LastYearAmt[`Amt${i}`],
            ThisYear: DateToString(startOfMonth(new Date(response.Year, i - 1, 1))),
            ThisYearAmt: response.ThisYearAmt[`Amt${i}`],
            NextYear: DateToString(startOfMonth(new Date(response.Year + 1, i - 1, 1))),
            NextYearAmt: response.NextYearAmt[`Amt${i}`],
          });
          if (response.Revisions.length > 0) {
            temp2.push({
              Period: i,
              ThisYearAmt: response.ThisYearAmt[`Amt${i}`],
              ThisYear: DateToString(startOfMonth(new Date(response.Year, i - 1, 1))),
              Revision1: response.Revisions[0][`Amt${i}`],
              Revision2: response.Revisions[1][`Amt${i}`],
              Revision3: response.Revisions[2][`Amt${i}`],
              Revision4: response.Revisions[3][`Amt${i}`],
            });
          }
        }
        //create tempRevision
        if (temp2.length === 0) {
          for (let i = 1; i < 13; i++) {
            temp2.push({
              Period: i,
              ThisYearAmt: response.ThisYearAmt[`Amt${i}`],
              ThisYear: DateToString(startOfMonth(new Date(response.Year, i - 1, 1))),
              Revision1: 0,
              Revision2: 0,
              Revision3: 0,
              Revision4: 0,
            });
          }
        }

        if (response.Revisions.length === 0) {
          console.log("in");
          response.Revisions = Model.Revisions;
        }

        response.ArrAmt = temp;
        response.ArrRevisionAmt = temp2;
        console.log(response);
        setData(response);
      }
      if (mounted) {
        setLoading(false);
      }
    },
    [id]
  );

  useEffect(() => {
    let mounted = true;
    fetchBudgetById(mounted);
    return function cleanup() {
      mounted = false;
    };
  }, [fetchBudgetById]);

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
        customHeadLabelRender: () => `Year ${data.Year - 1}`,
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
        customHeadLabelRender: () => `Year ${data.Year}`,
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
              disabled={
                data.Year > new Date(ClosePeriodGl).getFullYear()
                  ? false
                  : closePeriodMonth >= tableMeta.rowIndex
                  ? true
                  : false
              }
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
        customHeadLabelRender: () => `Year ${data.Year + 1}`,
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
        customBodyRender: (value, tableMeta, updateValue) => {
          let closePeriodYear = new Date(ClosePeriodGl).getFullYear();
          return (
            <TextFieldNumber
              index={tableMeta.rowIndex}
              name={tableMeta.columnData.name}
              value={value}
              updateValue={updateValue}
              disabled={closePeriodYear < data.Year ? true : false}
            />
          );
        },
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
        //customHeadLabelRender: () => `Year ${data.Year}`,
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
          return (
            <TextFieldNumber
              index={tableMeta.rowIndex}
              name={tableMeta.columnData.name}
              value={value}
              updateValue={updateValue}
              disabled={true}
            />
          );
        },
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
                {data.Revisions[0]?.Caption ?? "Revision1"}
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
                {data.Revisions[1]?.Caption ?? "Revision2"}
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
                {data.Revisions[2]?.Caption ?? "Revision3"}
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
                {data.Revisions[3]?.Caption ?? "Revision4"}
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
    tableBodyHeight: "580px",
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
    tableBodyHeight: "580px",
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

  const Save = async (values) => {
    let newThisYearAmt = AdjustAmtBeforeSave(values.ArrAmt, "ThisYearAmt");
    let newNextYearAmt = AdjustAmtBeforeSave(values.ArrAmt, "NextYearAmt");
    let r1 = AdjustRevisionBeforeSave(values.ArrRevisionAmt, "Revision1");
    r1.Revision = values.Revisions[0].Revision;
    r1.Caption = values.Revisions[0].Caption;
    let r2 = AdjustRevisionBeforeSave(values.ArrRevisionAmt, "Revision2");
    r2.Revision = values.Revisions[1].Revision;
    r2.Caption = values.Revisions[1].Caption;
    let r3 = AdjustRevisionBeforeSave(values.ArrRevisionAmt, "Revision3");
    r3.Revision = values.Revisions[2].Revision;
    r3.Caption = values.Revisions[2].Caption;
    let r4 = AdjustRevisionBeforeSave(values.ArrRevisionAmt, "Revision4");
    r4.Revision = values.Revisions[3].Revision;
    r4.Caption = values.Revisions[3].Caption;
    let modelCurrent = {
      BudgetId: id,
      Year: values.Year,
      DeptCode: values.DeptCode,
      AccCode: values.AccCode,
      ThisYearAmt: newThisYearAmt,
      Revisions: [r1, r2, r3, r4],
      DimList: values.DimList,
      UserModified: values.UserModified,
    };
    console.log(modelCurrent, values, "modelCurrent");

    const { Code, InternalMessage } = await updateBudgetDetail(modelCurrent);
    if (Code === 0) {
      //update nextyearamt
      let sumNextYearAmt = Object.keys(newNextYearAmt).reduce(
        (sum, key) => sum + parseFloat(newNextYearAmt[key] || 0),
        0
      );
      console.log(sumNextYearAmt, "sumnextyear");

      if (sumNextYearAmt !== 0) {
        let whereRaw = `year = '${values.Year + 1}' and deptcode = '${values.DeptCode}' and acccode = '${
          values.AccCode
        }'`;
        let uriQueryString = {
          Limit: 1,
          Page: 1,
          OrderBy: { LastModified: "desc" },
          Exclude: ["LastYearAmt", "ThisYearAmt", "NextYearAmt", "Revisions", "DimList"],
          WhereRaw: whereRaw,
        };
        const resBudgetNextYear = await getBudgetList(uriQueryString);

        if (resBudgetNextYear.Data.length > 0) {
          let modelNextYear = {
            BudgetId: resBudgetNextYear.Data[0].BudgetId,
            Year: values.Year + 1,
            DeptCode: values.DeptCode,
            AccCode: values.AccCode,
            ThisYearAmt: newNextYearAmt,
            Revisions: [r1, r2, r3, r4],
            DimList: values.DimList,
            UserModified: values.UserModified,
          };
          const { Code } = await updateBudgetDetail(modelNextYear);
          if (Code === 0) {
            redirect("show", basePath, id);
          }
        } else {
          let modelNextYear = {
            BudgetId: -1,
            Year: values.Year + 1,
            DeptCode: values.DeptCode,
            AccCode: values.AccCode,
            ThisYearAmt: newNextYearAmt,
            Revisions: [r1, r2, r3, r4],
            DimList: values.DimList,
            UserModified: values.UserModified,
          };
          const { Code } = await createBudgetDetail(modelNextYear);
          if (Code === 0) {
            redirect("show", basePath, id);
          }
        }
      } else {
        redirect("show", basePath, id);
      }
    } else {
      console.log(id, InternalMessage);
    }
  };

  const ShowDim = (values) => {
    if (!values) {
      setDataDim(data.DimList.Dim);
      setOpenDim(true);
    }
  };

  const CancelFnc = () => {
    redirect("show", basePath, id);
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
      <ActionMenu menuControl={menuControlProp} />

      <Paper className={classes.root}>
        <BoxHeader header={"Budget Detail"} />
        <Grid container alignItems="flex-start" spacing={1}>
          <TextTopInGrid sizeSm={2} label="Year" value={data.Year} />
          <TextTopInGrid sizeSm={5} label="Dept." value={`${data.DeptCode} : ${data.DeptDesc}`} />
          <TextTopInGrid sizeSm={5} label="Acc." value={`${data.AccCode} : ${data.AccDesc}`} />
        </Grid>
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
          <MUIDataTable data={data.ArrAmt} columns={columns} options={options} />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <MUIDataTable data={data.ArrRevisionAmt} columns={columnsRevision} options={optionsRevision} />
        </TabPanel>
        <ButtonFooter SaveFnc={() => Save(data)} CancelFnc={CancelFnc} />
      </Paper>
      {data?.Revisions && showDialogChangeRevName && (
        <DialogChangeRevision
          value={data?.Revisions && data?.Revisions[revNo]?.Caption}
          open={openDialogChangeRev}
          close={() => setOpenDialogChangeRev(false)}
          save={(newCaption) => {
            data.Revisions.forEach((item, idx) => {
              if (idx === revNo) {
                item.Caption = newCaption;
              }
            });
            setData((state) => ({
              ...state,
              Revisions: data.Revisions,
            }));
            setOpenDialogChangeRev(false);
          }}
        />
      )}

      <pre>{process.env.NODE_ENV === "development" ? JSON.stringify(data, 0, 2) : ""}</pre>
      <NavRight
        open={openDim}
        close={() => setOpenDim(false)}
        ShowDim={() => ShowDim()}
        dataDim={dataDim}
        // modify
        // update={(item, value) => {
        //   dataDim.forEach((i) => {
        //     if (i.Id === item.Id) {
        //       i.Value = value;
        //       if (i.Type === "Date") {
        //         i.Value = new Date(value);
        //       }
        //     }
        //   });
        //   setDataDim(dataDim);
        // }}
      />
    </div>
  );
};

export default Edit;
