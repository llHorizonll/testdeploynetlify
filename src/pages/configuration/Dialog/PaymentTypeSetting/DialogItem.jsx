/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from "react";
import { useStateWithCallbackLazy } from "use-state-with-callback";
import { makeStyles } from "@material-ui/core/styles";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import { useForm } from "react-hook-form";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import { Grid, Select, Divider, Typography, MenuItem } from "@material-ui/core";
import { NumberFormatInForm } from "components/Form";
import ActionMenu from "components/ActionMenu";
import ButtonFooter from "components/ButtonFooter";
import {
  getApPaymentTypeList,
  getGblFileFromBankDetail,
  createGblFileFromBankDetail,
  updateGblFileFromBankDetail,
  delGblFileFromBankDetail,
} from "services/setting";
import Model from "models/gblFileFromBank";
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
  const [lookupList, setLookupList] = useState();
  const [selectedPayType, setSelectedPayType] = useState();

  const methods = useForm({ defaultValues: data });

  const { handleSubmit, reset } = methods;

  const fetchDetailById = useCallback(async () => {
    if (id && id !== 0) {
      const response = await getGblFileFromBankDetail(id);
      if (response) {
        setData(response);
        setSelectedPayType(response.AppyCode);
        reset(response);
      }
    } else {
      setData(Model);
      reset(Model);
    }
  }, [id, reset]);

  const fetchPaymentTypeLookup = useCallback(async () => {
    const { Data } = await getApPaymentTypeList();
    setLookupList(Data);
  }, []);

  useEffect(() => {
    fetchDetailById();
    fetchPaymentTypeLookup();
  }, [fetchDetailById]);

  const disableFormEnter = (e) => {
    if (e.key === "Enter" && e.target.localName !== "textarea") e.preventDefault();
  };

  const onSubmit = (values) => {
    if (selectedPayType !== "") {
      //Adjust parameter before save
      setData(
        (state) => ({
          ...state,
          ...values,
          AppyCode: selectedPayType,
          UserModified: Model.UserModified,
        }),
        (nextState) => Save(nextState)
      );
    } else {
      SnackbarUtils.warning("This PaymentType is required");
    }
  };

  const Save = async (values) => {
    if (values.FileId !== 0) {
      //Update
      const { Code, UserMessage } = await updateGblFileFromBankDetail(values);
      if (Code === 0) {
        SnackbarUtils.Success(UserMessage);
        handleClose(id);
      }
    } else {
      const { Code, InternalMessage, UserMessage } = await createGblFileFromBankDetail(values);
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
      const { Code, UserMessage } = await delGblFileFromBankDetail(id);
      if (Code === 0) {
        SnackbarUtils.success(UserMessage);
        handleClose(id);
      }
    }
  };

  const CancelFnc = () => {
    // if (id === 0) {
    //   onClose();
    //   return;
    // }
    // fetchDetailById();
    // setMode("view");
    onClose();
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
                  <FormControl variant="outlined">
                    <InputLabel id="caption">PaymentType *</InputLabel>
                    {lookupList && (
                      <Select
                        variant="outlined"
                        margin="dense"
                        labelId="caption"
                        label="PaymentType *"
                        value={selectedPayType}
                        onChange={(e) => setSelectedPayType(e.target.value)}
                        style={{ width: 240, marginTop: 4 }}
                      >
                        {lookupList &&
                          lookupList.map((item, idx) => (
                            <MenuItem key={idx} value={item.Code}>
                              {item.Code} : {item.Desc}
                            </MenuItem>
                          ))}
                      </Select>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={6} elevation={2}></Grid>
                <Grid item xs={4} elevation={2}>
                  <NumberFormatInForm
                    label="Column Of CheqNo"
                    name="ColumnOfCheqNo"
                    methods={methods}
                    rule={{
                      min: {
                        value: 0,
                        message: "* Required",
                      },
                      required: {
                        value: true,
                        message: "* Required",
                      },
                    }}
                    decimal={0}
                  />
                </Grid>
                <Grid item xs={4} elevation={2}>
                  <NumberFormatInForm
                    label="Column Of Clearing Date"
                    name="ColumnOfClearingDate"
                    methods={methods}
                    rule={{
                      min: {
                        value: 0,
                        message: "* Required",
                      },
                      required: {
                        value: true,
                        message: "* Required",
                      },
                    }}
                    decimal={0}
                  />
                </Grid>
                <Grid item xs={4} elevation={2}>
                  <NumberFormatInForm
                    label="Column Of Clearing Amount"
                    name="ColumnOfClearingAmount"
                    methods={methods}
                    rule={{
                      min: {
                        value: 0,
                        message: "* Required",
                      },
                      required: {
                        value: true,
                        message: "* Required",
                      },
                    }}
                    decimal={0}
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
