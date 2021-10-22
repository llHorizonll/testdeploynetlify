import React, { useContext, useState, useEffect } from "react";
import { GblContext } from "providers/formatter";
import MUIDataTable from "mui-datatables";
import TableFooter from "@material-ui/core/TableFooter";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import { makeStyles } from "@material-ui/core/styles";
import { Loading, Error } from "react-admin";
import { getAssetHisByAssetNo } from "services/asset";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  textRed: {
    color: "red",
  },
}));

const HisDepre = ({ Id, No }) => {
  const classes = useStyles();
  const { DateToString, NumberFormat } = useContext(GblContext);
  const [Data, setData] = useState();
  const [Paging, setPaging] = useState();
  const [loading, setLoading] = useState(true);
  const [error] = useState();

  useEffect(() => {
    async function fetchList() {
      setLoading(true);
      const { Data, Paging } = await getAssetHisByAssetNo(Id, No);
      setData(Data);
      setPaging(Paging);
      setLoading(false);
    }
    fetchList();
  }, [Id, No]);

  const columns = [
    {
      name: "DepHisId",
      label: " ",
      options: {
        viewColumns: false,
        filter: false,
        sort: false,
        display: false,
      },
    },
    {
      name: "Period",
      label: "Period Date",
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value, tableMeta) => {
          let v = new Date(value);
          if (tableMeta.rowData[3] === 0) {
            return <span className={classes.textRed}>{DateToString(v ?? new Date())}</span>;
          } else {
            return DateToString(v ?? new Date());
          }
        },
      },
    },
    {
      name: "LastCost",
      label: "LastCost",
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
        customBodyRender: (value, tableMeta) => {
          if (tableMeta.rowData[3] === 0) {
            return <span className={classes.textRed}>{NumberFormat(value)}</span>;
          } else {
            return NumberFormat(value);
          }
        },
      },
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
        customBodyRender: (value, tableMeta) => {
          if (tableMeta.rowData[3] === 0) {
            return <span className={classes.textRed}>{NumberFormat(value, "qty")}</span>;
          } else {
            return NumberFormat(value, "qty");
          }
        },
      },
    },
    {
      name: "DepreAmt",
      label: "Depreciation",
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
        customBodyRender: (value, tableMeta) => {
          if (tableMeta.rowData[3] === 0) {
            return <span className={classes.textRed}>{NumberFormat(value)}</span>;
          } else {
            return NumberFormat(value);
          }
        },
      },
    },
    {
      name: "AccuDepreAmt",
      label: "Accu. Depreciation",
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
        customBodyRender: (value, tableMeta) => {
          if (tableMeta.rowData[3] === 0) {
            return <span className={classes.textRed}>{NumberFormat(value)}</span>;
          } else {
            return NumberFormat(value);
          }
        },
      },
    },
    {
      name: "RemainNetBook",
      label: "Net Book Value",
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
        customBodyRender: (value, tableMeta) => {
          if (tableMeta.rowData[3] === 0) {
            return <span className={classes.textRed}>{NumberFormat(value)}</span>;
          } else {
            return NumberFormat(value);
          }
        },
      },
    },
  ];

  const CustomFooter = (props) => {
    return (
      <TableFooter>
        <TableRow>
          <TableCell colSpan={1000}>Total records count = {props.count}</TableCell>
        </TableRow>
      </TableFooter>
    );
  };

  const options = {
    responsive: "standard",
    selectableRows: "none",
    serverSide: true,
    rowsPerPage: Paging?.TotalRecordCount ?? 10,
    //elevation: 0,
    setTableProps: () => {
      return {
        size: "small",
      };
    },
    customFooter: () => <CustomFooter count={Paging.TotalRecordCount} />,
  };

  if (loading) return <Loading />;
  if (error) return <Error />;
  if (!Data) return null;

  return (
    <div className={classes.root}>
      <MUIDataTable title={"History Depreciation"} data={Data} columns={columns} options={options} />
    </div>
  );
};

export default HisDepre;
