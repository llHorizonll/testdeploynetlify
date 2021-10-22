import React, { useContext, useState } from "react";
import { GblContext } from "providers/formatter";
import IconButton from "@material-ui/core/IconButton";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import CircularProgress from "@material-ui/core/CircularProgress";
import MUIDataTable from "mui-datatables";
import { Typography, Tooltip } from "@material-ui/core";
import { withStyles, makeStyles } from "@material-ui/core/styles";
import DatePickerFormat from "components/DatePickerFormat";
import ConfigDashboard from "./ConfigDashboard";
import DisplayValuePercent from "components/DisplayValuePercent";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";

const useStyles = makeStyles((theme) => ({
  circulLoading: {
    margin: 50,
    display: "flex",
    justifyContent: "center",
  },
  button: {
    textTransform: "none",
    borderRadius: 4,
  },
  label: {
    // Aligns the content of the button vertically.
    flexDirection: "column",
  },
  selected: {
    color: "white !important",
    backgroundColor: theme.palette.primary.main + "!important",
  },
  divDept: {
    position: "relative",
    height: "20px",
    width: "140px",
  },
  divAcc: {
    position: "relative",
    height: "20px",
    width: "200px",
  },
  parentStyle: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    boxSizing: "border-box",
    display: "block",
    width: "100%",
  },
  cellStyleEllipsis: {
    boxSizing: "border-box",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
}));

const HtmlTooltip = withStyles((theme) => ({
  tooltip: {
    backgroundColor: "#f5f5f9",
    color: "rgba(0, 0, 0, 0.87)",
    maxWidth: 220,
    fontSize: theme.typography.pxToRem(12),
    border: "1px solid #dadde9",
  },
}))(Tooltip);

const ListingChart = (props) => {
  const classes = useStyles();
  const { DateToString, NumberFormat } = useContext(GblContext);
  const [dateTemp, setDateTemp] = useState(new Date());
  const [viewTemp, setViewTemp] = useState("Y");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (event, v) => {
    setViewTemp(v);
  };

  const { name, stateKey, date, data } = props;

  const updateChart = () => {
    setLoading(true);
    if (dateTemp !== "Invalid Date") {
      props.updateChart({ typeOfDate: viewTemp, date: dateTemp }, stateKey);
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
      <DatePickerFormat
        disableFuture
        animateYearScrolling
        label="Select Date"
        value={dateTemp}
        onChange={(e) => setDateTemp(e)}
      />

      <ToggleButtonGroup style={{ marginTop: 10 }} size="small" value={viewTemp} exclusive onChange={handleChange}>
        <ToggleButton
          classes={{
            root: classes.button,
            label: classes.label,
            selected: classes.selected,
          }}
          value="M"
          aria-label="list"
        >
          Month-to-date (MTD)
        </ToggleButton>
        <ToggleButton
          classes={{
            root: classes.button,
            label: classes.label,
            selected: classes.selected,
          }}
          variant="outlined"
          value="Y"
          aria-label="module"
        >
          Year-to-date (YTD)
        </ToggleButton>
      </ToggleButtonGroup>
    </>
  );

  const columns = [
    {
      label: "Dept.",
      name: "DeptCode",
      options: {
        filter: false,
        customBodyRender: (value, tableMera) => {
          return (
            <div className={classes.divDept}>
              <div className={classes.parentStyle}>
                <div className={classes.cellStyleEllipsis}>{`${value} : ${
                  tableMera.tableData[tableMera.rowIndex].DeptDesc
                }`}</div>
              </div>
            </div>
          );
        },
      },
    },
    {
      label: "Acc.",
      name: "AccCode",
      options: {
        filter: false,
        customBodyRender: (value, tableMera) => {
          return (
            <div className={classes.divAcc}>
              <div className={classes.parentStyle}>
                <div className={classes.cellStyleEllipsis}>
                  <HtmlTooltip
                    title={<React.Fragment>{tableMera.tableData[tableMera.rowIndex].AccDesc}</React.Fragment>}
                    placement="top"
                  >
                    <div>{`${value} : ${tableMera.tableData[tableMera.rowIndex].AccDesc}`}</div>
                  </HtmlTooltip>
                </div>
              </div>
            </div>
          );
        },
      },
    },
    {
      label: "Budget",
      name: "BudgetAmt",
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
      label: "Actual",
      name: "ActualAmt",
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
      label: "Variance",
      name: "ActualRate",
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
          return <DisplayValuePercent value={value} />;
        },
      },
    },
    {
      label: "Last Year",
      name: "LastYearAmt",
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
    //selectableRows: "multiple",
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
          <IconButton aria-label="settings" onClick={() => setOpen(true)}>
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
                <b>{name}</b>
              </Typography>
              <Typography variant="body2">
                {DateToString(date ?? new Date())}
                {viewTemp === "Y" ? "(YTD)" : "(MTD)"}
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

export default ListingChart;
