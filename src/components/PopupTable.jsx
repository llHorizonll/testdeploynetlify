import React, { useState, useEffect, useMemo } from "react";
import { useTranslate } from "react-admin";
import { makeStyles } from "@material-ui/core/styles";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import { useForm } from "react-hook-form";
import { Grid, Button, Box, Typography, Divider } from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import DimensionContent from "components/DimensionContent";

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

export default function PopupTable({
  children,
  open,
  save,
  cancel,
  initialValues,
  checkTaxType,
  update,
  formFields,
  showDim,
  maxWidth = "sm",
}) {
  const classes = useStyles();
  const translate = useTranslate();
  const methods = useForm({
    defaultValues: useMemo(() => {
      return initialValues;
    }, [initialValues]),
  });

  const { handleSubmit, getValues, watch, reset } = methods;
  const [disableBtn, setDisableBtn] = useState(false);

  useEffect(() => {
    reset(initialValues);
  }, [reset, initialValues]);

  const onSubmit = (newFormValue) => {
    if (checkTaxType) {
      checkTaxType(methods, newFormValue);
      if (Object.keys(methods.errors).length === 0) {
        const newArr = Object.assign({}, initialValues, newFormValue);
        save(newArr);
        setDisableBtn(true);
      }
    } else {
      const newArr = Object.assign({}, initialValues, newFormValue);
      save(newArr);
      setDisableBtn(true);
    }
  };

  const updateForm = (e) => {
    const values = getValues();
    update(e.target.name, methods, values);
  };

  return (
    <div>
      <Dialog open={open} onClose={cancel} scroll={"paper"} maxWidth={maxWidth} disableBackdropClick>
        <DialogTitle id="scroll-dialog-title">
          {initialValues?.index !== undefined ? "Edit" : "Add" || "Add"}
          {cancel ? (
            <IconButton aria-label="close" className={classes.closeButton} onClick={cancel}>
              <CloseIcon />
            </IconButton>
          ) : null}
        </DialogTitle>
        <DialogContent dividers className={classes.content}>
          <form>
            <div className={classes.root}>
              <Grid container spacing={1} justifyContent="space-around" alignItems="center">
                {formFields
                  ? formFields.map((item, idx) => (
                      <Grid item xs={item.size} key={idx}>
                        {React.createElement(item.field.type, {
                          ...{
                            ...item.field.props,
                            methods,
                            key: item.field.props.name,
                            onChange: updateForm,
                          },
                        })}
                      </Grid>
                    ))
                  : ""}
              </Grid>
            </div>
            {children}

            {showDim ? (
              <>
                <Divider />
                <Box style={{ margin: 30 }}>
                  <Typography variant="h6" className={classes.content}>
                    Dimension
                  </Typography>
                  <DimensionContent
                    data={initialValues?.DimList?.Dim}
                    update={(item, value) => {
                      let DimListDetail = initialValues?.DimList?.Dim;
                      [...DimListDetail].forEach((i) => {
                        if (i.Id === item.Id) {
                          i.Value = value;
                          if (i.Type === "Date") {
                            i.Value = new Date(value);
                          }
                        }
                      });
                      let Dim = {
                        Dim: DimListDetail,
                      };
                      methods.setValue("DimList", Dim);
                      methods.trigger();
                    }}
                    modify={true}
                  />
                </Box>
              </>
            ) : (
              ""
            )}
          </form>
          <pre>{process.env.NODE_ENV === "development" ? JSON.stringify(watch(), 0, 2) : ""}</pre>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            onClick={handleSubmit(onSubmit)}
            disabled={disableBtn}
          >
            {translate("ra.action.save")}
          </Button>
          <Button variant="outlined" onClick={cancel}>
            {translate("ra.action.cancel")}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
