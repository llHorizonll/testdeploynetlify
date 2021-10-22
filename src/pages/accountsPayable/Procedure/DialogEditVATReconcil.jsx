/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useState, useEffect } from "react";
import { useTheme } from "@material-ui/core/styles";
import { GblContext } from "providers/formatter";
import { useStateWithCallbackLazy } from "use-state-with-callback";
import { makeStyles } from "@material-ui/core/styles";
import { Box, FormControl, Select, InputLabel, MenuItem } from "@material-ui/core";
import {
  getEditVatReconcileByPrefix,
  exportVatReconcile,
  delEditVatReconcileDetail,
  updateEditVatReconcileDetail,
  createEditVatReconcileDetail,
} from "services/reconcile";
import { showReportByName } from "pages/Report/services";
import { TableHead, TableRow, TableCell, Tooltip, Icon, IconButton } from "@material-ui/core";
import MaterialTable, { MTableHeader, MTableToolbar } from "material-table";
import Typography from "@material-ui/core/Typography";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import Dialog from "@material-ui/core/Dialog";
import ActionMenu from "components/ActionMenu";
import PopupTable from "components/PopupTable";
import { TextFieldInForm, DateInForm, NumberFormatInForm } from "components/Form";
import { format, addDays, startOfMonth, endOfMonth } from "date-fns";
import Model from "models/editVatReconcile";
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
}));

