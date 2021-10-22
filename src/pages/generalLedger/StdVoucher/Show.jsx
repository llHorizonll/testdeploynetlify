import React, { useContext, useState, useEffect, useCallback } from "react";
import { GblContext } from "providers/formatter";
import clsx from "clsx";
import { Loading, Error, useRedirect } from "react-admin";
import { Paper, Grid } from "@material-ui/core";
import TableFooter from "@material-ui/core/TableFooter";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import MUIDataTable, { TableHead as MuiTableHead } from "mui-datatables";
import TextTopInGrid from "components/TextTopInGrid";
import ActionMenu from "components/ActionMenu";
import BoxHeader from "components/BoxHeader";
import NavRight from "components/NavRightSide";
import VisibilityIcon from "@material-ui/icons/Visibility";
import { getJvFrDetail, delJvFrDetail } from "services/generalLedger";
import { permissionName } from "utils/constants";
import { format } from "date-fns";

const Show = (props) => {
  const classes = props.useStyles();
  const { basePath, id, permissions } = props;
  const { NumberFormat, ToNumber } = useContext(GblContext);
  const redirect = useRedirect();
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [openDim, setOpenDim] = useState(false);
  const [dataDim, setDataDim] = useState();

  const menuControlProp = [
    { name: "Back", fnc: () => redirect("list", basePath) },
    { name: "Add", fnc: () => redirect("create", basePath) },
    { name: "Edit", fnc: () => redirect("edit", basePath, id) },
    { name: "Delete", fnc: () => DelOrVoid() },
    { name: "Print" },
  ];

  const DelOrVoid = async () => {
    let msg = "Confirm deletion ?";
    let dialog = window.confirm(msg);
    if (dialog) {
      const { Code, InternalMessage } = await delJvFrDetail(id);
      if (Code === 0) {
        redirect("list", basePath);
      } else {
        console.log(InternalMessage, "InternalMessage");
      }
    }
  };

  const fetchJvFrById = useCallback(
    async (mounted) => {
      const response = await getJvFrDetail(props.id).catch((error) => {
        setError(error);
      });
      if (response) {
        if (response.Type === "Template") {
          response.FJvhFrom = format(new Date(), "MM/yyyy");
          response.FJvhTo = format(new Date(), "MM/yyyy");
          response.FJvhFreq = 1;
        } else {
          response.FJvhFromPr = `${response.FJvhFromPr}`;
          response.FJvhFrom = `${response.FJvhFromPr}/${response.FJvhFromYr}`;
          response.FJvhToPr = `${response.FJvhToPr}`;
          response.FJvhTo = `${response.FJvhToPr}/${response.FJvhToYr}`;
        }
        setData(response);
      }

      if (mounted) {
        setLoading(false);
      }
    },
    [props.id]
  );

  useEffect(() => {
    let mounted = true;
    fetchJvFrById(mounted);
    return function cleanup() {
      mounted = false;
    };
  }, [fetchJvFrById]);

  if (loading) return <Loading />;
  if (error) return <Error />;
  if (!data) return null;

  const columns = [
    {
      name: "",
      label: "",
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
                onClick={() => ShowDim(tableMeta.rowData[11].Dim)}
              />
            </>
          );
        },
      },
    },
    {
      name: "DeptCode",
      label: "Dept.",
    },
    {
      name: "AccCode",
      label: "Account #",
    },
    {
      name: "AccDesc",
      label: "Account Name",
    },
    {
      name: "Description",
      label: "Comment",
    },
    {
      name: "CurCode",
      label: "Currency",
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
      name: "DrAmount",
      label: "Dr Amount",
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
    {
      name: "CrAmount",
      label: "Cr Amount",
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
    {
      name: "DrBase",
      label: "Dr Base",
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
    {
      name: "CrBase",
      label: "Cr Base",
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
    {
      name: "DimList",
      label: "DimList",
      options: {
        display: false,
      },
    },
  ];

  const footerClasses = clsx({
    [classes.footerCell]: true,
    [classes.stickyFooterCell]: true,
  });

  const options = {
    responsive: "standard",
    selectableRows: "none",
    serverSide: true,
    fixedHeader: true,
    tableBodyHeight: "580px",
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
    customTableBodyFooterRender: function (opts) {
      let sumDrAmt = opts.data.reduce((accu, item) => {
        let s = ToNumber(accu) + ToNumber(item.data[7]);
        return NumberFormat(s ?? 0);
      }, 0);

      let sumCrAmt = opts.data.reduce((accu, item) => {
        let s = ToNumber(accu) + ToNumber(item.data[8]);
        return NumberFormat(s ?? 0);
      }, 0);

      let sumDrBase = opts.data.reduce((accu, item) => {
        let s = ToNumber(accu) + ToNumber(item.data[9]);
        return NumberFormat(s ?? 0);
      }, 0);

      let sumCrBase = opts.data.reduce((accu, item) => {
        let s = ToNumber(accu) + ToNumber(item.data[10]);
        return NumberFormat(s ?? 0);
      }, 0);
      return (
        <TableFooter className={footerClasses}>
          <TableRow>
            {opts.columns.map((col, index) => {
              if (col.display === "true") {
                if (col.name === "DrAmount") {
                  return (
                    <TableCell key={index} className={footerClasses}>
                      {sumDrAmt}
                    </TableCell>
                  );
                } else if (col.name === "CrAmount") {
                  return (
                    <TableCell key={index} className={footerClasses}>
                      {sumCrAmt}
                    </TableCell>
                  );
                } else if (col.name === "DrBase") {
                  return (
                    <TableCell key={index} className={footerClasses}>
                      {sumDrBase}
                    </TableCell>
                  );
                } else if (col.name === "CrBase") {
                  return (
                    <TableCell key={index} className={footerClasses}>
                      {sumCrBase}
                    </TableCell>
                  );
                } else {
                  return <TableCell key={index} className={footerClasses} />;
                }
              }
              return null;
            })}
          </TableRow>
        </TableFooter>
      );
    },
  };

  const ShowDim = (values) => {
    if (!values) {
      setDataDim(data.DimHList.Dim);
      setOpenDim(true);
    } else {
      setDataDim(values);
      setOpenDim(true);
    }
  };

  const CustomHeader = (props) => {
    return (
      <>
        <MuiTableHead {...props} />
      </>
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
        permission={permissions.find((i) => i.Name === permissionName["GL.StdJv"])}
      />

      <Paper style={{ padding: 12, marginBottom: 12 }}>
        <BoxHeader header={"Standard Journal Voucher"} />
        <Grid container alignItems="flex-start" spacing={1} style={{ marginBottom: 12 }}>
          <TextTopInGrid sizeSm={1} label="Prefix" value={data.Prefix} />
          <TextTopInGrid sizeSm={2} label="Type" value={data.Type} />
          <TextTopInGrid sizeSm={9} label="Description" value={data.Description} />
          {data.Type === "Recurring" ? (
            <>
              <TextTopInGrid sizeSm={1} label="From" value={data.FJvhFrom} />
              <TextTopInGrid sizeSm={2} label="To" value={data.FJvhTo} />
              <TextTopInGrid sizeSm={2} label="Recurring Every Period" value={data.FJvhFreq} />
            </>
          ) : (
            ""
          )}
        </Grid>
        <MUIDataTable
          data={data.Detail}
          columns={columns}
          options={options}
          components={{
            TableHead: CustomHeader,
          }}
        />
      </Paper>

      <NavRight
        open={openDim}
        close={() => setOpenDim(false)}
        ShowDim={() => ShowDim()}
        dataDim={dataDim}
        module={"GL_JvFr"}
        moduleId={id}
      />
      {/* <pre>{JSON.stringify(data, 0, 2)}</pre> */}
    </div>
  );
};

export default Show;
