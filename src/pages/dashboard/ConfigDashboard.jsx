import React from "react";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles((theme) => ({
  centerContent: {
    display: "flex",
    flexDirection: "column",
    margin: "auto",
    width: "fit-content",
  },
}));

const styles = (theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  centerContent: {
    display: "flex",
    flexDirection: "column",
    margin: "auto",
    width: "fit-content",
  },
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
});

const DialogTitle = withStyles(styles)((props) => {
  const { children, classes, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});

const ConfigDashboard = (props) => {
  const classes = useStyles();
  const { field } = props;
  return (
    <Dialog
      fullWidth
      open={props.open}
      onClose={props.close}
      aria-labelledby="customized-dialog-title"
    >
      <DialogTitle id="customized-dialog-title" onClose={props.close}>
        {/* Config {name} */}
      </DialogTitle>
      <DialogContent className={classes.centerContent}>
        {field ? field : ""}
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={props.update} color="primary" variant="contained">
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfigDashboard;

// const ConfigDashboard = (props) => {
//   const classes = useStyles();
//   const [accCode, setAccCode] = useState("1111");

//   return (
//     <Drawer anchor="right" open={props.open} onClose={props.close}>
//       <Typography variant="h4" component="h4">
//         <Box textAlign="center">Config</Box>
//       </Typography>
//       <Divider />
//       <div className={classes.list} role="presentation">
//         <List>
//           <TextField
//             variant="outlined"
//             margin="dense"
//             fullWidth
//             select
//             id="AccountCode"
//             label="AccountCode"
//             value={accCode}
//             onChange={(e) => setAccCode(e.target.value)}
//           >
//             {["1111", "2222", "3333", "4444"].map((option) => (
//               <MenuItem key={option} value={option}>
//                 {option}
//               </MenuItem>
//             ))}
//           </TextField>
//           <TextField
//             variant="outlined"
//             margin="dense"
//             fullWidth
//             id="date"
//             label="From"
//             type="date"
//             defaultValue="2017-05-24"
//             className={classes.textField}
//             InputLabelProps={{
//               shrink: true,
//             }}
//           />
//           <TextField
//             variant="outlined"
//             margin="dense"
//             fullWidth
//             id="date"
//             label="To"
//             type="date"
//             defaultValue="2017-05-24"
//             className={classes.textField}
//             InputLabelProps={{
//               shrink: true,
//             }}
//           />
//         </List>
//       </div>
//     </Drawer>
//   );
// };
