import React from "react";
import NumberFormat from "react-number-format";

const NumberFormatInput = (props) => {
  const { inputRef, onChange, decimal, ...other } = props;
  return (
    <NumberFormat
      {...other}
      getInputRef={inputRef}
      onValueChange={(values) => {
        onChange({
          target: {
            name: props.name,
            value: values.value,
          },
        });
      }}
      thousandSeparator
      decimalScale={decimal ?? 2}
      fixedDecimalScale
      isNumericString
    />
  );
};

export default NumberFormatInput;
