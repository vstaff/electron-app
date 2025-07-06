import React, { useEffect } from "react";

// <styles>
import "./styles/global.css";
import "./styles/App.css";
// </styles>

// <hooks>
import { useState } from "react";
// </hooks>

// <my_components>
import MyDND from "./components/MyDND/MyDND";
import MyTable from "./components/MyTable/MyTable";
import AddRecordForm from "./components/AddRecordForm/AddRecordForm";
// </my_components>

// <mui>
import AddIcon from "@mui/icons-material/Add";
import { Fab } from "@mui/material";
// </mui>

// <dsa>
import HashTable from "./dsa/hash_table/HashTable";
import Key from "./dsa/hash_table/Key";
import Value from "./dsa/hash_table/Value";
// </dsa>

// util
import { makeHTRaw, correctDate, FormDataJSON, INITIAL_HASH_SIZE, validateStudentsFile } from "./util";

export default function App() {
  // <catalogs_data>
  const [studentsRawData, setStudentsRawData] = useState<string[]>([]);
  const [gradesRawData, setGradesRawData] = useState<string[]>([]);

  const [studentsHashTable, setStudentsHashTable] = useState<HashTable>(
    new HashTable(INITIAL_HASH_SIZE)
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
  const handleNewStudentSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const raw = Object.fromEntries((formData as any).entries());
    const formJSON = raw as FormDataJSON;

    console.log(formJSON);
    console.log(correctDate(formJSON["student-birth-date"]));
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
        prevStudentsHashTable.insert(key, value);
        return prevStudentsHashTable;
      });
    } catch (err) {
      alert(`Не получилось добавить запись для Справочника Студенты`);
      return;
    }

    console.log(formJSON);
    handleClose();
  };
  const handleNewGradeSubmit = (event: React.FormEvent<HTMLFormElement>) => {};
  // </form>

  // <dnd>
  const [studentsDNDContentRejected, setStudentsDNDContentRejected] =
    useState(false);
  const [gradesDNDContentRejected, setGradesDNDContentRejected] =
    useState(false);
  // </dnd>

  // <effects>
  useEffect(() => {
    console.log("from app studentsRawData=", studentsRawData);
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
        alert("Не получилось загрузить данные из файла");
        setStudentsDNDContentRejected(true);
        wasBreak = true;
        break;
      }
    }

    setStudentsHashTable(wasBreak ? new HashTable(10) : newHashTable);
  }, [studentsRawData]);

  useEffect(() => {
    console.log("from app studentsHashTable=");
    studentsHashTable.print();
  }, [studentsHashTable]);

  useEffect(() => {
    if (studentsDNDContentRejected) {
      setStudentsHashTable(new HashTable(10));
    }
  }, [studentsDNDContentRejected]);

  useEffect(() => {
    if (gradesDNDContentRejected) {
      // TODO: че делать когда файл с оценками некорректный
    }
  });
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
            <MyDND
              name="Ученики"
              setRawData={setStudentsRawData}
              alertMessage="Для справочника Студенты каждая строка входного файла должна содержать: ФИО;Класс;Дата рождения"
              validateFile={validateStudentsFile}
              contentRejected={studentsDNDContentRejected}
              setContentRejected={setStudentsDNDContentRejected}
            />
          </div>

          <div className="load-file-container" id="load-file-grades-container">
            <h3 className="open-sans-light">Справочник оценок</h3>
            <MyDND
              name="Оценки"
              setRawData={setGradesRawData}
              alertMessage="Для справочника Оценки каждая строка входного файла должна содержать: ФИО;Предмет;Оценка;Дата"
              validateFile={(text: string) => true}
              contentRejected={gradesDNDContentRejected}
              setContentRejected={setGradesDNDContentRejected}
            />
          </div>
        </section>

        <section className="app-section" id="table-section">
          <h2 className="open-sans-light">Хеш-таблица</h2>
          <MyTable
            tableFor="students"
            tableHead={[
              "Статус",
              "Первичный хеш",
              "Вторичный хеш",
              "ФИО",
              "Класс",
              "Дата Рождения",
            ]}
            tableContent={makeHTRaw(studentsHashTable, [
              {
                name: "Редактировать",
                callback: ({ name, birthDate, from, } : { name: string; birthDate: string; from: string; }) => {
                  console.log(`Редактировать ${name} ${birthDate} из справочника ${from}`);
                  const index = studentsHashTable.search(new Key(name, birthDate));
                  console.log(`нужно отредачить элемент ${name} ${birthDate} в таблице ${from} на ${index}`)

                  setStudentsHashTable(prevStudentsHashTable => {
                    const newHashTable = prevStudentsHashTable.clone();
                    newHashTable.replace(index ?? 0);
                    return newHashTable;
                  })
                },
              },
              {
                name: "Удалить",
                callback: ({ name, birthDate, from, } : { name: string, birthDate: string, from: string, }) => {
                  console.log(`Удалить ${name} ${birthDate} из справочника ${from}`);
                }
              }
            ])}
            tableHeadCallbacks={
              [
                {
                  name: "Добавить",
                  callback: () => setIsAddFormOpen(true),
                },
                {
                  name: "Экспортировать",
                  callback: () => console.log("экспорт студентов"),
                },
                {
                  name: "Импортировать",
                  callback: () => console.log("импорт студентов"),
                },
              ]
            }
          />
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

        <AddRecordForm
          isAddFormOpen={isAddFormOpen}
          handleClose={handleClose}
          handleNewStudentSubmit={handleNewStudentSubmit}
          handleNewGradeSubmit={handleNewGradeSubmit}
          setNewRecordType={setNewRecordType}
          newRecordType={newRecordType}
        />
      </div>
    </>
  );
}
