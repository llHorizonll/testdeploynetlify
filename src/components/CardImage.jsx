import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 345,
    textAlign: "center",
    padding: "20px 0",
  },
  rootNoBorder: {
    textAlign: "center",
    padding: "10px 0",
  },
  media: {
    width: "100%",
    height: "auto",
  },
  expand: {
    transform: "rotate(0deg)",
    marginLeft: "auto",
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: "rotate(180deg)",
  },
  avatar: {
    backgroundColor: "red",
  },
}));

const CardImage = ({ base64Src, imgSrc, noBorder, customSize }) => {
  const classes = useStyles();

  if (customSize) {
    return (
      <>
        {base64Src ? (
          <Card elevation={0}>
            <img style={{ height: customSize.height }} src={`data:image/png;base64, ${base64Src}`} alt="AssetImage" />
          </Card>
        ) : (
          <Card elevation={0}>
            <img style={{ height: customSize.height }} src={imgSrc} alt="AssetImage" />
          </Card>
        )}
      </>
    );
  }

  return (
    <>
      {base64Src ? (
        <Card
          elevation={noBorder ? 0 : 1}
          className={clsx({
            [classes.root]: !noBorder,
            [classes.rootNoBorder]: noBorder,
          })}
        >
          <img className={classes.media} src={`data:image/png;base64, ${base64Src}`} alt="AssetImage" />
        </Card>
      ) : (
        <Card
          elevation={noBorder ? 0 : 1}
          className={clsx({
            [classes.root]: !noBorder,
            [classes.rootNoBorder]: noBorder,
          })}
        >
          <img className={classes.media} src={imgSrc} alt="AssetImage" />
        </Card>
      )}
    </>
  );
};

export default CardImage;
