import React, { useContext, useState, useEffect, useCallback } from "react";
import { GblContext } from "providers/formatter";
import clsx from "clsx";
import { Loading, Error, useRedirect, withTranslate } from "react-admin";
import { Paper, Grid } from "@material-ui/core";
import TableFooter from "@material-ui/core/TableFooter";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import MuiTranslateTable from "components/MuiTranslateTable";
import TextTopInGrid from "components/TextTopInGrid";
import ActionMenu from "components/ActionMenu";
import BoxHeader from "components/BoxHeader";
import NavRight from "components/NavRightSide";
import DialogCopy from "./DialogCopy";
import DialogTemplate from "./DialogTemplate";
import VisibilityIcon from "@material-ui/icons/Visibility";
import { getJvDetail, delJvDetail } from "services/generalLedger";
import { permissionName } from "utils/constants";
import { showReportByName } from "pages/Report/services";
import { addDays } from "date-fns";
import SnackbarUtils from "utils/SnackbarUtils";

const Show = (props) => {
  const classes = props.useStyles();
  const { settingAll, DateToString, NumberFormat, ToNumber } = useContext(GblContext);
  const { SettingClosePeriod, SettingGl } = settingAll;
  const { ClosePeriodGl } = SettingClosePeriod;
  let newClosePeriodGl = addDays(new Date(ClosePeriodGl), 1);
  const { basePath, id, permissions, translate } = props;
  const redirect = useRedirect();
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);
  const [error] = useState();
  const [openDim, setOpenDim] = useState(false);
  const [dataDim, setDataDim] = useState();
  const [openCopyDialog, setOpenCopyDialog] = useState(false);
  const [openTemplateDialog, setOpenTemplateDialog] = useState(false);

  const CheckDisableBtn = () => data?.Status === "Void";

  const CloseCopyDialog = (mode) => {
    setOpenCopyDialog(false);

    if (mode) {
      localStorage.setItem("jvCopyMode", mode.value);
      localStorage.setItem("jvId", id);
      redirect(`create`, basePath);
    }
  };

  const CloseTemplateDialog = (templateId) => {
    setOpenTemplateDialog(false);
    if (templateId) {
      localStorage.setItem("templateId", templateId);
      redirect(`create`, basePath);
    }
  };

  const CheckEditBtn = () => {
    if (!SettingGl.AllowEditJvPostingFromSource) {
      if (data.JvhSource !== "" && data.JvhSource !== "XLS") {
        let msg = "cannot edit this JV. It was posted from others.";
        SnackbarUtils.warning(msg);
        return;
      }
    }
    if (data) {
      if (new Date(newClosePeriodGl) > new Date(data.JvhDate)) {
        var msgClosePeriod = translate("ra.closePeriod.warning", { name: "jv", action: "edit" });
        SnackbarUtils.warning(msgClosePeriod);
      } else {
        redirect("edit", basePath, id);
      }
    }
  };

  const CheckDeleteBtn = () => {
    if (data) {
      if (new Date(newClosePeriodGl) > new Date(data.JvhDate)) {
        var msgClosePeriod = translate("ra.closePeriod.warning", { name: "jv", action: "void" });
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
      disabled: CheckDisableBtn(),
      fnc: () => CheckEditBtn(),
    },
    {
      name: "Void",
      disabled: CheckDisableBtn(),
      fnc: () => CheckDeleteBtn(),
    },
    // { name: "Excel" },
    { name: "Copy", fnc: () => setOpenCopyDialog(true) },
    { name: "Template", fnc: () => setOpenTemplateDialog(true) },
    { name: "Print", fnc: () => showReportByName("GL_JV", [{ Name: "JvhSeq", Value: id }]) },
  ];

  const DelOrVoid = async () => {
    let msg = "Confirm deletion ?";
    let dialog = window.confirm(msg);
    if (dialog) {
      const { Code, InternalMessage } = await delJvDetail(id);
      if (Code === 0) {
        redirect("list", basePath);
      } else {
        console.log(InternalMessage, "InternalMessage");
      }
    }
  };

  const fetchJvById = useCallback(async () => {
    const response = await getJvDetail(id);
    if (response) {
      setData(response);
      setDataDim(response.DimHList.Dim);
    }
  }, [id]);

  useEffect(() => {
    setLoading(true);
    fetchJvById();
    setLoading(false);
  }, [fetchJvById]);

  const columns = [
    {
      name: "",
      label: "",
      options: {
        filter: false,
        viewColumns: false,
        customBodyRender: (value, tableMeta) => {
          return (
            <>
              <VisibilityIcon
                fontSize="small"
                color="primary"
                style={{ cursor: "pointer" }}
                onClick={() => ShowDim(tableMeta.rowData[11].Dim)}
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
      options: {
        customBodyRender: (val) => {
          return (
            <div className={classes.divComment}>
              <div className={classes.parentStyle}>
                <div className={classes.cellStyleEllipsis}>{val}</div>
              </div>
            </div>
          );
        },
      },
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

  const SearchByNo = (e) => {
    if (e) {
      redirect("show", basePath, e.JvhSeq);
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
        permission={permissions.find((i) => i.Name === permissionName["GL.Jv"])}
      />

      <Paper className={classes.root}>
        <BoxHeader
          header={`Journal Voucher`}
          showSearch
          searchOption={{ placeholder: "Search by Voucher No.", update: SearchByNo }}
          source={data.JvhSource}
          status={data.Status}
        />
        <Grid container alignItems="flex-start" spacing={1} style={{ marginBottom: 12 }}>
          <TextTopInGrid sizeSm={1} label="Prefix" value={data.Prefix} />
          <TextTopInGrid sizeSm={2} label="Voucher No." value={data.JvhNo} />
          <TextTopInGrid sizeSm={2} label="Date" value={DateToString(data.JvhDate ?? new Date())} />
          <TextTopInGrid sizeSm={7} label="Description" value={data.Description} />
        </Grid>
        <MuiTranslateTable data={data.Detail} columns={columns} options={options} />
      </Paper>

      <NavRight
        open={openDim}
        close={() => setOpenDim(false)}
        ShowDim={() => ShowDim()}
        dataDim={dataDim}
        module={"GL_Jv"}
        moduleId={id}
      />
      {openCopyDialog && <DialogCopy open={openCopyDialog} onClose={CloseCopyDialog} basePath={basePath} />}
      {openTemplateDialog && <DialogTemplate open={openTemplateDialog} onClose={CloseTemplateDialog} />}
      <pre>{process.env.NODE_ENV === "development" ? JSON.stringify(data, 0, 2) : ""}</pre>
    </div>
  );
};

export default withTranslate(Show);
