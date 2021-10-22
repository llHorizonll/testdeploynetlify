import React, { useContext } from "react";
import { GblContext } from "providers/formatter";
import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider, DatePicker } from "@material-ui/pickers";

export default function FDatePicker(props) {
  const { settingAll } = useContext(GblContext);
  const { SettingSystem } = settingAll;
  
  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <DatePicker
        {...props}
        format={SettingSystem.DateFormat}
        inputVariant="outlined"
        margin="dense"
        autoOk={true}
        okLabel=""
        cancelLabel=""
        fullWidth
        showTodayButton
      />
    </MuiPickersUtilsProvider>
  );
}
