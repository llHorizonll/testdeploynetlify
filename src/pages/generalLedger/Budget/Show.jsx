import React, { useContext, useState, useEffect, useCallback } from "react";
import { GblContext } from "providers/formatter";
import clsx from "clsx";
import { withStyles } from "@material-ui/core/styles";
import { Loading, Error, useRedirect, withTranslate } from "react-admin";
import { Paper, Grid } from "@material-ui/core";
import TableFooter from "@material-ui/core/TableFooter";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import TextTopInGrid from "components/TextTopInGrid";
import ActionMenu from "components/ActionMenu";
import BoxHeader from "components/BoxHeader";
import NavRight from "components/NavRightSide";
import Excel from "./Excel";
import MUIDataTable from "mui-datatables";
import { getBudgetDetail, delBudgetDetail } from "services/generalLedger";
import { permissionName } from "utils/constants";
import { addDays, startOfMonth } from "date-fns";
import SnackbarUtils from "utils/SnackbarUtils";

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

const Show = (props) => {
  const classes = props.useStyles();
  const { settingAll, DateToString, NumberFormat, ToNumber } = useContext(GblContext);
  const { SettingClosePeriod } = settingAll;
  const { ClosePeriodGl } = SettingClosePeriod;
  let newClosePeriodGl = addDays(new Date(ClosePeriodGl), 1);
  const redirect = useRedirect();
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);
  const [error] = useState();
  const [valueOfTab, setValueOfTab] = useState(0);
  const [openDim, setOpenDim] = useState(false);
  const [dataDim, setDataDim] = useState();
  const handleChangeTab = (event, newValue) => {
    setValueOfTab(newValue);
  };

  const [open, setOpen] = React.useState(false);

  // const handleClickOpen = () => {
  //   setOpen(true);
  // };

  const handleClose = () => {
    setOpen(false);
  };

  const { basePath, id, permissions, translate } = props;

  const CheckEditBtn = () => {
    if (data) {
      if (newClosePeriodGl.getFullYear() > data.Year) {
        var msgClosePeriod = translate("ra.closePeriod.warning", { name: "Year in this budget", action: "edit" });
        SnackbarUtils.warning(msgClosePeriod);
      } else {
        redirect("edit", basePath, id);
      }
    }
  };

  const CheckDeleteBtn = () => {
    if (data) {
      if (newClosePeriodGl.getFullYear() >= data.Year) {
        let msgClosePeriod = "Some period already closed. cannot delete";
        SnackbarUtils.warning(msgClosePeriod);
      } else {
        DelOrVoid();
      }
    }
  };

  const menuControlProp = [
    { name: "Back", fnc: () => redirect("list", basePath) },
    { name: "Add", fnc: () => redirect("create", basePath) },
    {
      name: "Edit",
      fnc: () => CheckEditBtn(),
    },
    {
      name: "Delete",
      fnc: () => CheckDeleteBtn(),
    },
    // { name: "Excel", fnc: handleClickOpen },
  ];

  const DelOrVoid = async () => {
    let msg = "Confirm deletion ?";
    let dialog = window.confirm(msg);
    if (dialog) {
      const { Code, InternalMessage } = await delBudgetDetail(id);
      if (Code === 0) {
        redirect("list", basePath);
      } else {
        console.log(InternalMessage, "InternalMessage");
      }
    }
  };

  const fetchBudgetById = useCallback(async (mounted) => {
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
      response.ArrAmt = temp;
      response.ArrRevisionAmt = temp2;
      setData(response);
    }
    if (mounted) {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let mounted = true;
    fetchBudgetById(mounted);
    return function cleanup() {
      mounted = false;
    };
  }, [fetchBudgetById]);

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
        customBodyRender: (value) => {
          return NumberFormat(value);
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
        customBodyRender: (value) => {
          return NumberFormat(value);
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
        customBodyRender: (value) => {
          return NumberFormat(value);
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
        customBodyRender: (value) => {
          return NumberFormat(value);
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
        customHeadLabelRender: () => data.Revisions[0]?.Caption ?? "Revision1",
        customBodyRender: (value) => {
          return NumberFormat(value);
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
        customHeadLabelRender: () => data.Revisions[1]?.Caption ?? "Revision2",
        customBodyRender: (value) => {
          return NumberFormat(value);
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
        customHeadLabelRender: () => data.Revisions[2]?.Caption ?? "Revision3",
        customBodyRender: (value) => {
          return NumberFormat(value);
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
        customHeadLabelRender: () => data.Revisions[3]?.Caption ?? "Revision4",
        customBodyRender: (value) => {
          return NumberFormat(value);
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
    tableBodyHeight: "480px",
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
      let sumLastYear = opts.data.reduce((accu, item) => {
        let s = ToNumber(accu) + ToNumber(item.data[2]);
        return NumberFormat(s ?? 0);
      }, 0);

      let sumThisYear = opts.data.reduce((accu, item) => {
        let s = ToNumber(accu) + ToNumber(item.data[4]);
        return NumberFormat(s ?? 0);
      }, 0);

      let sumNextYear = opts.data.reduce((accu, item) => {
        let s = ToNumber(accu) + ToNumber(item.data[6]);
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
                      {sumLastYear}
                    </TableCell>
                  );
                } else if (col.name === "ThisYearAmt") {
                  return (
                    <TableCell key={index} className={footerClasses}>
                      {sumThisYear}
                    </TableCell>
                  );
                } else if (col.name === "NextYearAmt") {
                  return (
                    <TableCell key={index} className={footerClasses}>
                      {sumNextYear}
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
    tableBodyHeight: "480px",
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
      let sumThisYear = opts.data.reduce((accu, item) => {
        let s = ToNumber(accu) + ToNumber(item.data[2]);
        return NumberFormat(s ?? 0);
      }, 0);
      let sumRev1 = opts.data.reduce((accu, item) => {
        let s = ToNumber(accu) + ToNumber(item.data[3]);
        return NumberFormat(s ?? 0);
      }, 0);
      let sumRev2 = opts.data.reduce((accu, item) => {
        let s = ToNumber(accu) + ToNumber(item.data[4]);
        return NumberFormat(s ?? 0);
      }, 0);
      let sumRev3 = opts.data.reduce((accu, item) => {
        let s = ToNumber(accu) + ToNumber(item.data[5]);
        return NumberFormat(s ?? 0);
      }, 0);
      let sumRev4 = opts.data.reduce((accu, item) => {
        let s = ToNumber(accu) + ToNumber(item.data[6]);
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
                      {sumThisYear}
                    </TableCell>
                  );
                } else if (col.name === "Revision1") {
                  return (
                    <TableCell key={index} className={footerClasses}>
                      {sumRev1}
                    </TableCell>
                  );
                } else if (col.name === "Revision2") {
                  return (
                    <TableCell key={index} className={footerClasses}>
                      {sumRev2}
                    </TableCell>
                  );
                } else if (col.name === "Revision3") {
                  return (
                    <TableCell key={index} className={footerClasses}>
                      {sumRev3}
                    </TableCell>
                  );
                } else if (col.name === "Revision4") {
                  return (
                    <TableCell key={index} className={footerClasses}>
                      {sumRev4}
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

  const ShowDim = (values) => {
    if (!values) {
      setDataDim(data.DimList.Dim);
      setOpenDim(true);
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error />;
  if (!data) return null;

  return (
    <div
      className={clsx({
        [classes.drawerOpen]: openDim,
        [classes.drawerClose]: !openDim,
      })}
    >
      <ActionMenu
        menuControl={menuControlProp}
        permission={permissions.find((i) => i.Name === permissionName["GL.Budget"])}
      />

      <Paper className={classes.root}>
        <BoxHeader header={"Budget"} />
        <Grid container alignItems="flex-start" spacing={1} style={{ marginBottom: 12 }}>
          <TextTopInGrid sizeSm={2} label="Year" value={data.Year} />
          <TextTopInGrid sizeSm={5} label="Dept." value={`${data.DeptCode} : ${data.DeptDesc}`} />
          <TextTopInGrid sizeSm={5} label="Acc." value={`${data.AccCode} : ${data.AccDesc}`} />
        </Grid>
        <Tabs
          value={valueOfTab}
          onChange={handleChangeTab}
          indicatorColor="primary"
          textColor="primary"
          style={{ marginBottom: 12 }}
        >
          <StyledTab label="Annual Budget" {...a11yProps(0)} />
          <StyledTab label="Revision Budget" {...a11yProps(1)} />
        </Tabs>
        <TabPanel value={valueOfTab} index={0}>
          <MUIDataTable data={data.ArrAmt} columns={columns} options={options} />
        </TabPanel>
        <TabPanel value={valueOfTab} index={1}>
          <MUIDataTable data={data.ArrRevisionAmt} columns={columnsRevision} options={optionsRevision} />
        </TabPanel>
      </Paper>
      <NavRight
        open={openDim}
        close={() => setOpenDim(false)}
        ShowDim={() => ShowDim()}
        dataDim={dataDim}
        module={"Budget"}
        moduleId={id}
      />
      <pre>{process.env.NODE_ENV === "development" ? JSON.stringify(data, 0, 2) : ""}</pre>
      {open ? <Excel open={open} handleClose={handleClose} /> : ""}
    </div>
  );
};

export default withTranslate(Show);
