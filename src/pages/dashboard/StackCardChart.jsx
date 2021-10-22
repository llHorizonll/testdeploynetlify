import React, { useContext, useState } from "react";
import { GblContext } from "providers/formatter";
import CircularProgress from "@material-ui/core/CircularProgress";
import { Card, CardHeader, Typography, Checkbox, TextField, Tooltip, Divider } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import CheckBoxOutlineBlankIcon from "@material-ui/icons/CheckBoxOutlineBlank";
import CheckBoxIcon from "@material-ui/icons/CheckBox";
import { makeStyles } from "@material-ui/core/styles";
import { List, ListItem, ListItemText, ListItemIcon, ListItemSecondaryAction } from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import ImageIcon from "@material-ui/icons/Image";
//import AddIcon from "@material-ui/icons/Add";
import DatePickerFormat from "components/DatePickerFormat";
import ConfigDashboard from "./ConfigDashboard";
import DisplayValuePercent from "components/DisplayValuePercent";
//import { getAccountCodeList } from "services/setting";
import ListBox from "components/ListBox";
import PopperListBox from "components/PopperListBox";
import { useMediaQuery } from "@material-ui/core";

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
  circulLoading: {
    margin: 50,
    display: "flex",
    justifyContent: "center",
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

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const StackCardChart = (props) => {
  const classes = useStyles();
  const { DateToString, NumberFormat } = useContext(GblContext);
  const [dateTemp, setDateTemp] = useState(new Date());
  const [add, setAdd] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lookupList] = useState({
    accountCode: [],
  });
  //const [accValue, setAccValue] = useState();
  const { name, stateKey, date, data } = props;
  const isXSmall = useMediaQuery((theme) => theme.breakpoints.down("xs"));

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

  // const selectAccount = async () => {
  //   setAdd(true);
  //   const { Data } = await getAccountCodeList();
  //   setLookupList((state) => ({
  //     ...state,
  //     accountCode: Data,
  //   }));
  //   setOpen(true);
  // };

  const selectSetting = async () => {
    setAdd(false);
    setOpen(true);
  };

  const Field = (
    <Autocomplete
      multiple
      id="Account"
      options={lookupList["accountCode"]}
      disableCloseOnSelect
      disableListWrap
      //value={accValue}
      //onChange={(e, newValue) => setAccValue(newValue)}
      ListboxComponent={ListBox}
      PopperComponent={PopperListBox}
      classes={{
        option: classes.option,
      }}
      getOptionLabel={(option) => option.AccCode}
      renderOption={(option, { selected }) => (
        <React.Fragment>
          <Checkbox icon={icon} checkedIcon={checkedIcon} style={{ marginRight: 8 }} checked={selected} />
          {`${option.AccCode} : ${option.Description}`}
        </React.Fragment>
      )}
      style={{ width: 300 }}
      renderInput={(params) => (
        <TextField {...params} variant="outlined" label="AccountCode" margin="dense" placeholder="AccountCode" />
      )}
    />
  );

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
        <Card elevation={6}>
          <CardHeader
            action={
              <>
                {/* <IconButton aria-label="settings" onClick={selectAccount}>
                  <AddIcon />
                </IconButton> */}
                <IconButton aria-label="settings" onClick={selectSetting}>
                  <MoreVertIcon />
                </IconButton>
                <ConfigDashboard
                  open={open}
                  close={closeConfig}
                  update={updateChart}
                  name={name}
                  //select multi account
                  //field={Field}
                  //select date
                  field={add ? Field : FieldFormDate}
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
          <List dense className={classes.root}>
            {data && data?.length > 0 ? (
              <ListItem>
                <ListItemText style={{ paddingLeft: 60 }} primary={<b>Account</b>} />
                <ListItemText
                  style={{
                    textAlign: "right",
                    paddingRight: isXSmall ? "2rem" : "5rem",
                  }}
                  primary={
                    <Tooltip title="Total as of today" placement="top">
                      <Typography variant="body2">
                        <b>Amount</b>
                      </Typography>
                    </Tooltip>
                  }
                />
                <ListItemSecondaryAction style={{ top: "48%" }}>
                  <Tooltip title="% Increase from yesterday" placement="top-end">
                    <Typography variant="body2">
                      <b>Previos Day</b>
                    </Typography>
                  </Tooltip>
                </ListItemSecondaryAction>
              </ListItem>
            ) : (
              ""
            )}
            <Divider />
            {data
              ? data.map((item, idx) => (
                  <ListItem key={idx}>
                    <ListItemIcon style={{ minWidth: 30 }}>
                      <ImageIcon />
                    </ListItemIcon>
                    <ListItemText primary={`${item.AccCode} : ${item.AccDesc}`} />
                    <ListItemText
                      style={{
                        textAlign: "right",
                        paddingRight: isXSmall ? "2rem" : "5rem",
                      }}
                      primary={NumberFormat(item.Amount)}
                    />
                    <ListItemSecondaryAction>
                      <Typography variant="body2">
                        <DisplayValuePercent value={item.Percentage} />
                      </Typography>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))
              : ""}
          </List>
        </Card>
      )}
    </>
  );
};

export default StackCardChart;
