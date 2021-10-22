import React from "react";
import clsx from "clsx";
import { Box, Typography, Chip } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import FilterMenu from "components/FilterMenu";
import { withTranslate } from "react-admin";

const useStyles = makeStyles((theme) => ({
  statusDraft: {
    backgroundColor: theme.palette.grey,
    color: theme.palette.text.primary,
  },
  statusNormal: {
    backgroundColor: "#2196f3",
    color: "white",
  },
  statusVoid: {
    backgroundColor: "#e57373",
    color: "white",
  },
  statusActive: {
    backgroundColor: "green",
    color: "white",
  },
  statusInactive: {
    backgroundColor: "#e57373",
    color: "white",
  },
}));

const BoxHeader = ({ header, source, status, showSearch, searchOption, translate }) => {
  const classes = useStyles();
  return (
    <Box display="flex" bgcolor="background.paper">
      <Box flexGrow={1}>
        <Typography variant="h6" gutterBottom>
          {translate(`ra.module.${header}`)}
        </Typography>
      </Box>
      {showSearch ? <FilterMenu searchOption={searchOption} /> : ""}
      {source ? (
        <Box p={1}>
          <Chip label={source} className={classes.statusDraft} />
        </Box>
      ) : (
        ""
      )}
      {status !== undefined ? (
        <Box p={1}>
          {typeof status === "boolean" ? (
            <Chip
              label={status ? "Active" : "In-Active"}
              className={clsx({
                [classes.statusActive]: status === true,
                [classes.statusInactive]: status === false,
              })}
            />
          ) : (
            <Chip
              label={status}
              className={clsx(classes.statusDraft, {
                [classes.statusNormal]: status === "Normal",
                [classes.statusVoid]: status === "Void",
              })}
            />
          )}
        </Box>
      ) : (
        ""
      )}
    </Box>
  );
};

export default withTranslate(BoxHeader);
