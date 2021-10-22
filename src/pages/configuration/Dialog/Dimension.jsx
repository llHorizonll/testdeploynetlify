/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useState, useEffect, useCallback } from "react";
import { GblContext } from "providers/formatter";
import { useStateWithCallbackLazy } from "use-state-with-callback";
import { makeStyles } from "@material-ui/core/styles";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import { useForm, Controller } from "react-hook-form";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import Autocomplete from "@material-ui/lab/Autocomplete";
import CheckBoxOutlineBlankIcon from "@material-ui/icons/CheckBoxOutlineBlank";
import CheckBoxIcon from "@material-ui/icons/CheckBox";
import {
  Grid,
  Divider,
  TextField,
  Switch,
  Checkbox,
  Typography,
  InputLabel,
  Select,
  MenuItem,
} from "@material-ui/core";
import { TextFieldInForm, NumberFormatInForm, DateInForm, SelectInForm } from "components/Form";
import ActionMenu from "components/ActionMenu";
import ButtonFooter from "components/ButtonFooter";
import {
  getDimensionDetail,
  createDimensionDetail,
  updateDimensionDetail,
  delDimensionDetail,
} from "services/dimension";
import Model from "models/dimension";
import { DimensionType } from "utils/options";
import SnackbarUtils from "utils/SnackbarUtils";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    margin: 30,
  },
  appBar: {
    position: "relative",
    backgroundColor: theme.palette.primary.main,
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
  content: {
    padding: 0,
  },
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  inputRoot: {
    padding: "3px !important",
  },
  option: {
    width: 500,
    fontSize: 14,
    "& > span": {
      marginRight: 10,
      fontSize: 18,
    },
  },
}));

