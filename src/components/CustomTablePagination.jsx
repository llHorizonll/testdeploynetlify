import React from "react";
import TableFooter from "@material-ui/core/TableFooter";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import MuiTablePagination from "@material-ui/core/TablePagination";

export default function CustomTablePagination(props) {
  const {
    rowsPerPageOptions,
    count,
    rowsPerPage,
    page,
    onPageChange,
    onRowsPerPageChange,
  } = props;

  const footerStyle = {
    display: "flex",
    justifyContent: "flex-end",
    padding: "0px 24px 0px 24px",
  };

  return (
    <TableFooter>
      <TableRow>
        <TableCell style={footerStyle} colSpan={1000}>
          <MuiTablePagination
            rowsPerPageOptions={rowsPerPageOptions}
            component="div"
            count={count}
            rowsPerPage={rowsPerPage}
            page={page}
            // labelRowsPerPage={textLabels.rowsPerPage}
            // labelDisplayedRows={({ from, to, count }) =>
            //   `${from}-${to} ${textLabels.displayRows} ${count}`
            // }
            // backIconButtonProps={{
            //   "aria-label": textLabels.previous,
            // }}
            // nextIconButtonProps={{
            //   "aria-label": textLabels.next,
            // }}
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
          />
        </TableCell>
      </TableRow>
    </TableFooter>
  );
}
