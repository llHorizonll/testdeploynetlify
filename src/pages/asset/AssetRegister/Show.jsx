import React, { useContext, useState, useEffect, useCallback } from "react";
import { GblContext } from "providers/formatter";
import clsx from "clsx";
import { withStyles } from "@material-ui/core/styles";
import { Loading, Error, useRedirect, withTranslate } from "react-admin";
import { Paper, Grid, Typography, Divider, Tabs, Tab, Button } from "@material-ui/core";
import TextTopInGrid from "components/TextTopInGrid";
import HisDepre from "./HisDepre";
import HisDisposal from "./HisDisposal";
import HisLocation from "./HisLocation";
import ActionMenu from "components/ActionMenu";
import BoxHeader from "components/BoxHeader";
import NavRight from "components/NavRightSide";
import CardImage from "components/CardImage";
import PreviewImage from "assets/previewImage.png";
import DialogCopy from "./DialogCopy";
import DialogEditAfterClsPeriod from "./DialogEditAfterClsPeriod";
import { permissionName } from "utils/constants";
import { getAssetRegDetail, delAssetRegDetail, checkRegisterDisposal } from "services/asset";
import { addDays } from "date-fns";
import SnackbarUtils from "utils/SnackbarUtils";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <div>{children}</div>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const StyledTab = withStyles({
  root: {
    textTransform: "none",
  },
})((props) => <Tab {...props} />);

