import React, { useContext, useState, useEffect } from "react";
import { GblContext } from "providers/formatter";
import MUIDataTable from "mui-datatables";
import TableFooter from "@material-ui/core/TableFooter";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import { makeStyles } from "@material-ui/core/styles";
import { Loading, Error } from "react-admin";
import { getAssetDisposalListByAssetNo } from "services/asset";

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
      const { Data, Paging } = await getAssetDisposalListByAssetNo(
        10,
        1,
        Id,
        No
      );
      setData(Data);
      setPaging(Paging);
      setLoading(false);
    }
    fetchList();
  }, [Id, No]);

  const columns = [
    {
      name: "DisposalId",
      label: " ",
      options: {
        viewColumns: false,
        filter: false,
        sort: false,
        display: false,
      },
    },
    {
      name: "DisposalDate",
      label: "Disposal Date",
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value) => {
          let v = new Date(value);
          return DateToString(v ?? new Date());
        },
      },
    },
    {
      name: "Type",
      label: "Type",
    },
    {
      name: "TotalCost",
      label: "Total Cost",
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
      name: "SaleAmt",
      label: "Sale Amt",
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

  const CustomFooter = (props) => {
    return (
      <TableFooter>
        <TableRow>
          <TableCell colSpan={1000}>
            Total records count = {props.count}
          </TableCell>
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
      <MUIDataTable
        title={"History Disposal"}
        data={Data}
        columns={columns}
        options={options}
      />
    </div>
  );
};

export default HisDepre;
