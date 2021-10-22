/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext } from "react";
import { GblContext } from "providers/formatter";
import { makeStyles } from "@material-ui/core/styles";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import Icon from "@material-ui/core/Icon";
import IconButton from "@material-ui/core/IconButton";
import { Button, Typography, TextField } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import MUIDataTable from "mui-datatables";
import { postHotelogix } from "services/interface";
import ListBox from "components/ListBox";
import PopperListBox from "components/PopperListBox";
import parse from "autosuggest-highlight/parse";
import match from "autosuggest-highlight/match";
import SnackbarUtils from "utils/SnackbarUtils";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    margin: 30,
  },
  appBar: {
    position: "relative",
    backgroundColor: theme.palette.primary.main,
  },
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
  textCancel: {
    color: theme.palette.type === "dark" ? theme.palette.grey[800] : "inherit",
    border: `1px solid rgba(0, 0, 0, 0.23)`,
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
          <Icon>close</Icon>
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
};

export default function DialogPostingResult(props) {
  const classes = useStyles();
  const { DateToString, NumberFormat } = useContext(GblContext);
  const { open, onClose, data, updateData, lookupList } = props;
  const [newValue, setNewValue] = React.useState();

  const ConfirmToSave = () => {
    let selectedData = data;
    if (selectedData.length > 0) {
      var foundItem = selectedData.find((item) => item.ArNo === "");
      if (foundItem) {
        return [];
      }
      let numberOfPost = data.filter((x) => x.IsPass === true).length;
      let numberOfNotpost = data.filter((x) => x.IsPass === false).length;

      let all = numberOfPost + numberOfNotpost;

      let msg = `Found updated data : ${all} transactions
      (Y) Can post : ${numberOfPost}
      (N) Cannot post : ${numberOfNotpost}`;
      let dialog = window.confirm(msg);
      if (dialog) {
        return selectedData;
      } else {
        return [];
      }
    }
  };

  const Save = async () => {
    let selectedData = ConfirmToSave();
    if (selectedData.length > 0) {
      const { Code, UserMessage, InternalMessage } = await postHotelogix(data);
      if (Code === null) {
        alert("File Not Found");
      }
      if (Code === 0) {
        SnackbarUtils.success(UserMessage);
      }
      if (Code === -1) {
        alert(InternalMessage);
      }
      if (Code === -500) {
        alert(-500);
      }
    }
  };

  const columns = [
    {
      name: "IsPass",
      label: " ",
      options: {
        filter: false,
        sort: false,
        customBodyRender: (value) => {
          if (value) {
            return <Icon style={{ color: "green" }}>check_circle</Icon>;
          } else {
            return <Icon style={{ color: "red" }}>cancel</Icon>;
          }
        },
      },
    },
    {
      name: "ArNo",
      label: "A/R No.",
      options: {
        filter: false,
        sort: false,
        customBodyRender: (value, tableMeta) => {
          console.log(newValue);
          setNewValue(value);
          return (
            <Autocomplete
              size="small"
              id="arProfileList"
              disableClearable={false}
              disableListWrap
              ListboxComponent={ListBox}
              PopperComponent={PopperListBox}
              classes={{
                option: classes.option,
              }}
              options={lookupList["arProfileList"]}
              autoHighlight
              freeSolo={value === "" || "string" ? true : false}
              value={value}
              getOptionLabel={(option) => {
                return typeof option === "object" ? option.Code : option;
              }}
              onChange={(e, newItem) => {
                setNewValue("");
                if (newItem) {
                  updateData(tableMeta.rowIndex, newItem.Code);
                } else {
                  updateData(tableMeta.rowIndex, "");
                }
              }}
              style={{ width: 100, display: "inline-flex" }}
              renderInput={(params) => {
                return (
                  <TextField
                    {...params}
                    variant="outlined"
                    label="* A/R No"
                    name="ArNo"
                    margin="dense"
                    placeholder="A/R No"
                    value={params.inputProps.value}
                    error={params.inputProps.value === ""}
                    helperText={params.inputProps.value === "" ? "* Required" : null}
                  />
                );
              }}
              renderOption={(option, { inputValue }) => {
                let mergestring = `${option.Code} : ${option.Desc ? option.Desc : ""}`;
                const matches = match(mergestring, inputValue);
                const parts = parse(mergestring, matches);
                return (
                  <div>
                    {parts.map((part, index) => (
                      <span key={index} style={{ fontWeight: part.highlight ? 700 : 400 }}>
                        {part.text}
                      </span>
                    ))}
                  </div>
                );
              }}
              // filterOptions={(options, { inputValue }) => filterOptions(options, { inputValue }, "Code", "Desc")}
            />
          );
        },
      },
    },
    {
      name: "CounterAccount",
      label: "T/A Code",
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: "GuestNo",
      label: "Guest No.",
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: "FolioDate",
      label: "Folio Date",
      options: {
        filter: false,
        sort: true,
        customBodyRender: (value) => {
          let v = new Date(value);
          return DateToString(v ?? new Date());
        },
      },
    },
    {
      name: "FolioNo",
      label: "Folio No.",
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: "NameOfInhouse",
      label: "Name Of Inhouse",
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: "NameOfFolio",
      label: "Name Of Folio",
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: "Sal",
      label: "Sal",
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: "Address",
      label: "Address",
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: "Tel",
      label: "Tel",
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: "Amount",
      label: "Amount",
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
      name: "Comment",
      label: "Comment",
      options: {
        filter: false,
        sort: false,
      },
    },
  ];

  const options = {
    responsive: "standard",
    selectableRows: "none",
    fixedHeader: true,
    tableBodyHeight: "500px",
    search: false,
    download: false,
    filter: false,
    print: false,
    viewColumns: false,
    elevation: 0,
    setTableProps: () => {
      return {
        size: "small",
      };
    },
    pagination: false,
    onRowsDelete: (rowsDeleted) => {
      const removeArray = rowsDeleted.data.map((i) => i.index);
      for (var i = removeArray.length - 1; i >= 0; i--) data.splice(removeArray[i], 1);
    },
  };

  return (
    <div>
      <Dialog open={open} onClose={onClose} scroll={"paper"} fullWidth maxWidth="lg" disableBackdropClick>
        <DialogTitle id="scroll-dialog-title" onClose={onClose}>
          A/R Posting From Hotelogix
        </DialogTitle>
        <DialogContent dividers className={classes.content}>
          <MUIDataTable data={data} columns={columns} options={options} />
          <pre>{process.env.NODE_ENV === "development" ? JSON.stringify(data, 0, 2) : ""}</pre>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="primary" type="submit" onClick={() => Save(data)}>
            OK
          </Button>
          <Button variant="outlined" className={classes.textCancel} onClick={onClose}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
