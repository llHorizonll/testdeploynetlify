import React, { useContext, useState, useEffect, useCallback } from "react";
import { GblContext } from "providers/formatter";
import TextField from "@material-ui/core/TextField";
import InputBase from "@material-ui/core/InputBase";
import Button from "@material-ui/core/Button";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Dialog from "@material-ui/core/Dialog";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { makeStyles } from "@material-ui/core/styles";
import DatePickerFormat from "components/DatePickerFormat";

import ListBox from "components/ListBox";
import PopperListBox from "components/PopperListBox";
import { getAstDepartment, getAstLocation, changeLocation } from "services/asset";
import { addDays } from "date-fns";
import gbl from "utils/formatter";

const useStyles = makeStyles((theme) => ({
  option: {
    width: 500,
    fontSize: 14,
    "& > span": {
      marginRight: 10,
      fontSize: 18,
    },
  },
  textCancel: {
    color: theme.palette.type === "dark" ? theme.palette.grey[800] : "inherit",
    border: `1px solid rgba(0, 0, 0, 0.23)`,
  },
}));

const DialogEditAfterClsPeriod = (props) => {
  const classes = useStyles();
  const { settingAll } = useContext(GblContext);
  const { SettingClosePeriod } = settingAll;
  const { ClosePeriodAsset } = SettingClosePeriod;
  let newClosePeriodAsset = addDays(new Date(ClosePeriodAsset), 1);
  const { onClose, open, RegId, DepartmentCode, DepartmentDesc, LocationCode, LocationDesc, TransferDate } = props;
  const [transferDate, SetTransferDate] = useState(new Date(TransferDate));
  const [deptCode, setDeptCode] = useState(DepartmentCode);
  const [deptDesc, setDeptDesc] = useState(DepartmentDesc);
  const [locCode, setLocCode] = useState(LocationCode);
  const [locDesc, setLocDesc] = useState(LocationDesc);
  const [lookupList, setLookupList] = useState({
    astDepartmentList: [],
    astLocationList: [],
  });

  const fetchAstDepartmentLookup = useCallback(async () => {
    const { Data } = await getAstDepartment();
    setLookupList((state) => ({
      ...state,
      astDepartmentList: Data,
    }));
  }, []);

  const fetchAstLocationLookup = useCallback(async () => {
    const { Data } = await getAstLocation();
    setLookupList((state) => ({
      ...state,
      astLocationList: Data,
    }));
  }, []);

  useEffect(() => {
    fetchAstDepartmentLookup();
    fetchAstLocationLookup();
  }, [fetchAstDepartmentLookup, fetchAstLocationLookup]);

  const handleCancel = () => {
    onClose();
  };

  const handleOk = async () => {
    let param = {
      FromRegId: RegId,
      DepartmentCode: deptCode,
      LocationCode: locCode,
      TransferDate: transferDate,
      UserModified: gbl.UserName,
    };
    const { Code, InternalMessage } = await changeLocation(param);
    if (Code === 0) {
      onClose(RegId);
    } else {
      alert(InternalMessage);
    }
  };

  return (
    <Dialog
      disableBackdropClick
      disableEscapeKeyDown
      maxWidth="sm"
      aria-labelledby="confirmation-dialog-title"
      open={open}
    >
      <DialogTitle id="confirmation-dialog-title">Copy Asset</DialogTitle>
      <DialogContent dividers>
        <Autocomplete
          id="Department"
          options={lookupList["astDepartmentList"]}
          disableClearable
          disableListWrap
          defaultValue={deptCode}
          value={deptCode}
          onChange={(e, newItem) => {
            setDeptCode(newItem.DepartmentCode);
            setDeptDesc(newItem.Description);
          }}
          ListboxComponent={ListBox}
          PopperComponent={PopperListBox}
          classes={{
            option: classes.option,
          }}
          getOptionLabel={(option) => {
            return typeof option === "object" ? option.DepartmentCode : option;
          }}
          renderOption={(option) => `${option.DepartmentCode} : ${option.Description}`}
          style={{ width: 210, display: "inline-flex" }}
          renderInput={(params) => (
            <TextField {...params} variant="outlined" label="Department" margin="dense" placeholder="Department" />
          )}
        />

        <InputBase style={{ marginLeft: 20 }} value={deptDesc} />

        <Autocomplete
          id="Location"
          options={lookupList["astLocationList"]}
          disableClearable
          disableListWrap
          defaultValue={locCode}
          value={locCode}
          onChange={(e, newItem) => {
            setLocCode(newItem.LocCode);
            setLocDesc(newItem.Description);
          }}
          ListboxComponent={ListBox}
          PopperComponent={PopperListBox}
          classes={{
            option: classes.option,
          }}
          getOptionLabel={(option) => {
            return typeof option === "object" ? option.LocCode : option;
          }}
          renderOption={(option) => `${option.LocCode} : ${option.Description}`}
          style={{ width: 210, display: "inline-flex" }}
          renderInput={(params) => (
            <TextField {...params} variant="outlined" label="Location" margin="dense" placeholder="Location" />
          )}
        />

        <InputBase style={{ marginLeft: 20 }} value={locDesc} />

        <DatePickerFormat
          label="TransferDate"
          minDate={new Date(newClosePeriodAsset)}
          minDateMessage={"Date must be more than close period"}
          value={transferDate}
          onChange={(e) => SetTransferDate(e)}
        />
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={handleOk} color="primary">
          Ok
        </Button>
        <Button variant="outlined" className={classes.textCancel} onClick={handleCancel}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogEditAfterClsPeriod;
