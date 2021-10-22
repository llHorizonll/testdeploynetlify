/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useState, useEffect } from "react";
import { useTheme } from "@material-ui/core/styles";
import { GblContext } from "providers/formatter";
import { useStateWithCallbackLazy } from "use-state-with-callback";
import { makeStyles } from "@material-ui/core/styles";
import { Box, FormControl, Select, InputLabel, MenuItem, Button, DialogActions } from "@material-ui/core";
import {
  getChequeReconcileList,
  updateChequeReconcile,
  getSettingFileFromBank,
  uploadFileFromBank,
} from "services/reconcile";
import { getApPaymentTypeList } from "services/setting";
import MaterialTable, { MTableToolbar } from "material-table";
import DatePickerFormat from "components/DatePickerFormat";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Typography from "@material-ui/core/Typography";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import Dialog from "@material-ui/core/Dialog";
import ModelUriQueryString from "models/uriQueryString";
import gbl from "utils/formatter";
import SnackbarUtils from "utils/SnackbarUtils";
import { addDays } from "date-fns";

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
  textCancel: {
    color: theme.palette.type === "dark" ? theme.palette.grey[800] : "inherit",
    border: `1px solid rgba(0, 0, 0, 0.23)`,
  },
}));

const DialogChequeRec = (props) => {
  const classes = useStyles();
  const { settingAll, DateToString, NumberFormat } = useContext(GblContext);
  const { SettingClosePeriod } = settingAll;
  const { ClosePeriodAp } = SettingClosePeriod;
  let newClosePeriodAp = addDays(new Date(ClosePeriodAp), 1);
  const { onClose, open, defaultClearingDate, useDateFromBank } = props;
  const [apPaymentTypeList, setApPaymentTypeList] = useState();
  const [Data, setData] = useStateWithCallbackLazy();
  const [uriQueryString, setUriQueryString] = useState({
    Limit: ModelUriQueryString.Limit,
    Page: ModelUriQueryString.Page,
    OrderBy: ModelUriQueryString.OrderBy,
    WhereGroupList: ModelUriQueryString.WhereGroupList,
    Exclude: ModelUriQueryString.Exclude,
    WhereRaw: ModelUriQueryString.WhereRaw,
    WhereLike: ModelUriQueryString.WhereLike,
    WhereLikeFields: ModelUriQueryString.WhereLikeFields,
  });
  const theme = useTheme();
  const [selectedRow, setSelectedRow] = useState([]);
  const [payType, setPayType] = useState("All");
  const [showUploadfile, setShowUploadfile] = useState(false);
  const [fileBank, setFileBank] = useState();
  const [isLoading, setLoading] = useState(true);

  const handleFilterList = () => {
    uriQueryString.WhereGroupList = [
      {
        AndOr: "And",
        ConditionList: [],
      },
    ];

    if (payType !== "All") {
      let condition = uriQueryString.WhereGroupList[0].ConditionList.find((item) => item.Field === "AppyCode");
      if (!condition) {
        uriQueryString.WhereGroupList[0].ConditionList.push({
          AndOr: "And",
          Field: "AppyCode",
          Operator: "=",
          Value: payType,
        });
      }
    }
    uriQueryString.OrderBy = { PyhSeq: "" };
  };

  const fetchSearchList = async (uriQueryString, mounted) => {
    handleFilterList();
    const { Data } = await getChequeReconcileList(uriQueryString);
    if (Data) {
      setData(Data);
      setUriQueryString(uriQueryString);
    } else {
      setData([]);
    }
    if (mounted) {
      setLoading(false);
    }
  };

  const fetchApPaymentTypeLookup = async () => {
    const { Data } = await getApPaymentTypeList();
    setApPaymentTypeList(Data);
  };

  useEffect(() => {
    fetchApPaymentTypeLookup();
  }, []);

  useEffect(() => {
    let mounted = true;
    fetchSearchList(uriQueryString, mounted);
    return function cleanup() {
      mounted = false;
    };
  }, [payType]);

  const selectionChange = (rows, selectedRows) => {
    //Select or UnSelect 1 Item
    if (selectedRows) {
      if (selectedRows.tableData.checked) {
        selectedRows.IsSelect = true;
        if (fileBank) {
          if (selectedRows.PyhClearDt === false) {
            selectedRows.PyhClearDt = selectedRows.OldClearingDate;
          } else {
            selectedRows.PyhClearDt = !useDateFromBank ? defaultClearingDate : selectedRows.PyhClearDt;
          }
        } else {
          selectedRows.PyhClearDt = defaultClearingDate;
          selectedRows.ClearingAmount = selectedRows.PyhAmt;
        }
        selectedRows.OldClearingDate = selectedRows.PyhClearDt;
      } else {
        selectedRows.IsSelect = false;
        selectedRows.PyhClearDt = null;
      }
      Data[selectedRows.tableData.id] = selectedRows;
      setData([...Data]);
    }
    //Select All
    if (rows.length > 0 && !selectedRows) {
      //Check All
      const newRows = rows.filter((item) => {
        item.IsSelect = true;
        item.tableData = { checked: true };
        item.OldClearingDate = item.PyhClearDt;
        item.ClearingAmount = item.PyhAmt;
        if (fileBank) {
          if (!!item.PyhClearDt === false) {
            item.PyhClearDt = item.OldClearingDate;
          } else {
            item.PyhClearDt = !useDateFromBank ? defaultClearingDate : item.PyhClearDt;
          }
        } else {
          item.PyhClearDt = defaultClearingDate;
        }
        return item;
      });
      setData([...newRows]);
    }
    //UnSelect All
    if (rows.length === 0 && !selectedRows) {
      Data.forEach((item) => {
        item.IsSelect = false;
        item.tableData = { checked: false };
        item.PyhClearDt = null;
      });
      setData([...Data]);
    }
    let arrIndex = Array.from(rows.keys());
    setSelectedRow(arrIndex);
  };

  const columns = [
    { title: "Payment No.", field: "PyhSeq", sorting: false },
    { title: "Cheque No.", field: "PyhChqFr", sorting: false },
    { title: "Vendor", field: "VnCode", sorting: false },
    { title: "Vendor Name", field: "VnName", sorting: false },
    { title: "Payment Type", field: "AppyCode", sorting: false },
    {
      title: "Pay Amount",
      field: "PyhAmt",
      sorting: false,
      type: "numeric",
      render: (rowData) => NumberFormat(rowData.PyhAmt),
    },
    {
      title: "Clearing Date",
      field: "PyhClearDt",
      sorting: false,
      type: "date",
      render: (rowData) => {
        let value = rowData.PyhClearDt;
        if (!rowData.PyhClearDt) {
          return null;
        }
        let dateValue = new Date(value);
        if (rowData.tableData.checked) {
          return (
            <DatePickerFormat
              label="Clearing Date"
              minDate={new Date(newClosePeriodAp)}
              minDateMessage={"Date must be more than close period"}
              value={dateValue}
              onChange={(e) => {
                Data[rowData.tableData.id].PyhClearDt = new Date(e);
                setData([...Data]);
              }}
              style={{ width: 120 }}
            />
          );
        } else {
          return <div style={{ width: 120 }}>{DateToString(value ?? new Date())}</div>;
        }
      },
    },
    {
      title: "Clearing Amount",
      field: "ClearingAmount",
      type: "numeric",
      sorting: false,
      render: (rowData) => NumberFormat(rowData.ClearingAmount),
    },
  ];

  const options = {
    headerStyle: {
      backgroundColor: theme.palette.primary.main,
      color: "#FFF",
    },
    padding: "dense",
    paging: false,
    selection: true,
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
            <CloseIcon />
          </IconButton>
        ) : null}
      </MuiDialogTitle>
    );
  };

  const handleSave = async () => {
    let selectedData = Data.filter((item) => item.IsSelect);
    if (selectedData.length > 0) {
      let paramCheque = [];
      selectedData.forEach((item) => {
        if (new Date(item.PyhClearDt) > newClosePeriodAp) {
          paramCheque.push({
            PyhSeq: item.PyhSeq,
            PyhChqFr: item.PyhChqFr,
            PyhChqTo: item.PyhChqTo,
            PyhClearDt: item.PyhClearDt,
            UserModified: gbl.UserName,
          });
        }
      });
      if (paramCheque.length > 0) {
        const { Code } = await updateChequeReconcile(paramCheque);
        if (Code === 0) {
          SnackbarUtils.success("Success");
          fetchSearchList(uriQueryString);
        }
      }
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const switchPaymentType = async (appyCode) => {
    setPayType(appyCode);
    setSelectedRow([]);
    setFileBank();
    let { Data } = await getSettingFileFromBank(appyCode);
    if (Data.length > 0) {
      setShowUploadfile(true);
    } else {
      setShowUploadfile(false);
    }
  };

  const uploadFile = async (e) => {
    setFileBank(e.target.files[0].name);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64FileData = reader.result.replace("data:", "").replace(/^.+,/, "");
      let param = {
        PaymentType: payType,
        FileData: base64FileData,
      };
      const response = await uploadFileFromBank(param);
      const newData = response.Data;
      if (!newData) {
        return;
      }
      if (newData.length === 0) {
        SnackbarUtils.toast("No maching data");
        return;
      }
      if (Data.length === 0) {
        SnackbarUtils.toast("No maching data");
        return;
      }

      if (newData) {
        newData.forEach((item) => {
          if (item.ClearingAmount > 0) {
            item.IsSelect = true;
            item.tableData = { checked: true };
            item.PyhClearDt = !useDateFromBank ? defaultClearingDate : item.PyhClearDt;
            item.OldClearingDate = item.PyhClearDt;
          } else {
            item.IsSelect = false;
            item.tableData = { checked: false };
          }
        });
        const newDataSelected = newData.filter((item) => item.IsSelect);
        if (newDataSelected.length === 0) {
          SnackbarUtils.toast("No maching data");
          return;
        } else {
          let arrIndex = Array.from(newDataSelected.keys());
          setData(newDataSelected);
          setSelectedRow(arrIndex);
        }
      } else {
        setData([]);
      }
    };
    if (e.target.files[0]) {
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const CustomFilterList = (props) => {
    return (
      <>
        <MTableToolbar {...props} />
        <Box display="flex">
          <Box p={1}>
            <FormControl variant="outlined">
              <InputLabel id="payType">PaymentType</InputLabel>
              <Select
                variant="outlined"
                margin="dense"
                labelId="payType"
                label="PaymentType"
                value={payType}
                onChange={(e) => switchPaymentType(e.target.value)}
                style={{ width: 240 }}
              >
                <MenuItem value="All">All</MenuItem>
                {apPaymentTypeList
                  ? apPaymentTypeList.map((item, idx) => (
                      <MenuItem key={idx} value={item.Code}>
                        {item.Code} : {item.Desc}
                      </MenuItem>
                    ))
                  : ""}
              </Select>
            </FormControl>
          </Box>
          {showUploadfile && (
            <Box p={2}>
              {!fileBank && <input type="file" id="fileBank" onChange={uploadFile} accept=".csv,(*.*)"></input>}
              {fileBank && (
                <>
                  <span style={{ margin: "0 10px" }}>{fileBank}</span>{" "}
                  <button
                    onClick={() => {
                      setSelectedRow([]);
                      setFileBank();
                      fetchSearchList(uriQueryString);
                    }}
                  >
                    cancel
                  </button>
                </>
              )}
            </Box>
          )}
        </Box>
      </>
    );
  };

  return (
    <Dialog fullWidth maxWidth="lg" aria-labelledby="confirmation-dialog-title" open={open}>
      <DialogTitle id="customized-dialog-title" onClose={handleCancel}>
        Cheque Reconciliation
      </DialogTitle>
      <DialogContent dividers>
        <MaterialTable
          title=""
          columns={columns}
          data={Data}
          options={options}
          isLoading={isLoading}
          onSelectionChange={selectionChange}
          components={{
            Toolbar: CustomFilterList,
          }}
        />
      </DialogContent>
      <DialogActions>
        {selectedRow.length > 0 ? (
          <>
            <Button variant="contained" onClick={handleSave} color="primary">
              Save
            </Button>
            <Button variant="outlined" className={classes.textCancel} onClick={handleCancel}>
              Cancel
            </Button>
          </>
        ) : (
          <div style={{ margin: 18 }}></div>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default DialogChequeRec;
