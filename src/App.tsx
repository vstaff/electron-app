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
import {
  makeHTRaw,
  correctDate,
  StudentFormDataJSON,
  INITIAL_HASH_SIZE,
  validateStudentsFile,
  alert_object,
  initialAlerts,
} from "./util";
import MyForm from "./components/MyForm/MyForm";
import MyAlert from "./components/MyAlert/MyAlert";

export default function App() {
  const [alerts, setAlerts] = useState<alert_object[]>(initialAlerts);
  const toggleAlert = (name: string) =>
    setAlerts((prevAlerts) =>
      prevAlerts.map((al) =>
        al.name === name ? { ...al, open: !al.open } : al
      )
    );

  const [highlightIdx, setHighlightIdx] = useState<number | null>(null); // Для подсветки найденной строки

  // <catalogs_data>
  const [studentsRawData, setStudentsRawData] = useState<string[]>([]);
  const [gradesRawData, setGradesRawData] = useState<string[]>([]);

  const [studentsHashTable, setStudentsHashTable] = useState<HashTable>(
    new HashTable(INITIAL_HASH_SIZE)
  );
  // </catalogs_data>

  // <form>
  // <insert>
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const handleAddFormClose = () => {
    setIsAddFormOpen(false);
  };
  const [newRecordType, setNewRecordType] = useState<"student" | "grade">(
    "student"
  );
  const handleClickOpen = () => {
    setIsAddFormOpen(true);
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
        prevStudentsHashTable.insert(key, value);
        return prevStudentsHashTable;
      });
    } catch (err) {
      toggleAlert("insert_error");
    }
    handleAddFormClose();
  };
  const handleNewGradeSubmit = (event: React.FormEvent<HTMLFormElement>) => {}; // TODO: сделать обработчик отправки формы для создания новой записи в справочнике Оценки
  // </insert>

  // <find>
  const [isFindRecordFormOpen, setIsFindRecordFormOpen] = useState(false);
  const handleFindRecordFormClose = () => {
    setIsFindRecordFormOpen(false);
  };
  const [findRecordType, setFindRecordType] = useState<"student" | "grade">(
    "student"
  );
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
        handleFindRecordFormClose();
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
    handleFindRecordFormClose();
  };
  const handleFindGradeSubmit = (event: React.FormEvent<HTMLFormElement>) => {};
  // </find>
  // <remove>
  const [isRemoveFormOpen, setIsRemoveFormOpen] = useState(false);
  const handleRemoveFormClose = () => {
    setIsRemoveFormOpen(false);
  };
  const [removeRecordType, setRemoveRecordType] = useState<"student" | "grade">(
    "student"
  );
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

      const idx = studentsHashTable.search(key); // что делать дальше хз
      if (Object.is(idx, null)) {
        toggleAlert("delete_error");
      } else {
        handleRemoveFormClose();
        const row = document.getElementById(`students-row-${idx}`);
        row && row.classList.add("removed");
        setStudentsHashTable((prevStudentsHashTable) => {
          prevStudentsHashTable.remove(key);
          return prevStudentsHashTable;
        });
      }
    } catch (err) {
      toggleAlert("delete_error");
    }
    handleRemoveFormClose();
  };
  const handleRemoveGradeSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {};
  // </remove>
  // </form>

  // <dnd>
  const [studentsDNDContentRejected, setStudentsDNDContentRejected] =
    useState(false);
  const [gradesDNDContentRejected, setGradesDNDContentRejected] =
    useState(false);
  const [studentsPrevFileName, setStudentsPrevFileName] = useState("");
  const [gradesPrevFileName, setGradesPrevFileName] = useState("");
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

          <div className="load-file-container" id="load-file-grades-container">
            <h3 className="open-sans-light">Справочник оценок</h3>
            <MyDND
              prevFileName={gradesPrevFileName}
              setPrevFileName={setGradesPrevFileName}
              name="Оценки"
              setRawData={setGradesRawData}
              alertName="read_file_error"
              toggleAlert={toggleAlert}
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
            highlightRow={highlightIdx}
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
                callback: () => setIsFindRecordFormOpen(true),
              },

              {
                name: "Добавить",
                callback: () => setIsAddFormOpen(true),
              },
              {
                name: "Удалить",
                callback: () => setIsRemoveFormOpen(true),
              },
              {
                name: "Экспортировать",
                callback: () => console.log("экспорт студентов"),
              },
              {
                name: "Импортировать",
                callback: () => console.log("импорт студентов"),
              },
            ]}
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

        {/* Форма для добавления записи */}
        <MyForm
          formTitle="Добавить запись"
          formMessage="Заполните форму чтобы добавить новую запись"
          isFormOpen={isAddFormOpen}
          handleClose={handleAddFormClose}
          handleStudentSubmit={handleNewStudentSubmit}
          handleGradeSubmit={handleNewGradeSubmit}
          setRecordType={setNewRecordType}
          recordType={newRecordType}
        />

        {/* Форма для поиска записи */}
        <MyForm
          keyOnly={true}
          formTitle="Найти запись"
          formMessage="Заполните форму чтобы найти запись в справочнике"
          isFormOpen={isFindRecordFormOpen}
          handleClose={handleFindRecordFormClose}
          handleStudentSubmit={handleFindStudentSubmit}
          handleGradeSubmit={handleFindGradeSubmit}
          setRecordType={setFindRecordType}
          recordType={findRecordType}
        />

        {/* Форма для удаления записи */}
        <MyForm
          keyOnly={true}
          formTitle="Удалить запись"
          formMessage="Заполните форму чтобы удалить запись из справочника"
          isFormOpen={isRemoveFormOpen}
          handleClose={handleRemoveFormClose}
          handleStudentSubmit={handleRemoveStudentSubmit}
          handleGradeSubmit={handleRemoveGradeSubmit}
          setRecordType={setRemoveRecordType}
          recordType={removeRecordType}
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
