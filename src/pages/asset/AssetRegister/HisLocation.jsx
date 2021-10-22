import React, { useContext, useState, useEffect } from "react";
import { GblContext } from "providers/formatter";
import MUIDataTable from "mui-datatables";
import TableFooter from "@material-ui/core/TableFooter";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import { makeStyles } from "@material-ui/core/styles";
import { Loading, Error } from "react-admin";
import { getAssetHisLocationByAssetNo } from "services/asset";

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
  const { DateToString } = useContext(GblContext);
  const [Data, setData] = useState();
  const [Paging, setPaging] = useState();
  const [loading, setLoading] = useState(true);
  const [error] = useState();

  useEffect(() => {
    async function fetchList() {
      setLoading(true);
      const { Data, Paging } = await getAssetHisLocationByAssetNo(Id, No);
      setData(Data);
      setPaging(Paging);
      setLoading(false);
    }
    fetchList();
  }, [Id, No]);

  const columns = [
    {
      name: "LogId",
      label: " ",
      options: {
        viewColumns: false,
        filter: false,
        sort: false,
        display: false,
      },
    },
    {
      name: "LogDate",
      label: "Date",
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
      name: "DepartmentCode",
      label: "Department Code",
    },
    {
      name: "DepartmentName",
      label: "Department Description",
    },
    {
      name: "LocCode",
      label: "Location Code",
    },
    {
      name: "LocName",
      label: "Location Name",
    },
    {
      name: "UserModified",
      label: "User",
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
      <MUIDataTable title={"History Location"} data={Data} columns={columns} options={options} />
    </div>
  );
};

export default HisDepre;
