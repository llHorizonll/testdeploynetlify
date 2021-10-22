/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";

export default function DatePicker({
  controlNo,
  name,
  dateFormat,
  value,
  setParameter,
}) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const today = new Date();
    const d = today.getDate().toString().padStart(2, "0");
    const m = (today.getMonth() + 1).toString().padStart(2, "0");
    const y = today.getFullYear();

    let dateValue = "";
    let atDate = value ?? "today";
    switch (atDate.toLowerCase()) {
      case "today":
        dateValue = `${y}-${m}-${d}`;
        break;
      case "startmonth":
        dateValue = `${y}-${m}-1`;
        break;
      case "endmonth":
        dateValue = `${y}-${m}-${d}`;
        break;
      default:
        dateValue = atDate;
        break;
    }
    setSelectedDate(new Date(dateValue));
    setParameter(controlNo, name, dateValue);
  },[]);

  const convertDate = (date) => {
    const d = date.getDate().toString().padStart(2, "0");
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const y = date.getFullYear();
    return `${y}-${m}-${d}`;
  };

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <KeyboardDatePicker
        margin="normal"
        id={name}
        name={name}
        label=""
        format={dateFormat}
        showTodayButton
        value={selectedDate}
        onChange={(date) => {
          setSelectedDate(date);
          setParameter(controlNo, name, convertDate(date));
        }}
        KeyboardButtonProps={{
          "aria-label": "Select date",
        }}
      />
    </MuiPickersUtilsProvider>
  );
}
