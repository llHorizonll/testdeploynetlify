/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import TextField from "@material-ui/core/TextField";
import { Autocomplete } from "@material-ui/lab";

export default function Lookup({
  controlNo,
  name,
  value,
  dataSet,
  dataValue,
  displayValue,
  items,
  values,
  setParameter,
}) {
  const [data, setData] = useState([{ text: "", value: "" }]);
  const [selectedValue, setSelectedValue] = useState(
    data.length > 0 ? data[0] : { text: "", value: "" }
  );

  useEffect(() => {
    function getDefaultValue(dataArray) {
      let dt = dataArray;

      if (Number.isInteger(value)) {
        let index = +value;
        index = index >= dt.length ? dt.length - 1 : index;
        index = index < 0 ? 0 : index;

        return dt[index];
      } else if (value.toLowerCase() === "first") {
        return dt[0];
      } else if (value.toLowerCase() === "last") {
        return dt[dt.length - 1];
      } else return dt[0];
    }

    const newData = [];
    if (items.length > 0) {
      for (let i = 0; i < items.length; i++) {
        newData.push({
          text: items[i].toString(),
          value: values[i].toString(),
        });
      }
    } else {
      dataSet.data.forEach((element) => {
        newData.push({
          text: element[`${displayValue}`].toString(),
          value: element[`${dataValue}`].toString(),
        });
      });
    }

    setData(newData);

    if (newData.length !== 0) {
      const item = getDefaultValue(newData);
      setSelectedValue(item);
      setParameter(controlNo, name, item.value);
    } else setParameter(controlNo, name, "");
  }, []);

  return (
    <Autocomplete
      //ref = {(e)=> refKey.current[refId] = e}
      id={name}
      name={name}
      disableClearable
      options={data}
      getOptionLabel={(option) => option.text}
      renderInput={(params) => (
        <TextField
          //inputRef={(element) => (refKey.current[refId] = element)}
          //name={name}
          {...params}
          label=""
          margin="normal"
          fullWidth
        />
      )}
      value={selectedValue}
      onChange={(e, newValue) => {
        e.preventDefault();
        setSelectedValue(newValue);
        setParameter(controlNo, name, newValue.value);
      }}
    />
  );
}