const DialogTitle = (props) => {
  const { children, onClose, ...other } = props;
  const classes = useStyles();
  return (
    <MuiDialogTitle disableTypography {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
};

export default function DialogItem(props) {
  const classes = useStyles();
  const { children, id, mode, setMode, open, onClose, moduleList } = props;
  console.log(moduleList)
  const { DateToString, StringToDate } = useContext(GblContext);
  const [data, setData] = useStateWithCallbackLazy(Model);
  const [moduleDisplay, setModuleDisplay] = useState("");
  const [moduleValue, setModuleValue] = useState();
  const [switchValue, setSwitchValue] = useState(false);
  const [selectValue, setSelectValue] = useState();
  const [arrListOfValue, setArrListOfvalue] = useState([]);
  const methods = useForm({ defaultValues: data });

  const { handleSubmit, reset, control } = methods;

  const fetchDetailById = useCallback(async () => {
    if (id && id !== 0) {
      const response = await getDimensionDetail(id);
      if (response) {
        //console.log(arr, response.Module);
        var tmp = [];
        if (response.Module) {
          response.Module.forEach((item) => tmp.push(moduleList.find((i) => i.key === item)));
          let displayModule = tmp.map((i) => i.value).join();
          setModuleDisplay(displayModule);
          setModuleValue(tmp);
        }
        if (response.Type === "Date") {
          response.Value = StringToDate(response.Value);
        }

        if (response.Type === "Boolean") {
          let v = response.Value === "true" ? true : false;
          setSwitchValue(v);
        }
        if (response.Type === "List") {
          var arr = [];
          if (response.ListOfValues !== null) {
            var y = response.ListOfValues.match(/(?<=\[)[^\][]*(?=])/g);
            arr = y;
          }
          console.log(arr, response.Value);
          setArrListOfvalue(arr);
          setSelectValue(response.Value);
        }

        setData(response);
        reset(response);
      }
    } else {
      setData(Model);
      reset(Model);
    }
  }, [id, reset]);

  useEffect(() => {
    fetchDetailById();
  }, [fetchDetailById]);

  const disableFormEnter = (e) => {
    if (e.key === "Enter" && e.target.localName !== "textarea") e.preventDefault();
  };

  const onSubmit = (values) => {
    if (values.Type === "Date") {
      values.Value = DateToString(values.Value);
    }

    if (values.Type === "Boolean") {
      values.Value = switchValue;
    }
    if (values.Type === "List") {
      values.Value = selectValue;
    }

    //Adjust parameter before save
    setData(
      (state) => ({
        ...state,
        ...values,
        Module: moduleValue.map((i) => i.key),
        UserModified: Model.UserModified,
      }),
      (nextState) => Save(nextState)
    );
  };

  const Save = async (values) => {
    if (mode === "edit") {
      values.Id = id;
      //Update
      const { Code, UserMessage } = await updateDimensionDetail(values);
      if (Code === 0) {
        SnackbarUtils.success(UserMessage);
        handleClose(id);
      }
    } else {
      console.log(values);
      const { Code, InternalMessage, UserMessage } = await createDimensionDetail(values);
      if (Code === 0) {
        SnackbarUtils.success(UserMessage);
        handleClose(parseInt(InternalMessage));
      }
    }
  };

  const handleClose = (value) => {
    onClose(value);
  };

  const menuControlProp = [
    {
      name: "Edit",
      fnc: () => {
        setMode("edit");
      },
      disabled: mode !== "view",
    },
    {
      name: "Delete",
      fnc: () => DelOrVoid(id),
      disabled: mode !== "view",
    },
  ];

  const DelOrVoid = async (id) => {
    let msg = "Confirm deletion ?";
    let dialog = window.confirm(msg);
    if (dialog) {
      const { Code, UserMessage } = await delDimensionDetail(id);
      if (Code === 0) {
        SnackbarUtils.success(UserMessage);
        handleClose(id);
      }
    }
  };

  const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
  const checkedIcon = <CheckBoxIcon fontSize="small" />;

  const SwitchInputType = (type) => {
    switch (type) {
      case "Text":
        return (
          <TextFieldInForm
            label="Value"
            name="Value"
            methods={methods}
            disabled={mode === "view"}
            rule={{
              maxLength: {
                value: 40,
                message: "maximum length is 40",
              },
            }}
          />
        );
      case "Number":
        return (
          <NumberFormatInForm
            label="Value"
            name="Value"
            methods={methods}
            rule={{
              min: {
                value: 0.01,
                message: "* Required",
              },
              required: {
                value: true,
                message: "* Required",
              },
            }}
            decimal={0}
            disabled={mode === "view"}
          />
        );
      case "Date":
        return (
          <DateInForm
            label="Value"
            name="Value"
            methods={methods}
            // minDate={new Date(ClosePeriodAp)}
            // minDateMessage={"Date must be more than close period"}
            required
            disabled={mode === "view"}
          />
        );
      case "Boolean":
        return (
          <FormControlLabel
            style={{ marginLeft: 0 }}
            value={switchValue}
            control={
              <Switch
                checked={switchValue}
                onChange={(e, newValue) => setSwitchValue(newValue)}
                disabled={mode === "view"}
              />
            }
            label="Value"
            labelPlacement="start"
            color="primary"
          />
        );
      case "List":
        return (
          <>
            <TextFieldInForm
              label="Value"
              name="ListOfValues"
              multiline
              rows={5}
              methods={methods}
              disabled={mode === "view"}
              rule={{
                maxLength: {
                  value: 255,
                  message: "maximum length is 255",
                },
              }}
            />
            <FormControl variant="outlined">
              <InputLabel id="caption">Default Option</InputLabel>
              <Select
                variant="outlined"
                margin="dense"
                labelId="caption"
                label="Default Option"
                value={selectValue ?? ""}
                onChange={(e) => setSelectValue(e.target.value)}
                style={{ width: 206, marginTop: 4 }}
                disabled={mode === "view"}
              >
                {arrListOfValue.map((item, idx) => (
                  <MenuItem key={idx} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        );
      default:
        return <div>null</div>;
    }
  };

  return (
    <div>
      <Dialog open={open} onClose={onClose} scroll={"paper"} fullWidth maxWidth="sm" disableBackdropClick>
        <DialogTitle id="scroll-dialog-title" onClose={onClose}>
          {id}
        </DialogTitle>
        <DialogContent dividers className={classes.content}>
          <ActionMenu menuControl={menuControlProp} justifyContent="flex-start" />
          <Divider />
          <form onKeyDown={disableFormEnter}>
            <div className={classes.root}>
              <Grid container spacing={2} justifyContent="flex-start">
                <Grid item xs={6} elevation={2}>
                  <TextFieldInForm
                    label="Caption"
                    name="Caption"
                    variant="outlined"
                    margin="dense"
                    methods={methods}
                    disabled={mode === "view"}
                    rule={{
                      maxLength: {
                        value: 40,
                        message: "maximum length is 40",
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={3} elevation={2} style={{ margin: "-30px 0" }}>
                  <FormControl fullWidth variant="outlined">
                    <Controller
                      name="Active"
                      control={control}
                      defaultValue=""
                      render={(props) => {
                        return (
                          <FormControlLabel
                            value={props.value}
                            control={
                              <Switch
                                checked={typeof props.value === "boolean" ? props.value : false}
                                onChange={(e, newValue) => props.onChange(newValue)}
                                disabled={mode === "view"}
                              />
                            }
                            label={props.value ? "Active" : "In-Active"}
                            labelPlacement="top"
                            color="primary"
                            style={{ marginTop: 14 }}
                          />
                        );
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={6} elevation={2}>
                  <SelectInForm
                    label="DataType"
                    name="Type"
                    options={DimensionType}
                    methods={methods}
                    disabled={mode === "view"}
                  />
                </Grid>

                {moduleList && (
                  <Grid item xs={6} elevation={2}>
                    {mode === "view" && (
                      <FormControl fullWidth>
                        <TextField
                          label="Module"
                          name="Module"
                          variant="outlined"
                          margin="dense"
                          value={moduleDisplay}
                          disabled={mode === "view"}
                        />
                      </FormControl>
                    )}
                  </Grid>
                )}

                {mode !== "view" && (
                  <Grid item xs={12} elevation={2}>
                    <FormControl variant="outlined" fullWidth>
                      <Controller
                        name="Module"
                        control={control}
                        defaultValue={moduleList[0]}
                        render={(props) => {
                          return (
                            <Autocomplete
                              multiple
                              limitTags={6}
                              options={moduleList}
                              disableCloseOnSelect
                              disableListWrap
                              value={moduleValue}
                              onChange={(e, newValue) => setModuleValue(newValue)}
                              classes={{
                                inputRoot: classes.inputRoot,
                                option: classes.option,
                              }}
                              getOptionLabel={(option) => option.key}
                              renderOption={(option, { selected }) => (
                                <React.Fragment>
                                  <Checkbox
                                    icon={icon}
                                    checkedIcon={checkedIcon}
                                    style={{ marginRight: 8 }}
                                    checked={selected}
                                  />
                                  {option.value}
                                </React.Fragment>
                              )}
                              renderInput={(params) => (
                                <TextField {...params} variant="outlined" label="Module" margin="dense" />
                              )}
                            />
                          );
                        }}
                      />
                    </FormControl>
                  </Grid>
                )}

                <Grid item xs={12} elevation={2}>
                  {methods.watch("Type") === "Text" && SwitchInputType("Text")}
                  {methods.watch("Type") === "Number" && SwitchInputType("Number")}
                  {methods.watch("Type") === "Date" && SwitchInputType("Date")}
                  {methods.watch("Type") === "Boolean" && SwitchInputType("Boolean")}
                  {methods.watch("Type") === "List" && SwitchInputType("List")}
                </Grid>
              </Grid>
            </div>

            {children}
            <Divider />
          </form>
          <pre>{process.env.NODE_ENV === "development" ? JSON.stringify(methods.watch(), 0, 2) : ""}</pre>
        </DialogContent>
        {mode !== "view" ? (
          <DialogActions>
            <ButtonFooter noBorder SaveFnc={handleSubmit(onSubmit)} CancelFnc={onClose} />
          </DialogActions>
        ) : (
          ""
        )}
      </Dialog>
    </div>
  );
}
