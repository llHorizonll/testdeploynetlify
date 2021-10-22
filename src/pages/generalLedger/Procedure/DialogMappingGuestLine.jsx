/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from "react";
import { useStateWithCallbackLazy } from "use-state-with-callback";
import { getMappingGuestLine, updateMappingGuestLine } from "services/interface";
import { getDimensionByCaption } from "services/dimension";
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
import { MuiAutosuggest, TextFieldInForm, SelectInForm, DescInForm } from "components/Form";
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
  const { open, onClose, lookupList, dimValueCfg } = props;
  const [data, setData] = useStateWithCallbackLazy();
  const [columns, setColumns] = useState();
  const [showAdd, setShowAdd] = useState(false);
  const [editIndex, setEditIndex] = useState("");
  const [lookupDimension, setLookupDimension] = useState();
  const [initNewRow, setInitNewRow] = useStateWithCallbackLazy({
    index: -1,
    OriginalRow: null,
    PMS_Department: "",
    PMS_AccountCode: "",
    PMS_Description: "",
    DeptCode: "",
    AccCode: "",
    AccDesc: "",
    RowState: 4,
  });

  const fetchMappingList = useCallback(async () => {
    setLoading(true);
    const { Columns, Rows } = await getMappingGuestLine();
    const newColumns = Columns.map(({ ColumnName: name, Caption: label }) => ({
      name,
      label,
    }));
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
    Rows.forEach((item, idx) => {
      item.index = idx;
      if (item[dimValueCfg] === null) {
        item[dimValueCfg] = "";
      }
    });

    if (newColumns?.length > 0) {
      const { Data } = await getDimensionByCaption(newColumns[newColumns.length - 1].name);
      setInitNewRow((state) => ({
        ...state,
        [dimValueCfg]: "",
      }));
      if (Data[0].ListOfValues) {
        let pattern = /([^[]+(?=]))/g;
        var q = Data[0].ListOfValues.trim();
        var listString = q.match(pattern);
        var newlistArray;
        if (listString.length > 0) {
          newlistArray = listString.map((element) => {
            let textSplit = element.split(":");
            return { key: textSplit[0], value: textSplit[1] };
          });
        }
        setLookupDimension(newlistArray);
      }
    }

    setColumns(newColumns);
    setData(Rows);

    setTimeout(() => {
      setLoading(false);
    }, 600);
  }, []);

  useEffect(() => {
    fetchMappingList();
  }, [fetchMappingList]);

  const Save = async () => {
    const { Code, UserMessage } = await updateMappingGuestLine(data);
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
      field: <TextFieldInForm label="PMS_Department" name="PMS_Department" variant="outlined" margin="dense" />,
    },
    {
      size: 6,
      field: <TextFieldInForm label="PMS_AccountCode" name="PMS_AccountCode" variant="outlined" margin="dense" />,
    },
    {
      size: 12,
      field: <TextFieldInForm label="PMS_Description" name="PMS_Description" variant="outlined" margin="dense" />,
    },
    {
      size: 6,
      field: (
        <MuiAutosuggest
          label="* Department"
          name="DeptCode"
          optKey="DeptCode"
          optDesc="Description"
          options={lookupList["departmentList"]}
          updateOtherField={[{ key: "DeptDesc", optKey: "Description" }]}
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
      name: "DeptDesc",
      field: (
        <DescInForm
          style={{ marginTop: 8 }}
          name="DeptDesc"
          InputProps={{
            readOnly: true,
          }}
        />
      ),
    },
    {
      size: 6,
      field: (
        <MuiAutosuggest
          label="* Account #"
          name="AccCode"
          optKey="AccCode"
          optDesc="Description"
          options={lookupList["accountCodeList"]}
          updateOtherField={[{ key: "AccDesc", optKey: "Description" }]}
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
      name: "AccDesc",
      field: (
        <DescInForm
          style={{ marginTop: 8 }}
          name="AccDesc"
          InputProps={{
            readOnly: true,
          }}
        />
      ),
    },
    {
      size: 6,
      field: <SelectInForm label={dimValueCfg} name={dimValueCfg} options={lookupDimension} />,
    },
    {
      size: 6,
      field: <div></div>,
      implementation: "css",
      smDown: true,
      component: { Hidden },
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