const Show = (props) => {
  const classes = props.useStyles();
  const { basePath, id, permissions, translate } = props;
  const redirect = useRedirect();
  const { settingAll, DateToString, NumberFormat } = useContext(GblContext);
  const { SettingClosePeriod } = settingAll;
  const { ClosePeriodAsset } = SettingClosePeriod;
  let newClosePeriodAsset = addDays(new Date(ClosePeriodAsset), 1);
  const [data, setData] = useState();
  const [isDisposaled, setIsDisposaled] = useState();
  const [loading, setLoading] = useState(true);
  const [error] = useState();
  const [openDim, setOpenDim] = useState(false);
  const [dataDim, setDataDim] = useState();
  const [openCopyDialog, setOpenCopyDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [valueOfTab, setValueOfTab] = useState(0);

  const handleChangeTab = (event, newValue) => {
    setValueOfTab(newValue);
  };

  const CheckEditBtn = () => {
    const action = (key) => (
      <>
        <Button
          variant="contained"
          onClick={() => {
            SnackbarUtils.closeSnackbar(key);
            setOpenEditDialog(true);
          }}
        >
          Yes
        </Button>
        <Button
          onClick={() => {
            SnackbarUtils.closeSnackbar(key);
          }}
        >
          No
        </Button>
      </>
    );

    if (data) {
      if (isDisposaled) {
        let msg = translate("ra.asset.disposed");
        SnackbarUtils.warning(msg);
        return;
      }
      if (new Date(newClosePeriodAsset) > new Date(data.InputDate)) {
        let msg = "Input date within a closed period. Continue editing?";
        SnackbarUtils.warning(msg, {
          variant: "warning",
          autoHideDuration: null,
          action,
        });
      } else {
        redirect("edit", basePath, id);
      }
    }
  };

  const CheckDeleteBtn = () => {
    if (data) {
      if (isDisposaled) {
        let msg = translate("ra.asset.disposed");
        SnackbarUtils.warning(msg);
        return;
      }
      if (new Date(newClosePeriodAsset) > new Date(data.InputDate)) {
        var msgClosePeriod = translate("ra.closePeriod.warning", { name: "asset", action: "delete" });
        SnackbarUtils.warning(msgClosePeriod);
      } else {
        DelOrVoid();
      }
    }
  };

  const CloseCopyDialog = (regId) => {
    setOpenCopyDialog(false);
    if (regId) {
      redirect("show", basePath, regId);
    }
  };

  const CloseEditDialog = (regId) => {
    setOpenEditDialog(false);
    console.log(regId);
    if (regId) {
      fetchAssetById(regId);
    }
  };

  const menuControlProp = [
    { name: "Back", fnc: () => redirect("list", basePath) },
    { name: "Add", fnc: () => redirect("create", basePath) },
    {
      name: "Edit",
      fnc: () => CheckEditBtn(),
    },
    {
      name: "Delete",
      fnc: () => CheckDeleteBtn(),
    },
    { name: "Copy", fnc: () => setOpenCopyDialog(true) },
    {
      name: "Disposal",
      fnc: () => {
        if (id) {
          localStorage.setItem("regId", id);
          redirect("create", "/assetDisposal");
        }
      },
    },
    { name: "Print" },
    { name: "Print BarCode" },
  ];

  const fetchAssetById = useCallback(async () => {
    const response = await getAssetRegDetail(id);
    if (response) {
      setData(response);
      const { Result } = await checkRegisterDisposal(response.RegId);
      setIsDisposaled(Result);

      setDataDim(response.DimList.Dim);
    }
  }, [id]);

  useEffect(() => {
    setLoading(true);
    fetchAssetById();
    setLoading(false);
  }, [fetchAssetById]);

  const ShowDim = (values) => {
    if (!values) {
      setDataDim(data.DimList.Dim);
      setOpenDim(true);
    } else {
      setDataDim(values);
      setOpenDim(true);
    }
  };

  const DelOrVoid = async () => {
    if (isDisposaled) {
      let msg = translate("ra.asset.disposed");
      SnackbarUtils.warning(msg);
      return;
    }

    if (new Date(newClosePeriodAsset) > new Date(data.InputDate)) {
      let msg = "Input date within a closed period or Asset already disposed. Cannot delete.";
      SnackbarUtils.warning(msg);
    }

    let msg = "Confirm deletion ?";
    let dialog = window.confirm(msg);
    if (dialog) {
      const { Code, InternalMessage } = await delAssetRegDetail(id);
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

  const TypeOfDate = (type) => {
    switch (type) {
      case 1:
        return "Month";
      case 2:
        return "Day";
      default:
        return "Year";
    }
  };

  const RegisterValue1 = () => {
    return (
      <Grid container alignItems="flex-start" spacing={1} style={{ marginBottom: 12 }}>
        <TextTopInGrid sizeXs={12} sizeSm={6} label="Currency" value={data.CurCode} />
        <TextTopInGrid sizeXs={12} sizeSm={6} label="Rate" value={NumberFormat(data.CurRate, "currency")} />
        <TextTopInGrid sizeXs={12} sizeSm={6} label="Unit" value={data.Unit} />
        <TextTopInGrid sizeXs={12} sizeSm={6} label="Qty" value={NumberFormat(data.Qty, "qty")} />
        <TextTopInGrid sizeXs={12} sizeSm={12} label="Asset Life" value={`${data.Life} ${TypeOfDate(data.Type)}`} />
        <TextTopInGrid sizeXs={12} sizeSm={12} label="Init Accu Depre" value={NumberFormat(data.InitAccu)} />
      </Grid>
    );
  };

  const RegisterValue2 = () => {
    return (
      <Grid container alignItems="flex-start" spacing={1} style={{ marginBottom: 12 }}>
        <TextTopInGrid sizeXs={12} sizeSm={6} label="Amount/Unit" value={NumberFormat(data.Amount, "unit")} />
        <TextTopInGrid sizeXs={12} sizeSm={6} label="Base Amt." value={NumberFormat(data.BaseAmount)} />
        <TextTopInGrid sizeXs={12} sizeSm={6} label="Salvage / Unit" value={NumberFormat(data.Salvage, "unit")} />
        <TextTopInGrid sizeXs={12} sizeSm={6} label="Total Salvage" value={NumberFormat(data.Salvage * data.Qty)} />
        <TextTopInGrid sizeXs={12} sizeSm={6} label="Total Value" value={NumberFormat(data.TotalCost)} />

        <TextTopInGrid sizeXs={12} sizeSm={6} label="Net Book Value" value={NumberFormat(data.RemainNet)} />
      </Grid>
    );
  };

  const RemainValue = () => {
    return (
      <Grid container alignItems="flex-start" direction="column" spacing={1} style={{ marginBottom: 12 }}>
        <TextTopInGrid sizeXs={12} sizeSm={12} label="Qty" value={NumberFormat(data.RemainInfo.Qty, "qty")} />
        <TextTopInGrid sizeXs={12} sizeSm={12} label="Life (Days)" value={data.RemainInfo.Life} />
        <TextTopInGrid sizeXs={12} sizeSm={12} label="Total Value" value={NumberFormat(data.RemainInfo.TotalValue)} />
        <TextTopInGrid sizeXs={12} sizeSm={12} label="Accu Depre." value={NumberFormat(data.RemainInfo.AccuDepre)} />
        <TextTopInGrid
          sizeXs={12}
          sizeSm={12}
          label="Net Book Value"
          value={NumberFormat(data.RemainInfo.NetBookValue)}
        />
      </Grid>
    );
  };

  const AssetAccount = () => {
    return (
      <Grid container alignItems="flex-start" spacing={1} style={{ marginBottom: 12 }}>
        <TextTopInGrid
          sizeXs={12}
          sizeSm={12}
          label="Cost Dept."
          value={`${data.CostDeptCode} - ${data.CostDeptDesc}`}
        />
        <TextTopInGrid sizeXs={12} sizeSm={12} label="Cost Acc." value={`${data.CostAccCode} - ${data.CostAccDesc}`} />
        <TextTopInGrid
          sizeXs={12}
          sizeSm={12}
          label="Accu Dept."
          value={`${data.AccuDeptCode} - ${data.AccuDeptDesc}`}
        />
        <TextTopInGrid sizeXs={12} sizeSm={12} label="Accu Acc." value={`${data.AccuAccCode} - ${data.AccuAccDesc}`} />
        <TextTopInGrid
          sizeXs={12}
          sizeSm={12}
          label="Depre Dept."
          value={`${data.DepreDeptCode} - ${data.DepreDeptDesc}`}
        />
        <TextTopInGrid
          sizeXs={12}
          sizeSm={12}
          label="Depre Acc."
          value={`${data.DepreAccCode} - ${data.DepreAccDesc}`}
        />
      </Grid>
    );
  };

  return (
    <div
      className={clsx({
        [classes.drawerOpen]: openDim,
        [classes.drawerClose]: !openDim,
      })}
    >
      <ActionMenu
        menuControl={menuControlProp}
        permission={permissions.find((i) => i.Name === permissionName["Ast.Register"])}
      />

      <Paper className={classes.root}>
        <BoxHeader header={`Asset Management`} status={data.Status} />

        <Tabs
          value={valueOfTab}
          onChange={handleChangeTab}
          indicatorColor="primary"
          textColor="primary"
          style={{ marginBottom: 12 }}
        >
          <StyledTab label="Register" {...a11yProps(0)} />
          <StyledTab label="History Depreciation" {...a11yProps(1)} />
          <StyledTab label="History Disposal" {...a11yProps(2)} />
          <StyledTab label="History Location" {...a11yProps(3)} />
        </Tabs>
        <TabPanel value={valueOfTab} index={0}>
          <Grid container alignItems="flex-start" spacing={1} style={{ marginBottom: 12 }}>
            <Grid item xs={9}>
              <Grid container alignItems="flex-start" spacing={1} style={{ marginBottom: 12 }}>
                <TextTopInGrid sizeXs={2} sizeSm={2} label="Asset No." value={`${data.Id} - ${data.No}`} />

                <TextTopInGrid sizeXs={2} sizeSm={2} label="Name" value={data.Name} />
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
                <TextTopInGrid sizeXs={2} sizeSm={2} label="BarCode" value={data.Barcode} />
                <TextTopInGrid
                  sizeXs={2}
                  sizeSm={4}
                  label="Category"
                  value={`${data.CategoryCode} - ${data.AstCateDesc}`}
                />
                <TextTopInGrid
                  sizeXs={2}
                  sizeSm={4}
                  label="Department"
                  value={`${data.DepartmentCode} - ${data.AstDeptDesc}`}
                />
                <TextTopInGrid
                  sizeXs={2}
                  sizeSm={4}
                  label="Location"
                  value={`${data.LocationCode} - ${data.AstLocDesc}`}
                />
                <TextTopInGrid sizeXs={2} sizeSm={4} label="Invoice No." value={data.InvoiceNo} />
                <TextTopInGrid sizeXs={2} sizeSm={4} label="Serial No." value={data.SerialNo} />
                <TextTopInGrid
                  sizeXs={2}
                  sizeSm={4}
                  label="Transfer Date"
                  value={DateToString(data.TransferDate ?? new Date())}
                />
                <TextTopInGrid
                  sizeXs={2}
                  sizeSm={4}
                  label="Vendor"
                  value={data.VnCode ? `${data.VnCode} : ${data.VnName}` : ""}
                />
                <TextTopInGrid sizeXs={2} sizeSm={4} label="Specification" value={data.Spec} />
                <TextTopInGrid sizeXs={2} sizeSm={4} label="Remark" value={data.Remark} />
              </Grid>
            </Grid>
            <Grid item xs={3}>
              <CardImage base64Src={data.AstPhoto ? data.AstPhoto : undefined} imgSrc={PreviewImage} />
            </Grid>
          </Grid>
          <Divider />

          <Grid container alignItems="flex-start" spacing={1} style={{ margin: "12px 0" }}>
            <Grid item xs={6}>
              <Typography className={classes.heading}>Register Value</Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography className={classes.heading}>Remain Value</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography className={classes.heading}>Asset Account</Typography>
            </Grid>
            <Grid item xs={3}>
              <RegisterValue1 />
            </Grid>
            <Grid item xs={3}>
              <RegisterValue2 />
            </Grid>
            <Grid item xs={2}>
              <RemainValue />
            </Grid>
            <Grid item xs={4}>
              <AssetAccount />
            </Grid>
          </Grid>
        </TabPanel>
        <TabPanel value={valueOfTab} index={1}>
          {valueOfTab === 1 ? <HisDepre Id={data.Id} No={data.No} /> : ""}
        </TabPanel>
        <TabPanel value={valueOfTab} index={2}>
          {valueOfTab === 2 ? <HisDisposal Id={data.Id} No={data.No} /> : ""}
        </TabPanel>
        <TabPanel value={valueOfTab} index={3}>
          {valueOfTab === 3 ? <HisLocation Id={data.Id} No={data.No} /> : ""}
        </TabPanel>
      </Paper>

      <NavRight
        open={openDim}
        close={() => setOpenDim(false)}
        ShowDim={() => ShowDim()}
        dataDim={dataDim}
        module={"AST_Reg"}
        moduleId={id}
      />

      {openCopyDialog ? (
        <DialogCopy
          open={openCopyDialog}
          onClose={CloseCopyDialog}
          basePath={basePath}
          RegId={id}
          AssetId={data.Id}
          AssetNo={data.No}
        />
      ) : (
        ""
      )}
      {openEditDialog ? (
        <DialogEditAfterClsPeriod
          open={openEditDialog}
          onClose={CloseEditDialog}
          basePath={basePath}
          RegId={id}
          DepartmentCode={data.DepartmentCode}
          DepartmentDesc={data.AstDeptDesc}
          LocationCode={data.LocationCode}
          LocationDesc={data.AstLocDesc}
          TransferDate={data.TransferDate}
        />
      ) : (
        ""
      )}

      <pre>{process.env.NODE_ENV === "development" ? JSON.stringify(data, 0, 2) : ""}</pre>
    </div>
  );
};

export default withTranslate(Show);
