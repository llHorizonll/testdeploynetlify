import React, { useContext, useState } from "react";
import { GblContext } from "providers/formatter";
import { Card, CardHeader, Avatar, Box, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Icon from "@material-ui/core/Icon";
import IconButton from "@material-ui/core/IconButton";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import CircularProgress from "@material-ui/core/CircularProgress";
import DatePickerFormat from "components/DatePickerFormat";
import ConfigDashboard from "./ConfigDashboard";

const useStyles = makeStyles((theme) => ({
  cardHeader: {
    padding: "10px 16px",
  },
  large: {
    width: theme.spacing(7),
    height: theme.spacing(7),
    backgroundColor: theme.palette.secondary.main,
    color: "#fff",
  },
  main: () => ({
    overflow: "inherit",
    padding: "0 10px 10px 10px",
    display: "flex",
    justifyContent: "flex-start",
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

const CardChart = (props) => {
  const classes = useStyles();
  const [dateTemp, setDateTemp] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { DateToString, NumberFormat } = useContext(GblContext);

  if (!props.data) {
    return "";
  }

  const { icon, name, date, value1, value2 } = props.data;

  const updateCard = () => {
    setLoading(true);
    if (dateTemp !== "Invalid Date") {
      props.updateCard(dateTemp, name);
    }
    setLoading(false);
    setOpen(false);
  };

  const closeConfig = () => {
    setDateTemp(date);
    setOpen(false);
  };

  const Field = (
    <DatePickerFormat
      disableFuture
      animateYearScrolling
      label="Select Date"
      value={dateTemp}
      onChange={(e) => setDateTemp(e)}
    />
  );

  return (
    <Card elevation={6}>
      {loading ? (
        <div className={classes.circulLoading}>
          <CircularProgress />
        </div>
      ) : (
        <>
          <CardHeader
            className={classes.cardHeader}
            action={
              <>
                <IconButton aria-label="settings" onClick={() => setOpen(true)}>
                  <MoreVertIcon />
                </IconButton>
                <ConfigDashboard open={open} close={closeConfig} update={updateCard} name={name} field={Field} />
              </>
            }
            title={
              <Typography variant="body1">
                <b>{name}</b>
              </Typography>
            }
            subheader={<Typography variant="body2">{DateToString(date ?? new Date())}</Typography>}
          />
          <div className={classes.main}>
            <Box>
              <Avatar variant="rounded" className={classes.large}>
                <Icon fontSize="large">{icon}</Icon>
              </Avatar>
            </Box>
            <Box ml="10px">
              <Typography variant="body1">{NumberFormat(value1 ?? 0)}</Typography>
              <Typography variant="body1">{value2 ? NumberFormat(value2) + " %" : ""}</Typography>
            </Box>
          </div>
        </>
      )}
    </Card>
  );
};

export default CardChart;
