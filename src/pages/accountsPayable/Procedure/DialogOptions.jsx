import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import { Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem } from "@material-ui/core";
import RadioGroup from "@material-ui/core/RadioGroup";
import Radio from "@material-ui/core/Radio";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import InputLabel from "@material-ui/core/InputLabel";
import { format } from "date-fns";

const useStyles = makeStyles((theme) => ({
  textCancel: {
    color: theme.palette.type === "dark" ? theme.palette.grey[800] : "inherit",
    border: `1px solid rgba(0, 0, 0, 0.23)`,
  },
}));

const DialogOption = (props) => {
  const classes = useStyles();
  const { headerText, open, onClose, options, isPeriodDialog } = props;
  const [taxPeriod, setTaxPeriod] = React.useState(format(new Date(), "MM/yyyy"));
  const [selectedOption, setSelectedOption] = React.useState(options[0]);
  const radioGroupRef = React.useRef(null);

  const handleEntering = () => {
    if (radioGroupRef.current != null) {
      radioGroupRef.current.focus();
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const handleOk = () => {
    if (isPeriodDialog) {
      onClose(taxPeriod);
      return;
    }
    onClose(selectedOption);
  };

  const handleTypeChange = (e, value) => {
    e.persist();
    const name = e.target.name;
    setSelectedOption({ ...selectedOption, [name]: value });
  };

  const handlePeriodChange = (e, value) => {
    setTaxPeriod(e.target.value);
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
      <DialogTitle id="confirmation-dialog-title">{headerText}</DialogTitle>
      <DialogContent dividers>
        {isPeriodDialog ? (
          <FormControl variant="outlined" fullWidth>
            <InputLabel id="label">Period</InputLabel>
            <Select
              labelId="label"
              variant="outlined"
              margin="dense"
              label="Period"
              style={{ width: 160, margin: "4px 0" }}
              value={taxPeriod}
              onChange={handlePeriodChange}
            >
              {options
                ? options.map((item, idx) => (
                    <MenuItem key={idx} value={item}>
                      {item}
                    </MenuItem>
                  ))
                : ""}
            </Select>
          </FormControl>
        ) : (
          <RadioGroup
            ref={radioGroupRef}
            aria-label="Type"
            name="value"
            value={selectedOption && selectedOption.value}
            onChange={handleTypeChange}
          >
            {options.map((option, idx) => (
              <FormControlLabel label={option.desc} key={option.value} value={option.value} control={<Radio />} />
            ))}
          </RadioGroup>
        )}
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

export default DialogOption;
