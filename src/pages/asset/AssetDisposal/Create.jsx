/* eslint-disable eqeqeq */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useState, useEffect } from "react";
import { GblContext } from "providers/formatter";
import { useStateWithCallbackLazy } from "use-state-with-callback";
import { Loading, useRedirect } from "react-admin";
import { useForm } from "react-hook-form";
import { Paper, Grid, Typography, TextField, Divider, IconButton } from "@material-ui/core";
import NumberFormatInput from "components/NumberFormatInput";
import TextTopInGrid from "components/TextTopInGrid";
import ActionMenu from "components/ActionMenu";
import BoxHeader from "components/BoxHeader";
import ButtonFooter from "components/ButtonFooter";
import CardImage from "components/CardImage";
import DialogAssetRegister from "./DialogAssetRegister";
import SearchIcon from "@material-ui/icons/Search";
import PreviewImage from "assets/previewImage.png";
import InputAdornment from "@material-ui/core/InputAdornment";
import { createAssetDisDetail, getAssetRegDetail, getAssetDisposalAccuDepre } from "services/asset";
import Model from "models/assetDisposal";

const Create = (props) => {
  const classes = props.useStyles();
  const { DateToString, NumberFormat, ToNumber } = useContext(GblContext);
  const [openRegDialog, setOpenRegDialog] = useState(false);
  const redirect = useRedirect();
  const { basePath, formFieldsSale, formFieldsDisposal, formFieldsAccount, regId } = props;
  const [loading, setLoading] = useState(false);
  const [remainValue, setRemainValue] = useState();
  const [initData, setInitData] = useStateWithCallbackLazy(Model);
  const [regData, setRegData] = useState();

  const menuControlProp = [
    { name: "Back", fnc: () => redirect("list", basePath) },
    { name: "Add", disabled: true },
    { name: "Edit", disabled: true },
    { name: "Delete", disabled: true },
    { name: "Print", disabled: true },
  ];

  const methods = useForm({ defaultValues: initData });

  const { handleSubmit, getValues, reset } = methods;

  const disableFormEnter = (e) => {
    if (e.key === "Enter" && e.target.localName !== "textarea") e.preventDefault();
  };

  const onSubmit = () => {
    const values = getValues();
    setInitData(
      (state) => ({
        ...state,
        ...values,
        Name: regData.Name,
        ReduceAmt: values["Type"] === "Quantity" ? 0 : values["AstAmt"],
      }),
      (nextState) => Save(nextState)
    );
  };

  const CalculateDisposal = (type, disposalDate, astAmt, saleQty) => {
    if (type === "Quantity") {
      methods.setValue("TotalCost", astAmt * saleQty);
    }
    if (type === "Amount") {
      methods.setValue("TotalCost", astAmt);
    }
    let paramAstDisposalQuery = {
      DisposalDate: disposalDate,
      Id: remainValue["Id"],
      No: remainValue["No"],
      Type: type,
      Qty: saleQty,
      ReduceAmt: astAmt,
    };
    GetDataWhenChangeAstNo(paramAstDisposalQuery);
  };

  const UpdateForm = (e) => {
    const values = getValues();
    let type = values["Type"];
    let disposalDate = values["DisposalDate"];
    let saleQty = ToNumber(values["Qty"]);
    let astAmt = ToNumber(values["AstAmt"]);
    let saleAmt = ToNumber(values["SaleAmt"]);
    let saleNetBook = ToNumber(values["NetBook"]);

    if (e.target?.name === "Type") {
      let dType = e.target?.value;
      methods.setValue("Type", dType);
      if (dType === "Quantity") {
        methods.setValue("Qty", remainValue["Available"]);
        CalculateDisposal(dType, disposalDate, astAmt, remainValue["Available"]);
      }
      if (dType === "Amount") {
        if (remainValue["Available"] > 1) {
          alert("This version not support asset Qty. more than 1 unit");
          methods.setValue("Type", "Quantity");
          return;
        } else {
          methods.setValue("Qty", 0);
          CalculateDisposal(dType, disposalDate, astAmt, 0);
        }
      }
    }

    if (e.target === undefined) {
      let newDisposalDate = e;
      setInitData((state) => ({
        ...state,
        DisposalDate: newDisposalDate,
      }));
      methods.setValue("DisposalDate", newDisposalDate);
      CalculateDisposal(type, newDisposalDate, astAmt, saleQty);
      methods.clearErrors("Qty");
    }

    if (e.target?.name === "SaleAmt") {
      methods.setValue("GainLossAmt", saleAmt - saleNetBook);
      setInitData((state) => ({
        ...state,
        SaleAmt: saleAmt,
        GainLossAmt: saleAmt - saleNetBook,
      }));

      CheckAccount();
    }

    if (e.target?.name === "Qty" && saleQty > 0 && saleQty <= remainValue["Available"]) {
      CalculateDisposal(type, disposalDate, astAmt, saleQty);
      methods.clearErrors("Qty");
    }

    if ((e.target?.name === "Qty" && saleQty <= 0) || saleQty > remainValue["Available"]) {
      methods.setError("Qty", {
        type: "min",
        message: "Qty must be less than availiable",
      });
    }
  };

  const CheckAccount = () => {
    const vGlDept = methods.watch("GainLostDeptCode");
    const vGlAcc = methods.watch("GainLostAccCode");
    const vSaleDept = methods.watch("SaleDeptCode");
    const vSaleAcc = methods.watch("SaleAccCode");

    if (!vGlDept) {
      methods.setError("GainLostDeptCode", {
        type: "required",
        message: "*Required",
      });
    } else {
      methods.clearErrors("GainLostDeptCode");
    }
    if (!vGlAcc) {
      methods.setError("GainLostAccCode", {
        type: "required",
        message: "*Required",
      });
    } else {
      methods.clearErrors("GainLostAccCode");
    }
    if (!vSaleDept) {
      methods.setError("SaleDeptCode", {
        type: "required",
        message: "*Required",
      });
    } else {
      methods.clearErrors("SaleDeptCode");
    }
    if (!vSaleAcc) {
      methods.setError("SaleAccCode", {
        type: "required",
        message: "*Required",
      });
    } else {
      methods.clearErrors("SaleAccCode");
    }

    if (ToNumber(methods.watch("GainLossAmt")) === 0) {
      methods.clearErrors("GainLostDeptCode");
      methods.clearErrors("GainLostAccCode");
    }
  };

  const fetchAssetRegItem = async (id) => {
    setLoading(true);
    //setNewRegId
    let newRegId = regId;
    if (id) {
      newRegId = id;
    }
    const response = await getAssetRegDetail(newRegId);
    if (response) {
      setRegData(response);

      let paramAstDisposalQuery = {
        DisposalDate: new Date(initData.DisposalDate),
        Id: response.Id,
        No: response.No,
        Type: initData.Type,
        Qty: initData.Qty,
        ReduceAmt: initData.AstAmt,
      };

      GetDataWhenChangeAstNo(paramAstDisposalQuery);
      localStorage.removeItem("regId");
    }
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const GetDataWhenChangeAstNo = async (param) => {
    const resRemainValue = await getAssetDisposalAccuDepre(param);
    if (resRemainValue) {
      resRemainValue.totalValue = resRemainValue.LastCost * resRemainValue.Available;

      resRemainValue.nbv = resRemainValue.totalValue - resRemainValue.AccuDepre;
      setRemainValue(resRemainValue);

      let totalCost = resRemainValue.Qty > 0 ? resRemainValue.LastCost * resRemainValue.Qty : resRemainValue.LastCost;
      let saleNetBook = totalCost - resRemainValue.AccuDepre;

      setInitData(
        (state) => ({
          ...state,
          Type: resRemainValue.Type,
          Id: resRemainValue.Id,
          No: resRemainValue.No,
          Qty: resRemainValue.Qty,
          AstAmt: resRemainValue.LastCost,
          TotalCost: totalCost,
          NetBook: saleNetBook,
          LastCost: resRemainValue.LastCost,
          Depre: resRemainValue.AccuDepre,
          AccuDepreAmt: resRemainValue.AccuDepre,
          GainLossAmt: state.SaleAmt - saleNetBook,
        }),
        (nextState) => {
          reset(nextState);
          if (nextState.GainLossAmt !== 0) {
            methods.setError("GainLostDeptCode", {
              type: "required",
              message: "*Required",
            });
            methods.setError("GainLostAccCode", {
              type: "required",
              message: "*Required",
            });
          }
          if (!nextState.SaleDeptCode) {
            methods.setError("SaleDeptCode", {
              type: "required",
              message: "*Required",
            });
          }
          if (!nextState.SaleAccCode) {
            methods.setError("SaleAccCode", {
              type: "required",
              message: "*Required",
            });
          }
        }
      );
    }
  };

  const FindAssetRegisterById = () => {
    setOpenRegDialog(true);
  };

  const CloseRegisterDialog = (regId) => {
    setOpenRegDialog(false);
    if (regId) {
      fetchAssetRegItem(regId);
    }
  };

  useEffect(() => {
    if (regId != 0) {
      fetchAssetRegItem();
    } else {
      redirect("list", basePath);
    }
  }, []);

  const Save = async (values) => {
    console.log(values);
    const { Code, InternalMessage } = await createAssetDisDetail(values);
    if (Code === 0) {
      redirect(`${InternalMessage}/show`);
    }
  };

  const CancelFnc = () => {
    redirect("list", basePath);
  };

  if (loading) return <Loading />;
  if (!initData) return null;

  const RegisterValue = () => {
    if (regData) {
      return (
        <Grid container justifyContent="flex-start" alignItems="flex-start" spacing={1} style={{ marginBottom: 12 }}>
          <Grid item xs={12} sm={4}>
            <TextField
              name="AssetNo"
              label="AssetNo"
              variant="outlined"
              margin="dense"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton aria-label="Find Asset Register" onClick={FindAssetRegisterById}>
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              inputProps={{
                readOnly: true,
              }}
              value={`${regData.Id}-${regData.No}`}
            />
          </Grid>
          <TextTopInGrid sizeXs={12} sizeSm={8} label="Name" value={regData.Name} />
          <TextTopInGrid sizeXs={12} sizeSm={4} label="Input Date" value={DateToString(regData.InputDate)} />
          <TextTopInGrid
            sizeXs={12}
            sizeSm={4}
            label="Category"
            value={`${regData.CategoryCode} : ${regData.AstCateDesc}`}
          />
          <TextTopInGrid
            sizeXs={12}
            sizeSm={4}
            label="Department"
            value={`${regData.DepartmentCode} : ${regData.AstDeptDesc}`}
          />
          <TextTopInGrid sizeXs={12} sizeSm={4} label="Acquire Date" value={DateToString(regData.AcquireDate)} />
          <TextTopInGrid sizeXs={12} sizeSm={4} label="Serial No." value={regData.SerialNo} />
          <TextTopInGrid
            sizeXs={12}
            sizeSm={4}
            label="Location"
            value={`${regData.LocationCode} : ${regData.AstLocDesc}`}
          />
          <TextTopInGrid sizeXs={12} sizeSm={4} label="Specification" value={regData.Spec} />
          <TextTopInGrid sizeXs={12} sizeSm={4} label="Remark" value={regData.Remark} />
        </Grid>
      );
    } else {
      return "";
    }
  };

  const RegisterAccount = () => {
    if (regData) {
      return (
        <Grid container justifyContent="flex-start" alignItems="flex-start" spacing={1} style={{ marginBottom: 12 }}>
          <TextTopInGrid
            sizeXs={12}
            sizeSm={6}
            label="Asset Department"
            value={`${regData.CostDeptCode} : ${regData.CostDeptDesc}`}
          />
          <TextTopInGrid
            sizeXs={12}
            sizeSm={6}
            label="Accu Department"
            value={`${regData.AccuDeptCode} : ${regData.AccuDeptDesc}`}
          />
          <TextTopInGrid
            sizeXs={12}
            sizeSm={6}
            label="Asset Account"
            value={`${regData.CostAccCode} : ${regData.CostAccDesc}`}
          />
          <TextTopInGrid
            sizeXs={12}
            sizeSm={6}
            label="Accu Account"
            value={`${regData.AccuAccCode} : ${regData.AccuAccDesc}`}
          />
        </Grid>
      );
    } else {
      return "";
    }
  };

  const TextFieldNumber = (props) => {
    return (
      <TextField
        fullWidth
        {...props}
        variant="filled"
        margin="dense"
        InputProps={{
          inputComponent: NumberFormatInput,
        }}
        inputProps={{
          style: { textAlign: "right" },
          decimal: 2,
          readOnly: true,
        }}
        style={{ marginBottom: 12.5 }}
      />
    );
  };

  return (
    <div>
      <ActionMenu menuControl={menuControlProp} />

      <form onSubmit={handleSubmit(onSubmit)} onKeyDown={disableFormEnter}>
        <Paper style={{ padding: 16 }}>
          <BoxHeader header={"Asset Disposal"} />
          <Grid container spacing={1} style={{ marginBottom: 12 }}>
            <Grid item xs={9}>
              <RegisterValue />
            </Grid>
            <Grid item xs={3}>
              {regData?.AstPhoto ? <CardImage base64Src={regData.AstPhoto} /> : <CardImage imgSrc={PreviewImage} />}
            </Grid>
          </Grid>
          <Divider style={{ marginBottom: 12 }} />

          <Grid container alignItems="flex-start" spacing={1} style={{ marginBottom: 12 }}>
            <Grid item xs={4}>
              <Typography className={classes.heading}>Remain Value @ {DateToString(new Date())}</Typography>
              <br />
              <TextFieldNumber name="LastCost" label="LastCost" value={NumberFormat(remainValue?.LastCost ?? 0)} />
              <TextFieldNumber name="Qty" label="Qty" value={NumberFormat(remainValue?.Available ?? 0, "qty")} />
              <TextFieldNumber
                name="TotalValue"
                label="TotalValue"
                value={NumberFormat(remainValue?.totalValue ?? 0)}
              />
              <TextFieldNumber
                name="AccuDepreAmt"
                label="Accu. Depre"
                value={NumberFormat(remainValue?.AccuDepre ?? 0)}
              />
              <TextFieldNumber name="NetBookValue" label="Net Book Value" value={NumberFormat(remainValue?.nbv ?? 0)} />
            </Grid>
            <Grid item xs={4}>
              <Typography className={classes.heading}>Disposal Value</Typography>
              <br />
              <Grid container alignItems="flex-start" spacing={1} style={{ marginBottom: 12 }}>
                {formFieldsDisposal
                  ? formFieldsDisposal.map((item, idx) => (
                      <Grid item xs={item.size} key={idx} style={item.style}>
                        {item.field.props.name == "AstAmt" || item.field.props.name == "Qty"
                          ? React.createElement(item.field.type, {
                              ...{
                                ...item.field.props,
                                methods,
                                key: item.field.props.name,
                                onChange: UpdateForm,
                                forceSetReadOnly: methods.watch("Type") === "Amount" ? true : false,
                              },
                            })
                          : React.createElement(item.field.type, {
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
            <Grid item xs={4}>
              <Typography className={classes.heading}>Sale Value</Typography>
              <br />
              <Grid container alignItems="flex-start" spacing={1} style={{ marginTop: 97 }}>
                {formFieldsSale
                  ? formFieldsSale.map((item, idx) => (
                      <Grid item xs={item.size} key={idx} style={item.style}>
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
          </Grid>
          <Divider style={{ marginBottom: 12 }} />

          <Grid container alignItems="center" spacing={1}>
            <Grid item xs={12}>
              <Typography className={classes.heading}>Asset Account</Typography>
              <br />
              <RegisterAccount />
            </Grid>
            <Grid item xs={12}>
              <Typography className={classes.heading}>Disposal Account</Typography>
              <br />
              <Grid container alignItems="center" spacing={1} style={{ marginBottom: 12 }}>
                {formFieldsAccount
                  ? formFieldsAccount.map((item, idx) => (
                      <Grid item xs={item.size} key={idx} style={item.style}>
                        {React.createElement(item.field.type, {
                          ...{
                            ...item.field.props,
                            methods,
                            key: item.field.props.name,
                            onChange: CheckAccount,
                          },
                        })}
                      </Grid>
                    ))
                  : ""}
              </Grid>
            </Grid>
          </Grid>
        </Paper>
        <DialogAssetRegister open={openRegDialog} onClose={CloseRegisterDialog} basePath={basePath} />
        <pre>{process.env.NODE_ENV === "development" ? JSON.stringify(initData, 0, 2) : ""}</pre>
        <ButtonFooter CancelFnc={CancelFnc} />
      </form>
    </div>
  );
};

export default Create;
