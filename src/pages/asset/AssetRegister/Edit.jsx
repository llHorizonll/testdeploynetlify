/* eslint-disable eqeqeq */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useState, useEffect, useCallback } from "react";
import { GblContext } from "providers/formatter";
import { useStateWithCallbackLazy } from "use-state-with-callback";
import clsx from "clsx";
import { Loading, useRedirect } from "react-admin";
import { Paper, Grid, Typography, Divider } from "@material-ui/core";
import { useForm } from "react-hook-form";
import ActionMenu from "components/ActionMenu";
import BoxHeader from "components/BoxHeader";
import ButtonFooter from "components/ButtonFooter";
import NavRight from "components/NavRightSide";
import CardImage from "components/CardImage";
import PreviewImage from "assets/previewImage.png";
import { getAssetRegDetail, updateAssetRegDetail } from "services/asset";

const Edit = (props) => {
  const classes = props.useStyles();
  const { settingAll, DateToString, NumberFormat, ToNumber } = useContext(GblContext);
  const { SettingClosePeriod } = settingAll;
  const { ClosePeriodAsset } = SettingClosePeriod;
  const redirect = useRedirect();
  const { basePath, id, formFields, formFieldsRegister, formFieldsRemainValue, formFieldsAccount } = props;
  const [data, setData] = useStateWithCallbackLazy();
  const [displayImg, setDisplayImg] = useState();
  const [loading, setLoading] = useState(true);

  const menuControlProp = [
    { name: "Back", fnc: () => redirect("list", basePath) },
    { name: "Add", disabled: true },
    { name: "Edit", disabled: true },
    { name: "Delete", disabled: true },
    { name: "Copy", disabled: true },
    { name: "Disposal", disabled: true },
    { name: "Print", disabled: true },
    { name: "Print BarCode", disabled: true },
  ];

  const methods = useForm({ defaultValues: data });

  const { handleSubmit, getValues, reset } = methods;

  const fetchAssetRegById = useCallback(async () => {
    setLoading(true);
    const response = await getAssetRegDetail(id);
    if (response) {
      let CurRate = ToNumber(response["CurRate"]);
      let Qty = ToNumber(response["Qty"]);
      let Salvage = ToNumber(response["Salvage"]);
      response.TotalSalvage = NumberFormat(Salvage * CurRate * Qty);
      var lifeType;
      switch (response["LifeType"]) {
        case 1:
          lifeType = "Month";
          break;
        case 2:
          lifeType = "Day";
          break;
        default:
          lifeType = "Year";
          break;
      }
      response.LifeType = lifeType;
      setData(response);
      reset(response);
    }
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, [id, reset]);

  useEffect(() => {
    fetchAssetRegById();
  }, [fetchAssetRegById]);

  const disableFormEnter = (e) => {
    if (e.key === "Enter" && e.target.localName !== "textarea") e.preventDefault();
  };

  const onSubmit = () => {
    const values = getValues();
    var lifeType;
    //Switch Value AssetLifeType
    switch (values["LifeType"]) {
      case "Month":
        lifeType = 1;
        break;
      case "Day":
        lifeType = 2;
        break;
      default:
        lifeType = 0;
        break;
    }
    //Adjust parameter before save
    setData(
      (state) => ({
        ...state,
        ...values,
        LifeType: lifeType,
      }),
      (nextState) => Save(nextState)
    );
  };

  const [openDim, setOpenDim] = useState(false);
  const [dataDim, setDataDim] = useState();

  const UpdateForm = (e) => {
    const values = getValues();
    let CurRate = ToNumber(values["CurRate"]);
    let Amount = ToNumber(values["Amount"]);
    let Qty = ToNumber(values["Qty"]);
    let InitAccu = ToNumber(values["InitAccu"]);
    let Salvage = ToNumber(values["Salvage"]);
    let TotalSalvage = NumberFormat(Salvage * CurRate * Qty);

    let BaseAmount = NumberFormat(Amount * CurRate);
    let TotalValue = NumberFormat(Amount * CurRate * Qty);
    let NetBookValue = NumberFormat(Amount * CurRate * Qty);

    methods.setValue("BaseAmount", BaseAmount);
    methods.setValue("TotalCost", TotalValue);
    methods.setValue("TotalSalvage", TotalSalvage);
    methods.setValue("RemainNet", ToNumber(NetBookValue) - InitAccu);
  };

  const Save = async (values) => {
    //Validate & CheckDetail
    console.log(values);
    const { Code, InternalMessage } = await updateAssetRegDetail(values);
    if (Code === 0) {
      redirect("show", basePath, id, values);
    } else {
      console.log(id, InternalMessage);
    }
  };

  const ShowDim = (values) => {
    if (!values) {
      setDataDim(data.DimList.Dim);
      setOpenDim(true);
    } else {
      setDataDim(values);
      setOpenDim(true);
    }
  };

  const CancelFnc = () => {
    redirect("show", basePath, id);
  };

  const UploadImg = (e) => {
    var d = URL.createObjectURL(e.target.files[0]);
    setDisplayImg(d);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result.replace("data:", "").replace(/^.+,/, "");
      setData((state) => ({
        ...state,
        AstPhoto: base64String,
      }));
      methods.trigger();
    };
    reader.readAsDataURL(e.target.files[0]);
  };

  if (loading) return <Loading />;
  if (!data) return null;

  return (
    <div
      className={clsx(classes.drawer, {
        [classes.drawerOpen]: openDim,
        [classes.drawerClose]: !openDim,
      })}
    >
      <ActionMenu menuControl={menuControlProp} />

      <form onSubmit={handleSubmit(onSubmit)} onKeyDown={disableFormEnter}>
        <Paper style={{ padding: 16 }}>
          <Grid container alignItems="center" justifyContent="center" spacing={1}>
            <Grid item xs={9}>
              <BoxHeader header={"Asset Register"} />
            </Grid>
            <Grid item xs={3}>
              <input type="file" onChange={UploadImg}></input>
            </Grid>
          </Grid>
          <Grid container alignItems="center" justifyContent="center" spacing={1} style={{ marginBottom: 12 }}>
            <Grid item xs={9}>
              <Grid container alignItems="flex-start" spacing={1} style={{ marginBottom: 12 }}>
                {formFields
                  ? formFields.map((item, idx) => (
                      <Grid item xs={item.size} key={idx} style={item.style}>
                        {React.createElement(item.field.type, {
                          ...{
                            ...item.field.props,
                            methods,
                            key: item.field.props.name,
                          },
                        })}
                      </Grid>
                    ))
                  : ""}
              </Grid>
            </Grid>
            <Grid item xs={3}>
              {data?.AstPhoto ? (
                <CardImage base64Src={data.AstPhoto} />
              ) : (
                <CardImage imgSrc={displayImg ? displayImg : PreviewImage} />
              )}
            </Grid>
          </Grid>
          <Divider style={{ marginBottom: 12 }} />

          <Grid container alignItems="flex-start" spacing={1} style={{ marginBottom: 12 }}>
            <Grid item xs={9}>
              <Typography className={classes.heading}>Register Value</Typography>
              <br />
              <Grid container alignItems="flex-start" spacing={1}>
                {formFieldsRegister
                  ? formFieldsRegister.map((item, idx) => (
                      <Grid item xs={item.size} key={idx}>
                        {React.createElement(item.field.type, {
                          ...{
                            ...item.field.props,
                            methods,
                            key: item.field.props.name,
                            onChange: UpdateForm,
                          },
                        })}
                      </Grid>
                    ))
                  : ""}
              </Grid>
            </Grid>
            <Grid item xs={3}>
              <Typography className={classes.heading}>Remain Value @ {DateToString(ClosePeriodAsset)}</Typography>
              <br />
              <Grid container alignItems="flex-start" spacing={1}>
                {formFieldsRemainValue
                  ? formFieldsRemainValue.map((item, idx) => (
                      <Grid item xs={item.size} key={idx}>
                        {React.createElement(item.field.type, {
                          ...{
                            ...item.field.props,
                            methods,
                            key: item.field.props.name,
                            //onChange: UpdateForm,
                          },
                        })}
                      </Grid>
                    ))
                  : ""}
              </Grid>
            </Grid>
          </Grid>
          <Typography className={classes.heading}>Asset Account</Typography>
          <br />
          <Grid container alignItems="center" justifyContent="center" spacing={1}>
            {formFieldsAccount
              ? formFieldsAccount.map((item, idx) => (
                  <Grid item xs={item.size} key={idx}>
                    {React.createElement(item.field.type, {
                      ...{
                        ...item.field.props,
                        methods,
                        key: item.field.props.name,
                      },
                    })}
                  </Grid>
                ))
              : ""}
          </Grid>
        </Paper>
        <pre>{process.env.NODE_ENV === "development" ? JSON.stringify(data, 0, 2) : ""}</pre>
        <ButtonFooter CancelFnc={CancelFnc} />
      </form>

      <NavRight
        open={openDim}
        close={() => setOpenDim(false)}
        ShowDim={() => ShowDim()}
        dataDim={dataDim}
        modify
        update={(item, value) => {
          dataDim.forEach((i) => {
            if (i.Id === item.Id) {
              i.Value = value;
              if (i.Type === "Date") {
                i.Value = new Date(value);
              }
            }
          });
          setDataDim(dataDim);
          methods.trigger();
        }}
      />
    </div>
  );
};

export default Edit;
