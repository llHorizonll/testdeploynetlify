import React, { useContext } from "react";
import { GblContext } from "providers/formatter";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  colorOfValuePlus: {
    fontSize: 12,
    color: "green",
    whiteSpace: "nowrap",
  },
  colorOfValueNeg: {
    fontSize: 12,
    color: "red",
    whiteSpace: "nowrap",
  },
  colorOfValueNormal: {
    fontSize: 12,
    color: "green",
    whiteSpace: "nowrap",
  },
}));

const DisplayValuePercent = (props) => {
  const classes = useStyles();
  const { NumberFormat, NumberFormatP1 } = useContext(GblContext);
  const switchColorClass = () => {
    if (props.value < 0) {
      return classes.colorOfValueNeg;
    }
    if (props.value > 0) {
      return classes.colorOfValuePlus;
    }
    if (props.value === 0) {
      return classes.colorOfValueNormal;
    }
  };

  const IgnorePlus = (props) => {
    if (props.unit === "ROOM") {
      return NumberFormat(props.value, "percent") + " %";
    } else if (props.fixDecimal) {
      return "+ " + NumberFormatP1(props.value) + " %";
    } else {
      return "+ " + NumberFormat(props.value, "percent") + " %";
    }
  };

  return (
    <div className={switchColorClass()}>
      {props.value != null ? (
        props.value >= 0 ? (
          <IgnorePlus {...props} />
        ) : (
          NumberFormat(props.value, "percent") + " %"
        )
      ) : (
        ""
      )}
    </div>
  );
};
export default DisplayValuePercent;
