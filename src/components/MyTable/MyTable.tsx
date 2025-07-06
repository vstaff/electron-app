import React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { HashTable } from "../../dsa/HashTable";
import "./MyTable.css";
import MyContextMenuStrip from "../MyContextMenuStrip/MyContextMenuStrip";
import { Callback } from "../../util";

interface MyTableProps {
  hashTable: HashTable;
  callbacks: Callback[];
}

export default function MyTable({ hashTable, callbacks }: MyTableProps) {
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
                {/* <TableCell align="left">Исходная строка</TableCell> */}
                <TableCell align="left">Статус</TableCell>
                <TableCell align="left">Первичный хеш</TableCell>
                <TableCell align="left">Вторичный хеш</TableCell>
                <TableCell align="left">ФИО</TableCell>
                <TableCell align="left">Класс</TableCell>
                <TableCell align="left">Дата Рождения</TableCell>
              </TableRow>
            </TableHead>
          }
          callbacks={[
            {
              name: callbacks[0].name, // Добавить
              callback: () => {
                callbacks[0].callback();
                console.log("добавить из контекстного меню");
              },
            },
            {
              name: callbacks[1].name, // Экспортировать
              callback: () => {
                callbacks[1].callback();
                console.log("экспортировать из контекстного меню");
              },
            },
            {
              name: callbacks[2].name, // Импортировать
              callback: () => {
                callbacks[2].callback();
                console.log("импортировать из контекстного меню");
              },
            },
          ]}
        />
        <TableBody>
          {hashTable.getNodes().map((node, index) => {
            return (
              <MyContextMenuStrip key={index}
                target={
                  <TableRow
                    className="table-row"
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell className="table-cell-index" align="left">
                      {index}
                    </TableCell>

                    {/* <TableCell className="table-cell-origin-row" align="left">
                  {node.originRow ?? "~"}
                </TableCell> */}

                    <TableCell className="table-cell-status" align="left">
                      {node.status ?? "~"}
                    </TableCell>

                    <TableCell className="table-cell-initial-hash" align="left">
                      {node.initialHash ?? "~"}
                    </TableCell>

                    <TableCell
                      className="table-cell-secondary-hash"
                      align="left"
                    >
                      {node.secondaryHash ?? "~"}
                    </TableCell>

                    <TableCell className="table-cell-name" align="left">
                      {node.key?.name ?? "~"}
                    </TableCell>

                    <TableCell className="table-cell-class-code" align="left">
                      {node.value?.classCode ?? "~"}
                    </TableCell>

                    <TableCell className="table-cell-birth-date" align="left">
                      {node.key?.birthDate ?? "~"}
                    </TableCell>
                  </TableRow>
                }
                callbacks={[
                  {
                    name: callbacks[3].name,
                    callback: () => {
                      callbacks[3].callback();
                      console.log("редактировать из контекстного меню");
                    },
                  }
                ]}
              />
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
