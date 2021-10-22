import React, { useContext, useState, useEffect, useCallback } from "react";
import { GblContext } from "providers/formatter";
import clsx from "clsx";
import { Loading, Error, useRedirect } from "react-admin";
import Typography from "@material-ui/core/Typography";
import { Paper, Grid, Box, Switch } from "@material-ui/core";
import InfoIcon from "@material-ui/icons/Info";
import MonetizationOnIcon from "@material-ui/icons/MonetizationOn";
import TextTopInGrid from "components/TextTopInGrid";
import MUIDataTable from "mui-datatables";
import ActionMenu from "components/ActionMenu";
import BoxHeader from "components/BoxHeader";
import NavRight from "components/NavRightSide";
import ArContractDetail from "./ArContractDetail";
import VisibilityIcon from "@material-ui/icons/Visibility";
import { permissionName } from "utils/constants";
import { getArProfileDetail, delArProfileDetail } from "services/accountReceivable";

const Show = (props) => {
  const classes = props.useStyles();
  const { DateToString, NumberFormat } = useContext(GblContext);
  const { basePath, id, permissions } = props;
  const redirect = useRedirect();
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);
  const [error] = useState();
  const [openDim, setOpenDim] = useState(false);
  const [openContract, setOpenContract] = useState(false);
  const [dataContract, setDataContract] = useState();

  const menuControlProp = [
    { name: "Back", fnc: () => redirect("list", basePath) },
    { name: "Add", fnc: () => redirect("create", basePath) },
    { name: "Edit", fnc: () => redirect("edit", basePath, id) },
    { name: "Delete", fnc: () => DelOrVoid() },
    { name: "Print" },
  ];

  const fetchById = useCallback(async (mounted) => {
    const response = await getArProfileDetail(id);
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
    fetchById(mounted);
    return function cleanup() {
      mounted = false;
    };
  }, [fetchById]);

  const DelOrVoid = async () => {
    let msg = "Confirm deletion ?";
    let dialog = window.confirm(msg);
    if (dialog) {
      const { Code, InternalMessage } = await delArProfileDetail(id);
      if (Code === 0) {
        redirect("list", basePath);
      } else {
        console.log(InternalMessage, "InternalMessage");
      }
    }
  };

  const columns = [
    {
      name: "index",
      label: " ",
      options: {
        filter: false,
        viewColumns: false,
        customBodyRender: (value, tableMeta) => {
          return (
            <>
              <VisibilityIcon
                fontSize="small"
                color="primary"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  ShowContract(value);
                }}
              />
            </>
          );
        },
      },
    },
    {
      name: "Active",
      label: "Status",
      options: {
        customBodyRender: (value) => {
          return (
            <Switch
              checked={typeof value === "boolean" ? value : false}
              onChange={(e, newValue) => e.preventDefault()}
              //disabled={true}
            />
          );
        },
      },
    },
    {
      name: "ContractNo",
      label: "Contract No.",
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: "ConHDesc",
      label: "Description",
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: "CurCode",
      label: "Currency",
      options: {
        filter: false,
        sort: false,
        setCellHeaderProps: () => ({
          align: "right",
        }),
        setCellProps: () => ({
          style: {
            textAlign: "right",
          },
        }),
      },
    },
    {
      name: "CurRate",
      label: "Rate",
      options: {
        filter: false,
        sort: false,
        setCellHeaderProps: () => ({
          align: "right",
        }),
        setCellProps: () => ({
          style: {
            textAlign: "right",
          },
        }),
        customBodyRender: (value) => {
          return NumberFormat(value, "currency");
        },
      },
    },
    {
      name: "ProjectCode",
      label: "Project",
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: "Owner",
      label: "Owner",
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: "ConStart",
      label: "Start Contract",
      options: {
        filter: false,
        sort: false,
        setCellHeaderProps: () => ({
          align: "right",
        }),
        setCellProps: () => ({
          style: {
            textAlign: "right",
          },
        }),
        customBodyRender: (value) => {
          let v = new Date(value);
          return DateToString(v ?? new Date());
        },
      },
    },
    {
      name: "ConEnd",
      label: "End Contract",
      options: {
        filter: false,
        sort: false,
        setCellHeaderProps: () => ({
          align: "right",
        }),
        setCellProps: () => ({
          style: {
            textAlign: "right",
          },
        }),
        customBodyRender: (value) => {
          if (!value) {
            return "";
          }
          let v = new Date(value);
          return DateToString(v);
        },
      },
    },
    {
      name: "PeriodicMonth",
      label: "Charge Every Month",
      options: {
        filter: false,
        sort: false,
        setCellHeaderProps: () => ({
          align: "right",
        }),
        setCellProps: () => ({
          style: {
            textAlign: "right",
          },
        }),
      },
    },
    {
      name: "TotalAmount",
      label: "Amount",
      options: {
        filter: false,
        sort: false,
        setCellHeaderProps: () => ({
          align: "right",
        }),
        setCellProps: () => ({
          style: {
            textAlign: "right",
          },
        }),
        customBodyRender: (value) => {
          return NumberFormat(value);
        },
      },
    },
  ];

  const options = {
    responsive: "standard",
    selectableRows: "none",
    fixedHeader: true,
    tableBodyHeight: "500px",
    search: false,
    download: false,
    filter: false,
    print: false,
    viewColumns: false,
    elevation: 0,
    setTableProps: () => {
      return {
        size: "small",
      };
    },
    pagination: false,
    onRowsDelete: (rowsDeleted) => {
      const removeArray = rowsDeleted.data.map((i) => i.index);
      for (var i = removeArray.length - 1; i >= 0; i--) data.Detail.splice(removeArray[i], 1);
    },
  };

  const ShowContract = (index) => {
    setDataContract(data.ContractDetail[index]);
    setOpenContract(true);
  };

  const ShowDim = () => {
    setOpenDim(true);
  };

  if (loading) return <Loading />;
  if (error) return <Error />;
  if (!data) return null;
  return (
    <div
      className={clsx({
        [classes.drawerOpen]: openDim,
        [classes.drawerClose]: !openDim,
      })}
    >
      <ActionMenu
        menuControl={menuControlProp}
        permission={permissions.find((i) => i.Name === permissionName["AR.Profile"])}
      />

      <Paper className={classes.root}>
        <BoxHeader header={`A/R Profile`} status={data.Active} />
        <Grid container alignItems="flex-start" spacing={1} style={{ marginBottom: 6 }}>
          <TextTopInGrid sizeSm={2} label="A/R No." value={data.ArNo} />
          <TextTopInGrid sizeSm={2} label="Title" value={data.Title} />
          <TextTopInGrid sizeSm={2} label="Type" value={data.ArType ? `${data.ArType} : ${data.ArTypeDesc}` : ""} />
          <TextTopInGrid sizeSm={3} label="First Name" value={data.FirstName} />
          <TextTopInGrid sizeSm={3} label="Last Name" value={data.LastName} />
          <TextTopInGrid sizeSm={2} label="Register Date" value={DateToString(data.RegDate)} />

          <TextTopInGrid sizeSm={4} label="Company Name" value={data.Company} />
        </Grid>
        {/* Information */}
        <Box style={{ marginBottom: 12 }}>
          <Typography className={classes.heading} style={{ display: "flex" }}>
            <InfoIcon color="primary" /> &nbsp; Information
          </Typography>
        </Box>
        <Grid container alignItems="flex-start" spacing={1} style={{ marginBottom: 6 }}>
          <Grid container item xs={12} sm={6} spacing={1}>
            <TextTopInGrid sizeSm={12} label="Position" value={data.Position} />
            <TextTopInGrid sizeSm={12} label="Tel" value={data.Tel} />
            <TextTopInGrid sizeSm={12} label="Tax ID." value={data.TaxNo} />
            <TextTopInGrid sizeSm={12} label="Email" value={data.Email} />
            <TextTopInGrid sizeSm={12} label="Remark" value={data.Remark} />
          </Grid>
          <Grid container item xs={12} sm={6} spacing={1}>
            <TextTopInGrid sizeSm={12} label="Address1" value={data.AddressInfo.Address1} />
            <TextTopInGrid sizeSm={12} label="Address2" value={data.AddressInfo.Address2} />
            <TextTopInGrid sizeSm={12} label="Address3" value={data.AddressInfo.Address3} />
          </Grid>
        </Grid>

        {/* Billing */}
        <Box style={{ marginBottom: 12 }}>
          <Typography className={classes.heading} style={{ display: "flex" }}>
            <MonetizationOnIcon color="primary" /> &nbsp; Billing
          </Typography>
        </Box>
        <Grid container alignItems="flex-start" spacing={1} style={{ marginBottom: 6 }}>
          <Grid container item xs={12} sm={6} spacing={1}>
            <TextTopInGrid
              sizeSm={12}
              label="Payment"
              value={data.PaymentCode ? `${data.PaymentCode} : ${data.PaymentDesc}` : ""}
            />
            <TextTopInGrid sizeSm={12} label="Credit Limit" value={`${NumberFormat(data.CreditLimit)} THB`} />
            <TextTopInGrid sizeSm={12} label="Credit Term" value={`${data.CreditTerm} Day`} />
          </Grid>
          <Grid container item xs={12} sm={6} spacing={1}>
            <TextTopInGrid sizeSm={12} label="Billing To" value={data.Billto} />
            <TextTopInGrid sizeSm={12} label="Mailing To" value={data.Mailto} />
            <TextTopInGrid sizeSm={12} label="Tax Invoice Address" value={data.Taxto} />
          </Grid>
        </Grid>

        <MUIDataTable data={data.ContractDetail} columns={columns} options={options} />
      </Paper>

      <NavRight
        open={openDim}
        close={() => setOpenDim(false)}
        ShowDim={() => ShowDim()}
        module={"AR_Profile"}
        moduleId={id}
      />

      {openContract && (
        <ArContractDetail open={openContract} close={() => setOpenContract(false)} data={dataContract} modify={false} />
      )}

      <pre>{process.env.NODE_ENV === "development" ? JSON.stringify(data, 0, 2) : ""}</pre>
    </div>
  );
};

export default Show;
