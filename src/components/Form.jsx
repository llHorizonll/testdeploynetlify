/* eslint-disable eqeqeq */
/* eslint-disable no-eval */
import React, { useContext } from "react";
import { GblContext } from "providers/formatter";
import { makeStyles } from "@material-ui/core/styles";
import { Controller } from "react-hook-form";
import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider, DatePicker } from "@material-ui/pickers";
import { Switch, TextField, Select, MenuItem, InputBase } from "@material-ui/core";
import Checkbox from "@material-ui/core/Checkbox";
import { Autocomplete } from "@material-ui/lab";
import parse from "autosuggest-highlight/parse";
import match from "autosuggest-highlight/match";
import { matchSorter } from "match-sorter";
import NumberFormatInput from "components/NumberFormatInput";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";

import ListBox from "components/ListBox";
import PopperListBox from "components/PopperListBox";

const useStyles = makeStyles((theme) => ({
  inputRoot: {
    padding: "4px !important",
  },
  option: {
    width: 500,
    fontSize: 14,
    "& > span": {
      marginRight: 10,
      fontSize: 18,
    },
  },
  menuPaper: {
    maxHeight: 200,
  },
  helperTextContainer: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "space-between",
  },
}));

export function SwitchInForm({ methods, name, rule, ...rest }) {
  return (
    <Controller
      name={name}
      control={methods.control}
      rules={rule}
      defaultValue=""
      render={(props) => {
        let notNullValue = props.value === "" ? false : props.value;
        return (
          <FormControlLabel
            value={typeof props.value === "string" && props.value === "true"  ? props.value : false}
            control={
              <Switch
                {...props}
                checked={notNullValue}
                onChange={(e) => {
                  if (rest.disabled) {
                    e.preventDefault();
                  } else {
                    props.onChange(e.target.checked);
                  }
                }}
              />
            }
            label={props.value ? "Active" : "In-Active"}
            labelPlacement="start"
            color="primary"
          />
        );
      }}
    />
  );
}

export function TextFieldInForm({ methods, name, rule, ...rest }) {
  const classes = useStyles();
  const HelperText = (props) => {
    if (props.rule?.maxLength) {
      var countCharacter;
      if (methods.watch(name) && methods.watch(name) !== "") {
        countCharacter = `${methods.watch(name).toString().length}/${props.rule?.maxLength.value}`;
      } else {
        countCharacter = `0/${props.rule?.maxLength.value}`;
      }
    }

    return (
      <span className={classes.helperTextContainer}>
        <span>{props.msg ? props.msg.message : ""}</span>
        <span>{countCharacter ? countCharacter : ""}</span>
      </span>
    );
  };
  return (
    <FormControl fullWidth>
      <Controller
        name={name}
        control={methods.control}
        rules={rule}
        defaultValue=""
        render={(props) => {
          let notNullValue = props.value ?? "";
          return (
            <TextField
              {...props}
              {...rest}
              id={name}
              name={name}
              label={rest.label}
              variant="outlined"
              margin="dense"
              //inputRef={rule ? methods.register(rule) : methods.register}
              error={!!methods.errors[name]}
              helperText={<HelperText msg={methods.errors[name]} rule={rule} />}
              inputProps={{
                maxLength: rule?.maxLength ? rule?.maxLength.value : 255,
              }}
              value={notNullValue}
              onChange={(e) => {
                props.onChange(e.target.value);
                methods.setValue(name, e.target.value);
                if (rest.onChange) rest.onChange(e);
              }}
            />
          );
        }}
      />
    </FormControl>
  );
}

