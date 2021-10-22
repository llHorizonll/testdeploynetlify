import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { Typography, Box, FormControl, Select, InputLabel, MenuItem, TextField, Switch } from "@material-ui/core";
import NumberFormatInput from "components/NumberFormatInput";
import DatePickerFormat from "components/DatePickerFormat";

const useStyles = makeStyles((theme) => ({
  root: {
    minWidth: 200,
    //backgroundColor: theme.palette.type === "dark" ? "inherit" : "grey",
  },
  content: {
    padding: theme.spacing(1, 2),
  },
}));

const SwitchTypeBox = ({ item, update }) => {
  var arrListOfValue = [];
  if (item.ListOfValues !== null) {
    // var y = item.ListOfValues.match(/\s*([^[:]+)/g);
    // var z = y.filter(function (item, idx) {
    //   return idx % 2 === 0;
    // });
    // arrListOfValue = z;
    var y = item.ListOfValues.match(/(?<=\[)[^\][]*(?=])/g);
    arrListOfValue = y;
  }
  switch (item.Type) {
    case "Text":
      return (
        <TextField
          fullWidth
          variant="outlined"
          margin="dense"
          label={item.Caption}
          defaultValue={item.Value ?? ""}
          onChange={(e) => update(item, e.target.value)}
        />
      );
    case "Number":
      return (
        <TextField
          fullWidth
          variant="outlined"
          margin="dense"
          label={item.Caption}
          defaultValue={item.Value ?? ""}
          onChange={(e) => update(item, e.target.value)}
          InputProps={{
            inputComponent: NumberFormatInput,
          }}
          inputProps={{
            style: { textAlign: "right" },
            maxLength: 18,
            decimal: 2,
          }}
        />
      );
    case "Date":
      return (
        <DatePickerFormat
          label={item.Caption}
          value={item.Value ?? ""}
          showTodayButton
          onChange={(e) => update(item, e)}
          style={{ width: 206 }}
        />
      );
    case "Boolean":
      return (
        <FormControlLabel
          style={{ marginLeft: 0 }}
          value={typeof item.Value === "string" && item.Value.toLowerCase() === "true" ? true : item.Value}
          control={
            <Switch
              checked={typeof item.Value === "string" && item.Value.toLowerCase() === "true" ? true : item.Value}
              onChange={(e, newValue) => update(item, newValue)}
            />
          }
          label={item.Caption}
          labelPlacement="start"
          color="primary"
        />
      );
    case "List": {
      return (
        <FormControl variant="outlined">
          <InputLabel id="caption">{item.Caption}</InputLabel>
          <Select
            variant="outlined"
            margin="dense"
            labelId="caption"
            label={item.Caption}
            value={item.Value ?? ""}
            onChange={(e) => update(item, e.target.value)}
            style={{ width: 206 }}
          >
            {arrListOfValue.map((item, idx) => (
              <MenuItem key={idx} value={item}>
                {item}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    }

    default:
      return <div></div>;
  }
};

const Modify = ({ data, update }) => {
  const classes = useStyles();
  return (
    <React.Fragment>
      {data
        ? data.map((item, idx) => (
            <Box key={idx} className={classes.content}>
              <SwitchTypeBox item={item} update={update} />
            </Box>
          ))
        : ""}
    </React.Fragment>
  );
};

const View = ({ data }) => {
  const classes = useStyles();
  return (
    <React.Fragment>
      {data
        ? data.map((item, idx) => (
            <Box key={idx} className={classes.content}>
              <Typography variant="subtitle2" component="b">
                {item.Caption}
              </Typography>
              <Typography variant="body2" component="p">
                {item.Value}
                <br />
              </Typography>
            </Box>
          ))
        : ""}
    </React.Fragment>
  );
};

const DimensionContent = ({ data, update, modify }) => {
  return <React.Fragment>{modify ? <Modify data={data} update={update} /> : <View data={data} />}</React.Fragment>;
};

export default DimensionContent;
