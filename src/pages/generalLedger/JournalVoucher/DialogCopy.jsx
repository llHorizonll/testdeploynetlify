import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Dialog from "@material-ui/core/Dialog";
import RadioGroup from "@material-ui/core/RadioGroup";
import Radio from "@material-ui/core/Radio";
import FormControlLabel from "@material-ui/core/FormControlLabel";

const useStyles = makeStyles((theme) => ({
  textCancel: {
    color: theme.palette.type === "dark" ? theme.palette.grey[800] : "inherit",
    border: `1px solid rgba(0, 0, 0, 0.23)`,
  },
}));

const options = [
  {
    value: "1",
    desc: "Copy to new JV",
  },
  {
    value: "2",
    desc: "Copy and reverse transaction",
  },
  {
    value: "3",
    desc: "Copy to new JV with zero amount",
  },
  {
    value: "4",
    desc: "Copy to Template",
  },
];

const DialogCopy = (props) => {
  const classes = useStyles();
  const { onClose, open } = props;
  const [selectedOption, setSelectedOption] = React.useState({ value: "1" });
  const radioGroupRef = React.useRef(null);

  React.useEffect(() => {
    if (!open) {
      setSelectedOption(options[0]);
    }
  }, [open]);

  const handleEntering = () => {
    if (radioGroupRef.current != null) {
      radioGroupRef.current.focus();
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const handleOk = () => {
    onClose(selectedOption);
  };

  const handleChange = (event, value) => {
    event.persist();
    const name = event.target.name;
    setSelectedOption({ ...selectedOption, [name]: value });
  };

  return (
    <Dialog
      disableBackdropClick
      disableEscapeKeyDown
      maxWidth="xs"
      onEntering={handleEntering}
      aria-labelledby="confirmation-dialog-title"
      open={open}
    >
      <DialogTitle id="confirmation-dialog-title">Select Method</DialogTitle>
      <DialogContent dividers>
        <RadioGroup
          ref={radioGroupRef}
          aria-label="copyType"
          name="value"
          value={selectedOption.value}
          onChange={handleChange}
        >
          {options.map((option, idx) => (
            <FormControlLabel label={option.desc} key={option.value} value={option.value} control={<Radio />} />
          ))}
        </RadioGroup>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={handleOk} color="primary">
          Ok
        </Button>
        <Button variant="outlined" className={classes.textCancel} onClick={handleCancel}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogCopy;
