/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import TextField from "@material-ui/core/TextField";

export default function Text({ controlNo, name, value, setParameter }) {
  const [text, setText] = useState(value);

  useEffect(() => {
    setText(value);
    setParameter(controlNo, name, value);

  }, []);

  return (
    <TextField
      id={name}
      name={name}
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        setParameter(controlNo, name, e.target.value);
      }}
    />
  );
}