const DialogEditVATRec = (props) => {
  const theme = useTheme();
  const classes = useStyles();
  const { settingAll, DateToString, NumberFormat, ToMySqlDate, FindTaxAmount, ToNumber } = useContext(GblContext);
  const { SettingClosePeriod } = settingAll;
  const { ClosePeriodAp } = SettingClosePeriod;
  let newClosePeriodAp = addDays(new Date(ClosePeriodAp), 1);
  const { onClose, open, taxPeriodList } = props;
  const [initNewRow] = useStateWithCallbackLazy(Model);
  const [showAdd, setShowAdd] = useState(false);
  const [editIndex, setEditIndex] = useState("");
  const [checkSource, setCheckSource] = useState(false);
  const [defaultTaxPeriod, setDefaultTaxPeriod] = useState(format(new Date(), "MM/yyyy"));
  const [Data, setData] = useState();
  const [Prefix, setPrefix] = useState();
  const [isLoading, setLoading] = useState(true);

  const handleFilterList = async (period = defaultTaxPeriod) => {
    var year = period.substring(3, 8);
    var month = period.substring(0, 2);
    var monthInt = parseInt(month) - 1;
    let filterDate = new Date(year, monthInt);
    let startDayOfMonth = ToMySqlDate(startOfMonth(filterDate));
    let endDayOfMonth = ToMySqlDate(endOfMonth(filterDate));
    const { Code } = await exportVatReconcile(startDayOfMonth, endDayOfMonth);
    if (Code === 0) {
      setPrefix(`vat${year}${month}`);
    }
  };

  const menuControlProp = [{ name: "Print", fnc: () => showReportByName("AP_VatReconciliation", defaultTaxPeriod) }];

  const fetchSearchList = async (prefix = Prefix, mounted) => {
    const { Data } = await getEditVatReconcileByPrefix(prefix);
    if (Data) {
      setData(Data);
    } else {
      setData([]);
    }
    if (mounted) {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    if (Prefix) {
      fetchSearchList(Prefix, mounted);
    } else {
      handleFilterList();
    }
    return function cleanup() {
      mounted = false;
    };
  }, [Prefix]);

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
                      const { Code, InternalMessage } = await delEditVatReconcileDetail(rowData.Id);
                      if (Code === 0) {
                        SnackbarUtils.success("Success");
                        fetchSearchList();
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
    { title: "Tax Invoice No.", field: "InvhTInvNo", sorting: false },
    {
      title: "Tax Invoice Date.",
      field: "InvhTInvDt",
      sorting: false,
      render: (rowData) => {
        let value = rowData.InvhTInvDt;
        if (!rowData.InvhTInvDt) {
          return null;
        }
        return DateToString(value ?? new Date());
      },
    },
    {
      title: "Vendor Name",
      field: "VnName",
      sorting: false,
      cellStyle: {
        width: 200,
      },
    },
    { title: "TaxID", field: "TaxId", sorting: false },
    { title: "Branch No.", field: "BranchNo", sorting: false },
    {
      title: "Description",
      field: "InvhDesc",
      sorting: false,
      cellStyle: {
        width: 200,
      },
    },
    {
      title: "Net Amount",
      field: "BfTaxAmt",
      sorting: false,
      type: "numeric",
      render: (rowData) => NumberFormat(rowData.BfTaxAmt),
    },
    {
      title: "Tax Amount",
      field: "TaxAmt",
      sorting: false,
      type: "numeric",
      render: (rowData) => NumberFormat(rowData.TaxAmt),
    },
    {
      title: "Total Amount",
      field: "TotalAmt",
      sorting: false,
      type: "numeric",
      render: (rowData) => NumberFormat(rowData.TotalAmt),
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
            {taxPeriodList ? (
              <FormControl variant="outlined" fullWidth>
                <InputLabel id="label">Tax Period</InputLabel>
                <Select
                  labelId="label"
                  variant="outlined"
                  margin="dense"
                  label="Tax Period"
                  style={{ width: 160, margin: "4px 0" }}
                  value={defaultTaxPeriod}
                  onChange={(e) => {
                    setDefaultTaxPeriod(e.target.value);
                    handleFilterList(e.target.value);
                  }}
                >
                  {taxPeriodList
                    ? taxPeriodList.map((item, idx) => (
                        <MenuItem key={idx} value={item}>
                          {item}
                        </MenuItem>
                      ))
                    : ""}
                </Select>
              </FormControl>
            ) : (
              ""
            )}
          </Box>
        </Box>
      </>
    );
  };

  const CustomHeader = (props) => {
    return (
      <>
        <TableHead>
          <TableRow>
            <TableCell align="left" colSpan={1} style={{ padding: "4px 16px" }}>
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
    if (currentField === "BfTaxAmt") {
      let TaxAmt = FindTaxAmount("Add", 7, data["BfTaxAmt"]);
      m.setValue("TaxAmt", TaxAmt);
      m.setValue("TotalAmt", ToNumber(data["BfTaxAmt"]) + ToNumber(TaxAmt));
    }
    if (currentField === "TaxAmt") {
      console.log(data["TaxAmt"], data["BfTaxAmt"]);
      //let TaxAmt = FindTaxAmount("Add", data["TaxAmt"], data["BfTaxAmt"]);
      m.setValue("TotalAmt", ToNumber(data["BfTaxAmt"]) + ToNumber(data["TaxAmt"]));
    }
  };

  const SaveFromPopup = async (arr, row) => {
    if (editIndex !== "") {
      //update
      const { Code, InternalMessage } = await updateEditVatReconcileDetail(row);
      if (Code === 0) {
        SnackbarUtils.success("Success");
        setShowAdd(false);
        fetchSearchList();
      } else {
        console.log(InternalMessage);
      }
    } else {
      //create
      let newParam = {
        ...initNewRow,
        ...row,
        Prefix: Prefix,
      };
      const { Code, InternalMessage } = await createEditVatReconcileDetail(newParam);
      if (Code === 0) {
        SnackbarUtils.success("Success");
        setShowAdd(false);
        fetchSearchList();
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
          label="* Tax Invoice No."
          name="InvhTInvNo"
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
          disabled={checkSource}
        />
      ),
    },
    {
      size: 3,
      field: (
        <DateInForm
          label="* Tax Invoice Date"
          name="InvhTInvDt"
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
              value: 13,
              message: "maximum length is 13",
            },
          }}
        />
      ),
    },
    {
      size: 6,
      field: (
        <TextFieldInForm
          label="* Vendor Name"
          name="VnName"
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
      size: 6,
      field: (
        <TextFieldInForm
          label="Description"
          name="InvhDesc"
          variant="outlined"
          margin="dense"
          rule={{
            maxLength: {
              value: 255,
              message: "maximum length is 255",
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
          label="* Net Amount"
          name="BfTaxAmt"
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
          label="* Tax"
          name="TaxAmt"
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
      field: <NumberFormatInForm label="Total Amount" name="TotalAmt" disabled={true} />,
    },
  ];

  return (
    <Dialog fullWidth maxWidth="xl" aria-labelledby="confirmation-dialog-title" open={open}>
      <DialogTitle id="customized-dialog-title" onClose={handleCancel}>
        Edit VAT Reconciliation
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
      </DialogContent>
    </Dialog>
  );
};

export default DialogEditVATRec;
