import React from "react";
import Popper from "@material-ui/core/Popper";

const PopperListBox = function (props) {
  return <Popper {...props} style={{ width: 500 }} placement="bottom-start" />;
};

export default PopperListBox;
