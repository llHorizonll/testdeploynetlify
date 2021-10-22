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
  content1: {
    paddingLeft: 16,
  },
  content2: {
    paddingLeft: 16,
  },
  boxColor: {
    height: 0,
    width: "1.2rem",
    paddingBottom: "1.2rem",
    marginRight: 10,
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
    margin: 100,
    display: "flex",
    justifyContent: "center",
  },
}));

const StackedBarChart = (props) => {
  const classes = useStyles();
  const { NumberFormat, CurrencyFormat } = useContext(GblContext);
  const [dateTemp, setDateTemp] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { name, stateKey, date, totalUnPaid, data1, data2, colors1, colors2, rawData } = props;

  const updateChart = () => {
    setLoading(true);
    if (dateTemp !== "Invalid Date") {
      props.updateChart(dateTemp, stateKey);
    }
    setTimeout(() => {
      setLoading(false);
      setOpen(false);
    }, 1000);
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

  const closeConfig = () => {
    setDateTemp(date);
    setOpen(false);
  };

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
            subheader={
              <Typography variant="subtitle2">
                {name === "Payable"
                  ? "Total Unpaid  " + CurrencyFormat(totalUnPaid ?? 0, "THB")
                  : "Total Outstanding  " + CurrencyFormat(totalUnPaid ?? 0, "THB")}
              </Typography>
            }
          />
          <Divider />
          <CardContent style={{ padding: 0 }}>
            {data1 ? (
              <Chart
                width="100%"
                height={"100px"}
                chartType="BarChart"
                loader={<div>Loading Chart</div>}
                data={data1}
                options={{
                  chartArea: { width: "90%", height: 40, top: 10 },
                  isStacked: true,
                  colors: colors1 ?? [],
                  hAxis: {
                    minValue: 0,
                    maxValue: totalUnPaid,
                    textPosition: "bottom",
                    format: "short",
                    baselineColor: { color: "white" },
                    //gridlines: { color: "white" },
                  },
                  vAxis: {
                    textPosition: "none",
                    //gridlines: { color: "white" },
                  },
                  legend: { position: "none" },
                }}
              />
            ) : (
              ""
            )}

            <List dense className={classes.root} style={{ marginTop: -20 }}>
              <ListItem>
                <div
                  className={classes.boxColor}
                  style={{
                    backgroundColor: colors1 ? colors1[0] : [],
                  }}
                ></div>
                <ListItemText primary={"Undue"} />
                <ListItemSecondaryAction>
                  <Typography variant="body2">{NumberFormat(rawData?.Undue ?? 0)}</Typography>
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <div
                  className={classes.boxColor}
                  style={{
                    backgroundColor: colors1 ? colors1[1] : [],
                  }}
                ></div>
                <ListItemText primary={"Overdue"} />
                <ListItemSecondaryAction>
                  <Typography variant="body2">{NumberFormat(rawData?.Overdue ?? 0)}</Typography>
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText primary={<b>Summary</b>} />
                <ListItemSecondaryAction>
                  <Typography variant="body2">
                    <b>{NumberFormat(rawData && rawData?.Undue + rawData?.Overdue)}</b>
                  </Typography>
                </ListItemSecondaryAction>
              </ListItem>
            </List>
            <Divider />
            {data2 ? (
              <Chart
                width="100%"
                height={"100px"}
                chartType="BarChart"
                loader={<div>Loading Chart</div>}
                data={data2}
                options={{
                  chartArea: { width: "90%", height: 40, top: 10 },
                  isStacked: true,
                  colors: colors2 ?? [],
                  hAxis: {
                    minValue: 0,
                    maxValue: totalUnPaid,
                    textPosition: "bottom",
                    format: "short",
                    baselineColor: { color: "white" },
                    //gridlines: { color: "white" },
                  },
                  vAxis: {
                    textPosition: "none",
                    //gridlines: { color: "white" },
                  },
                  legend: { position: "none" },
                }}
              />
            ) : (
              ""
            )}
          </CardContent>
          <List dense className={classes.root} style={{ marginTop: -20 }}>
            <ListItem>
              <div
                className={classes.boxColor}
                style={{
                  backgroundColor: colors2 ? colors2[0] : [],
                }}
              ></div>
              <ListItemText primary={"Current"} />
              <ListItemSecondaryAction>
                <Typography variant="body2">{NumberFormat(rawData?.Current)}</Typography>
              </ListItemSecondaryAction>
            </ListItem>
            <Divider />
            <ListItem>
              <div
                className={classes.boxColor}
                style={{
                  backgroundColor: colors2 ? colors2[1] : [],
                }}
              ></div>
              <ListItemText primary={"<= 30"} />
              <ListItemSecondaryAction>
                <Typography variant="body2">{NumberFormat(rawData?.Age30)}</Typography>
              </ListItemSecondaryAction>
            </ListItem>
            <Divider />
            <ListItem>
              <div
                className={classes.boxColor}
                style={{
                  backgroundColor: colors2 ? colors2[2] : [],
                }}
              ></div>
              <ListItemText primary={"<= 60"} />
              <ListItemSecondaryAction>
                <Typography variant="body2">{NumberFormat(rawData?.Age60)}</Typography>
              </ListItemSecondaryAction>
            </ListItem>
            <Divider />
            <ListItem>
              <div
                className={classes.boxColor}
                style={{
                  backgroundColor: colors2 ? colors2[3] : [],
                }}
              ></div>
              <ListItemText primary={"<= 90"} />

              <ListItemSecondaryAction>
                <Typography variant="body2">{NumberFormat(rawData?.Age90)}</Typography>
              </ListItemSecondaryAction>
            </ListItem>
            <Divider />
            <ListItem>
              <div
                className={classes.boxColor}
                style={{
                  backgroundColor: colors2 ? colors2[4] : [],
                }}
              ></div>
              <ListItemText primary={"> 90"} />
              <ListItemSecondaryAction>
                <Typography variant="body2">{NumberFormat(rawData?.Age91)}</Typography>
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemText primary={<b>Summary</b>} />
              <ListItemSecondaryAction>
                <Typography variant="body2">
                  <b>
                    {NumberFormat(
                      rawData &&
                        (rawData?.Current ?? 0) + rawData?.Age30 + rawData?.Age60 + rawData?.Age90 + rawData?.Age91
                    )}
                  </b>
                </Typography>
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </Card>
      )}
    </>
  );
};

export default StackedBarChart;
