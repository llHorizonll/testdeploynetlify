/* eslint-disable eqeqeq */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext } from "react";
import { GblContext } from "providers/formatter";
import { useStateWithCallbackLazy } from "use-state-with-callback";
import { useRedirect } from "react-admin";
import { Paper, Grid, Divider } from "@material-ui/core";
import { useForm } from "react-hook-form";
import BoxHeader from "components/BoxHeader";
import ButtonFooter from "components/ButtonFooter";
import ActionMenu from "components/ActionMenu";
import Model from "models/vendor";
import { createVendorDetail } from "services/accountPayable";

const Create = (props) => {
  const {
    basePath,
    formFieldsVendor,
    formFieldsInfo,
    formFieldsAddress,
    formFieldsBank,
    formFieldsInvoice,
    formFieldsPayment,
  } = props;
  const redirect = useRedirect();
  const [initData, setInitData] = useStateWithCallbackLazy(Model);
  const { ToNumber } = useContext(GblContext);

  const menuControlProp = [
    { name: "Back", fnc: () => redirect("list", basePath) },
    { name: "Add", disabled: true },
    { name: "Edit", disabled: true },
    { name: "Delete", disabled: true },
    { name: "Print", disabled: true },
  ];

  const methods = useForm({ defaultValues: initData });

  const { handleSubmit, getValues } = methods;

  const disableFormEnter = (e) => {
    if (e.key === "Enter" && e.target.localName !== "textarea") e.preventDefault();
  };

  const CheckVatType = () => {
    const VatType1 = getValues("VnVat1");
    const VatType2 = getValues("VnVat2");
    const VatType1Acc = getValues("VnVat1DrAccCode");
    const VatType2Acc = getValues("VnVat2DrAccCode");
    const VatRate1 = getValues("VnTaxR1");
    const VatRate2 = getValues("VnTaxR2");
    if (VatType1 !== "None" && !!VatType1Acc === false) {
      methods.setError("VnVat1DrAccCode", {
        type: "required",
        message: "* Required",
      });
    }
    if (VatType2 !== "None" && !!VatType2Acc === false) {
      methods.setError("VnVat2DrAccCode", {
        type: "required",
        message: "* Required",
      });
    }
    if (VatType1 !== "None" && ToNumber(VatRate1) === 0) {
      methods.setError("VnTaxR1", {
        type: "required",
        message: "* Required",
      });
    } else {
      methods.clearErrors("VnTaxR1");
    }
    if (VatType2 !== "None" && ToNumber(VatRate2) === 0) {
      methods.setError("VnTaxR2", {
        type: "required",
        message: "* Required",
      });
    } else {
      methods.clearErrors("VnTaxR2");
    }

    if (VatType1 === "None") {
      methods.setValue("VnVat1DrAccCode", "");
      methods.setValue("VnTaxR1", 0);
      methods.clearErrors("VnVat1DrAccCode");
      methods.clearErrors("VnTaxR1");
    }
    if (VatType2 === "None") {
      methods.setValue("VnVat2DrAccCode", "");
      methods.setValue("VnTaxR2", 0);
      methods.clearErrors("VnVat2DrAccCode");
      methods.clearErrors("VnTaxR2");
    }
    if (!!VatType1Acc) {
      methods.clearErrors("VnVat1DrAccCode");
    }
    if (!!VatType2Acc) {
      methods.clearErrors("VnVat2DrAccCode");
    }
  };

  const onSubmit = () => {
    CheckVatType();
    const values = getValues();
    let vnAddress1 = values.mergeVnAdd.split("\n");
    let vnAddress2 = values.mergeVn2Add.split("\n");
    let bankRef = values.mergeBankRef.split("\n");
    //adjust address
    values.VnAdd1 = vnAddress1[0] ?? "";
    values.VnAdd2 = vnAddress1[1] ?? "";
    values.VnAdd3 = vnAddress1[2] ?? "";
    values.VnAdd4 = vnAddress1[3] ?? "";
    values.Vn2Add1 = vnAddress2[0] ?? "";
    values.Vn2Add2 = vnAddress2[1] ?? "";
    values.Vn2Add3 = vnAddress2[2] ?? "";
    values.Vn2Add4 = vnAddress2[3] ?? "";
    //adjust bank
    values.BankRef1 = bankRef[0] ?? "";
    values.BankRef2 = bankRef[1] ?? "";
    values.BankRef3 = bankRef[2] ?? "";
    //Adjust parameter before save
    if (Object.keys(methods.errors).length === 0) {
      setInitData(
        (state) => ({
          ...state,
          ...values,
        }),
        (nextState) => Save(nextState)
      );
    }
  };

  const Save = async (values) => {
    //Validate & CheckDetail
    console.log(values, "save");
    const { Code, InternalMessage } = await createVendorDetail(values);
    if (Code === 0) {
      redirect(`${InternalMessage}/show`);
    }
  };

  return (
    <div>
      <ActionMenu menuControl={menuControlProp} />
      <Paper style={{ padding: 16 }}>
        <BoxHeader header={"Vendor"} />
        <form onSubmit={handleSubmit(onSubmit)} onKeyDown={disableFormEnter}>
          <Grid container spacing={1} justifyContent="flex-start">
            {formFieldsVendor
              ? formFieldsVendor.map((item, idx) => (
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
          <Divider style={{ margin: "10px 0" }} />
          <BoxHeader header={"Information"} />
          <Grid container spacing={1} justifyContent="flex-start">
            {formFieldsInfo
              ? formFieldsInfo.map((item, idx) => (
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
          <Grid container spacing={1} justifyContent="flex-start">
            {formFieldsAddress
              ? formFieldsAddress.map((item, idx) => (
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
          <Divider style={{ margin: "10px 0" }} />

          <Grid container spacing={1}>
            <Grid item xs={6}>
              <BoxHeader header={"Invoice Default"} />
            </Grid>
            <Grid item xs={6}>
              <BoxHeader header={"Payment Default"} />
            </Grid>
            <Grid container item xs={6} spacing={1} justifyContent="flex-start">
              {formFieldsInvoice
                ? formFieldsInvoice.map((item, idx) => (
                    <Grid item xs={item.size} key={idx}>
                      {React.createElement(item.field.type, {
                        ...{
                          ...item.field.props,
                          methods,
                          key: item.field.props.name,
                          onChange: CheckVatType,
                        },
                      })}
                    </Grid>
                  ))
                : ""}
            </Grid>

            <Grid container item xs={6} spacing={1} justifyContent="flex-start">
              {formFieldsPayment
                ? formFieldsPayment.map((item, idx) => (
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
          </Grid>
          <Divider style={{ margin: "10px 0" }} />
          <BoxHeader header={"AutoPay Information"} />
          <Grid container spacing={1} justifyContent="flex-start">
            {formFieldsBank
              ? formFieldsBank.map((item, idx) => (
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
          <ButtonFooter CancelFnc={() => redirect("list", basePath)} />
        </form>
      </Paper>
      <pre>{process.env.NODE_ENV === "development" ? JSON.stringify(initData, 0, 2) : ""}</pre>
    </div>
  );
};

export default Create;
