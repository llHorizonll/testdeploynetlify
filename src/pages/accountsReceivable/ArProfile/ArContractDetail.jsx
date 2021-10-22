import React, { useContext, useState } from "react";
import { GblContext } from "providers/formatter";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import BoxHeader from "components/BoxHeader";
import { Drawer, Box, Grid, Typography, Divider } from "@material-ui/core";
import MUIDataTable from "mui-datatables";
import TableFooter from "@material-ui/core/TableFooter";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TaxVatContent from "components/TaxVatContent";
import SummaryRightSide from "components/SummaryRightSide";
import TextTopInGrid from "components/TextTopInGrid";
import DimensionContent from "components/DimensionContent";
import VisibilityIcon from "@material-ui/icons/Visibility";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  content: {
    padding: theme.spacing(0, 1),
  },
  list: {
    width: 980,
  },
  footerCell: {
    backgroundColor: theme.palette.background.paper,
    borderTop: "2px solid rgba(224, 224, 224, 1)",
    borderBottom: "none",
  },
  stickyFooterCell: {
    position: "sticky",
    bottom: 0,
    zIndex: 100,
    textAlign: "right",
    fontSize: "0.9rem",
    fontWeight: 600,
    color: theme.palette.primary.main,
  },
}));

export default function PersistentDrawerRight({ open, close, data, modify }) {
  const classes = useStyles();
  const { DateToString, NumberFormat, ToNumber } = useContext(GblContext);
  const [dataDim, setDataDim] = useState();
  const [dataTax, setDataTax] = useState();
  console.log(dataTax)
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
                  setDataDim(data.Detail[tableMeta.rowIndex].DimList.Dim);
                  setDataTax(data.Detail[tableMeta.rowIndex]);
                }}
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
      name: "CrAcc",
      label: "Account #",
    },
    {
      name: "ConDDesc",
      label: "Comment",
    },
    {
      name: "Unit",
      label: "Unit",
    },
    {
      name: "Qty",
      label: "Qty",
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
          return NumberFormat(value, "qty");
        },
      },
    },
    {
      name: "Price",
      label: "Price/Unit",
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
          return NumberFormat(value, "unit");
        },
      },
    },
    {
      name: "NetAmt",
      label: "Net Amount",
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
      name: "TaxAmt1",
      label: "Tax Amount 1",
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
      name: "TaxAmt2",
      label: "Tax Amount 2",
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
      name: "TotalAmt",
      label: "Total",
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
    customTableBodyFooterRender: function (opts) {
      let sumNet = opts.data.reduce((accu, item) => {
        let s = ToNumber(accu) + ToNumber(item.data[7]);
        return NumberFormat(s ?? 0);
      }, 0);

      let sumTax1 = opts.data.reduce((accu, item) => {
        let s = ToNumber(accu) + ToNumber(item.data[8]);
        return NumberFormat(s ?? 0);
      }, 0);

      let sumTax2 = opts.data.reduce((accu, item) => {
        let s = ToNumber(accu) + ToNumber(item.data[9]);
        return NumberFormat(s ?? 0);
      }, 0);

      let sumTotal = opts.data.reduce((accu, item) => {
        let s = ToNumber(accu) + ToNumber(item.data[10]);
        return NumberFormat(s ?? 0);
      }, 0);
      return (
        <TableFooter className={footerClasses}>
          <TableRow>
            {opts.columns.map((col, index) => {
              if (col.display === "true") {
                switch (col.name) {
                  case "NetAmt":
                    return (
                      <TableCell key={index} className={footerClasses}>
                        {sumNet}
                      </TableCell>
                    );
                  case "TaxAmt1":
                    return (
                      <TableCell key={index} className={footerClasses}>
                        {sumTax1}
                      </TableCell>
                    );
                  case "TaxAmt2":
                    return (
                      <TableCell key={index} className={footerClasses}>
                        {sumTax2}
                      </TableCell>
                    );
                  case "TotalAmt":
                    return (
                      <TableCell key={index} className={footerClasses}>
                        {sumTotal}
                      </TableCell>
                    );
                  default:
                    return <TableCell key={index} className={footerClasses} />;
                }
              }
              return null;
            })}
          </TableRow>
        </TableFooter>
      );
    },
    onRowsDelete: (rowsDeleted) => {
      const removeArray = rowsDeleted.data.map((i) => i.index);
      for (var i = removeArray.length - 1; i >= 0; i--) data.Detail.splice(removeArray[i], 1);
    },
  };

  return (
    <Drawer open={open} onClose={close} anchor="right">
      <Box className={clsx(classes.list)} p={1}>
        <BoxHeader header={`A/R Contract`} status={data.Active} style={{ paddingLeft: 12 }} />

        <Grid container alignItems="flex-start" spacing={1} style={{ margin: "0 6px 10px 6px" }}>
          <TextTopInGrid sizeSm={3} label="Contract No." value={data.ContractNo} />
          <TextTopInGrid sizeSm={3} label="Start Contract" value={DateToString(data.ConStart)} />
          <TextTopInGrid sizeSm={2} label="End Contract" value={DateToString(data.ConEnd)} />

          <TextTopInGrid sizeSm={2} label="Currency" value={data.CurCode} />
          <TextTopInGrid sizeSm={2} label="Rate" value={NumberFormat(data.CurRate, "currency")} />
          <TextTopInGrid
            sizeSm={3}
            label="Owner"
            value={data.OwnerDesc ? `${data.Owner} : ${data.OwnerDesc}` : data.Owner}
          />
          <TextTopInGrid
            sizeSm={3}
            label="Project"
            value={data.ProjectDesc ? `${data.ProjectCode} : ${data.ProjectDesc}` : data.ProjectCode}
          />
          <TextTopInGrid sizeSm={2} label="Charge Every Month" value={`${data.PeriodicMonth} Month`} />
          <TextTopInGrid sizeSm={6} label="Description" value={data.ConHDesc} />
        </Grid>

        <MUIDataTable data={data.Detail} columns={columns} options={options} />
        <Divider />
      </Box>
      <Box>
        {dataTax && (
          <Grid container alignItems="flex-start" spacing={1} style={{ marginBottom: 12 }}>
            <Grid item xs={4}>
              <Box p={1}>
                <Typography variant="h6" className={classes.content}>
                  Tax Vat
                </Typography>
                <TaxVatContent data={dataTax} />
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box p={1}>
                <Typography variant="h6" className={classes.content}>
                Base Summary
                </Typography>
                <SummaryRightSide data={dataTax} />
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box p={1}>
                <Typography variant="h6" className={classes.content}>
                  Dimension
                </Typography>
                <DimensionContent
                  data={dataDim}
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
                  }}
                  modify={modify}
                />
              </Box>
            </Grid>
          </Grid>
        )}
      </Box>

      <pre style={{ width: 240 }}>{process.env.NODE_ENV === "development" ? JSON.stringify(data, 0, 2) : ""}</pre>
    </Drawer>
  );
}
