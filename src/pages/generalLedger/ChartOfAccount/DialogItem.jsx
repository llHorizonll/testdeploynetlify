/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useCallback } from "react";
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
import FormLabel from "@material-ui/core/FormLabel";
import { Grid, Checkbox, Switch, Divider, Typography } from "@material-ui/core";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import ActionMenu from "components/ActionMenu";
import ButtonFooter from "components/ButtonFooter";
import { AccTypeOptions, AccModuleOptions } from "utils/options";
import { TextFieldInForm } from "components/Form";
import {
  getAccountCodeDetail,
  createAccountCodeDetail,
  updateAccountCodeDetail,
  delAccountCodeDetail,
} from "services/setting";
import Model from "models/accountCode";
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
  const { children, id, mode, setMode, open, onClose } = props;

  const [data, setData] = useStateWithCallbackLazy(Model);

  const methods = useForm({ defaultValues: data });

  const { handleSubmit, reset, control } = methods;

  const fetchAccById = useCallback(async () => {
    if (id && id !== 0) {
      const response = await getAccountCodeDetail(id);
      if (response) {
        setData(response);
        reset(response);
      }
    } else {
      setData(Model);
      reset(Model);
    }
  }, [id, reset]);

  useEffect(() => {
    fetchAccById();
  }, [fetchAccById]);

  const disableFormEnter = (e) => {
    if (e.key === "Enter" && e.target.localName !== "textarea") e.preventDefault();
  };

  const onSubmit = (values) => {
    console.log(values);
    if (values.UseInAp || values.UseInAr || values.UseInAsset || values.UseInGl) {
      //Adjust parameter before save
      setData(
        (state) => ({
          ...state,
          ...values,
          UserModified: Model.UserModified,
        }),
        (nextState) => Save(nextState)
      );
    } else {
      alert("Please assign module.");
      return;
    }
  };

  const Save = async (values) => {
    if (mode === "edit") {
      values.Id = id;
      //Update
      const { Code, UserMessage } = await updateAccountCodeDetail(values);
      if (Code === 0) {
        SnackbarUtils.success(UserMessage);
        handleClose(id);
      }
    } else {
      console.log(values);
      const { Code, InternalMessage, UserMessage } = await createAccountCodeDetail(values);
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
      const { Code, UserMessage } = await delAccountCodeDetail(id);
      if (Code === 0) {
        SnackbarUtils.success(UserMessage);
        handleClose(id);
      }
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
                    label="* AccCode"
                    name="AccCode"
                    variant="outlined"
                    margin="dense"
                    methods={methods}
                    disabled={mode !== "add"}
                    rule={{
                      required: {
                        value: true,
                        message: "* Required",
                      },
                      maxLength: {
                        value: 15,
                        message: "maximum length is 15",
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={3} elevation={2} style={{margin:"-30px 0"}}>
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
                <Grid item xs={12} elevation={2}>
                  <TextFieldInForm
                    label="Description"
                    name="Description"
                    variant="outlined"
                    margin="dense"
                    methods={methods}
                    disabled={mode === "view"}
                    rule={{
                      maxLength: {
                        value: 255,
                        message: "maximum length is 255",
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} elevation={2}>
                  <TextFieldInForm
                    label="Description (Local)"
                    name="Description2"
                    variant="outlined"
                    margin="dense"
                    methods={methods}
                    disabled={mode === "view"}
                    rule={{
                      maxLength: {
                        value: 255,
                        message: "maximum length is 255",
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={6} elevation={2}>
                  <FormLabel component="legend">Nature</FormLabel>
                  <FormControl component="fieldset">
                    <Controller
                      name="Nature"
                      control={control}
                      defaultValue=""
                      rules={{
                        required: "Required",
                      }}
                      render={(props) => (
                        <RadioGroup aria-label="Nature" name="Nature" value={props.value} onChange={props.onChange}>
                          <FormControlLabel
                            value="Debit"
                            control={<Radio disabled={mode !== "add"} />}
                            label="Debit"
                          />
                          <FormControlLabel
                            value="Credit"
                            control={<Radio disabled={mode !== "add"} />}
                            label="Credit"
                          />
                        </RadioGroup>
                      )}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={6} elevation={2}>
                  <FormLabel component="legend">Type</FormLabel>
                  <FormControl component="fieldset">
                    <Controller
                      name="Type"
                      control={control}
                      defaultValue=""
                      render={(props) => {
                        return (
                          <RadioGroup aria-label="Type" name="Type" value={props.value} onChange={props.onChange}>
                            {AccTypeOptions.map((item, idx) => (
                              <FormControlLabel
                                key={idx}
                                value={item.replace(/ /g, "")}
                                control={<Radio disabled={mode !== "add"} />}
                                label={item}
                              />
                            ))}
                          </RadioGroup>
                        );
                      }}
                    />
                  </FormControl>
                </Grid>
                <Divider />
                <Grid item xs={12} elevation={2}>
                  <FormLabel component="legend">Assign Modules</FormLabel>
                  {AccModuleOptions.map((item, idx) => (
                    <FormControl component="fieldset" key={idx}>
                      <Controller
                        name={item.value}
                        control={control}
                        defaultValue=""
                        render={(props) => {
                          return (
                            <FormControlLabel
                              value={props.value}
                              control={
                                <Checkbox
                                  checked={typeof props.value === "boolean" ? props.value : false}
                                  onChange={(e, newValue) => props.onChange(newValue)}
                                  disabled={mode === "view"}
                                />
                              }
                              label={item.name}
                            />
                          );
                        }}
                      />
                    </FormControl>
                  ))}
                </Grid>
              </Grid>
            </div>
            {children}
            <Divider />
          </form>
          <pre>{process.env.NODE_ENV === "development" ? JSON.stringify(data, 0, 2) : ""}</pre>
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
