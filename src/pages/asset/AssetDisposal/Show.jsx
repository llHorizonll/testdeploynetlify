import React, { useContext, useState, useEffect, useCallback } from "react";
import { GblContext } from "providers/formatter";
import { Loading, Error, useRedirect } from "react-admin";
import { Paper, Grid, Typography, Divider } from "@material-ui/core";
import TextTopInGrid from "components/TextTopInGrid";
import CardImage from "components/CardImage";
import ActionMenu from "components/ActionMenu";
import BoxHeader from "components/BoxHeader";
import { permissionName } from "utils/constants";
import {
  getAssetDisDetail,
  getAssetDisposalAccuDepre,
  getAssetRegisterSearchList,
  delAssetDisDetail,
} from "services/asset";
import DialogAssetRegister from "./DialogAssetRegister";
import ModelUriQueryString from "models/uriQueryString";

const Show = (props) => {
  const classes = props.useStyles();
  const { DateToString, NumberFormat } = useContext(GblContext);
  const { basePath, id, permissions } = props;
  const redirect = useRedirect();
  const [data, setData] = useState();
  const [remainValue, setRemainValue] = useState();
  const [regData, setRegData] = useState();
  const [loading, setLoading] = useState(true);
  const [error] = useState();

  const menuControlProp = [
    { name: "Back", fnc: () => redirect("list", basePath) },
    { name: "Add", fnc: props.FncAddButton },
    { name: "Edit", fnc: () => redirect("edit", basePath, id) },
    { name: "Delete", fnc: () => DelOrVoid() },
    { name: "Print" },
  ];

  const fetchAssetById = useCallback(
    async (mounted) => {
      const response = await getAssetDisDetail(id);
      if (response) {
        setData(response);
        let paramAstDisposalQuery = {
          DisposalDate: response.DisposalDate,
          Id: response.Id,
          No: response.No,
          Type: response.Type,
          Qty: response.Qty,
          ReduceAmt: response.AstAmt,
        };
        const resRemainValue = await getAssetDisposalAccuDepre(paramAstDisposalQuery);
        if (resRemainValue) {
          resRemainValue.available = resRemainValue.Available + resRemainValue.Qty;
          resRemainValue.totalValue = resRemainValue.LastCost * resRemainValue.available;
          resRemainValue.nbv = resRemainValue.totalValue - resRemainValue.AccuDepre;
          setRemainValue(resRemainValue);
        }
        let whereRaw = `AstId = '${response.Id}' and AstNo = '${response.No}'`;

        let excludeModel = [
          "Barcode",
          "Spec",
          "SerialNo",
          "AstPhoto",
          "CurRate",
          "Qty",
          "Salvage",
          "InitAccu",
          "TotalCost",
          "Life",
          "LifeType",
          "RemainDay",
          "RemainNet",
          "RemainTotalCost",
          "DimList",
          "RemainInfo",
        ];

        const resRegisterAccount = await getAssetRegisterSearchList({
          Limit: ModelUriQueryString.Limit,
          Page: ModelUriQueryString.Page,
          OrderBy: ModelUriQueryString.OrderBy,
          WhereGroupList: ModelUriQueryString.WhereGroupList,
          Exclude: excludeModel,
          WhereRaw: whereRaw,
          WhereLike: ModelUriQueryString.WhereLike,
          WhereLikeFields: ModelUriQueryString.WhereLikeFields,
        });

        //find assetgister follow whereraw AstId,AstNo
        if (resRegisterAccount) {
          setRegData(resRegisterAccount.Data[0]);
        }
        if (mounted) {
          setLoading(false);
        }
      }
    },
    [id]
  );

  useEffect(() => {
    let mounted = true;
    fetchAssetById(mounted);
    return function cleanup() {
      mounted = false;
    };
  }, [fetchAssetById]);

  const DelOrVoid = async () => {
    let msg = "Confirm deletion ?";
    let dialog = window.confirm(msg);
    if (dialog) {
      const { Code, InternalMessage } = await delAssetDisDetail(id);
      if (Code === 0) {
        redirect("list", basePath);
      } else {
        console.log(InternalMessage, "InternalMessage");
      }
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error />;
  if (!data) return null;

  const RemainValue = () => {
    if (remainValue) {
      return (
        <Grid container alignItems="flex-start" direction="column" spacing={1} style={{ marginBottom: 12 }}>
          <TextTopInGrid sizeXs={12} sizeSm={12} label="LastCost" value={NumberFormat(remainValue.LastCost)} />
          <TextTopInGrid sizeXs={12} sizeSm={12} label="Qty" value={NumberFormat(remainValue.available, "qty")} />
          <TextTopInGrid sizeXs={12} sizeSm={12} label="Total Value" value={NumberFormat(remainValue.totalValue)} />
          <TextTopInGrid sizeXs={12} sizeSm={12} label="Accu Depre." value={NumberFormat(remainValue.AccuDepre)} />
          <TextTopInGrid sizeXs={12} sizeSm={12} label="Net Book Value" value={NumberFormat(remainValue.nbv)} />
        </Grid>
      );
    } else {
      return "";
    }
  };

  const DisposalValue = () => {
    return (
      <Grid container alignItems="flex-start" direction="column" spacing={1} style={{ marginBottom: 12 }}>
        <TextTopInGrid sizeXs={12} sizeSm={12} label="Disposal Type" value={data.Type} />
        <TextTopInGrid sizeXs={12} sizeSm={12} label="Disposal Date" value={DateToString(data.DisposalDate)} />
        <TextTopInGrid sizeXs={12} sizeSm={12} label="Amount/Unit" value={NumberFormat(data.AstAmt, "unit")} />
        <TextTopInGrid sizeXs={12} sizeSm={12} label="Qty" value={NumberFormat(data.Qty, "qty")} />
        <TextTopInGrid sizeXs={12} sizeSm={12} label="Total Asset Value" value={NumberFormat(data.AstAmt * data.Qty)} />
      </Grid>
    );
  };

  const SaleValue = () => {
    return (
      <Grid container alignItems="flex-start" direction="column" spacing={1} style={{ marginBottom: 12 }}>
        <TextTopInGrid sizeXs={12} sizeSm={12} label="Sale Amount" value={NumberFormat(data.SaleAmt)} />
        <TextTopInGrid
          sizeXs={12}
          sizeSm={12}
          label="Net Book Value"
          value={NumberFormat(data.AstAmt - remainValue?.AccuDepre ?? 0)}
        />
        <TextTopInGrid
          sizeXs={12}
          sizeSm={12}
          label="Gain/Loss Amount"
          value={NumberFormat(data.SaleAmt - (data.AstAmt - remainValue?.AccuDepre ?? 0))}
        />
      </Grid>
    );
  };

  const CheckCodeNull = (code, desc) => {
    if (code) {
      return `${code} : ${desc}`;
    } else {
      return "";
    }
  };

  const AssetAccount1 = () => {
    if (regData) {
      return (
        <Grid container alignItems="flex-start" spacing={1} style={{ marginBottom: 12 }}>
          <TextTopInGrid
            sizeXs={12}
            sizeSm={6}
            label="Asset Department"
            value={CheckCodeNull(regData.CostDeptCode, regData.CostDeptDesc)}
          />
          <TextTopInGrid
            sizeXs={12}
            sizeSm={6}
            label="Accu Department"
            value={CheckCodeNull(regData.AccuDeptCode, regData.AccuDeptDesc)}
          />
          <TextTopInGrid
            sizeXs={12}
            sizeSm={6}
            label="Asset Account"
            value={CheckCodeNull(regData.CostAccCode, regData.CostAccDesc)}
          />
          <TextTopInGrid
            sizeXs={12}
            sizeSm={6}
            label="Accu Account"
            value={CheckCodeNull(regData.AccuAccCode, regData.AccuAccDesc)}
          />
        </Grid>
      );
    } else {
      return "";
    }
  };

  const AssetAccount2 = () => {
    return (
      <Grid container alignItems="flex-start" spacing={1} style={{ marginBottom: 12 }}>
        <TextTopInGrid
          sizeXs={12}
          sizeSm={6}
          label="Gain/Loss Department"
          value={CheckCodeNull(data.GainLostDeptCode, data.AstGlDeptDesc)}
        />
        <TextTopInGrid
          sizeXs={12}
          sizeSm={6}
          label="Sale Department"
          value={CheckCodeNull(data.SaleDeptCode, data.AstSaleDeptDesc)}
        />
        <TextTopInGrid
          sizeXs={12}
          sizeSm={6}
          label="Gain/Loss Account"
          value={CheckCodeNull(data.GainLostAccCode, data.AstGlAccDesc)}
        />
        <TextTopInGrid
          sizeXs={12}
          sizeSm={6}
          label="Sale Account"
          value={CheckCodeNull(data.SaleAccCode, data.AstSaleAccDesc)}
        />
      </Grid>
    );
  };

  return (
    <div>
      <ActionMenu
        menuControl={menuControlProp}
        permission={permissions.find((i) => i.Name === permissionName["Ast.Disposal"])}
      />

      <Paper className={classes.root}>
        <BoxHeader header={`Asset Disposal`} status={data.Status} />

        <Grid container alignItems="flex-start" spacing={1}>
          <Grid item xs={9}>
            <Grid container alignItems="flex-start" spacing={1} style={{ marginBottom: 12 }}>
              <TextTopInGrid sizeXs={2} sizeSm={4} label="Asset No." value={`${data.Id} - ${data.No}`} />
              <TextTopInGrid sizeXs={2} sizeSm={4} label="Name" value={data.Name} />
              <TextTopInGrid
                sizeXs={2}
                sizeSm={2}
                label="Input Date"
                value={DateToString(data.InputDate ?? new Date())}
              />
              <TextTopInGrid
                sizeXs={2}
                sizeSm={2}
                label="Acquire Date"
                value={DateToString(data.AcquireDate ?? new Date())}
              />
              <TextTopInGrid
                sizeXs={2}
                sizeSm={4}
                label="Category"
                value={`${data.CategoryCode} : ${data.AstCateDesc}`}
              />
              <TextTopInGrid
                sizeXs={2}
                sizeSm={4}
                label="Department"
                value={`${data.DepartmentCode} : ${data.AstDeptDesc}`}
              />
              <TextTopInGrid
                sizeXs={2}
                sizeSm={4}
                label="Location"
                value={`${data.LocationCode} : ${data.AstLocDesc}`}
              />

              <TextTopInGrid sizeXs={2} sizeSm={4} label="Serial No." value={data.SerialNo} />
              <TextTopInGrid sizeXs={2} sizeSm={4} label="Specification" value={data.Spec} />
              <TextTopInGrid sizeXs={2} sizeSm={4} label="Remark" value={data.Remark} />
            </Grid>
            <Divider />
            <Grid container alignItems="flex-start" spacing={1}>
              <Grid item xs={4}>
                <Typography className={classes.heading}>Remain Value @ {DateToString(data.DisposalDate)}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography className={classes.heading}>Disposal Value</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography className={classes.heading}>Sale Value</Typography>
              </Grid>
              <Grid item xs={4}>
                <RemainValue />
              </Grid>
              <Grid item xs={4}>
                <DisposalValue />
              </Grid>
              <Grid item xs={4}>
                <SaleValue />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={3}>
            <CardImage base64Src={data.AstPhoto} />
          </Grid>
        </Grid>
        <Divider />
        <Grid container alignItems="flex-start" spacing={1} style={{ margin: "12px 0" }}>
          <Grid item xs={12}>
            <AssetAccount1 />
          </Grid>
          <Grid item xs={12}>
            <AssetAccount2 />
          </Grid>
        </Grid>
      </Paper>

      <DialogAssetRegister open={props.open} onClose={props.onClose} basePath={basePath} />
      <pre>{process.env.NODE_ENV === "development" ? JSON.stringify(data, 0, 2) : ""}</pre>
    </div>
  );
};

export default Show;
