import React, { useContext, useState } from "react";
import { GblContext } from "providers/formatter";
import { TextField } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import CircularProgress from "@material-ui/core/CircularProgress";
import Autocomplete from "@material-ui/lab/Autocomplete";
import MUIDataTable from "mui-datatables";
import { makeStyles } from "@material-ui/core/styles";
import Tooltip from "@material-ui/core/Tooltip";
import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider, DatePicker } from "@material-ui/pickers";
import ConfigDashboard from "./ConfigDashboard";
import DisplayValuePercent from "components/DisplayValuePercent";
import { getDepartmentList } from "services/setting";
import ListBox from "components/ListBox";
import PopperListBox from "components/PopperListBox";

const useStyles = makeStyles((theme) => ({
  circulLoading: {
    margin: 50,
    display: "flex",
    justifyContent: "center",
  },
  textRight: {
    paddingRight: 0,
    textAlign: "right",
  },
  option: {
    width: 500,
    fontSize: 14,
    "& > span": {
      marginRight: 10,
      fontSize: 18,
    },
  },
}));

const IncomeChart = (props) => {
  const classes = useStyles();
  const { NumberFormat } = useContext(GblContext);
  const [dateTemp, setDateTemp] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lookupList, setLookupList] = useState({
    accountCode: [],
    department: [],
  });
  const [deptValue, setDeptValue] = useState();
  const { name, stateKey, date, data } = props;

  const updateChart = () => {
    setLoading(true);
    if (dateTemp !== "Invalid Date") {
      props.updateChart({ deptValue: deptValue, date: dateTemp }, stateKey);
    }
    setTimeout(() => {
      setLoading(false);
      setOpen(false);
    }, 1000);
  };

  const closeConfig = () => {
    setDateTemp(date);
    setOpen(false);
  };

  const FieldForm = (
    <>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <DatePicker
          disableFuture
          openTo="year"
          views={["year", "month"]}
          inputVariant="outlined"
          margin="dense"
          label="Select Date"
          value={dateTemp}
          onChange={(e) => setDateTemp(e)}
          autoOk={true}
          okLabel=""
          cancelLabel=""
          //animateYearScrolling
        />
      </MuiPickersUtilsProvider>
      <Autocomplete
        id="Department"
        options={lookupList["department"]}
        disableListWrap
        value={deptValue}
        onChange={(e, newItem) => setDeptValue(newItem)}
        ListboxComponent={ListBox}
        PopperComponent={PopperListBox}
        classes={{
          option: classes.option,
        }}
        getOptionLabel={(option) => option.DeptCode}
        renderOption={(option) => `${option.DeptCode} : ${option.Description ?? ""}`}
        style={{ width: 300 }}
        renderInput={(params) => (
          <TextField {...params} variant="outlined" label="Department" margin="dense" placeholder="Department" />
        )}
      />
    </>
  );

  const columns = [
    {
      label: "Name",
      name: "Name",
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      label: "Dept.",
      name: "DeptCode",
      options: {
        filter: false,
        display: false,
        customBodyRender: (value, tableMera) => {
          if (value === "All" || tableMera.tableData[tableMera.rowIndex]?.DeptDesc === null) {
            return "All";
          } else {
            return `${value} : ${tableMera.tableData[tableMera.rowIndex]?.DeptDesc}`;
          }
        },
      },
    },
    {
      label: "MTD",
      name: "MTD",
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
      label: "YTD",
      name: "YTD",
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
      label: "YTD Last Year",
      name: "YTD_LYear",
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
      label: "Variance (%)",
      name: "YTDRate",
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
        customHeadLabelRender: (columnMeta) => {
          return (
            <Tooltip title="% Increase between YTD & YTD last year" placement="top">
              <div>{columnMeta.label}</div>
            </Tooltip>
          );
        },
        customBodyRender: (value) => {
          return <DisplayValuePercent value={value} />;
        },
      },
    },
    {
      label: "YTD Budget",
      name: "Budget",
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
      label: "Variance (%)",
      name: "BudgetRate",
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
        customHeadLabelRender: (columnMeta) => {
          return (
            <Tooltip title="% Increase between YTD & YTD Budget" placement="top">
              <div>{columnMeta.label}</div>
            </Tooltip>
          );
        },
        customBodyRender: (value) => {
          return <DisplayValuePercent value={value} />;
        },
      },
    },
  ];

  const selectSetting = async () => {
    const { Data } = await getDepartmentList();
    Data.unshift({ DeptCode: "All" });
    setLookupList((state) => ({
      ...state,
      department: Data,
    }));
    setOpen(true);
  };

  const options = {
    responsive: "standard",
    selectableRows: "none",
    serverSide: true,
    setTableProps: () => {
      return {
        size: "small",
      };
    },
    viewColumns: false,
    download: false,
    filter: false,
    print: false,
    search: false,
    pagination: false,
    customToolbar: () => {
      return (
        <>
          <IconButton aria-label="settings" onClick={selectSetting}>
            <MoreVertIcon />
          </IconButton>
          <ConfigDashboard open={open} close={closeConfig} update={updateChart} name={name} field={FieldForm} />
        </>
      );
    },
  };

  if (!props.data) {
    return "";
  }

  return (
    <>
      {loading ? (
        <div className={classes.circulLoading}>
          <CircularProgress />
        </div>
      ) : (
        <MUIDataTable
          title={
            <>
              <Typography variant="body1">
                <b>
                  {name} ({data[0].DeptCode === "*" ? data[0].DeptDesc : `${data[0].DeptCode} : ${data[0].DeptDesc}`})
                </b>
              </Typography>
              <Typography variant="body2">
                {`${date.getMonth() < 9 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1}/${date.getFullYear()}`}
              </Typography>
            </>
          }
          data={data}
          columns={columns}
          options={options}
        />
      )}
    </>
  );
};

export default IncomeChart;
