/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useState } from "react";
import clsx from "clsx";
import { GblContext } from "providers/formatter";
import { makeStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
import Paper from "@material-ui/core/Paper";
import Box from "@material-ui/core/Box";
import Dialog from "@material-ui/core/Dialog";
import Typography from "@material-ui/core/Typography";
import DialogContent from "@material-ui/core/DialogContent";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import Collapse from "@material-ui/core/Collapse";
import IconButton from "@material-ui/core/IconButton";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import CloseIcon from "@material-ui/icons/Close";
import MUIDataTable from "mui-datatables";

const useStyles = makeStyles((theme) => ({
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
  content: {
    padding: 0,
  },
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  circulLoading: {
    margin: 50,
    display: "flex",
    justifyContent: "center",
  },
  expand: {
    transform: "rotate(0deg)",
    marginLeft: "auto",
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: "rotate(180deg)",
  },
}));

const DialogTitle = (props) => {
  const { children, onClose, ...other } = props;
  const classes = useStyles();

  return (
    <MuiDialogTitle disableTypography {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
};

export default function ErrorList(props) {
  const classes = useStyles();
  const { DateToString } = useContext(GblContext);
  const { open, onClose, errorList } = props;
  const [showTypeClosePeriod, setShowTypeClosePeriod] = useState(true);
  const [showModule, setShowModule] = useState(true);

  const arrLogType = errorList.filter((i) => i.LogType === "Close period");
  const arrValiation = errorList.filter((i) => i.LogType !== "Close period");

  const columns = [
    {
      name: "Prefix",
      label: "Document No.",
      options: {
        filter: false,
        sort: false,
        customBodyRender: (value, tableMeta) => {
          return value + " " + tableMeta.rowData[1];
        },
      },
    },
    {
      name: "JvhNo",
      label: "JvhNo",
      options: {
        display: false,
      },
    },
    {
      name: "JvhDate",
      label: "Date",
      options: {
        filter: false,
        sort: false,
        customBodyRender: (value, tableMeta, updateValue) => {
          let v = new Date(value);
          return DateToString(v ?? new Date());
        },
      },
    },
    {
      name: "LogType",
      label: "Message",
      options: {
        filter: false,
        sort: false,
        customBodyRender: (value, tableMeta) => {
          return value + " " + tableMeta.rowData[4];
        },
      },
    },
    {
      name: "LogMessage",
      label: "LogMessage",
      options: {
        display: false,
      },
    },
  ];

  const options = {
    responsive: "standard",
    selectableRows: "none",
    fixedHeader: true,
    search: false,
    download: false,
    filter: false,
    print: true,
    viewColumns: false,
    setTableProps: () => {
      return {
        size: "small",
      };
    },
    pagination: false,
  };

  return (
    <div>
      <Dialog
        open={open}
        // eslint-disable-next-line no-sequences
        onClose={({ event: onClose }, { reason: "disableBackdropClick" })}
        scroll={"paper"}
        fullWidth
        maxWidth="md"
        disableBackdropClick
      >
        <DialogTitle id="scroll-dialog-title" onClose={onClose}>
          ErrorList
        </DialogTitle>
        <DialogContent dividers className={classes.content}>
          {!errorList ? (
            <div className={classes.circulLoading}>
              <CircularProgress />
            </div>
          ) : (
            <>
              <Box mx={3} my={2} display="flex" onClick={() => setShowTypeClosePeriod(!showTypeClosePeriod)}>
                <Typography variant="h6">
                  ClosePeriod
                  <IconButton
                    className={clsx(classes.expand, {
                      [classes.expandOpen]: showTypeClosePeriod,
                    })}
                    aria-expanded={showTypeClosePeriod}
                    aria-label="show more"
                  >
                    <ExpandMoreIcon />
                  </IconButton>
                </Typography>
              </Box>

              <Collapse in={showTypeClosePeriod} timeout="auto" unmountOnExit>
                <Box mx={3}>
                  <Paper mx={3} variant="outlined" square={true}>
                    {arrLogType
                      ? arrLogType.map((item, idx) => (
                          <div key={idx} style={{ margin: "10px 40px" }}>
                            <Typography
                              display="inline"
                              style={{ marginLeft: "20px" }}
                              variant="h6"
                              color="textSecondary"
                            >
                              ⚠️
                            </Typography>
                            <Typography
                              display="inline"
                              style={{ marginLeft: "40px " }}
                              variant="body1"
                              color="textSecondary"
                            >
                              {item.ErrorCode} {item.LogMessage}
                            </Typography>
                          </div>
                        ))
                      : ""}
                  </Paper>
                </Box>
              </Collapse>

              <Box mx={3} my={2} display="flex" onClick={() => setShowModule(!showModule)}>
                <Typography variant="h6">
                  Validation
                  <IconButton
                    className={clsx(classes.expand, {
                      [classes.expandOpen]: showModule,
                    })}
                    aria-expanded={showModule}
                    aria-label="show more"
                  >
                    <ExpandMoreIcon />
                  </IconButton>
                </Typography>
              </Box>

              <Collapse in={showModule} timeout="auto" unmountOnExit>
                <Box mx={3}>
                  <Paper mx={3} variant="outlined" square={true}>
                    <MUIDataTable data={arrValiation} columns={columns} options={options} />
                  </Paper>
                </Box>
              </Collapse>
            </>
          )}

          <pre>{process.env.NODE_ENV === "development" ? JSON.stringify(errorList, 0, 2) : ""}</pre>
        </DialogContent>
      </Dialog>
    </div>
  );
}
