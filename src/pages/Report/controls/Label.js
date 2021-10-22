import { Typography } from "@material-ui/core";
import React from "react";

export default function Label({ text }) {
  return (
    <div>
      <br />
      <Typography variant="h6">{text}</Typography>
    </div>
  );
}