export function NumberFormatInForm({ methods, name, rule, ...rest }) {
  const classes = useStyles();
  const HelperText = (props) => {
    return (
      <span className={classes.helperTextContainer}>
        <span>{props.msg ? props.msg.message : ""}</span>
      </span>
    );
  };
  const isReadOnly = () => {
    if (methods.watch("Type")) {
      switch (name) {
        case "AstAmt":
          return !rest.forceSetReadOnly;
        case "Qty":
          return rest.forceSetReadOnly;
        default:
          return rest.readOnly;
      }
    } else {
      return rest.readOnly;
    }
  };

  return (
    <FormControl fullWidth>
      <Controller
        name={name}
        control={methods.control}
        rules={rule}
        defaultValue={""}
        render={(props) => {
          return (
            <TextField
              id={name}
              name={name}
              label={rest.label}
              variant={isReadOnly() ? "filled" : "outlined"}
              margin="dense"
              error={!!methods.errors[name]}
              helperText={<HelperText msg={methods.errors[name]} rule={rule} />}
              InputProps={{
                inputComponent: NumberFormatInput,
              }}
              inputProps={{
                style: { textAlign: "right" },
                maxLength: rule?.maxLength ? rule?.maxLength.value : 18,
                decimal: rest.decimal,
                readOnly: isReadOnly(),
              }}
              defaultValue={""}
              value={methods.watch(name)}
              disabled={rest.disabled}
              onChange={(e) => {
                props.onChange(e.target.value);
                methods.setValue(name, e.target.value);
                if (rest.onChange) rest.onChange(e);
              }}
              style={rest.style}
            />
          );
        }}
      />
    </FormControl>
  );
}

export function DateInForm({ methods, name, rule, ...rest }) {
  const { settingAll } = useContext(GblContext);
  const { SettingSystem } = settingAll;
  const classes = useStyles();
  const HelperText = (props) => {
    return (
      <span className={classes.helperTextContainer}>
        <span>{props.msg ? props.msg.message : ""}</span>
      </span>
    );
  };
  const setMinDate = () => {
    if (rest.customMinDate) {
      if (methods.watch(rest.customMinDate) === null) {
        return methods.watch(rest.minDate);
      } else {
        if (new Date(methods.watch(rest.customMinDate)) < rest.minDate) {
          return rest.minDate;
        }
        return methods.watch(rest.customMinDate);
      }
    } else {
      return rest.minDate;
    }
  };
  return (
    <Controller
      name={name}
      control={methods.control}
      rules={rule}
      render={({ ref, ...detail }) => {
        return (
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <DatePicker
              {...detail}
              label={rest.label}
              name={name}
              inputVariant="outlined"
              margin="dense"
              format={SettingSystem.DateFormat}
              required={rule?.required !== undefined ? true : false}
              error={!!methods.errors[name]}
              helperText={<HelperText msg={methods.errors[name]} rule={rule} />}
              autoOk={true}
              okLabel=""
              cancelLabel=""
              fullWidth
              showTodayButton
              minDate={setMinDate()}
              minDateMessage={rest.minDateMessage}
              disabled={rest.disabled}
              clearable={rest.clearable}
              onChange={(newValue) => {
                if (!isNaN(Date.parse(newValue))) {
                  let obj = { target: { name: name, value: newValue } };
                  detail.onChange(obj);
                  methods.setValue(name, newValue);
                  if (rest.onChange) rest.onChange(obj);
                } else {
                  detail.onChange(newValue);
                }
              }}
              style={methods.errors[name] ? null : rest.style}
            />
          </MuiPickersUtilsProvider>
        );
      }}
    />
  );
}

export function CheckBoxInForm({ methods, name, rule, ...rest }) {
  return (
    <Controller
      name={name}
      control={methods.control}
      render={({ ref, ...detail }) => {
        return (
          <FormControlLabel
            control={
              <Checkbox
                {...detail}
                checked={Boolean(detail.value)}
                name={name}
                color="primary"
                onChange={(e, newValue) => {
                  detail.onChange(e.target.value);
                  methods.setValue(name, newValue);
                  if (rest.onChange) {
                    rest.onChange(e);
                  }
                }}
                disabled={rest.disabled}
              />
            }
            label={rest.label}
          />
        );
      }}
    />
  );
}

const filterOptions = (options, { inputValue }, optKey, optDesc) => {
  return matchSorter(options, inputValue, {
    keys: [`${optKey}`, `${optDesc}`],
  });
};

