import React from "react";
import MUIDataTable from "mui-datatables";
import { withTranslate } from "react-admin";

const MuiTranslateTable = ({ data, columns, options, translate }) => {
  columns.forEach((item) => (item.label = item.label !== "" ? translate(`ra.field.${item.label}`) : ""));
  return <MUIDataTable data={data} columns={columns} options={options} />;
};

export default withTranslate(MuiTranslateTable);
