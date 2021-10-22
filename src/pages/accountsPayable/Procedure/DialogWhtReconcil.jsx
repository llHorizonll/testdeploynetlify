/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useState, useEffect } from "react";
import { useTheme } from "@material-ui/core/styles";
import { GblContext } from "providers/formatter";
import { useStateWithCallbackLazy } from "use-state-with-callback";
import { makeStyles } from "@material-ui/core/styles";
import { Box, FormControl, Select, InputLabel, MenuItem, Typography } from "@material-ui/core";
import {
  delWhtReconcileDetail,
  updateWhtReconcileDetail,
  createWhtReconcileDetail,
  getWhtReconcileByYearMonth,
  getWhtYearList,
  importWhtYearList,
} from "services/reconcile";
import { getApVendorList, getApWhtTypeSearchList, getApWhtServiceSearchList } from "services/accountPayable";
import { showReportByName } from "pages/Report/services";
import { TableHead, TableRow, TableCell, Tooltip, Icon, IconButton } from "@material-ui/core";
import MaterialTable, { MTableHeader, MTableToolbar } from "material-table";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import Dialog from "@material-ui/core/Dialog";
import ActionMenu from "components/ActionMenu";
import PopupTable from "components/PopupTable";
import { TextFieldInForm, DateInForm, NumberFormatInForm, MuiAutosuggest, DescInForm } from "components/Form";
import Model from "models/whtReconcile";
import ModelUriQueryString from "models/uriQueryString";
import DialogOptions from "./DialogOptions";
import DialogPrintItem from "./DialogPrintOptions";
import { addDays } from "date-fns";
import SnackbarUtils from "utils/SnackbarUtils";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  paper: {
    width: "100%",
    marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 750,
  },
  visuallyHidden: {
    border: 0,
    clip: "rect(0 0 0 0)",
    height: 1,
    margin: -1,
    overflow: "hidden",
    padding: 0,
    position: "absolute",
    top: 20,
    width: 1,
  },
  rootTitle: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  divComment: {
    position: "relative",
    height: "20px",
    width: "140px",
  },
  parentStyle: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    boxSizing: "border-box",
    display: "block",
    width: "100%",
  },
  cellStyleEllipsis: {
    boxSizing: "border-box",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
}));

