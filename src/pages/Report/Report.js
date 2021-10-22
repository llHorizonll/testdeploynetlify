/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { callStoreProcedurePost, getReportList, showReport } from "./services";
import DialogTitle from "@material-ui/core/DialogTitle";
import Dialog from "@material-ui/core/Dialog";
import Hidden from "@material-ui/core/Hidden";
import Fab from "@material-ui/core/Fab";
import {
  Paper,
  Typography,
  Button,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Avatar,
  Icon,
  Backdrop,
  CircularProgress,
  //Snackbar,
} from "@material-ui/core";
//import MuiAlert from "@material-ui/lab/Alert";
import { makeStyles } from "@material-ui/core/styles";
import DescriptionIcon from "@material-ui/icons/Description";
import DatePicker from "./controls/DatePicker";
import Lookup from "./controls/Lookup";
import Text from "./controls/Text";
import Label from "./controls/Label";
import SnackbarUtils from "utils/SnackbarUtils";

export default function Report(props) {
  const [reportList, setReportList] = useState();
  const [report, setReport] = useState({});
  const [listData, setListData] = useState([]);
  const [listControl, setListControl] = useState([]);
  const [param, setParam] = useState([]);
  const [loading, setLoading] = useState(false);
  //const [message, setMessage] = useState("");
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    async function fetch() {
      const groupName = props.options.groupName;
      const list = await getReportList(groupName);
      setReportList(list);
    }
    fetch();
  }, []);

  const useStyles = makeStyles((theme) => ({
    root: {
      //backgroundColor: theme.palette.background.paper,
      flexGrow: 1,
    },
    title: {
      margin: theme.spacing(4, 0, 2),
    },
    backdrop: {
      zIndex: theme.zIndex.drawer + 1,
      color: "#fff",
    },
  }));

  const classes = useStyles();

  const default_DateFormat = "dd/MM/yyyy";

  // const Alert = (props) => {
  //   return <MuiAlert elevation={6} variant="filled" {...props} />;
  // };

  const setParameter = (index, name, value) => {
    const newParam = { id: index, name: name, value: value };
    setParam((p) => {
      const old = p.filter((item) => item.name !== name);
      return [...old, newParam];
    });
  };

  const report_Click = (e, id) => {
    e.preventDefault();
    setParam([]);
    getListControls(id);
  };

  const preview_Click = async (e) => {
    e.preventDefault();

    setLoading(true);

    const parameters = [];
    // Ordering paramters by id
    param.sort((a, b) => (a.id > b.id ? 1 : a.id < b.id ? -1 : 0));
    // Create parameters in postData
    param.map((item) => parameters.push({ Name: item.name, Value: item.value }));
    const error = await showReport(report, parameters);
    //const error = await showReportByName('AP_Vendor1',[{ Name: "VendorCode", Value: "1" }] );
    setLoading(false);
    if (error) SnackbarUtils.warning(error);
  };

  const getListControls = async (id) => {
    if (+id > 0) {
      const result = reportList.Data && reportList.Data.filter((o) => o.Id === parseInt(id));

      const rpt = result ? result[0] : {};

      setReport(rpt);

      let xml = rpt.Dialog ? rpt.Dialog.replace(/^\s+|\s+$/gm, "") : undefined;

      if (xml) {
        const parser = new DOMParser();
        const dom = parser.parseFromString(xml, "text/xml");
        let nodes = dom.getElementsByTagName("Data")[0].childNodes;
        const dataSet = [];

        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i];
          const name = node.getAttribute("Name");
          const spName = node.getAttribute("StoredProcedureName");

          dataSet.push({
            name: name,
            data: await callStoreProcedurePost(spName),
          });
        }
        setListData(dataSet);

        let listControls = [];

        // Dialog
        nodes = dom.getElementsByTagName("Dialog")[0].childNodes;
        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i];
          const nodeName = node.nodeName.toLowerCase();

          const newControl = {
            type: nodeName,
            name: node.hasAttribute("Name") ? node.getAttribute("Name") : "",
            visble: node.hasAttribute("Visible") ? node.getAttribute("Visible").toLowerCase() === "true" : true,
            text: node.hasAttribute("Text") ? node.getAttribute("Text") : "",
            value: node.hasAttribute("Value") ? node.getAttribute("Value") : "",
            items: node.hasAttribute("Items") ? node.getAttribute("Items").split("~") : [],
            values: node.hasAttribute("Values") ? node.getAttribute("Values").split("~") : [],
            dataSource: node.hasAttribute("DataSource") ? node.getAttribute("DataSource") : "",
            dataValue: node.hasAttribute("DataValue") ? node.getAttribute("DataValue") : "",
            displayValue: node.hasAttribute("DisplayValue") ? node.getAttribute("DisplayValue") : "",
            displayColumns: node.hasAttribute("DisplayColumns") ? node.getAttribute("DisplayColumns") : "",
          };

          if (newControl.visble) listControls.push(newControl);
        } // for loop

        setListControl([]);
        setListControl(listControls);

        // end if
      } else setReport({});
    } else {
      setReport({});
    }
  };

  const createControls = (item, index) => {
    let tag = "";

    switch (item.type.toLowerCase()) {
      case "label":
        tag = <Label key={index} text={item.text} />;
        break;
      case "text":
        tag = <Text key={index} controlNo={index} name={item.name} value={item.text} setParameter={setParameter} />;

        break;
      case "date":
        tag = (
          <DatePicker
            key={index}
            controlNo={index}
            name={item.name}
            value={item.value}
            dateFormat={default_DateFormat}
            setParameter={setParameter}
            showTodayButton
          />
        );
        //console.log("DatePicker=", {index});

        break;
      case "lookup":
        const dataSet =
          item.dataSource !== "" && listData.find((x) => x.name.toLowerCase() === item.dataSource.toLowerCase());

        tag = (
          <Lookup
            key={index}
            controlNo={index}
            name={item.name}
            value={item.value}
            //dataSource={item.dataSource}
            dataSet={dataSet}
            dataValue={item.dataValue}
            displayValue={item.displayValue}
            items={item.items}
            values={item.values}
            setParameter={setParameter}
          />
        );
        //console.log(item);

        break;
      default:
        tag = <div key={index}></div>;
        break;
    }
    return tag;
  };

  const createDialog = () => {
    return (
      <>
        <Paper
          elevation={3}
          style={{
            paddingTop: 5,
            paddingLeft: 20,
            paddingRight: 20,
            paddingBottom: 20,
          }}
        >
          <Typography variant="h6" className={classes.title}>
            {report.ReportName}
          </Typography>
          <Divider />
          <br />
          {listControl && listControl.map((item, index) => createControls(item, index))}
          <br />
          <br />
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            startIcon={<Icon>print</Icon>}
            onClick={(e) => preview_Click(e)}
          >
            Preview
          </Button>
        </Paper>
      </>
    );
  };

  const getTitle = (groupName) => {
    switch (groupName.toLowerCase()) {
      case "gl":
        return "General Ledger";
      case "ap":
        return "Account Payable";
      case "ar":
        return "Account Receivable";
      case "asset":
        return "Asset Managment";
      default:
        return "";
    }
  };

  // --------------------------------------------
  // Modal to display report list when is on mobile (sm)
  // --------------------------------------------

  function ReportListModal(props) {
    const { onClose, open } = props;

    const handleClose_ReportListDialog = () => {
      onClose();
    };

    return (
      <Dialog
        fullWidth={true}
        maxWidth={"sm"}
        onClose={handleClose_ReportListDialog}
        aria-labelledby="dialog-title"
        open={open}
      >
        <DialogTitle id="dialog-title">{props.title}</DialogTitle>

        <List component="nav" aria-label="report list">
          {reportList &&
            reportList.Data.map((item) => (
              <ListItem
                button
                key={item.Id}
                onClick={(e) => {
                  report_Click(e, item.Id);
                  handleClose_ReportListDialog();
                }}
              >
                <ListItemAvatar>
                  <Avatar>
                    <DescriptionIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={item.ReportName} secondary={item.Description} />
              </ListItem>
            ))}
        </List>
      </Dialog>
    );
  }

  const showModal = () => {
    setOpenDialog(true);
  };

  const hideModal = (value) => {
    setOpenDialog(false);
  };
  // --------------------------------------------

  // Display UI

  return (
    <div className={classes.root}>
      <br />

      <Hidden only={["md", "lg", "xl"]}>
        <div style={{ textAlign: "center" }}>
          <Fab variant="extended" onClick={showModal}>
            {getTitle(props.options.groupName)}
          </Fab>
        </div>
        <ReportListModal title={getTitle(props.options.groupName)} open={openDialog} onClose={hideModal} />
        <br />
      </Hidden>

      <Grid container spacing={3}>
        <Hidden only={["xs", "sm"]}>
          <Grid item xs={12} sm={6}>
            <Paper elevation={3} style={{ paddingTop: 5, paddingLeft: 20, paddingRight: 20 }}>
              <Typography variant="h6" className={classes.title}>
                {getTitle(props.options.groupName)}
              </Typography>
              <Divider />
              <List component="nav" aria-label="report list">
                {reportList &&
                  reportList.Data.map((item) => (
                    <ListItem button key={item.Id} onClick={(e) => report_Click(e, item.Id)}>
                      <ListItemAvatar>
                        <Avatar>
                          <DescriptionIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={item.ReportName} secondary={item.Description} />
                    </ListItem>
                  ))}
              </List>
            </Paper>
          </Grid>
        </Hidden>

        <Grid item xs={12} sm={12} md={6}>
          {report.Id && createDialog()}
        </Grid>
      </Grid>
      {/* <Snackbar
        open={message !== ""}
        autoHideDuration={6000}
        onClose={(event, reason) => {
          if (reason === "clickaway") {
            return;
          }
          setMessage("");
        }}
      >
        <Alert
          severity="warning"
          onClose={(event, reason) => {
            if (reason === "clickaway") {
              return;
            }
            setMessage("");
          }}
        >
          {message}
        </Alert>
      </Snackbar> */}
      <Backdrop className={classes.backdrop} open={loading}>
        <CircularProgress color="inherit" />
      </Backdrop>

      {/* <Backdrop className={classes.backdrop} open={loading}>
        <CircularProgress color="inherit" />
        <Paper
          elevation={3}
          style={{ paddingTop: 5, paddingLeft: 20, paddingRight: 20 }}
        ></Paper>
      </Backdrop> */}
    </div>
  );
}
