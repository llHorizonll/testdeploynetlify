import React, { useContext, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { GblContext } from "providers/formatter";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Dialog from "@material-ui/core/Dialog";
import DatePickerFormat from "components/DatePickerFormat";
import NumberFormatInput from "components/NumberFormatInput";
import { copyAssetRegister, getAssetRegisterSearchList } from "services/asset";
import gbl from "utils/formatter";
import ModelUriQueryString from "models/uriQueryString";
import { addDays } from "date-fns";

const useStyles = makeStyles((theme) => ({
  textCancel: {
    color: theme.palette.type === "dark" ? theme.palette.grey[800] : "inherit",
    border: `1px solid rgba(0, 0, 0, 0.23)`,
  },
}));

const DialogCopy = (props) => {
  const classes = useStyles();
  const { onClose, open, RegId, AssetId, AssetNo } = props;
  const { settingAll, ToNumber } = useContext(GblContext);
  const { SettingClosePeriod } = settingAll;
  const { ClosePeriodAsset } = SettingClosePeriod;
  let newClosePeriodAsset = addDays(new Date(ClosePeriodAsset), 1);
  const [inputDate, SetInputDate] = useState(new Date());
  const [acquireDate, SetAcquireDate] = useState(new Date());
  const [items, setItems] = useState(1);
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
  const handleCancel = () => {
    onClose();
  };

  const handleOk = async () => {
    let param = {
      FromRegId: RegId,
      InputDate: inputDate,
      AcquireDate: acquireDate,
      Count: ToNumber(items),
      UserModified: gbl.UserName,
    };

    const { Code, InternalMessage } = await copyAssetRegister(param);
    if (Code === 0) {
      uriQueryString.Limit = 1;
      uriQueryString.OrderBy = { AstRegId: "desc" };
      const newestAssetRegItem = await getAssetRegisterSearchList(uriQueryString);
      setUriQueryString(uriQueryString);
      onClose(newestAssetRegItem.Data[0].RegId);
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
        <TextField
          label="Item to Copy"
          value={items}
          variant="outlined"
          margin="dense"
          InputProps={{
            inputComponent: NumberFormatInput,
          }}
          inputProps={{
            style: { textAlign: "right", paddingRight: 16 },
            decimal: 0,
          }}
          onChange={(e) => setItems(e.target.value)}
        />
        <TextField
          label="Asset No."
          value={`${AssetId} - ${AssetNo}`}
          // variant="filled"
          // margin="dense"
          variant="outlined"
          margin="dense"
          inputProps={{
            style: { textAlign: "right", paddingRight: 16 },
            readOnly: true,
          }}
          disabled
          style={{ marginLeft: 20 }}
        />
        <br />
        <DatePickerFormat
          label="Input Date"
          minDate={new Date(newClosePeriodAsset)}
          minDateMessage={"Date must be more than close period"}
          value={inputDate}
          onChange={(e) => SetInputDate(e)}
        />
        <br />
        <DatePickerFormat
          label="AcquireDate"
          minDate={inputDate}
          minDateMessage={"AcquireDate cannot be more than Input Date"}
          value={acquireDate}
          onChange={(e) => SetAcquireDate(e)}
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

export default DialogCopy;
