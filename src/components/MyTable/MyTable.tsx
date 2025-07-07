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
import { MyTableProps, } from "../../util";

export default function MyTable({
  tableFor,
  tableHead,
  tableHeadCallbacks,
  tableContent,
  highlightRow,
}: MyTableProps) {
  return (
    <MyContextMenuStrip
      callbacks={tableHeadCallbacks}
      target={
        <TableContainer
          component={Paper}
          sx={{ maxHeight: 500, overflowY: "auto", scrollBehavior: "smooth" }}
        >
          <Table
            stickyHeader
            className="open-sans-regular"
            sx={{ minWidth: 650 }}
            aria-label="simple table"
          >
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

            <TableBody>
              {tableContent?.map((content, cidx) => (
                <TableRow
                  key={cidx}
                  className={`${tableFor}-row`}
                  id={`${tableFor}-row-${cidx}`}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  style={
                    highlightRow === cidx
                      ? {
                          backgroundColor: "lightgray",
                          transition: "background-color 0.5s ease",
                        }
                      : {}
                  }
                >
                  {content.content.map((item, idx) => (
                    <TableCell key={idx} align="left">
                      {item}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      }
    />
  );
}
