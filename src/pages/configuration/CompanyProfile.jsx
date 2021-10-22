/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState } from "react";
import { useStateWithCallbackLazy } from "use-state-with-callback";
import { useForm } from "react-hook-form";
import { makeStyles } from "@material-ui/core/styles";
import { Box, Grid, Typography, Divider } from "@material-ui/core";
import ActionMenu from "components/ActionMenu";
import ButtonFooter from "components/ButtonFooter";
import {
  TextFieldInForm,
  // NumberFormatInForm,
  // MuiAutosuggest,
  DateInForm,
  // DescInForm,
  // SelectInForm,
  // CheckBoxInForm,
} from "components/Form";
import CardImage from "components/CardImage";
import PreviewImage from "assets/previewImage.png";
import { getCompany, updateCompany } from "services/setting";
import Model from "models/company";
import SnackbarUtils from "utils/SnackbarUtils";

const useStyles = makeStyles((theme) => ({
  tabPanel: { width: "100%", margin: "0 20px" },
  button: { textTransform: "none" },
}));

const CompanyProfile = (props) => {
  const { children, value, index, ...other } = props;
  const classes = useStyles();
  const [mode, setMode] = useState("view");
  const [data, setData] = useStateWithCallbackLazy(Model);
  const methods = useForm({ defaultValues: data });

  const { handleSubmit, reset } = methods;

  const fetch = async () => {
    const response = await getCompany();
    if (response) {
      response.mergeHotelAddress = `${data.HotelAdd1}\n${data.HotelAdd2}\n${data.HotelAdd3}`;
      response.mergeRegAddress = `${data.RegAdd1}\n${data.RegAdd2}\n${data.RegAdd3}`;
      setData(response);
      reset(response);
    } else {
      setData();
    }
  };

  React.useEffect(() => {
    if (value === index) {
      fetch();
    }
  }, [value]);

  const disableFormEnter = (e) => {
    if (e.key === "Enter" && e.target.localName !== "textarea") e.preventDefault();
  };

  const onSubmit = async (values) => {
    values.Logo = data.Logo;
    let vnHotelAddress = values.mergeHotelAddress.split("\n");
    let vnRegAddress = values.mergeRegAddress.split("\n");
    //adjust address
    values.HotelAdd1 = vnHotelAddress[0] ?? "";
    values.HotelAdd2 = vnHotelAddress[1] ?? "";
    values.HotelAdd3 = vnHotelAddress[2] ?? "";

    values.RegAdd1 = vnRegAddress[0] ?? "";
    values.RegAdd2 = vnRegAddress[1] ?? "";
    values.RegAdd3 = vnRegAddress[2] ?? "";
    const { Code, UserMessage } = await updateCompany(values);
    if (Code === 0) {
      SnackbarUtils.success(UserMessage);
      setMode("view");
      fetch();
    } else {
      SnackbarUtils.warning(UserMessage);
    }
  };

  const menuControlProp = [
    {
      name: "Edit",
      fnc: () => {
        setMode("edit");
      },
    },
  ];

  const CancelFnc = () => {
    fetch();
    setMode("view");
  };

  const UploadImg = (e) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result.replace("data:", "").replace(/^.+,/, "");
      setData((state) => ({
        ...state,
        Logo: base64String,
      }));
      methods.trigger();
    };
    reader.readAsDataURL(e.target.files[0]);
  };

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
      className={classes.tabPanel}
    >
      {value === index && (
        <>
          <ActionMenu justifyContent="flex-end" menuControl={menuControlProp} />
          <Divider />
          <form onSubmit={handleSubmit(onSubmit)} onKeyDown={disableFormEnter}>
            <Grid container spacing={1}>
              {mode !== "view" && (
                <Grid item xs={12} md={12} style={{ textAlign: "center", marginLeft: "5vw", marginTop: "2vh" }}>
                  <input type="file" onChange={UploadImg}></input>
                </Grid>
              )}

              <Grid item xs={12} md={12} style={{ textAlign: "center" }}>
                {data?.Logo ? (
                  <CardImage base64Src={data.Logo} noBorder={true} customSize={{ width: 200 }} />
                ) : (
                  <CardImage imgSrc={PreviewImage} noBorder={true} customSize={{ width: 200 }} />
                )}
              </Grid>
            </Grid>
            <Box p={1}>
              <Typography variant="h6">Hotel Information</Typography>
            </Box>
            <Grid container alignItems="flex-start" spacing={1}>
              <Grid item xs={12} md={6}>
                <TextFieldInForm
                  label="HotelName"
                  name="HotelName"
                  variant="outlined"
                  margin="dense"
                  methods={methods}
                  InputProps={{
                    readOnly: mode === "view",
                  }}
                  //disabled={mode === "view"}
                  rule={{
                    maxLength: {
                      value: 60,
                      message: "maximun length is 60",
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextFieldInForm
                  label="Tel"
                  name="HotelTel"
                  variant="outlined"
                  margin="dense"
                  methods={methods}
                  InputProps={{
                    readOnly: mode === "view",
                  }}
                  //disabled={mode === "view"}
                  rule={{
                    maxLength: {
                      value: 20,
                      message: "maximun length is 20",
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextFieldInForm
                  label="Email"
                  name="HotelEmail"
                  variant="outlined"
                  margin="dense"
                  methods={methods}
                  InputProps={{
                    readOnly: mode === "view",
                  }}
                  //disabled={mode === "view"}
                  rule={{
                    maxLength: {
                      value: 60,
                      message: "maximun length is 60",
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextFieldInForm
                  label="Address"
                  name="mergeHotelAddress"
                  variant="outlined"
                  margin="dense"
                  methods={methods}
                  InputProps={{
                    readOnly: mode === "view",
                  }}
                  multiline
                  rows={5}
                  rule={{
                    maxLength: {
                      value: 100,
                      message: "maximun length is 100",
                    },
                  }}
                />
              </Grid>
            </Grid>

            <Box p={1}>
              <Typography variant="h6">Company Information</Typography>
            </Box>
            <Grid container alignItems="flex-start" spacing={1}>
              <Grid item xs={12} md={6}>
                <TextFieldInForm
                  label="RegName"
                  name="RegName"
                  variant="outlined"
                  margin="dense"
                  methods={methods}
                  disabled={true}
                  rule={{
                    maxLength: {
                      value: 60,
                      message: "maximun length is 60",
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextFieldInForm
                  label="Tel"
                  name="RegTel"
                  variant="outlined"
                  margin="dense"
                  methods={methods}
                  InputProps={{
                    readOnly: mode === "view",
                  }}
                  //disabled={mode === "view"}
                  rule={{
                    maxLength: {
                      value: 20,
                      message: "maximun length is 20",
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextFieldInForm
                  label="Email"
                  name="RegEmail"
                  variant="outlined"
                  margin="dense"
                  methods={methods}
                  InputProps={{
                    readOnly: mode === "view",
                  }}
                  //disabled={mode === "view"}
                  rule={{
                    maxLength: {
                      value: 60,
                      message: "maximun length is 60",
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextFieldInForm
                  label="Company Reg. Id"
                  name="RegId"
                  variant="outlined"
                  margin="dense"
                  methods={methods}
                  InputProps={{
                    readOnly: mode === "view",
                  }}
                  //disabled={mode === "view"}
                  rule={{
                    maxLength: {
                      value: 20,
                      message: "maximun length is 20",
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextFieldInForm
                  label="Tax ID."
                  name="RegTaxId"
                  variant="outlined"
                  margin="dense"
                  methods={methods}
                  disabled={true}
                  rule={{
                    maxLength: {
                      value: 30,
                      message: "maximun length is 30",
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextFieldInForm
                  label="Branch No"
                  name="BranchNo"
                  variant="outlined"
                  margin="dense"
                  methods={methods}
                  InputProps={{
                    readOnly: mode === "view",
                  }}
                  //disabled={mode === "view"}
                  rule={{
                    maxLength: {
                      value: 20,
                      message: "maximun length is 20",
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DateInForm label="Reg Date" name="RegDate" methods={methods} disabled={mode === "view"} />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextFieldInForm
                  label="Address"
                  name="mergeRegAddress"
                  variant="outlined"
                  margin="dense"
                  methods={methods}
                  InputProps={{
                    readOnly: mode === "view",
                  }}
                  multiline
                  rows={5}
                  rule={{
                    maxLength: {
                      value: 100,
                      message: "maximun length is 100",
                    },
                  }}
                />
              </Grid>
            </Grid>
            {mode !== "view" && <ButtonFooter CancelFnc={CancelFnc} />}
          </form>
        </>
      )}
    </div>
  );
};

export default CompanyProfile;
