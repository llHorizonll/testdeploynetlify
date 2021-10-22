/* eslint-disable eqeqeq */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useState, useEffect } from "react";
import { GblContext } from "providers/formatter";
import { useStateWithCallbackLazy } from "use-state-with-callback";
import { useForm } from "react-hook-form";
import { useRedirect, withTranslate } from "react-admin";
import { Paper, Grid, Box, Typography, Switch, Button } from "@material-ui/core";
import { TableHead, TableRow, TableCell } from "@material-ui/core";
import InfoIcon from "@material-ui/icons/Info";
import MonetizationOnIcon from "@material-ui/icons/MonetizationOn";
import EditIcon from "@material-ui/icons/Edit";
import MUIDataTable, { TableHead as MuiTableHead } from "mui-datatables";
import ActionMenu from "components/ActionMenu";
import BoxHeader from "components/BoxHeader";
import ButtonFooter from "components/ButtonFooter";
import ArContractForm from "./ArContractForm";
import { createArProfileDetail, checkDuplicateContract } from "services/accountReceivable";
import Model from "models/arProfile";
import ModelDetail from "models/arContractDetail";
import SnackbarUtils from "utils/SnackbarUtils";

const Create = (props) => {
  const classes = props.useStyles();
  const {
    basePath,
    formFields,
    formFieldsInfo,
    formFieldsBilling,
    formFieldsDetail,
    formFieldsContractDetail,

    translate,
  } = props;
  const redirect = useRedirect();

  const { settingAll, DateToString, NumberFormat, ToNumber } = useContext(GblContext);
  const { SettingSystem } = settingAll;

  const [initData, setInitData] = useStateWithCallbackLazy(Model);
  const [initNewRow, setInitNewRow] = useStateWithCallbackLazy(ModelDetail);
  const [openContract, setOpenContract] = useState(false);
  const [editIndex, setEditIndex] = useState("");

  const menuControlProp = [
    { name: "Back", fnc: () => redirect("list", basePath) },
    { name: "Add", disabled: true },
    { name: "Edit", disabled: true },
    { name: "Delete", disabled: true },
    { name: "Copy", disabled: true },
    { name: "Print", disabled: true },
  ];

  const methods = useForm({ defaultValues: initData });

  const { handleSubmit, getValues, reset } = methods;

  //set default value
  useEffect(() => {
    //reset ContracDetail When Add
    initData.ContractDetail = [];
    initNewRow.CurCode = SettingSystem.DefaultCurrencyCode;
    initNewRow.CurRate = SettingSystem.DefaultCurrencyRate;
    setInitNewRow(initNewRow);
    setInitData(initData);
    reset(initData);
  }, []);

  const disableFormEnter = (e) => {
    if (e.key === "Enter" && e.target.localName !== "textarea") e.preventDefault();
  };

  const onSubmit = () => {
    const values = getValues();
    console.log(values, "submit");
    //Adjust parameter before save
    setInitData(
      (state) => ({
        ...state,
        ...values,
        CurRate: ToNumber(values.CurRate),
      }),
      (nextState) => Save(nextState)
    );
  };

  const columns = [
    {
      name: "index",
      label: " ",
      options: {
        filter: false,
        viewColumns: false,
        customBodyRender: (value) => {
          return (
            <>
              <EditIcon
                fontSize="small"
                color="primary"
                style={{ cursor: "pointer", marginLeft: 10 }}
                onClick={() => UpdateContractRow(value)}
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
  };

  const CustomHeader = (props) => {
    return (
      <>
        <TableHead>
          <TableRow>
            <TableCell align="left" colSpan={3} className={classes.pdLeft0}>
              <Button
                variant="outlined"
                onClick={() => {
                  AddNewContractRow();
                }}
              >
                Add Contract
              </Button>
              {/* <IconButton
                size={"small"}
                onClick={() => AddNewRow()}
                style={{ marginLeft: 6 }}
              >
                <AddIcon />
              </IconButton> */}
            </TableCell>
            <TableCell align="right" colSpan={8}></TableCell>
          </TableRow>
        </TableHead>
        <MuiTableHead {...props} />
      </>
    );
  };

  const AddNewContractRow = () => {
    setInitNewRow(
      (state) => ({
        ...state,
        Detail: [],
        CurCode: SettingSystem.DefaultCurrencyCode,
        CurRate: SettingSystem.DefaultCurrencyRate,
      }),
      () => {
        setEditIndex("");
        setOpenContract(true);
      }
    );
  };

  const UpdateContractRow = (index) => {
    setEditIndex(index);
    setOpenContract(true);
  };

  const SaveFromPopup = async (arr, row) => {
    if (row.Detail.length === 0) {
      SnackbarUtils.toast(translate("ra.info.notransaction"));
      return;
    }
    //Check ContractNo Duplicate With ContractDetail
    if (arr.ContractDetail.length > 0) {
      var foundItem = arr.ContractDetail.find((item) => item.ContractNo === row.ContractNo);
      if (foundItem) {
        SnackbarUtils.warning(`Contract No. [${foundItem.ContractNo}] already exists.`);
        return;
      }
    }
    //Check ContractNo Duplicate With API
    const { Code } = await checkDuplicateContract(row.ContractNo);
    if (Code !== 0) {
      return;
    }
    if (editIndex !== "") {
      //update
      arr.ContractDetail[editIndex] = row;
      setInitData(arr);
      setOpenContract(false);
    } else {
      //create
      if (arr.ContractDetail) {
        row.index = arr.ContractDetail.length;
        arr.ContractDetail = [...arr.ContractDetail, row];
        setInitData(arr);
        setOpenContract(false);
      }
    }
  };

  const CancelFromPopup = () => {
    setOpenContract(false);
  };

  const UpdateForm = (e) => {
    console.log("update other field in form");
  };

  const Save = async (values) => {
    //Validate & CheckDetail
    console.log(values, "save");
    const { Code, InternalMessage } = await createArProfileDetail(values);
    if (Code === 0) {
      redirect(`${InternalMessage}/show`);
    }
  };

  const CancelFnc = () => {
    redirect("list", basePath);
  };

  return (
    <div>
      <ActionMenu menuControl={menuControlProp} />
      <form onSubmit={handleSubmit(onSubmit)} onKeyDown={disableFormEnter}>
        <Paper style={{ padding: 16 }}>
          <BoxHeader header={"A/R Profile"} />
          <Grid container alignItems="flex-start" spacing={1}>
            {formFields
              ? formFields.map((item, idx) => (
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
          {/* Information */}
          <Box style={{ marginBottom: 12 }}>
            <Typography className={classes.heading} style={{ display: "flex" }}>
              <InfoIcon color="primary" /> &nbsp; Information
            </Typography>
          </Box>
          <Grid container alignItems="flex-start" spacing={1}>
            {formFieldsInfo
              ? formFieldsInfo.map((item, idx) => (
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
          {/* Billing */}
          <Box style={{ marginBottom: 12 }}>
            <Typography className={classes.heading} style={{ display: "flex" }}>
              <MonetizationOnIcon color="primary" /> &nbsp; Billing
            </Typography>
          </Box>
          <Grid container alignItems="flex-start" spacing={1}>
            {formFieldsBilling
              ? formFieldsBilling.map((item, idx) => (
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

          <Grid container alignItems="flex-start">
            <Grid item xs={12}>
              <MUIDataTable
                data={initData.ContractDetail}
                columns={columns}
                options={options}
                components={{
                  TableHead: CustomHeader,
                }}
              />
            </Grid>
          </Grid>

          {openContract && (
            <ArContractForm
              initialValues={editIndex !== "" ? initData.ContractDetail[editIndex] : initNewRow}
              formFields={formFieldsDetail}
              formFieldsDetail={formFieldsContractDetail}
              open={openContract}
              save={(row) => SaveFromPopup(initData, row)}
              cancel={CancelFromPopup}
              modify
            />
          )}
        </Paper>
        <pre>{process.env.NODE_ENV === "development" ? JSON.stringify(initData, 0, 2) : ""}</pre>
        <ButtonFooter CancelFnc={CancelFnc} />
      </form>
    </div>
  );
};

export default withTranslate(Create);
