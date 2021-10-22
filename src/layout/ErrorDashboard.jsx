import * as React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import ErrorIcon from "@material-ui/icons/Report";
import { Title } from "react-admin";

const useStyles = makeStyles(
  (theme) => ({
    container: {
      marginTop: 200,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      [theme.breakpoints.down("sm")]: {
        padding: "1em",
      },
      fontFamily: "Roboto, sans-serif",
      opacity: 0.5,
    },
    title: {
      display: "flex",
      alignItems: "center",
    },
    icon: {
      width: "2em",
      height: "2em",
      marginRight: "0.5em",
    },
    panel: {
      marginTop: "1em",
    },
    panelDetails: {
      whiteSpace: "pre-wrap",
    },
    toolbar: {
      marginTop: "2em",
    },
  }),
  { name: "RaError" }
);

const ErrorPage = (props) => {
  const { classes: classesOverride, className, title, ...rest } = props;
  const classes = useStyles(props);
  return (
    <React.Fragment>
      {title && <Title defaultTitle={title} />}
      <div className={clsx(classes.container, className)} {...rest}>
        <h1 className={classes.title} role="alert">
          <ErrorIcon className={classes.icon} />
          Our new dashboard coming soon!!
        </h1>
      </div>
    </React.Fragment>
  );
};

export default ErrorPage;
