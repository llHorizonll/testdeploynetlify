import React, { useContext, useState } from "react";
import { GblContext } from "providers/formatter";
import CircularProgress from "@material-ui/core/CircularProgress";
import { Card, CardHeader, CardContent, IconButton, Typography, Divider } from "@material-ui/core";
import { List, ListItem, ListItemText, ListItemSecondaryAction } from "@material-ui/core";
import { Chart } from "react-google-charts";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import { makeStyles } from "@material-ui/core/styles";
import DatePickerFormat from "components/DatePickerFormat";
import ConfigDashboard from "./ConfigDashboard";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    backgroundColor: theme.palette.background.paper,
  },
  cardHeader: {
    padding: "10px 16px",
  },
  txtRight: {
    textAlign: "right",
  },
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

const UsageChart = (props) => {
  const classes = useStyles();
  const { DateToString, NumberFormat } = useContext(GblContext);
  const [dateTemp, setDateTemp] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!props) {
    return "";
  }
  const { name, stateKey, date, data, rawData } = props;

  const updateChart = () => {
    setLoading(true);
    props.updateChart(dateTemp, stateKey);
    setTimeout(() => {
      setLoading(false);
      setOpen(false);
    }, 1000);
  };

  const closeConfig = () => {
    setDateTemp(date);
    setOpen(false);
  };

  const FieldFormDate = (
    <DatePickerFormat
      disableFuture
      animateYearScrolling
      label="Select Date"
      value={dateTemp}
      onChange={(e) => setDateTemp(e)}
    />
  );

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
                  close={closeConfig}
                  update={updateChart}
                  name={name}
                  field={FieldFormDate}
                />
              </>
            }
            title={
              <Typography variant="body1">
                <b>{name}</b>
              </Typography>
            }
            subheader={<Typography variant="body2">{DateToString(date ?? new Date())}</Typography>}
          />
          <CardContent style={{ marginTop: -20 }}>
            {data ? (
              <Chart
                width="100%"
                height="300px"
                chartType="PieChart"
                loader={<div>Loading Chart</div>}
                data={data}
                options={{
                  // pieHole: 0.3,
                  chartArea: { width: "100%" },
                  is3D: true,
                  // pieSliceText: "value",
                  // sliceVisibilityThreshold: 0.0001,
                  // tooltip: {
                  //   text: "value",
                  // },
                }}
              />
            ) : (
              "No Data"
            )}
          </CardContent>
          <List dense className={classes.root}>
            <ListItem>
              <ListItemText style={{ textAlign: "left" }} primary={<b>Market Segment</b>} />
              <ListItemText style={{ textAlign: "right", paddingRight: "5rem" }} primary={<b>Amount</b>} />
              <ListItemSecondaryAction>
                <Typography variant="body2">
                  <b>Percent</b>
                </Typography>
              </ListItemSecondaryAction>
            </ListItem>
            <Divider />
            {rawData
              ? rawData.map((item, idx) => (
                  <React.Fragment key={idx}>
                    <ListItem>
                      <ListItemText primary={`${item.DimValue}` ?? "Empty name"} />
                      <ListItemText
                        style={{ textAlign: "right", paddingRight: "5rem" }}
                        primary={NumberFormat(item.Amount)}
                      />
                      <ListItemSecondaryAction>
                        <Typography variant="body2">{NumberFormat(item.Rate, "percent")} %</Typography>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))
              : ""}
            <ListItem>
              <ListItemText primary={<b>Summary</b>} />
              <ListItemText
                style={{
                  textAlign: "right",
                  paddingRight: "5rem",
                }}
                primary={<b>{NumberFormat(rawData ? rawData.reduce((a, c) => a + c.Amount, 0) : 0)}</b>}
              />
              <ListItemSecondaryAction>
                <Typography variant="body2">
                  <b>{NumberFormat(rawData && rawData.reduce((a, c) => a + c.Rate, 0), "percent")} %</b>
                </Typography>
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </Card>
      )}
    </>
  );
};

export default UsageChart;