export function MuiAutosuggest({ methods, name, optKey, optDesc, rule, ...rest }) {
  const classes = useStyles();

  const HelperText = (props) => {
    return (
      <span className={classes.helperTextContainer}>
        <span>{props.msg ? props.msg.message : ""}</span>
      </span>
    );
  };
  return (
    <Controller
      name={name}
      control={methods.control}
      defaultValue={rest.defaultValue ?? ""}
      rules={rule}
      render={(props) => {
        return (
          <Autocomplete
            {...props}
            style={rest.style}
            disabled={rest.disabled}
            disableListWrap
            disableClearable={false}
            //disableClearable={rest.clearable ? false : true}
            ListboxComponent={ListBox}
            PopperComponent={PopperListBox}
            classes={{
              inputRoot: classes.inputRoot,
              option: classes.option,
            }}
            options={rest.options}
            autoHighlight
            freeSolo={props.value == "" || "string" ? true : false}
            forcePopupIcon={true}
            getOptionLabel={(option) => {
              return typeof option === "object" ? option[optKey] : option;
            }}
            getOptionDisabled={(option) => option.Active !== undefined && option.Active === false}
            // getOptionSelected={(option, value) => {
            //   return typeof value === "object"
            //     ? option[optKey] == value[optKey]
            //     : option[optKey] == value;
            // }}
            renderInput={(params) => {
              if (rest.InputProps?.startAdornment) {
                params.InputProps.startAdornment = rest.InputProps.startAdornment;
              }
              return (
                <TextField
                  {...params}
                  error={!!methods.errors[name]}
                  helperText={<HelperText msg={methods.errors[name]} rule={rule} />}
                  label={rest.label}
                  name={name}
                  variant="outlined"
                  margin="dense"
                  placeholder={rest.label}
                />
              );
            }}
            renderOption={(option, { inputValue }) => {
              let mergestring = rest.noCode ? option[optKey] : `${option[optKey]} : ${optDesc ? option[optDesc] : ""}`;
              const matches = match(mergestring, inputValue);
              const parts = parse(mergestring, matches);
              return (
                <div>
                  {parts.map((part, index) => (
                    <span key={index} style={{ fontWeight: part.highlight ? 700 : 400 }}>
                      {part.text}
                    </span>
                  ))}
                </div>
              );
            }}
            onChange={(e, newValue) => {
              if (newValue) {
                props.onChange(newValue[optKey]);
                methods.setValue(name, newValue[optKey]);
              } else {
                props.onChange(newValue);
                methods.setValue(name, newValue);
              }
              if (rest.updateOtherField?.length > 0 && newValue) {
                rest.updateOtherField.forEach((element) => {
                  methods.setValue(element.key, newValue[element.optKey]);
                  if (element.useFncUpdate) {
                    let n = rest.fncUpdate(newValue);
                    methods.setValue(element.key, n);
                  }
                });
              } else {
                if (rest.updateOtherField) {
                  rest.updateOtherField.forEach((element) => {
                    methods.setValue(element.key, newValue);
                  });
                }
              }
              if (rest.onChange) rest.onChange(e);
            }}
            filterOptions={(options, { inputValue }) => filterOptions(options, { inputValue }, optKey, optDesc)}
          />
        );
      }}
    />
  );
}

export function SelectInForm({ methods, name, rule, clearOtherFieldError, ...rest }) {
  const classes = useStyles();
  return (
    <Controller
      name={name}
      control={methods.control}
      defaultValue={""}
      render={(props) => {
        return (
          <FormControl variant="outlined" fullWidth>
            <InputLabel id="label" style={{ margin: "4px 0" }}>
              {rest.label}
            </InputLabel>
            <Select
              {...props}
              labelId="label"
              variant="outlined"
              margin="dense"
              label={rest.label}
              style={{ margin: "4px 0" }}
              MenuProps={{ classes: { paper: classes.menuPaper } }}
              disabled={rest.disabled}
              defaultValue={""}
              onChange={async (e) => {
                props.onChange(e.target.value);
                methods.setValue(name, e.target.value);
                if (rest.onChange) rest.onChange(e);
                if (clearOtherFieldError) {
                  methods.clearErrors(clearOtherFieldError);
                }
              }}
            >
              {rest.options
                ? rest.options.map((item, idx) => {
                    if (typeof item === "string") {
                      return (
                        <MenuItem key={idx} value={item}>
                          {item}
                        </MenuItem>
                      );
                    } else {
                      return (
                        <MenuItem key={idx} value={item.key}>
                          {item.value}
                        </MenuItem>
                      );
                    }
                  })
                : ""}
            </Select>
          </FormControl>
        );
      }}
    />
  );
}

export function DescInForm({ methods, name, ...rest }) {
  return (
    <InputBase
      name={name}
      style={rest.style}
      inputRef={methods && methods.register}
      inputProps={rest.InputProps}
      fullWidth
      value={rest.value ?? undefined}
    />
  );
}
