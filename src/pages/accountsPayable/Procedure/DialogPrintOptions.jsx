import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Dialog from "@material-ui/core/Dialog";
import FormControl from "@material-ui/core/FormControl";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  formControl: {
    margin: theme.spacing(1),
  },
  textCancel: {
    color: theme.palette.type === "dark" ? theme.palette.grey[800] : "inherit",
    border: `1px solid rgba(0, 0, 0, 0.23)`,
  },
}));

const DialogPrintOption = (props) => {
  const classes = useStyles();
  const { onClose, open, options } = props;
  const [state, setState] = React.useState(options);

  const handleCancel = () => {
    onClose();
  };

  const handleOk = () => {
    onClose(options);
  };

  const handleChange = (event, option) => {
    option.value = event.target.checked;
    setState({ ...state, option });
  };

  return (
    <Dialog
      disableBackdropClick
      disableEscapeKeyDown
      maxWidth="sm"
      aria-labelledby="confirmation-dialog-title"
      open={open}
    >
      <DialogTitle id="confirmation-dialog-title">Select Type</DialogTitle>
      <DialogContent dividers>
        <FormControl component="fieldset" className={classes.formControl}>
          <FormGroup>
            {options.map((option, idx) => (
              <FormControlLabel
                label={option.desc}
                key={idx}
                control={
                  <Checkbox checked={option.value} onChange={(e) => handleChange(e, option)} name={option.index} />
                }
              />
            ))}
          </FormGroup>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={handleOk} color="primary">
          Print
        </Button>
        <Button variant="outlined" className={classes.textCancel} onClick={handleCancel}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogPrintOption;
