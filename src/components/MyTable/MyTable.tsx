import React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { HashTable } from '../../dsa/HashTable';

interface MyTableProps {
  hashTable: HashTable,
}

export default function MyTable({ hashTable, }: MyTableProps) {
  return (
    <TableContainer component={Paper}>
      <Table className='open-sans-regular' sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell align="left">#</TableCell>
            <TableCell align="left">Статус</TableCell>
            <TableCell align="left">Первичный хеш</TableCell>
            <TableCell align="left">Вторичный хеш</TableCell>
            <TableCell align="left">ФИО</TableCell>
            <TableCell align="left">Класс</TableCell>
            <TableCell align="left">Дата Рождения</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {
            hashTable.getNodes().map((node, index) => {
              return (
              <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell align="left">
                  {index}
                </TableCell>

                <TableCell align="left">
                  {node.status ?? "~"}
                </TableCell>

                <TableCell align="left">
                  {node.initialHash ?? "~"}
                </TableCell>

                <TableCell align="left">
                  {node.secondaryHash ?? "~"}
                </TableCell>

                <TableCell align="left">
                  {node.key?.name ?? "~"}
                </TableCell>

                <TableCell align="left">
                  {node.value?.classCode ?? "~"}
                </TableCell>

                <TableCell align="left">
                  {node.key?.birthDate ?? "~"}
                </TableCell>
              </TableRow>
              )
            })
          }
        </TableBody>
      </Table>
    </TableContainer>
  );
}
