import React from "react";
import { useTranslate } from "react-admin";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Avatar from "@material-ui/core/Avatar";
import Icon from "@material-ui/core/Icon";
import ExportIcon from "assets/Export.svg";
import Dis_ExportIcon from "assets/Dis_Export.svg";
import ExcelIcon from "assets/Excel.svg";
import Dis_ExcelIcon from "assets/Dis_Excel.svg";
import PaymentIcon from "assets/Payment.svg";
import Dis_PaymentIcon from "assets/Dis_Payment.svg";
import PrintChequeIcon from "assets/PrintCheque.svg";
import Dis_PrintChequeIcon from "assets/Dis_PrintCheque.svg";
import PrintWhtIcon from "assets/PrintWHT.svg";
import Dis_PrintWhtIcon from "assets/Dis_PrintWHT.svg";
import SnackbarUtils from "utils/SnackbarUtils";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    height: 140,
    width: 100,
  },
  layout: {
    padding: theme.spacing(1),
    marginBottom: 12,
  },
  button: {
    fontWeight: 400,
    textTransform: "none",
    height: 60, // setting height/width is optional
  },
  label: {
    // Aligns the content of the button vertically.
    flexDirection: "column",
    whiteSpace: "pre",
    lineHeight: 1.3,
  },
  small: {
    width: 18,
    height: 18,
    margin: 1,
  },
}));

const ActionMenu = (props) => {
  const classes = useStyles();
  const translate = useTranslate();
  const { menuControl, justify, permission, size } = props;

  const SwitchBtn = ({ name, dis }) => {
    let translatedName = translate(`ra.actionMenu.${name}`);
    switch (name) {
      case "Back":
        return (
          <>
            <Icon className="material-icons-outlined">arrow_back</Icon>
            {name}
          </>
        );
      case "Add":
        return (
          <>
            <Icon className="material-icons-outlined" color={!dis ? "primary" : "disabled"} fontSize={"medium"}>
              insert_drive_file
            </Icon>
            {translatedName}
          </>
        );
      case "Edit":
        return (
          <>
            <Icon className="material-icons-outlined" color={!dis ? "primary" : "disabled"} fontSize={"medium"}>
              edit
            </Icon>
            {translatedName}
          </>
        );
      case "Delete":
        return (
          <>
            <Icon className="material-icons-outlined" color={!dis ? "primary" : "disabled"} fontSize={"medium"}>
              delete
            </Icon>
            {translatedName}
          </>
        );
      case "Void":
        return (
          <>
            <Icon className="material-icons-outlined" color={!dis ? "primary" : "disabled"} fontSize={"medium"}>
              delete
            </Icon>
            {translatedName}
          </>
        );
      case "Excel":
        return (
          <>
            <Avatar variant="square" className={classes.small} alt="Excel" src={!dis ? ExcelIcon : Dis_ExcelIcon} />
            {name}
          </>
        );
      case "Copy":
        return (
          <>
            <Icon className="material-icons-outlined" color={!dis ? "primary" : "disabled"} fontSize={"medium"}>
              file_copy
            </Icon>
            {translatedName}
          </>
        );
      case "Template":
        return (
          <>
            <Icon className="material-icons-outlined" color={!dis ? "primary" : "disabled"} fontSize={"medium"}>
              description
            </Icon>
            {translatedName}
          </>
        );
      case "Disposal":
        return (
          <>
            <Icon className="material-icons-outlined" color={!dis ? "primary" : "disabled"} fontSize={"medium"}>
              description
            </Icon>
            {name}
          </>
        );
      case "Print":
        return (
          <>
            <Icon className="material-icons-outlined" color={!dis ? "primary" : "disabled"} fontSize={"medium"}>
              print
            </Icon>
            {translatedName}
          </>
        );
      case "Print Form":
        return (
          <>
            <Icon className="material-icons-outlined" color={!dis ? "primary" : "disabled"} fontSize={"medium"}>
              print
            </Icon>
            {name}
          </>
        );
      case "Print Report":
        return (
          <>
            <Icon className="material-icons-outlined" color={!dis ? "primary" : "disabled"} fontSize={"medium"}>
              description
            </Icon>
            {name}
          </>
        );
      case "Export":
        return (
          <>
            <Avatar variant="square" className={classes.small} alt="Export" src={!dis ? ExportIcon : Dis_ExportIcon} />
            {name}
          </>
        );
      case "Print BarCode":
        return (
          <>
            <Icon className="material-icons-outlined" color={!dis ? "primary" : "disabled"} fontSize={"medium"}>
              print
            </Icon>
            {name}
          </>
        );
      case "Print Cheque":
        return (
          <>
            <Avatar
              variant="square"
              className={classes.small}
              alt="Print Cheque"
              src={!dis ? PrintChequeIcon : Dis_PrintChequeIcon}
            />
            {name}
          </>
        );
      case "Print WHT":
        return (
          <>
            <Avatar
              variant="square"
              className={classes.small}
              alt="Print Wht"
              src={!dis ? PrintWhtIcon : Dis_PrintWhtIcon}
            />
            {name}
          </>
        );
      case "Payment":
        return (
          <>
            <Avatar
              variant="square"
              className={classes.small}
              alt="Payment"
              src={!dis ? PaymentIcon : Dis_PaymentIcon}
            />
            {name}
          </>
        );
      case "Receipt":
        return (
          <>
            <Avatar
              variant="square"
              className={classes.small}
              alt="Receipt"
              src={!dis ? PaymentIcon : Dis_PaymentIcon}
            />
            {name}
          </>
        );
      case "Settings":
        return (
          <>
            <Icon className="material-icons-outlined" color={!dis ? "primary" : "disabled"} fontSize={"medium"}>
              settings
            </Icon>
            {name}
          </>
        );
      //no default
    }
  };

  const CheckPermission = (name, fnc) => {
    const textTranslate = translate("ra.permission.denied");

    switch (name) {
      case "Add":
      case "Copy":
      case "Template":
        if (permission["Add"]) {
          return fnc();
        } else {
          SnackbarUtils.error(textTranslate);
          return false;
        }
      case "Edit":
        if (permission["Update"]) {
          return fnc();
        } else {
          SnackbarUtils.error(textTranslate);
          return false;
        }
      case "Void":
      case "Delete":
        if (permission["Delete"]) {
          return fnc();
        } else {
          SnackbarUtils.error(textTranslate);
          return false;
        }
      case "Print":
        if (permission["View"]) {
          return fnc ? fnc() : null;
        } else {
          SnackbarUtils.error(textTranslate);
          return false;
        }
      default:
        if (fnc) {
          return fnc ? fnc() : null;
        } else {
          return null;
        }
    }
  };

  return (
    <Grid item xs={size ? "auto" : 12}>
      <Grid container justifyContent={justify ? justify : "flex-end"} spacing={1}>
        {menuControl
          ? menuControl.map((element) => (
              <Grid item key={element.name} style={{ flex: element.name === "Back" ? 1 : 0 }}>
                <Button
                  classes={{ root: classes.button, label: classes.label }}
                  disabled={element.name !== "Back" ? element.disabled : false}
                  onClick={() => {
                    if (permission) {
                      CheckPermission(element.name, element.fnc);
                    } else {
                      console.log("not send permission yet");
                      element.fnc();
                    }
                  }}
                >
                  <SwitchBtn name={element.name} dis={element.disabled} />
                </Button>
              </Grid>
            ))
          : ""}
      </Grid>
    </Grid>
  );
};

export default ActionMenu;
