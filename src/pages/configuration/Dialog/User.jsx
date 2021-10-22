/* eslint-disable eqeqeq */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { useStateWithCallbackLazy } from "use-state-with-callback";
import { makeStyles } from "@material-ui/core/styles";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import ListItemText from "@material-ui/core/ListItemText";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import { useForm, Controller } from "react-hook-form";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import { Grid, Switch, Divider, Typography, Select, Checkbox } from "@material-ui/core";
import { TextFieldInForm } from "components/Form";
import ActionMenu from "components/ActionMenu";
import ButtonFooter from "components/ButtonFooter";
import SnackbarUtils from "utils/SnackbarUtils";

import {
  getUserByUserName,
  getTenantList,
  getUserSearchList,
  addOrDeleteTenant,
  createUserDetail,
  updateUserDetail,
  delUserDetail,
  getTemplatePermission,
  getUpdatePermission,
} from "services/setting";
import Model from "models/user";
import gbl from "utils/formatter";

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

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

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
  const { children, username, mode, setMode, open, onClose } = props;

  const [bu, setBu] = useState([]);
  const [buList, setBuList] = useState([]);
  const [permission, setPermission] = useState([]);
  const permissionList = ["Admin", "User (Viewer)", "User (Editor)"];
  const [tPermission, setTPermission] = useState([]);
  const [data, setData] = useStateWithCallbackLazy(Model);

  const methods = useForm({ defaultValues: data });

  const { handleSubmit, reset, control } = methods;

  const fetchDetailByUsername = async () => {
    if (username && username !== "") {
      const { Data } = await getUserByUserName(username);
      if (Data && Data.length > 0) {
        let Tenant = Data.map((i) => i.Tenant.Tenant);
        setBu(Tenant);
        let userItem = Data[0].Permission.find((item) => item.Name === "Sys.User");

        if (userItem && userItem.Code === "FC") {
          setPermission("Admin");
        }

        let newData = { ...Data[0].User, ...Data[0].Status, Tenant };
        setData(newData);
        reset(newData);
      } else {
        let qs = { Limit: 1, Page: 1, WhereLike: `%${username}%`, WhereLikeFields: ["UserName"] };
        const { Data } = await getUserSearchList(qs);
        setData(Data[0]);
        reset(Data[0]);
      }
    } else {
      setData(Model);
      reset(Model);
    }
  };

  const fetchTenantList = async () => {
    const { Data } = await getTenantList();
    if (Data) {
      setBuList(Data.map((i) => i.Tenant));
    }
  };

  const fetchTemplatePermissionList = async () => {
    const response = await getTemplatePermission();
    if (response) {
      response.filter(
        (item) =>
          item.Name !== "Front" &&
          item.Name !== "AutoGenreratePayment" &&
          item.Name !== "VerifyDataIntegrity" &&
          item.Name !== "PeriodSetup" &&
          item.Name !== "ExportSetup" &&
          item.Name !== "ExportDBF" &&
          item.Name !== "Vtech" &&
          item.Name !== "DepreciationCalculation" &&
          item.Name !== "DisposalCalculation"
      );
      setTPermission(response);
    }
  };

  useEffect(() => {
    fetchDetailByUsername();
    fetchTenantList();
    fetchTemplatePermissionList();
  }, []);

  const disableFormEnter = (e) => {
    if (e.key === "Enter" && e.target.localName !== "textarea") e.preventDefault();
  };

  const onSubmit = (values) => {
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

  const setTenantParam = async (v, selectedBu) => {
    let OldTenant = v?.Tenant ? v.Tenant : [];
    //1. loop OldTenant clear notIn selectTenant
    OldTenant.forEach(async (tenantName) => {
      var notInList = selectedBu.includes(tenantName);
      if (!notInList) {
        const { Code, UserMessage } = await addOrDeleteTenant(v.UserName, tenantName, "Delete");
        if (Code === 0) {
          console.log(UserMessage);
        }
      }
    });

    //2. add all selectedTenant
    selectedBu.forEach(async (tenantName) => {
      const { Code, UserMessage } = await addOrDeleteTenant(v.UserName, tenantName, "Add");
      if (Code === 0) {
        console.log(UserMessage);
      }
    });
  };

  const setPermissionParam = async (v, selectedBu, selectedRole) => {
    switch (selectedRole) {
      case "Admin":
        tPermission.forEach((item) => {
          item.View = true;
          //item.CanView = true;
          item.Add = true;
          //item.CanAdd = true;
          item.Execute = true;
          //item.CanExecute = true;
          item.Update = true;
          //item.CanUpdate = true;
          item.Delete = true;
          //item.CanDelete = true;
          item.Print = true;
          //item.CanPrint = true;
          return item;
        });

        break;
      case "User (Viewer)":
        break;
      case "User (Editor)":
        break;
      default:
        break;
    }

    console.log(tPermission, "vPermission");
    selectedBu.forEach(async (tenantName) => {
      let param = {
        Tenant: tenantName,
        UserName: v.UserName,
        PermissionInfos: tPermission,
        UserModified: gbl.UserName,
      };
      const { Code, UserMessage } = await getUpdatePermission(param);
      if (Code === 0) {
        console.log(UserMessage, "after updatepermission");
      }
    });

    console.log(v, selectedBu, selectedRole, tPermission);
  };

  const Save = async (values) => {
    const userDetail = Object.assign(
      {},
      {
        UserId: values.UserId,
        UserName: values.UserName,
        Active: values.Active,
        Email: values.Email,
        KeepOldPassword: true,
        Password: "",
        UserModified: gbl.UserName,
      }
    );

    if (mode === "edit") {
      await setTenantParam(values, bu);
      await setPermissionParam(values, bu, permission);
      //Update
      const { Code, UserMessage } = await updateUserDetail(userDetail);
      if (Code === 0) {
        SnackbarUtils.success(UserMessage);
        handleClose(values.UserName);
      }
    } else {
      const r = await createUserDetail(userDetail);
      if (r.Code === 0) {
        await setTenantParam(values, bu);
        await setPermissionParam(permission);
        SnackbarUtils.success(r.UserMessage);
        handleClose(0);
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
      fnc: () => CheckDeleteBtn(),
      disabled: mode !== "view",
    },
  ];

  const CheckDeleteBtn = () => {
    if (username === gbl.UserName) {
      SnackbarUtils.error("This user has been used in the system, cannot be delete");
    } else {
      DelOrVoid(data.UserId);
    }
  };

  const DelOrVoid = async (id) => {
    let msg = "Confirm deletion ?";
    let dialog = window.confirm(msg);
    if (dialog) {
      const { Code, UserMessage } = await delUserDetail(id);
      if (Code === 0) {
        SnackbarUtils.success(UserMessage);
        handleClose(id);
      }
    }
  };

  const CancelFnc = () => {
    console.log(username);
    if (username === "") {
      onClose();
      return;
    }
    fetchDetailByUsername(username);
    setMode("view");
  };

  return (
    <div>
      <Dialog open={open} onClose={onClose} scroll={"paper"} fullWidth maxWidth="sm" disableBackdropClick>
        <DialogTitle id="scroll-dialog-title" onClose={onClose}>
          {username === "" ? 0 : username}
        </DialogTitle>
        <DialogContent dividers className={classes.content}>
          <ActionMenu menuControl={menuControlProp} justifyContent="flex-start" />
          <Divider />
          <form onKeyDown={disableFormEnter}>
            <div className={classes.root}>
              <Grid container spacing={2} justifyContent="flex-start">
                <Grid item xs={6} elevation={2}>
                  <TextFieldInForm
                    label="* Username"
                    name="UserName"
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
                        value: 10,
                        message: "maximum length is 10",
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={6} elevation={2}>
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
                            labelPlacement="start"
                            color="primary"
                          />
                        );
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} elevation={2}>
                  <TextFieldInForm
                    label="Email"
                    name="Email"
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
                <Grid item xs={12} elevation={2}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="label-bu" style={{ marginTop: bu == "" && -5 }}>
                      Business unit
                    </InputLabel>
                    <Select
                      variant="outlined"
                      margin="dense"
                      labelId="label-bu"
                      label="Business unit"
                      multiple
                      value={bu}
                      onChange={(e) => setBu(e.target.value)}
                      renderValue={(selected) => selected.join(", ")}
                      MenuProps={MenuProps}
                      disabled={mode === "view"}
                    >
                      {buList.map((item) => (
                        <MenuItem key={item} value={item}>
                          <Checkbox checked={bu.indexOf(item) > -1} />
                          <ListItemText primary={item} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} elevation={2}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="label-role" style={{ marginTop: permission == "" && -5 }}>
                      Role
                    </InputLabel>
                    <Select
                      variant="outlined"
                      margin="dense"
                      labelId="label-role"
                      label="Role"
                      value={permission}
                      onChange={(e) => setPermission(e.target.value)}
                      //renderValue={(selected) => selected.join(", ")}
                      MenuProps={MenuProps}
                      disabled={mode === "view"}
                    >
                      {permissionList.map((item, idx) => (
                        <MenuItem key={idx} value={item}>
                          {item}
                          {/* <Checkbox checked={permission.indexOf(item) > -1} />
                          <ListItemText primary={item} /> */}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
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
