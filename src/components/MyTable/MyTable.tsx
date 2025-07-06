import React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import "./MyTable.css";
import MyContextMenuStrip from "../MyContextMenuStrip/MyContextMenuStrip";
import { MyTableProps, table_row } from "../../util";
import HashNode from "../../dsa/hash_table/HashNode";

export default function MyTable({
  tableFor,
  tableHead,
  tableHeadCallbacks,
  tableContent,
}: MyTableProps) {
  return (
    <TableContainer component={Paper}>
      <Table
        className="open-sans-regular"
        sx={{ minWidth: 650 }}
        aria-label="simple table"
      >
        <MyContextMenuStrip
          target={
            <TableHead>
              <TableRow>
                <TableCell align="left">#</TableCell>
                {tableHead.map((header, index) => (
                  <TableCell key={index} align="left">
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
          }
          callbacks={tableHeadCallbacks}
        />

        <TableBody>
          {tableContent?.map((content, cidx) => (
            <MyContextMenuStrip
              // callbacks={callbacks.tableContent}
              callbacks={content.callbacks}
              key={cidx}
              target={
                <TableRow
                  className="table-row"
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  {content.content.map((item, idx) => (
                    <TableCell key={idx} align="left">
                      {item}
                    </TableCell>
                  ))}
                </TableRow>
              }
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