const DialogWhtRec = (props) => {
  const theme = useTheme();
  const classes = useStyles();
  const { settingAll, DateToString, NumberFormat, ToNumber } = useContext(GblContext);
  const { SettingClosePeriod } = settingAll;
  const { ClosePeriodAp } = SettingClosePeriod;
  let newClosePeriodAp = addDays(new Date(ClosePeriodAp), 1);
  const { onClose, open } = props;
  const [initNewRow] = useStateWithCallbackLazy(Model);
  const [showAdd, setShowAdd] = useState(false);
  const [editIndex, setEditIndex] = useState("");
  const [checkSource, setCheckSource] = useState(false);
  const [Data, setData] = useState();
  const listOfMonth = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
  const [listOfWhtYear, setListOfWhtYear] = useState();
  const [lookupList, setLookupList] = useState({
    vendorList: [],
    whtTypeList: [],
    whtServiceList: [],
  });
  let m = new Date().getMonth() + 1;
  const [filter, setFilter] = useState({
    month: m < 10 ? "0" + m : m,
    year: new Date().getFullYear(),
  });
  const [uriQueryString] = useState({
    Limit: ModelUriQueryString.Limit,
    Page: ModelUriQueryString.Page,
    OrderBy: ModelUriQueryString.OrderBy,
    WhereGroupList: ModelUriQueryString.WhereGroupList,
    Exclude: ModelUriQueryString.Exclude,
    WhereRaw: ModelUriQueryString.WhereRaw,
    WhereLike: ModelUriQueryString.WhereLike,
    WhereLikeFields: ModelUriQueryString.WhereLikeFields,
  });
  const [openDialog, setOpenDialog] = useState({
    form: false,
    report: false,
    export: false,
  });
  const [isLoading, setLoading] = useState(true);

  const menuControlProp = [
    { name: "Print Form", fnc: () => setOpenDialog((state) => ({ ...state, form: true })) },
    { name: "Print Report", fnc: () => setOpenDialog((state) => ({ ...state, report: true })) },
    { name: "Export", fnc: () => setOpenDialog((state) => ({ ...state, export: true })) },
  ];

  const fetchWhtYearLookup = async () => {
    var arr = await getWhtYearList();
    setListOfWhtYear(arr);
  };

  const fetchVendorLookup = async () => {
    const { Data } = await getApVendorList();
    setLookupList((state) => ({
      ...state,
      vendorList: Data,
    }));
  };

  const fetchWhtTypeLookup = async () => {
    const { Data } = await getApWhtTypeSearchList(uriQueryString);
    setLookupList((state) => ({
      ...state,
      whtTypeList: Data,
    }));
  };

  const fetchWhtServiceLookup = async () => {
    const { Data } = await getApWhtServiceSearchList(uriQueryString);
    setLookupList((state) => ({
      ...state,
      whtServiceList: Data,
    }));
  };

  useEffect(() => {
    fetchWhtYearLookup();
    if (Data?.length > 0) {
      fetchVendorLookup();
      fetchWhtTypeLookup();
      fetchWhtServiceLookup();
    }
  }, [Data]);

  const fetchSearchList = async (filter, mounted) => {
    //update apWhtRecon
    await importWhtYearList();
    const response = await getWhtReconcileByYearMonth(filter);
    if (response) {
      setData(response);
    } else {
      setData([]);
    }
    if (mounted) {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    fetchSearchList(filter, mounted);
    return function cleanup() {
      mounted = false;
    };
  }, [filter]);

  const columns = [
    {
      title: " ",
      field: "Id",
      sorting: false,
      render: (rowData) => {
        return (
          <div style={{ display: "flex" }}>
            <Tooltip title={`Edit ${rowData.Id}`}>
              <IconButton
                size="small"
                color="primary"
                style={{ cursor: "pointer" }}
                onClick={() => UpdateRow(rowData.Id)}
              >
                <Icon>edit</Icon>
              </IconButton>
            </Tooltip>
            {rowData.Source !== "Exported" && (
              <Tooltip title={`Delete ${rowData.Id}`}>
                <IconButton
                  size="small"
                  color="primary"
                  style={{ cursor: "pointer", marginLeft: 10 }}
                  onClick={async () => {
                    let msg = "Confirm deletion ?";
                    let dialog = window.confirm(msg);
                    if (dialog) {
                      const { Code, InternalMessage } = await delWhtReconcileDetail(rowData.Id);
                      if (Code === 0) {
                        SnackbarUtils.success("Success");
                        fetchSearchList(filter);
                      } else {
                        console.log(InternalMessage, "InternalMessage");
                      }
                    }
                  }}
                >
                  <Icon>delete</Icon>
                </IconButton>
              </Tooltip>
            )}
          </div>
        );
      },
    },
    { title: "Source", field: "Source", sorting: false },
    {
      title: "Vendor",
      field: "VnCode",
      sorting: false,
      cellStyle: {
        width: 300,
      },
    },
    {
      title: "Title",
      field: "PreName",
      sorting: false,
      cellStyle: {
        width: 100,
      },
    },
    {
      title: "Payee",
      field: "PayeeName",
      sorting: false,
      cellStyle: {
        width: 300,
      },
    },
    {
      title: "Address",
      field: "Address",
      sorting: false,
      cellStyle: {
        width: 300,
      },
    },
    { title: "Tax ID.", field: "TaxId", sorting: false },
    { title: "Branch No.", field: "BranchNo", sorting: false },

    {
      title: "Date",
      field: "PayDate",
      sorting: false,
      render: (rowData) => {
        let value = rowData.PayDate;
        if (!rowData.PayDate) {
          return null;
        }
        return DateToString(value ?? new Date());
      },
    },
    { title: "WHT. No.", field: "WhtNo", sorting: false },
    { title: "WHT. Form", field: "WhtTypeCode", sorting: false },
    { title: "WHT. Desc", field: "WhtDesc", sorting: false },
    { title: "WHT. Rate (%)", field: "WhtRate", sorting: false },
    {
      title: "Payment Amount",
      field: "Amount",
      sorting: false,
      type: "numeric",
      render: (rowData) => NumberFormat(rowData.Amount),
    },
    {
      title: "Tax Amount",
      field: "TaxAmt",
      sorting: false,
      type: "numeric",
      render: (rowData) => NumberFormat(rowData.TaxAmt),
    },
  ];

  const options = {
    headerStyle: {
      backgroundColor: theme.palette.primary.main,
      color: "#FFF",
    },
    padding: "dense",
    paging: false,
    selection: false,
    selectionProps: () => ({
      color: "primary",
    }),
  };

  const DialogTitle = (props) => {
    const { children, onClose, ...other } = props;
    return (
      <MuiDialogTitle disableTypography className={classes.rootTitle} {...other}>
        <Typography variant="h6">{children}</Typography>
        {onClose ? (
          <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
            <Icon>close</Icon>
          </IconButton>
        ) : null}
      </MuiDialogTitle>
    );
  };

  const handleCancel = () => {
    onClose();
  };

  const CustomFilterList = (props) => {
    return (
      <>
        <MTableToolbar {...props} />
        <Box display="flex" style={{ marginTop: -50 }}>
          <Box p={1}>
            <FormControl variant="outlined" fullWidth>
              <InputLabel id="label">Month</InputLabel>
              <Select
                labelId="label"
                variant="outlined"
                margin="dense"
                label="Month"
                style={{ width: 160, margin: "4px 0" }}
                value={filter.month}
                onChange={(e) => {
                  setFilter((state) => ({
                    ...state,
                    month: e.target.value,
                  }));
                }}
              >
                {listOfMonth
                  ? listOfMonth.map((item, idx) => (
                      <MenuItem key={idx} value={item}>
                        {item}
                      </MenuItem>
                    ))
                  : ""}
              </Select>
            </FormControl>
          </Box>
          {listOfWhtYear && (
            <Box p={1}>
              <FormControl variant="outlined" fullWidth>
                <InputLabel id="label">Year</InputLabel>
                <Select
                  labelId="label"
                  variant="outlined"
                  margin="dense"
                  label="Year"
                  style={{ width: 160, margin: "4px 0" }}
                  value={filter.year}
                  onChange={(e) => {
                    setFilter((state) => ({
                      ...state,
                      year: e.target.value,
                    }));
                  }}
                >
                  {listOfWhtYear
                    ? listOfWhtYear.map((item, idx) => (
                        <MenuItem key={idx} value={item}>
                          {item}
                        </MenuItem>
                      ))
                    : ""}
                </Select>
              </FormControl>
            </Box>
          )}
        </Box>
      </>
    );
  };

  const CustomHeader = (props) => {
    return (
      <>
        <TableHead>
          <TableRow>
            <TableCell align="center" colSpan={1}>
              <IconButton size={"small"} onClick={AddNewRow} style={{ marginLeft: 6 }}>
                <Icon>add</Icon>
              </IconButton>
            </TableCell>
            <TableCell align="right" colSpan={10}></TableCell>
          </TableRow>
        </TableHead>
        <MTableHeader {...props} />
      </>
    );
  };

  const AddNewRow = () => {
    setEditIndex("");
    setShowAdd(true);
    setCheckSource(false);
  };

  const UpdateRow = (index) => {
    setEditIndex(index);
    setShowAdd(true);
    let selectedItem = Data.find((item) => item.Id === index);
    setCheckSource(selectedItem.Source === "Exported");
  };

  const UpdateFromPopup = (currentField, m, data) => {
    m.trigger();
    let amt = ToNumber(data["Amount"]);
    let whtrate = ToNumber(data["WhtRate"]);
    if (currentField === "WhtRate") {
      let taxAmt = amt * (whtrate / 100);
      m.setValue("TaxAmt", taxAmt);
    }
    if (currentField === "Amount") {
      let taxAmt = amt * (whtrate / 100);
      m.setValue("TaxAmt", taxAmt);
    }
  };

  const SaveFromPopup = async (arr, row) => {
    row.PeriodName = `${filter.year}-${filter.month}`;
    delete row.Dim;
    if (editIndex !== "") {
      //update
      console.log(row, "update");
      const { Code, InternalMessage } = await updateWhtReconcileDetail(row);
      if (Code === 0) {
        SnackbarUtils.success("Success");
        setShowAdd(false);
        fetchSearchList(filter);
      } else {
        console.log(InternalMessage);
      }
    } else {
      row.WhtTypeCode = row.WhtTypeDesc ?? "";
      row.WhtDesc = row.WhtCateDesc ?? "";
      //create
      let newParam = {
        ...initNewRow,
        ...row,
      };
      console.log(newParam, "create");
      const { Code, InternalMessage } = await createWhtReconcileDetail(newParam);
      if (Code === 0) {
        SnackbarUtils.success("Success");
        setShowAdd(false);
        fetchSearchList(filter);
      } else {
        console.log(InternalMessage);
      }
    }
  };

  const CancelFromPopup = () => {
    setShowAdd(false);
  };

  const formFieldsDetail = [
    {
      size: 3,
      field: (
        <TextFieldInForm
          label="Payment No."
          name="PyhSeq"
          variant="outlined"
          margin="dense"
          rule={{
            maxLength: {
              value: 10,
              message: "maximum length is 10",
            },
          }}
          disabled={checkSource}
        />
      ),
    },
    {
      size: 3,
      field: (
        <MuiAutosuggest
          label="Vendor"
          name="VnCode"
          optKey="VnCode"
          optDesc="VnName"
          options={lookupList["vendorList"]}
          updateOtherField={[
            { key: "PayeeName", optKey: "VnPayee" },
            { key: "InvhCredit", optKey: "VnTerm" },
            { key: "Address", optKey: "VnAdd1", useFncUpdate: true },
            { key: "InvhCredit", optKey: "VnTerm" },
            { key: "TaxId", optKey: "VnTaxNo" },
            { key: "BranchNo", optKey: "BranchNo" },
          ]}
          //for custom advance update field
          fncUpdate={(value) => {
            let v = value?.VnAdd1.concat(value?.VnAdd2 ?? "", value?.VnAdd3 ?? "", value?.VnAdd4 ?? "");
            return v;
          }}
          style={{ marginTop: -18 }}
          disabled={checkSource}
        />
      ),
    },
    {
      size: 6,
      name: "PayeeName",
      field: (
        <TextFieldInForm
          label="* Payee."
          name="PayeeName"
          variant="outlined"
          margin="dense"
          rule={{
            required: {
              value: true,
              message: "* Required",
            },
            maxLength: {
              value: 255,
              message: "maximum length is 255",
            },
          }}
        />
      ),
    },
    {
      size: 12,
      field: (
        <TextFieldInForm
          label="* Address"
          name="Address"
          variant="outlined"
          margin="dense"
          rule={{
            required: {
              value: true,
              message: "* Required",
            },
            maxLength: {
              value: 255,
              message: "maximum length is 255",
            },
          }}
        />
      ),
    },
    {
      size: 3,
      field: (
        <TextFieldInForm
          label="* Tax ID."
          name="TaxId"
          variant="outlined"
          margin="dense"
          rule={{
            required: {
              value: true,
              message: "* Required",
            },
            maxLength: {
              value: 30,
              message: "maximum length is 30",
            },
          }}
        />
      ),
    },
    {
      size: 3,
      field: (
        <TextFieldInForm
          label="Branch No."
          name="BranchNo"
          variant="outlined"
          margin="dense"
          rule={{
            maxLength: {
              value: 20,
              message: "maximum length is 20",
            },
          }}
        />
      ),
    },
    {
      size: 3,
      field: (
        <DateInForm
          label="Date"
          name="PayDate"
          style={{ marginTop: -14 }}
          minDate={new Date(newClosePeriodAp)}
          minDateMessage={"Date must be more than close period"}
          rule={{
            required: {
              value: true,
              message: "* Required",
            },
          }}
          disabled={checkSource}
        />
      ),
    },
    {
      size: 3,
      field: (
        <TextFieldInForm
          label="Wht No."
          name="WhtNo"
          variant="outlined"
          margin="dense"
          rule={{
            maxLength: {
              value: 30,
              message: "maximum length is 30",
            },
          }}
          disabled={checkSource}
        />
      ),
    },

    {
      size: 3,
      field: (
        <MuiAutosuggest
          label="* Wht Type"
          name="WhtTypeCode"
          optKey="WhtTypeCode"
          optDesc="Description"
          options={lookupList["whtTypeList"]}
          updateOtherField={[{ key: "WhtTypeDesc", optKey: "Description" }]}
          rule={{
            required: {
              value: true,
              message: "* Required",
            },
          }}
          disabled={checkSource}
        />
      ),
    },
    {
      size: 3,
      name: "WhtTypeDesc",
      field: (
        <DescInForm
          style={{ marginTop: 8 }}
          name="WhtTypeDesc"
          InputProps={{
            readOnly: true,
          }}
        />
      ),
    },
    {
      size: 3,
      field: (
        <MuiAutosuggest
          label="* Wht Category"
          name="WhtDesc"
          optKey="WhtCode"
          optDesc="Description"
          options={lookupList["whtServiceList"]}
          updateOtherField={[
            { key: "WhtCateDesc", optKey: "Description" },
            { key: "WhtRate", optKey: "WhtRate" },
          ]}
          rule={{
            required: {
              value: true,
              message: "* Required",
            },
          }}
          disabled={checkSource}
        />
      ),
    },
    {
      size: 3,
      name: "WhtCateDesc",
      field: (
        <DescInForm
          style={{ marginTop: 8 }}
          name="WhtCateDesc"
          InputProps={{
            readOnly: true,
          }}
        />
      ),
    },
    {
      size: 4,
      field: (
        <NumberFormatInForm
          label="* WHT Rate (%)"
          name="WhtRate"
          rule={{
            required: {
              value: true,
              message: "* Required",
            },
          }}
          disabled={checkSource}
        />
      ),
    },
    {
      size: 4,
      field: (
        <NumberFormatInForm
          label="* Payment Amount"
          name="Amount"
          rule={{
            required: {
              value: true,
              message: "* Required",
            },
          }}
          disabled={checkSource}
        />
      ),
    },
    {
      size: 4,
      field: <NumberFormatInForm label="Wht Amount" name="TaxAmt" disabled={checkSource} />,
    },
  ];

  const dialogPrintOption = [
    {
      index: 1,
      value: true,
      desc: "ฉบับที่ 1 (สำหรับ ผู้ถูกหัก ภาษี ณ ที่จ่าย ใช้แนบพร้อมกับแบบแสดงรายการภาษี)",
    },
    {
      index: 2,
      value: true,
      desc: "ฉบับที่ 2 (สำหรับ ผู้ถูกหัก ภาษี ณ ที่จ่าย เก็บไว้เป็นหลักฐาน)",
    },
    {
      index: 3,
      value: true,
      desc: "ฉบับที่ 3 (สำหรับ ผู้หัก ภาษี ณ ที่จ่าย ใช้แนบพร้อมกับแบบแสดงรายการภาษี)",
    },
    {
      index: 4,
      value: true,
      desc: "ฉบับที่ 4 (สำหรับ ผู้หัก ภาษี ณ ที่จ่าย เก็บไว้เป็นหลักฐาน)",
    },
  ];

  const dialogOption = [
    {
      value: "2",
      desc: "ภ.ง.ด 2",
    },
    {
      value: "3",
      desc: "ภ.ง.ด 3",
    },
    {
      value: "53",
      desc: "ภ.ง.ด 53",
    },
  ];

  const onCloseDialogForm = (arr) => {
    let period = `${filter.year}-${filter.month}`;
    let id = "";
    let page = arr.map((i) => i.index).toString();
    let param = `'${period}','${id}','','${page}'`;
    console.log(param);
    showReportByName("AP_WhtVatRecon", param);
    setOpenDialog((state) => ({ ...state, form: false }));
  };

  const onCloseDialogReport = (selectedOption) => {
    let period = `${filter.year}-${filter.month}`;
    let id = "";
    let page = "";
    let param = `'${period}','${id}','${selectedOption.value}','${page}'`;
    console.log(param);
    showReportByName("AP_WhtVatReconRpt", param);
    setOpenDialog((state) => ({ ...state, report: false }));
  };

  const onCloseDialogExport = (selectedOption) => {
    let period = `${filter.year}-${filter.month}`;
    let param = `'${period}','${selectedOption.value}'`;
    console.log(param);
    showReportByName("AP_WhtVatReconRpt", param);
    setOpenDialog((state) => ({ ...state, export: false }));
  };

  return (
    <Dialog fullWidth maxWidth="xl" aria-labelledby="confirmation-dialog-title" open={open}>
      <DialogTitle id="customized-dialog-title" onClose={handleCancel}>
        Withholding Tax Reconciliation
      </DialogTitle>
      <DialogContent dividers>
        <ActionMenu justifyContent="flex-start" menuControl={menuControlProp} />

        <MaterialTable
          title=""
          data={Data}
          columns={columns}
          options={options}
          isLoading={isLoading}
          components={{
            Header: CustomHeader,
            Toolbar: CustomFilterList,
          }}
        />

        {showAdd && (
          <PopupTable
            initialValues={editIndex !== "" ? Data.find((i) => i.Id === editIndex) : initNewRow}
            formFields={formFieldsDetail}
            update={UpdateFromPopup}
            open={showAdd}
            save={(row) => SaveFromPopup(Data, row)}
            cancel={CancelFromPopup}
            maxWidth={"md"}
          ></PopupTable>
        )}
        {openDialog.form && (
          <DialogPrintItem open={openDialog.form} onClose={onCloseDialogForm} options={dialogPrintOption} />
        )}

        {openDialog.report && (
          <DialogOptions
            open={openDialog.report}
            onClose={onCloseDialogReport}
            options={dialogOption}
            headerText="Select Type"
          />
        )}

        {openDialog.export && (
          <DialogOptions
            open={openDialog.export}
            onClose={onCloseDialogExport}
            options={dialogOption.filter((x) => x.value !== "1")}
            headerText="Select Type"
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DialogWhtRec;
