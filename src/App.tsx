import React, { useEffect } from "react";
import "./styles/global.css";

import "./styles/App.css";

// hooks
import { useState } from "react";

import { FileWithPath } from "react-dropzone/.";

// my components
import MyDND from "./components/MyDND/MyDND";
import MyTable from "./components/MyTable/MyTable";

// deps components
import AddIcon from "@mui/icons-material/Add";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Fab,
  FormControl,
  FormControlLabel,
  FormLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
} from "@mui/material";

// dsa
import { HashTable, Key, Value } from "./dsa/HashTable";

import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

export default function App() {
  // <catalogs_data>
  const [studentsRawData, setStudentsRawData] = useState<string[]>([]);
  const [gradesRawData, setGradesRawData] = useState<string[]>([]);

  const [studentsHashTable, setStudentsHashTable] = useState<HashTable>(
    new HashTable(10)
  );
  // </catalogs_data>

  // <form>
  const [newRecordType, setNewRecordType] = useState<"student" | "grade">(
    "student"
  );
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const handleClickOpen = () => {
    setIsAddFormOpen(true);
  };
  const handleClose = () => {
    setIsAddFormOpen(false);
  };
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const formJSON = Object.fromEntries((formData as any).entries());
    handleClose();
  };

  // </form>

  // <effects>
  useEffect(() => {
    console.log("from app studentsRawData=", studentsRawData);
    if (studentsRawData.length === 0) return;

    const newHashTable = new HashTable(Math.ceil(studentsRawData.length * 1.5));

    let i = 0;
    for (const line of studentsRawData) {
      const [name, classCode, birthDate] = line.split(";");
      const key = new Key(name, birthDate);
      const value = new Value(classCode);
      newHashTable.insert(key, value, i++);
    }

    setStudentsHashTable(newHashTable);
  }, [studentsRawData]);

  useEffect(() => {
    console.log("from app studentsHashTable=");
    studentsHashTable.print();
  }, [studentsHashTable]);
  // </effects>
  return (
    <>
      <div className="open-sans-regular" id="app">
        <section className="app-section" id="upload-files-section">
          <h2 className="open-sans-light">Загрузка файлов</h2>

          <div
            className="load-file-container"
            id="load-file-students-container"
          >
            <h3 className="open-sans-light">Справочник студентов</h3>
            <MyDND name="Ученики" setRawData={setStudentsRawData} />
          </div>

          <div className="load-file-container" id="load-file-grades-container">
            <h3 className="open-sans-light">Справочник оценок</h3>
            <MyDND name="Оценки" setRawData={setGradesRawData} />
          </div>
        </section>

        <section className="app-section" id="table-section">
          <h2 className="open-sans-light">Хеш-таблица</h2>
          <MyTable hashTable={studentsHashTable} />
        </section>

        <Fab
          onClick={handleClickOpen}
          id="add-record-button"
          size="small"
          sx={{
            color: "teal",
            position: "sticky",
            bottom: "10px",
            marginBottom: "10px",
            marginLeft: "calc(100% - 60px)",
            zIndex: 100,
          }}
          aria-label="add"
        >
          <AddIcon />
        </Fab>

        <Dialog open={isAddFormOpen} onClose={handleClose}>
          <DialogTitle>Добавить запись</DialogTitle>

          <DialogContent
            sx={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <DialogContentText>
              Заполните форму чтобы добавить новую запись
            </DialogContentText>
            <FormControl component="form" onSubmit={handleSubmit}>
              <FormLabel id="chose-new-record-type-label">Тип записи</FormLabel>
              <RadioGroup
                aria-labelledby="demo-radio-buttons-group-label"
                defaultValue={newRecordType}
                name="new-record-type"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setNewRecordType(event.target.value as "student" | "grade")
                }
              >
                <FormControlLabel
                  value="student"
                  control={<Radio />}
                  label="Студент"
                />
                <FormControlLabel
                  value="grade"
                  control={<Radio />}
                  label="Оценка"
                />
              </RadioGroup>

              {newRecordType === "student" ? (
                <>
                  <TextField
                    // autoFocus
                    required
                    margin="dense"
                    id="student-name"
                    name="student-name"
                    label="ФИО Студента"
                    type="text"
                    fullWidth
                    variant="standard"
                  />

                  <TextField
                    required
                    margin="dense"
                    id="student-class-number"
                    name="student-class-number"
                    label="Класс Студента"
                    type="number"
                    fullWidth
                    variant="standard"
                    inputProps={{
                      min: 1,
                      max: 11,
                      step: 1,
                    }}
                  />

                  <FormLabel id="student-class-letter-label">
                    Параллель*
                  </FormLabel>
                  <Select
                    required
                    labelId="student-class-letter-label"
                    name="student-class-letter"
                    id="student-class-letter"
                    label="Параллель"
                  >
                    <MenuItem value={"A"}>А</MenuItem>
                    <MenuItem value={"B"}>Б</MenuItem>
                    <MenuItem value={"V"}>В</MenuItem>
                    <MenuItem value={"G"}>Г</MenuItem>
                  </Select>

                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DemoContainer components={["DatePicker"]}>
                      <DatePicker
                        name="student-birth-date"
                        label="Дата рождения"
                        slotProps={{
                          textField: {
                            required: true,
                            fullWidth: true,
                          },
                        }}
                      />
                    </DemoContainer>
                  </LocalizationProvider>
                </>
              ) : (
                <>
                  <TextField
                    // autoFocus
                    required
                    margin="dense"
                    id="grade-student-name"
                    name="grade-student-name"
                    label="ФИО Студента"
                    type="text"
                    fullWidth
                    variant="standard"
                  />

                  <TextField
                    // autoFocus
                    required
                    margin="dense"
                    id="grade-subject"
                    name="grade-subject"
                    label="Предмет"
                    type="text"
                    fullWidth
                    variant="standard"
                  />

                  <TextField
                    required
                    margin="dense"
                    id="grade-grade"
                    name="grade-grade"
                    label="Оценка"
                    type="number"
                    fullWidth
                    variant="standard"
                    inputProps={{
                      min: 2,
                      max: 5,
                      step: 1,
                    }}
                  />

                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DemoContainer components={["DatePicker"]}>
                      <DatePicker
                        name="grade-date"
                        label="Дата оценки"
                        slotProps={{
                          textField: {
                            required: true,
                            fullWidth: true,
                          },
                        }}
                      />
                    </DemoContainer>
                  </LocalizationProvider>
                </>
              )}

              <DialogActions>
                <Button onClick={handleClose}>Отмена</Button>
                <Button type="submit">Подтвердить</Button>
              </DialogActions>
            </FormControl>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
