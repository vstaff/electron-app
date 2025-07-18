import React, { useEffect } from "react";
import "../styles/global.css";
import "../styles/App.css";
import { useState } from "react";
import MyDND from "./MyDND";
import MyTable from "./MyTable";
import { FormLabel, MenuItem, Select, TextField, Box } from "@mui/material";
import HashTable from "../dsa/hash_table/HashTable";
import Key from "../dsa/hash_table/Key";
import Value from "../dsa/hash_table/Value";
import HashTableSizeControl from "./HashTableSizeControl";
import {
  makeHTRaw,
  correctDate,
  StudentFormDataJSON,
  INITIAL_HASH_SIZE,
  validateStudentsFile,
  alert_object,
  initialAlerts,
  MIN_HASH_TABLE_SIZE,
  MAX_HASH_TABLE_SIZE,
  getHashTableResizeErrorAlert,
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
      prevAlerts.map((al) => {
        if (al.name === name) {
          console.log(`toggling ${name}`);
          return { ...al, open: !al.open };
        }
        return al;
      })
    );
  const [highlightIdx, setHighlightIdx] = useState<number | null>(null);

  // Используем только removedStudentKeys (убираем removedStudentRows)
  const [removedStudentKeys, setRemovedStudentKeys] = useState<string[]>([]);

  // <catalogs_data>
  const [studentsRawData, setStudentsRawData] = useState<string[]>([]);

  const [studentsHashTable, setStudentsHashTable] = useState<HashTable>(
    new HashTable(INITIAL_HASH_SIZE)
  );
  // </catalogs_data>

  // Функция для создания уникального ключа записи
  const createRecordKey = (name: string, birthDate: string): string => {
    return `${name}|${birthDate}`;
  };

  // Функция для проверки, удалена ли запись
  const isRecordRemoved = (rowIndex: number): boolean => {
    const tableData = makeHTRaw(studentsHashTable);
    if (rowIndex >= tableData.length) return false;

    const row = tableData[rowIndex];
    // Проверяем статус: если 2 (REMOVED) - значит удалена
    if (row[1] === "2") return true;

    // Если статус 1 (OCCUPIED), проверяем по ключу
    if (row[1] === "1") {
      const name = row[4]; // ФИО
      const birthDate = row[6]; // Дата рождения
      if (name !== "_" && birthDate !== "_") {
        const recordKey = createRecordKey(name, birthDate);
        return removedStudentKeys.includes(recordKey);
      }
    }

    return false;
  };

  // Функция для изменения размера хеш-таблицы
  const handleHashTableSizeChange = (newSize: number): boolean => {
    const success = studentsHashTable.resizeTable(newSize);
    
    if (!success) {
      // Добавляем динамический алерт с информацией о используемых ячейках
      const usedCells = studentsHashTable.getUsedCellsCount();
      const errorAlert = getHashTableResizeErrorAlert(usedCells);
      setAlerts(prevAlerts => {
        const updatedAlerts = prevAlerts.map(alert => 
          alert.name === "hashtable_resize_error" 
            ? { ...alert, message: errorAlert.message, open: true }
            : alert
        );
        return updatedAlerts;
      });
      return false;
    }

    // Создаем новую хеш-таблицу с обновленным размером
    setStudentsHashTable(prevTable => {
      const newTable = new HashTable(newSize);
      
      // Копируем все активные записи из старой таблицы
      const oldNodes = prevTable.getNodes();
      for (const node of oldNodes) {
        if (node.status === 1 && node.key && node.value) { // Status.OCCUPIED = 1
          newTable.insert(node.key, node.value);
        }
      }
      
      return newTable;
    });

    console.log(`Размер хеш-таблицы изменен на ${newSize}`);
    return true;
  };

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
        correctDate(formJSON["student-birth-date"]!)
      );
      const value = new Value(
        formJSON["student-class-number"].replace('"', "") +
          formJSON["student-class-letter"]
      );

      // Клонируем текущую хеш-таблицу и пробуем вставить
      const copy = studentsHashTable.clone();
      const insertResult = copy.insert(key, value);

      if (!insertResult) {
        console.log("DUPLICATE");
        toggleAlert("duplicate_error");        // Показываем окно об ошибке дубликата
        return;                                // Не закрываем форму
      }

      // Успешная вставка
      console.log("Запись успешно добавлена");
      setStudentsHashTable(copy);

      // Убираем ключ из списка удалённых (если был)
      const recordKey = createRecordKey(key.name, key.birthDate);
      setRemovedStudentKeys((prev) => prev.filter((k) => k !== recordKey));

      // Закрываем форму только после успеха
      handleAddStudentFormClose();
    } catch (err) {
      console.error(err);
      toggleAlert("insert_error");              // Если не прошли валидацию
    }
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

      const idx = studentsHashTable.search(key);
      if (Object.is(idx, null)) {
        toggleAlert("search_error");
      } else {
        handleFindStudentFormClose();
        const row = document.getElementById(`students-row-${idx}`);
        if (row) {
          console.log("handleFindStudentSubmit; вот строка ", row);
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
    console.log("Очищаем все удаленные записи");
    setRemovedStudentKeys([]);
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

        // Добавляем ключ записи в список удаленных
        const recordKey = createRecordKey(key.name, key.birthDate);
        setRemovedStudentKeys((prev) => {
          if (!prev.includes(recordKey)) {
            return [...prev, recordKey];
          }
          return prev;
        });

        // Фактически удаляем из хеш-таблицы
        setStudentsHashTable((prevStudentsHashTable) => {
          const copy = prevStudentsHashTable.clone();
          const removeResult = copy.remove(key);
          return removeResult ? copy : prevStudentsHashTable;
        });

        console.log("Запись помечена как удаленная:", recordKey);
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

  // Добавляем useEffect для отслеживания удаленных ключей
  useEffect(() => {
    console.log("Removed student keys:", removedStudentKeys);
  }, [removedStudentKeys]);
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

        {/* Секция управления размером хеш-таблицы */}
        <section className="app-subsection" id="hashtable-size-section">
          <h2 className="open-sans-light">Конфигурация хеш-таблицы</h2>
          <Box sx={{ padding: 2, border: '1px solid #ddd', borderRadius: 2 }}>
            <HashTableSizeControl
              currentSize={studentsHashTable.getSize()}
              usedCells={studentsHashTable.getUsedCellsCount()}
              onSizeChange={handleHashTableSizeChange}
              disabled={false}
            />
          </Box>
        </section>

        <section className="app-subsection" id="table-section">
          <h2 className="open-sans-light">Хеш-таблица</h2>
          <MyTable
            tableFor="students"
            highlightRow={highlightIdx}
            isRowRemoved={isRecordRemoved} // Используем новую функцию
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
                  console.log("Ручная очистка удаленных записей");
                  setRemovedStudentKeys([]); // Очищаем ключи
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
                id="student-class-letter"
                name="student-class-letter"
                defaultValue="А"
                fullWidth
                variant="standard"
              >
                <MenuItem value="А">А</MenuItem>
                <MenuItem value="Б">Б</MenuItem>
                <MenuItem value="В">В</MenuItem>
                <MenuItem value="Г">Г</MenuItem>
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
        {alerts.map((al, index) => {
          return (
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
          );
        })}
      </div>
    </>
  );
}