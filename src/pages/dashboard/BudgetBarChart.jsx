import React, { useState, useEffect, useCallback } from "react";
import CircularProgress from "@material-ui/core/CircularProgress";
import {
  Card,
  CardHeader,
  CardContent,
  IconButton,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@material-ui/core";
import { useMediaQuery } from "@material-ui/core";
import { Chart } from "react-google-charts";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import { makeStyles } from "@material-ui/core/styles";
import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider, DatePicker } from "@material-ui/pickers";
import ConfigDashboard from "./ConfigDashboard";
import chartapi from "services/callStoreProcedure";

const useStyles = makeStyles((theme) => ({
  card: {
    minHeight: 52,
    display: "flex",
    flexDirection: "column",
    flex: "1",
    "& a": {
      textDecoration: "none",
      color: "inherit",
    },
  },
  main: () => ({
    overflow: "inherit",
    padding: 16,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    "& .icon": {
      color: theme.palette.type === "dark" ? "inherit" : "#dc2440",
    },
  }),
  circulLoading: {
    margin: 50,
    display: "flex",
    justifyContent: "center",
  },
}));

const BudgetBarChart = (props) => {
  const classes = useStyles();
  const [dateTemp, setDateTemp] = useState(new Date());
  const [group, setGroup] = useState("0");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [optionList, setOptionList] = useState();
  const isXSmall = useMediaQuery((theme) => theme.breakpoints.down("xs"));
  const { name, stateKey, date, data } = props;

  const fetchOption = useCallback(async () => {
    const res = await chartapi.getYearcomparisionOption();
    setOptionList(res);
  }, []);

  useEffect(() => {
    fetchOption();
  }, [fetchOption]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateChart = () => {
    setLoading(true);
    props.updateChart({ group: group, date: dateTemp }, stateKey);
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
      <FormControl variant="outlined" size="small">
        <InputLabel id="outlined-label">Group</InputLabel>
        <Select
          labelId="outlined-label"
          defaultValue="0"
          label="Group"
          onChange={({ target }) => setGroup(target.value)}
        >
          {optionList
            ? optionList.map((item, idx) => (
                <MenuItem key={idx} value={item.Id}>
                  {item.name}
                </MenuItem>
              ))
            : ""}
        </Select>
      </FormControl>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <DatePicker
          style={{ marginTop: 20 }}
          disableFuture
          views={["year"]}
          inputVariant="outlined"
          margin="dense"
          label="This Year"
          value={dateTemp}
          onChange={(e) => setDateTemp(e)}
          autoOk={true}
          okLabel=""
          cancelLabel=""
          //animateYearScrolling
        />
      </MuiPickersUtilsProvider>
    </>
  );

  const chartEvents = [
    {
      eventName: "select",
      callback({ chartWrapper }) {
        console.log("Selected ", chartWrapper.getChart().getSelection());
      },
    },
  ];

  return (
    <>
      {loading ? (
        <div className={classes.circulLoading}>
          <CircularProgress />
        </div>
      ) : (
        <Card className={classes.card} elevation={6}>
          <CardHeader
            action={
              <>
                <IconButton aria-label="settings" onClick={() => setOpen(true)}>
                  <MoreVertIcon />
                </IconButton>
                <ConfigDashboard
                  open={open}
                  update={updateChart}
                  close={closeConfig}
                  name={name}
                  field={FieldForm}
                />
              </>
            }
            title={
              <Typography variant="body1">
                <b>
                  {name} ({optionList && optionList[group].name})
                </b>
              </Typography>
            }
            subheader={
              <Typography variant="body2">
                {date ? date.getFullYear() : ""}
              </Typography>
            }
          />
          <CardContent>
            {data ? (
              <Chart
                width="100%"
                height="300px"
                chartType="ColumnChart"
                //chartType="Bar"
                loader={<div>Loading Chart</div>}
                data={data}
                options={{
                  bars: "vertical",
                  vAxis: { format: isXSmall ? "short" : "decimal" },
                  colors: ["#bdbdbd", "#2196f3"],
                  legend: { position: "bottom" },
                  chartArea: {
                    width: "85%",
                  },
                }}
                chartEvents={chartEvents}
              />
            ) : (
              ""
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default BudgetBarChart;
