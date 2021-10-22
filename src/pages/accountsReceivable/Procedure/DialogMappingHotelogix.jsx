/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from "react";
import { useStateWithCallbackLazy } from "use-state-with-callback";
import { getMappingHotelogix, updateMappingHotelogix } from "services/interface";
import { getArProfileList } from "services/accountReceivable";
import { makeStyles } from "@material-ui/core/styles";
import Hidden from "@material-ui/core/Hidden";
import CircularProgress from "@material-ui/core/CircularProgress";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import { TableHead, TableRow, TableCell } from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import AddIcon from "@material-ui/icons/Add";
import EditIcon from "@material-ui/icons/Edit";
import CloseIcon from "@material-ui/icons/Close";
import { Button, Typography } from "@material-ui/core";
import MUIDataTable, { TableHead as MuiTableHead } from "mui-datatables";
import { MuiAutosuggest, TextFieldInForm } from "components/Form";
import PopupTable from "components/PopupTable";
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

export default function DialogItem(props) {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [lookupList, setLookupList] = useState({
    arProfileList: [],
  });
  const { open, onClose } = props;
  const [data, setData] = useStateWithCallbackLazy();
  const [columns, setColumns] = useState();
  const [showAdd, setShowAdd] = useState(false);
  const [editIndex, setEditIndex] = useState("");
  const [initNewRow] = useStateWithCallbackLazy({
    index: -1,
    ArNo: "",
    GuestNo: "",
    CounterAccount: "",
    FirstName: "",
    LastName: "",
    Company: "",
  });

  const fetchArProfileLookup = useCallback(async () => {
    const { Data } = await getArProfileList();
    setLookupList((state) => ({
      ...state,
      arProfileList: Data,
    }));
  }, []);

  useEffect(() => {
    fetchArProfileLookup();
  }, [fetchArProfileLookup]);

  const fetchMappingList = useCallback(async () => {
    setLoading(true);
    const { Mapping } = await getMappingHotelogix();
    const newColumns = [
      {
        name: "GuestNo",
        label: "Guest No.",
      },
      {
        name: "CounterAccount",
        label: "Counter Account",
      },
      {
        name: "ArNo",
        label: "ArNo",
      },
      {
        name: "FirstName",
        label: "FirstName",
      },
      {
        name: "LastName",
        label: "LastName",
      },
      {
        name: "Company",
        label: "Company",
      },
    ];

    newColumns.unshift({
      name: "index",
      label: " ",
      options: {
        filter: false,
        viewColumns: false,
        customBodyRender: (value) => {
          return (
            <>
              <EditIcon
                fontSize="small"
                color="primary"
                style={{ cursor: "pointer", marginLeft: 10 }}
                onClick={() => UpdateRow(value)}
              />
            </>
          );
        },
      },
    });
    Mapping.forEach((item, idx) => {
      item.index = idx;
    });

    setColumns(newColumns);
    setData(Mapping);

    setTimeout(() => {
      setLoading(false);
    }, 600);
  }, []);

  useEffect(() => {
    fetchMappingList();
  }, [fetchMappingList]);

  const Save = async () => {
    let param = {
      Mapping: data,
    };
    const { Code, UserMessage } = await updateMappingHotelogix(param);
    if (Code === 0) {
      SnackbarUtils.success(UserMessage);
      onClose();
    }
  };

  const options = {
    responsive: "standard",
    selectableRows: "multiple",
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

  const AddNewRow = () => {
    setEditIndex("");
    setShowAdd(true);
  };

  const UpdateRow = (value) => {
    setEditIndex(value);
    setShowAdd(true);
  };

  const SaveFromPopup = (arr, row) => {
    console.log((arr, row));
    if (editIndex !== "") {
      //update
      arr[editIndex] = row;
      setShowAdd(false);
    } else {
      //create
      row.index = arr.length;
      arr = [...arr, row];
      setShowAdd(false);
    }
    setData(arr);
  };

  const CancelFromPopup = () => {
    setShowAdd(false);
  };

  const CustomHeader = (props) => {
    return (
      <>
        <TableHead>
          <TableRow>
            <TableCell align="center" colSpan={1}>
              <IconButton size={"small"} onClick={() => AddNewRow()} style={{ marginLeft: 6 }}>
                <AddIcon />
              </IconButton>
            </TableCell>
            <TableCell align="right" colSpan={10}></TableCell>
          </TableRow>
        </TableHead>
        <MuiTableHead {...props} />
      </>
    );
  };

  const formFieldsDetail = [
    {
      size: 6,
      field: <TextFieldInForm label="GuestNo" name="GuestNo" variant="outlined" margin="dense" />,
    },
    {
      size: 6,
      field: <TextFieldInForm label="Counter Account" name="CounterAccount" variant="outlined" margin="dense" />,
    },
    {
      size: 6,
      field: (
        <MuiAutosuggest
          label="* A/R No."
          name="ArNo"
          optKey="ArNo"
          optDesc="Company"
          options={lookupList["arProfileList"]}
          updateOtherField={[
            { key: "FirstName", optKey: "FirstName" },
            { key: "LastName", optKey: "LastName" },
            { key: "Company", optKey: "Company" },
          ]}
          rule={{
            required: {
              value: true,
              message: "* Required",
            },
          }}
        />
      ),
    },
    {
      size: 6,
      field: <div></div>,
      implementation: "css",
      smDown: true,
      component: { Hidden },
    },
    {
      size: 12,
      field: (
        <TextFieldInForm
          label="FirstName"
          name="FirstName"
          variant="outlined"
          margin="dense"
          InputProps={{
            readOnly: true,
          }}
        />
      ),
    },
    {
      size: 12,
      field: (
        <TextFieldInForm
          label="LastName"
          name="LastName"
          variant="outlined"
          margin="dense"
          InputProps={{
            readOnly: true,
          }}
        />
      ),
    },
    {
      size: 12,
      field: (
        <TextFieldInForm
          label="Company"
          name="Company"
          variant="outlined"
          margin="dense"
          InputProps={{
            readOnly: true,
          }}
        />
      ),
    },
  ];

  return (
    <div>
      <Dialog open={open} onClose={onClose} scroll={"paper"} fullWidth maxWidth="lg" disableBackdropClick>
        <DialogTitle id="scroll-dialog-title" onClose={onClose}>
          Mapping code
        </DialogTitle>
        <DialogContent dividers className={classes.content}>
          {loading ? (
            <div className={classes.circulLoading}>
              <CircularProgress />
            </div>
          ) : (
            <MUIDataTable
              data={data}
              columns={columns}
              options={options}
              components={{
                TableHead: CustomHeader,
              }}
            />
          )}
          {showAdd && (
            <PopupTable
              initialValues={editIndex !== "" ? data[editIndex] : initNewRow}
              formFields={formFieldsDetail}
              update={() => {}}
              open={showAdd}
              save={(row) => SaveFromPopup(data, row)}
              cancel={CancelFromPopup}
            />
          )}
          <pre>{process.env.NODE_ENV === "development" ? JSON.stringify(data, 0, 2) : ""}</pre>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="primary" type="submit" onClick={() => Save(data)}>
            OK
          </Button>
          <Button onClick={onClose} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
