import React, { useState } from "react";
import { Dialog, Button, TextField } from "@material-ui/core";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";

export default function DialogChangeRevision(props) {
  const { value, open, close, save } = props;
  const [newValue, setNewValue] = useState();

  React.useEffect(() => {
    setNewValue(value);
  }, [value]);

  const handleChange = (event) => {
    setNewValue(event.target.value);
  };
  const updateRevCaption = () => {
    save(newValue);
  };

  return (
    <div>
      <Dialog onClose={close} aria-labelledby="customized-dialog-title" open={open}>
        <DialogTitle onClose={close}>Change Revision Name</DialogTitle>
        <DialogContent>
          <TextField
            variant="outlined"
            autoFocus
            margin="dense"
            label="Caption"
            defaultValue={newValue}
            onChange={handleChange}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="primary" onClick={updateRevCaption}>
            Save
          </Button>
          <Button onClick={close} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
