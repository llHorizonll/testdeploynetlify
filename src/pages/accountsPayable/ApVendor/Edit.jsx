/* eslint-disable eqeqeq */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useState, useEffect, useCallback } from "react";
import { GblContext } from "providers/formatter";
import { useStateWithCallbackLazy } from "use-state-with-callback";
import { Loading, useRedirect } from "react-admin";
import { Paper, Grid, Divider } from "@material-ui/core";
import { useForm } from "react-hook-form";
import BoxHeader from "components/BoxHeader";
import ButtonFooter from "components/ButtonFooter";
import ActionMenu from "components/ActionMenu";
import { getVendorDetail, updateVendorDetail } from "services/accountPayable";

const Edit = (props) => {
  const {
    basePath,
    id,
    formFieldsVendor,
    formFieldsInfo,
    formFieldsAddress,
    formFieldsBank,
    formFieldsInvoice,
    formFieldsPayment,
  } = props;
  const redirect = useRedirect();
  const [data, setData] = useStateWithCallbackLazy();
  const [loading, setLoading] = useState(true);
  const { ToNumber } = useContext(GblContext);
  const menuControlProp = [
    { name: "Back", fnc: () => redirect("list", basePath) },
    { name: "Add", disabled: true },
    { name: "Edit", disabled: true },
    { name: "Delete", disabled: true },
    { name: "Print", disabled: true },
  ];

  const methods = useForm({ defaultValues: data });
  const { handleSubmit, getValues, reset } = methods;

  const fetchVendorById = useCallback(async () => {
    setLoading(true);
    const response = await getVendorDetail(id);
    if (response) {
      response.mergeVnAdd = `${response.VnAdd1}\n${response.VnAdd2}\n${response.VnAdd3}\n${response.VnAdd4}`;
      response.mergeVn2Add = response.Vn2Add1
        ? `${response.Vn2Add1}\n${response.Vn2Add2}\n${response.Vn2Add3}\n${response.Vn2Add4}`
        : "";
      response.mergeBankRef = `${response.BankRef1}\n${response.BankRef2}\n${response.BankRef3}`;
      setData(response);
      reset(response);
    }
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, [id, reset]);

  useEffect(() => {
    fetchVendorById();
  }, [fetchVendorById]);

  const disableFormEnter = (e) => {
    if (e.key === "Enter" && e.target.localName !== "textarea") e.preventDefault();
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
      setData(
        (state) => ({
          ...state,
          ...values,
        }),
        (nextState) => Save(nextState)
      );
    }
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

  const Save = async (values) => {
    //Validate & CheckDetail
    setLoading(true);
    const { Code, InternalMessage } = await updateVendorDetail(values);
    if (Code === 0) {
      setLoading(false);
      redirect("show", basePath, id, values);
    } else {
      setLoading(false);
      console.log(id, InternalMessage);
    }
  };

  const CancelFnc = () => {
    redirect("show", basePath, id);
  };

  if (loading) return <Loading />;
  if (!data) return null;

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
          <ButtonFooter CancelFnc={CancelFnc} />
        </form>
      </Paper>
      <pre>{process.env.NODE_ENV === "development" ? JSON.stringify(data, 0, 2) : ""}</pre>
    </div>
  );
};

export default Edit;
