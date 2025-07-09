import React, { useEffect } from "react";
import "../styles/global.css"
import "../styles/App.css";
import { useState } from "react";
import MyDND from "./MyDND";
import MyTable from "./MyTable";
import { FormLabel, MenuItem, Select, TextField } from "@mui/material";
import HashTable from "../dsa/hash_table/HashTable";
import Key from "../dsa/hash_table/Key";
import Value from "../dsa/hash_table/Value";
import {
  makeHTRaw,
  correctDate,
  StudentFormDataJSON,
  INITIAL_HASH_SIZE,
  validateStudentsFile,
  alert_object,
  initialAlerts,
} from "../util";
import MyAlert from "./MyAlert";
import MyForm2 from "./MyForm2";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

export default function StudentsSection() {
  const [alerts, setAlerts] = useState<alert_object[]>(initialAlerts);
  const toggleAlert = (name: string) =>
    setAlerts((prevAlerts) =>
      prevAlerts.map((al) =>
        al.name === name ? { ...al, open: !al.open } : al
      )
    );
  const [highlightIdx, setHighlightIdx] = useState<number | null>(null);
  const [removedStudentRows, setRemovedStudentRows] = useState<number[]>([]); // новое состояние

  // <catalogs_data>
  const [studentsRawData, setStudentsRawData] = useState<string[]>([]);

  const [studentsHashTable, setStudentsHashTable] = useState<HashTable>(
    new HashTable(INITIAL_HASH_SIZE)
  );
  // </catalogs_data>

  // <form>
  // <insert>
  const [isAddStudentFormOpen, setIsAddStudentFormOpen] = useState(false);
  const handleAddStudentFormClose = () => {
    setIsAddStudentFormOpen(false);
  };
  const handleNewStudentSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const raw = Object.fromEntries((formData as any).entries());
    const formJSON = raw as StudentFormDataJSON;

    console.log("handleNewStudentSubmit; данные из формы ", formJSON);
    try {
      const key = new Key(
        formJSON["student-name"],
        correctDate(formJSON["student-birth-date"])
      );
      const value = new Value(
        `${formJSON["student-class-number"].replace('"', "")}${
          formJSON["student-class-letter"]
        }`
      );

      setStudentsHashTable((prevStudentsHashTable) => {
        const copy = prevStudentsHashTable.clone();
        const insertResult = copy.insert(key, value);

        if (insertResult) {
          console.log("Запись успешно добавлена");
          
          // Находим индекс новой записи и убираем его из removedRows
          const newRecordIndex = copy.search(key);
          if (newRecordIndex !== null) {
            setRemovedStudentRows((prevRemovedRows) => {
              // Убираем индекс из списка удаленных, если он там был
              const filteredRows = prevRemovedRows.filter(idx => idx !== newRecordIndex);
              console.log(`Убираем индекс ${newRecordIndex} из списка удаленных строк`);
              return filteredRows;
            });
          }
          return copy;
        }
        toggleAlert("duplicate_error")
        return prevStudentsHashTable;
      });
    } catch (err) {
      toggleAlert("insert_error");
    }
    handleAddStudentFormClose();
  };
  // </insert>

  // <find>
  const [isFindStudentFormOpen, setIsFindStudentFormOpen] = useState(false);
  const handleFindStudentFormClose = () => {
    setIsFindStudentFormOpen(false);
  };
  const handleFindStudentSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const raw = Object.fromEntries((formData as any).entries());
    const formJSON = raw as StudentFormDataJSON;

    console.log("handleFindStudentSubmit; данные из формы ", formJSON);
    try {
      const key = new Key(
        formJSON["student-name"],
        correctDate(formJSON["student-birth-date"])
      );

      const idx = studentsHashTable.search(key); // что делать дальше хз
      if (Object.is(idx, null)) {
        toggleAlert("search_error");
      } else {
        handleFindStudentFormClose();
        const row = document.getElementById(`students-row-${idx}`);
        if (row) {
          console.log("handleNewStudentSubmit; вот строка ", row);
          row.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest",
          });
        }
        setHighlightIdx(idx);
        setTimeout(() => setHighlightIdx(null), 2000);
      }
    } catch (err) {
      toggleAlert("search_error");
    }
    handleFindStudentFormClose();
  };
  // </find>
  // <remove>
  const [isRemoveStudentFormOpen, setIsRemoveStudentFormOpen] = useState(false);
  const handleRemoveStudentFormClose = () => {
    setIsRemoveStudentFormOpen(false);
  };

  const clearStudentsRemovedRows = () => {
    console.log("Очищаем все удаленные строки");
    setRemovedStudentRows([]);
  };

  const handleRemoveStudentSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const raw = Object.fromEntries((formData as any).entries());
    const formJSON = raw as StudentFormDataJSON;

    console.log("handleRemoveStudentSubmit; данные из формы ", formJSON);
    try {
      const key = new Key(
        formJSON["student-name"],
        correctDate(formJSON["student-birth-date"])
      );

      const idx = studentsHashTable.search(key);
      if (idx === null) {
        toggleAlert("delete_error");
      } else {
        handleRemoveStudentFormClose();

        // Добавляем индекс в список удаленных строк
        setRemovedStudentRows((prev) => {
          if (!prev.includes(idx)) {
            return [...prev, idx];
          }
          return prev;
        });

        // Фактически удаляем из хеш-таблицы сразу
        setStudentsHashTable((prevStudentsHashTable) => {
          const copy = prevStudentsHashTable.clone(); // Новый объект
          const removeResult = copy.remove(key);
          return removeResult ? copy : prevStudentsHashTable;
        });

        console.log("Строка помечена как удаленная:", idx);
      }
    } catch (err) {
      toggleAlert("delete_error");
    }
    handleRemoveStudentFormClose();
  };
  // </remove>
  // </form>

  // <dnd>
  const [studentsDNDContentRejected, setStudentsDNDContentRejected] =
    useState(false);
  const [studentsPrevFileName, setStudentsPrevFileName] = useState("");
  // </dnd>

  // <effects>
  useEffect(() => {
    console.log("from app studentsRawData=", studentsRawData);

    // Очищаем все помеченные как удаленные строки при загрузке новых данных
    clearStudentsRemovedRows();

    if (studentsRawData.length === 0) return;

    const newHashTable = new HashTable(studentsRawData.length);
    let wasBreak = false;
    for (const line of studentsRawData) {
      const [name, classCode, birthDate] = line.split(";");
      try {
        const key = new Key(name, birthDate);
        const value = new Value(classCode);
        newHashTable.insert(key, value);
      } catch (err) {
        toggleAlert("read_file_error");
        setStudentsDNDContentRejected(true);
        wasBreak = true;
        break;
      }
    }

    setStudentsHashTable((prevStudentsHashTable) =>
      wasBreak ? prevStudentsHashTable : newHashTable
    );
  }, [studentsRawData]);

  useEffect(() => {
    console.log("from app studentsHashTable=");
    studentsHashTable.print();
  }, [studentsHashTable]);

  // Добавляем useEffect для отслеживания удаленных строк
  useEffect(() => {
    console.log("Removed student rows:", removedStudentRows);
  }, [removedStudentRows]);
  // </effects>
  return (
    <>
      <div className="open-sans-regular app-section" id="students-section">
        <section className="app-subsection" id="upload-files-section">
          <h2 className="open-sans-light">Загрузка файлов</h2>

          <div
            className="load-file-container"
            id="load-file-students-container"
          >
            <h3 className="open-sans-light">Справочник студентов</h3>
            <MyDND
              prevFileName={studentsPrevFileName}
              setPrevFileName={setStudentsPrevFileName}
              name="Ученики"
              setRawData={setStudentsRawData}
              alertName="read_file_error"
              toggleAlert={toggleAlert}
              validateFile={validateStudentsFile}
              contentRejected={studentsDNDContentRejected}
              setContentRejected={setStudentsDNDContentRejected}
            />
          </div>
        </section>

        <section className="app-subsection" id="table-section">
          <h2 className="open-sans-light">Хеш-таблица</h2>
          <MyTable
            tableFor="students"
            highlightRow={highlightIdx}
            removedRows={removedStudentRows}
            tableHead={[
              "Статус",
              "Первичный хеш",
              "Вторичный хеш",
              "ФИО",
              "Класс",
              "Дата Рождения",
            ]}
            tableContent={makeHTRaw(studentsHashTable)}
            tableHeadCallbacks={[
              {
                name: "Найти",
                callback: () => setIsFindStudentFormOpen(true),
              },

              {
                name: "Добавить",
                callback: () => setIsAddStudentFormOpen(true),
              },
              {
                name: "Удалить",
                callback: () => setIsRemoveStudentFormOpen(true),
              },
              {
                name: "Экспортировать",
                callback: () => console.log("экспорт студентов"),
              },
              {
                name: "Импортировать",
                callback: () => console.log("импорт студентов"),
              },
              {
                name: "Очистить удаленные",
                callback: () => {
                  console.log("Ручная очистка удаленных строк");
                  setRemovedStudentRows([]);
                },
              },
            ]}
          />
        </section>

        {/* Форма для добавления записи */}
        <MyForm2
          formTitle="Добавить запись"
          formMessage="Заполните форму чтобы добавить новую запись"
          isFormOpen={isAddStudentFormOpen}
          handleClose={handleAddStudentFormClose}
          handleSubmit={handleNewStudentSubmit}
          children={
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
              <FormLabel id="student-class-letter-label">Параллель*</FormLabel>
              <Select
                required
                labelId="student-class-letter-label"
                name="student-class-letter"
                id="student-class-letter"
                label="Параллель"
                // value={"А"}
              >
                <MenuItem value={"А"}>А</MenuItem>
                <MenuItem value={"Б"}>Б</MenuItem>
                <MenuItem value={"В"}>В</MenuItem>
                <MenuItem value={"Г"}>Г</MenuItem>
              </Select>

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DemoContainer components={["DatePicker"]}>
                  <DatePicker
                    format="DD/MM/YYYY"
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
          }
        />

        {/* Форма для поиска записи */}
        <MyForm2
          formTitle="Найти запись"
          formMessage="Заполните форму чтобы найти запись в справочнике"
          isFormOpen={isFindStudentFormOpen}
          handleClose={handleFindStudentFormClose}
          handleSubmit={handleFindStudentSubmit}
          children={
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

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DemoContainer components={["DatePicker"]}>
                  <DatePicker
                    format="DD/MM/YYYY"
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
          }
        />

        {/* Форма для удаления записи */}
        <MyForm2
          formTitle="Удалить запись"
          formMessage="Заполните форму чтобы удалить запись из справочника"
          isFormOpen={isRemoveStudentFormOpen}
          handleClose={handleRemoveStudentFormClose}
          handleSubmit={handleRemoveStudentSubmit}
          children={
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

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DemoContainer components={["DatePicker"]}>
                  <DatePicker
                    format="DD/MM/YYYY"
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
          }
        />

        {/* alerts */}
        {alerts.map((al, index) => (
          <MyAlert
            key={index}
            title={al.title}
            message={al.message}
            open={al.open}
            onClose={() =>
              setAlerts((prevAlerts) =>
                prevAlerts.map((alert_item) =>
                  alert_item.name === al.name
                    ? { ...alert_item, open: false }
                    : alert_item
                )
              )
            }
          />
        ))}
      </div>
    </>
  );
}
