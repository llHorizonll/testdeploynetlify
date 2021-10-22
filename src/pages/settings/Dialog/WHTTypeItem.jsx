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
import { useForm } from "react-hook-form";
import { Grid, Divider, Typography } from "@material-ui/core";
import { TextFieldInForm } from "components/Form";
import ActionMenu from "components/ActionMenu";
import ButtonFooter from "components/ButtonFooter";
import { getWhtTypeDetail, createWhtTypeDetail, updateWhtTypeDetail, delWhtTypeDetail } from "services/accountPayable";
import Model from "models/apWhtType";
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

  const { handleSubmit, reset } = methods;

  const fetchDetailById = useCallback(async () => {
    if (id && id !== 0) {
      const response = await getWhtTypeDetail(id);
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
    fetchDetailById();
  }, [fetchDetailById]);

  const disableFormEnter = (e) => {
    if (e.key === "Enter" && e.target.localName !== "textarea") e.preventDefault();
  };

  const onSubmit = (values) => {
    values.WhtTypeCode = values.WhtTypeCode.replace(/ /g, "");
    //Adjust parameter before save
    setData(
      (state) => ({
        ...state,
        ...values,
        UserModified: Model.UserModified,
      }),
      (nextState) => Save(nextState)
    );
  };

  const Save = async (values) => {
    if (mode === "edit") {
      values.Id = id;
      //Update
      const { Code, UserMessage } = await updateWhtTypeDetail(values);
      if (Code === 0) {
        SnackbarUtils.success(UserMessage);
        handleClose(id);
      }
    } else {
      console.log(values);
      const { Code, InternalMessage, UserMessage } = await createWhtTypeDetail(values);
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
      const { Code, UserMessage } = await delWhtTypeDetail(id);
      if (Code === 0) {
        SnackbarUtils.success(UserMessage);
        handleClose(id);
      }
    }
  };

  const CancelFnc = () => {
    if (id === 0) {
      onClose();
      return;
    }
    fetchDetailById();
    setMode("view");
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
                    label="* Code"
                    name="WhtTypeCode"
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
                        value: 15,
                        message: "maximum length is 15",
                      },
                    }}
                  />
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
            <ButtonFooter noBorder SaveFnc={handleSubmit(onSubmit)} CancelFnc={CancelFnc} />
          </DialogActions>
        ) : (
          ""
        )}
      </Dialog>
    </div>
  );
}
