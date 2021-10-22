import React, { useContext, useState } from "react";
import { GblContext } from "providers/formatter";
import CircularProgress from "@material-ui/core/CircularProgress";
import { Grid, Card, CardHeader, Avatar, Box, Tooltip, Typography, useMediaQuery } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Icon from "@material-ui/core/Icon";
import IconButton from "@material-ui/core/IconButton";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider, DatePicker } from "@material-ui/pickers";
import ConfigDashboard from "./ConfigDashboard";
import DisplayValuePercent from "components/DisplayValuePercent";

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
  main: {
    padding: "0 24px 16px 10px;",
  },
  circulLoading: {
    margin: 50,
    display: "flex",
    justifyContent: "center",
  },
  large: {
    margin: "0 auto",
    width: theme.spacing(7),
    height: theme.spacing(7),
    //backgroundColor: theme.palette.secondary.main,
    color: theme.palette.type === "dark" ? "inherit" : "rgba(0, 0, 0, 0.87)",
  },
}));

const SectionCardChart = (props) => {
  const classes = useStyles();
  const [dateTemp, setDateTemp] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const isXSmall = useMediaQuery((theme) => theme.breakpoints.down("xs"));
  const { settingAll, DateToString, CurrencyFormat } = useContext(GblContext);
  const { SettingSystem } = settingAll;

  if (!props.data) {
    return "";
  }
  const { name, stateKey, date, data } = props;
  const updateSection = () => {
    setLoading(true);
    if (dateTemp !== "Invalid Date") {
      props.updateSection(dateTemp, stateKey);
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

  const FieldFormDate = (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <DatePicker
        disableFuture
        inputVariant="outlined"
        format={SettingSystem.DateFormat}
        margin="dense"
        label="Select Date"
        value={dateTemp}
        onChange={(e) => setDateTemp(e)}
        autoOk={true}
        okLabel=""
        cancelLabel=""
        animateYearScrolling
        showTodayButton
      />
    </MuiPickersUtilsProvider>
  );

  const FieldFormYearMonth = (
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
            className={classes.cardHeader}
            action={
              <>
                <IconButton aria-label="settings" onClick={() => setOpen(true)}>
                  <MoreVertIcon />
                </IconButton>
                <ConfigDashboard
                  open={open}
                  close={closeConfig}
                  update={updateSection}
                  name={name}
                  field={name === "Statistical Highlight" ? FieldFormDate : FieldFormYearMonth}
                />
              </>
            }
            title={
              <Typography variant="body1">
                <b>{name}</b>
              </Typography>
            }
            subheader={
              <Typography variant="body2">
                {name === "Statistical Highlight"
                  ? DateToString(date ?? new Date(), SettingSystem.DateFormat)
                  : `${date.getMonth() < 9 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1}/${date.getFullYear()}`}
              </Typography>
            }
          />
          {name === "Statistical Highlight" ? (
            <Grid
              container
              direction="row"
              justifyContent="space-around"
              alignItems="flex-start"
              spacing={3}
              className={classes.main}
            >
              {data.map((item, idx) => (
                <React.Fragment key={idx}>
                  {isXSmall && (
                    <Grid item xs={6} sm={2} key={`smallBox-${idx}`} style={{ padding: 6 }}>
                      <Box>
                        <Avatar variant="rounded" className={classes.large} style={{ background: item.color }}>
                          <Icon fontSize="large">{item.icon}</Icon>
                        </Avatar>
                      </Box>
                    </Grid>
                  )}
                  <Grid item xs={6} sm={2} key={`text-${idx}`} style={{ padding: 6 }}>
                    <Box>
                      <Typography variant="body1" component="h6">
                        <Box textAlign="right" style={{ textTransform: "uppercase" }}>
                          {item.name}
                        </Box>
                      </Typography>
                      <Box textAlign="right">
                        <Typography variant="body1" component="h6">
                          <b>{CurrencyFormat(item.value1, item.unit) ?? 0}</b>
                        </Typography>
                      </Box>
                      <Box textAlign="right">
                        <Typography variant="body2" component="h6">
                          {item.value2 !== null ? `${CurrencyFormat(item.value1) ?? 0} %` : ""}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  {item.icon != null && !isXSmall ? (
                    <Grid item xs={12} sm={1} key={`icon-${idx}`}>
                      <Box textAlign="center">
                        <Avatar variant="rounded" className={classes.large} style={{ background: item.color }}>
                          <Icon fontSize="large">{item.icon}</Icon>
                        </Avatar>
                      </Box>
                    </Grid>
                  ) : (
                    ""
                  )}
                </React.Fragment>
              ))}
            </Grid>
          ) : (
            <Grid
              container
              direction="row"
              justifyContent="space-around"
              alignItems="flex-start"
              spacing={2}
              className={classes.main}
            >
              {data.map((item, idx) => (
                <React.Fragment key={idx}>
                  <Grid item xs={12} sm={2} key={`text-${idx}`} style={{ padding: 6 }}>
                    <Box>
                      <Box textAlign="center">
                        <Tooltip title="% Increase from last month" placement="top">
                          <div>
                            <DisplayValuePercent unit={item.unit} value={item.value2} />
                          </div>
                        </Tooltip>
                      </Box>
                      <Box textAlign="center">
                        <b>{CurrencyFormat(item.value1 ?? 0, item.unit)}</b>
                      </Box>
                      <Typography variant="body2" component="h6">
                        <Box textAlign="center" style={{ textTransform: "uppercase" }}>
                          {item.name}
                        </Box>
                      </Typography>
                    </Box>
                  </Grid>
                </React.Fragment>
              ))}
            </Grid>
          )}
        </Card>
      )}
    </>
  );
};

export default SectionCardChart;
