import React, { useState, useEffect, useCallback } from "react";
import clsx from "clsx";
import { Loading, Error, useRedirect, withTranslate } from "react-admin";
import { Paper, Grid } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import TextTopInGrid from "components/TextTopInGrid";
import ActionMenu from "components/ActionMenu";
import BoxHeader from "components/BoxHeader";
import Accordion from "@material-ui/core/Accordion";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import NavRight from "components/NavRightSide";
import { getVendorDetail, delVendorDetail } from "services/accountPayable";
import { showReportByName } from "pages/Report/services";
import { permissionName } from "utils/constants";

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: 12,
    marginBottom: 12,
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightBold,
  },
  drawerOpen: {
    marginRight: drawerWidth,
  },
  drawerClose: {
    marginRight: 54,
  },
}));

const Show = (props) => {
  const classes = useStyles();
  const redirect = useRedirect();
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);
  const [error] = useState();
  const [openDim, setOpenDim] = useState(false);

  const { basePath, id, permissions } = props;

  const menuControlProp = [
    { name: "Back", fnc: () => redirect("list", basePath) },
    { name: "Add", fnc: () => redirect("create", basePath) },
    { name: "Edit", fnc: () => redirect("edit", basePath, id) },
    { name: "Delete", fnc: () => DelOrVoid() },
    { name: "Print", fnc: () => showReportByName("AP_Vendor", [{ Name: "Id", Value: id }]) },
  ];

  const fetchVendorById = useCallback(async (mounted) => {
    const response = await getVendorDetail(id);
    if (response) {
      setData(response);
    }
    if (mounted) {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let mounted = true;
    fetchVendorById(mounted);
    return function cleanup() {
      mounted = false;
    };
  }, [fetchVendorById]);

  const DelOrVoid = async () => {
    let msg = "Confirm deletion ?";
    let dialog = window.confirm(msg);
    if (dialog) {
      const { Code, InternalMessage } = await delVendorDetail(id);
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

  const InformationContent = () => {
    return (
      <Grid container alignItems="flex-start" spacing={1} style={{ marginBottom: 12 }}>
        <TextTopInGrid sizeSm={6} label="Vendor No" value={`${data.VnCode} : ${data.VnName}`} />
        <TextTopInGrid sizeSm={6} label="Vendor Category" value={`${data.VnCateCode} : ${data.VnCateDesc}`} />

        <TextTopInGrid sizeSm={6} label="WHT. Name" value={data.VnPayee} />
        <TextTopInGrid sizeSm={6} label="Attn" value={data.VnAttn} />

        <TextTopInGrid sizeSm={12} label="Chq. Name" value={data.Vn2Payee} />
        <TextTopInGrid
          sizeSm={6}
          label="Address1"
          value={`${data.VnAdd1} \n ${data.VnAdd2} \n ${data.VnAdd3} \n ${data.VnAdd4}`}
        />
        <TextTopInGrid
          sizeSm={6}
          label="Address2"
          value={`${data.Vn2Add1} \n ${data.Vn2Add2} \n ${data.Vn2Add3} \n ${data.Vn2Add4}`}
        />

        <TextTopInGrid sizeSm={6} label="Tel" value={data.VnTel} />

        <TextTopInGrid sizeSm={6} label="Tel" value={data.Vn2Tel} />

        <TextTopInGrid sizeSm={6} label="Fax" value={data.VnFax} />
        <TextTopInGrid sizeSm={6} label="Fax" value={data.Vn2Fax} />
        <TextTopInGrid sizeSm={6} label="Email" value={data.VnEmail} />

        <TextTopInGrid sizeSm={6} label="Email" value={data.Vn2Email} />

        <TextTopInGrid sizeSm={6} label="Reference" value={data.VnReference} />
        <TextTopInGrid sizeSm={6} label="Mapping Ref." value={data.VnMapRef} />

        <TextTopInGrid sizeSm={6} label="Tax ID." value={data.VnTaxNo} />
        <TextTopInGrid sizeSm={6} label="Branch No" value={data.BranchNo} />
        <TextTopInGrid sizeSm={6} label="Bus Reg No." value={data.VnRegNo} />
        <TextTopInGrid sizeSm={6} label="Credit Term" value={data.VnTerm} />
        <TextTopInGrid sizeSm={6} label="Discount Term" value={data.VnDisTrm} />
        <TextTopInGrid sizeSm={6} label="Less (%)" value={data.VnDisPct} />
      </Grid>
    );
  };

  const InvoiceDefault = () => {
    return (
      <Grid container alignItems="flex-start" spacing={1} style={{ marginBottom: 12 }}>
        <TextTopInGrid sizeSm={6} label="Vat Type 1" value={data.VnVat1} />
        <TextTopInGrid sizeSm={6} label="Vat Rate 1 (%)" value={data.VnTaxR1} />

        <TextTopInGrid
          sizeSm={12}
          label="Dr Vat 1"
          value={data.VnVat1DrAccCode ? `${data.VnVat1DrAccCode} : ${data.VnVat1DrAccDesc}` : ""}
        />
        {data.VnVat2 !== "None" ? (
          <React.Fragment>
            <TextTopInGrid sizeSm={6} label="Vat Type 2" value={data.VnVat2} />
            <TextTopInGrid sizeSm={6} label="Vat Rate 2 (%)" value={data.VnTaxR2} />
            <TextTopInGrid
              sizeSm={12}
              label="Dr Vat 2"
              value={data.VnVat2DrAccCode ? `${data.VnVat2DrAccCode} : ${data.VnVat2DrAccDesc}` : ""}
            />
          </React.Fragment>
        ) : (
          ""
        )}

        <TextTopInGrid
          sizeSm={12}
          label="Cr A/P Acc."
          value={data.VnVatCrAccCode ? `${data.VnVatCrAccCode} : ${data.VnVatCrAccDesc}` : ""}
        />
      </Grid>
    );
  };

  const PaymentDefault = () => {
    return (
      <Grid container alignItems="flex-start" spacing={1} style={{ marginBottom: 12 }}>
        <TextTopInGrid
          sizeSm={12}
          label="Type"
          value={data.VnPayType ? `${data.VnPayType} : ${data.VnPayTypeDesc}` : ""}
        />
        <TextTopInGrid
          sizeSm={12}
          label="Payment Dept."
          value={data.VnPayDeptCode ? `${data.VnPayDeptCode} : ${data.VnPayDeptDesc}` : ""}
        />
        <TextTopInGrid
          sizeSm={12}
          label="Cr Acc. Code"
          value={data.VnCrAccCode ? `${data.VnCrAccCode} : ${data.VnCrAccDesc}` : ""}
        />
        <TextTopInGrid
          sizeSm={12}
          label="WHT. Dept."
          value={data.VnWhtDeptCode ? `${data.VnWhtDeptCode} : ${data.VnWhtDeptDesc}` : ""}
        />
        <TextTopInGrid
          sizeSm={12}
          label="WHT. Acc."
          value={data.VnWhtAccCode ? `${data.VnWhtAccCode} : ${data.VnWhtAccDesc}` : ""}
        />
      </Grid>
    );
  };

  const AutoPayInfo = () => {
    return (
      <Grid container alignItems="flex-start" spacing={1} style={{ marginBottom: 12 }}>
        <TextTopInGrid sizeSm={12} label="Bank Name" value={data.BankName} />
        <TextTopInGrid sizeSm={12} label="Acc Name" value={data.BankAccountName} />
        <TextTopInGrid sizeSm={12} label="Acc No" value={data.BankAccountNo} />
        <TextTopInGrid sizeSm={12} label="Bank Ref 1" value={data.BankRef1} />
        <TextTopInGrid sizeSm={12} label="Bank Ref 2" value={data.BankRef2} />
        <TextTopInGrid sizeSm={12} label="Bank Ref 3" value={data.BankRef3} />
      </Grid>
    );
  };

  return (
    <div
      className={clsx(classes.drawer, {
        [classes.drawerOpen]: openDim,
        [classes.drawerClose]: !openDim,
      })}
    >
      <ActionMenu
        menuControl={menuControlProp}
        permission={permissions.find((i) => i.Name === permissionName["AP.Vendor"])}
      />

      <Paper className={classes.root}>
        <BoxHeader header={"Vendor"} status={data.Active} />
        <Grid container alignItems="flex-start" spacing={1}>
          <Grid item xs={12}>
            <Typography className={classes.heading}>Information</Typography>
          </Grid>
        </Grid>
        <Grid container alignItems="flex-start" spacing={1} style={{ margin: "0 20px" }}>
          <Grid item xs={12}>
            <InformationContent />
          </Grid>
        </Grid>
      </Paper>
      <Grid container alignItems="flex-start" spacing={1} style={{ marginBottom: 12 }}>
        <Grid item xs={4}>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel2-content" id="panel2-header">
              <Typography className={classes.heading}>Invoice Default</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <InvoiceDefault />
            </AccordionDetails>
          </Accordion>
        </Grid>
        <Grid item xs={4}>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel3-content" id="panel3-header">
              <Typography className={classes.heading}>Payment Default</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <PaymentDefault />
            </AccordionDetails>
          </Accordion>
        </Grid>
        <Grid item xs={4}>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel4-content" id="panel4-header">
              <Typography className={classes.heading}>AutoPay Information</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <AutoPayInfo />
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>
      <NavRight
        open={openDim}
        close={() => setOpenDim(false)}
        ShowDim={() => setOpenDim(true)}
        module={"Vendor"}
        moduleId={id}
      />

      <pre>{process.env.NODE_ENV === "development" ? JSON.stringify(data, 0, 2) : ""}</pre>
    </div>
  );
};

export default withTranslate(Show);
