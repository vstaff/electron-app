import React, { useEffect } from "react";
import "./styles/global.css";

import "./styles/App.css";

// hooks
import { useState } from "react";

import { FileWithPath } from "react-dropzone/.";

// components
import MyDND from "./components/MyDND/MyDND";
import MyTable from "./components/MyTable/MyTable";

// dsa
import { HashTable, Key, Value } from "./dsa/HashTable";

export default function App() {
  const [studentsRawData, setStudentsRawData] = useState<string[]>([]);
  const [gradesRawData, setGradesRawData] = useState<string[]>([]);

  const [studentsHashTable, setStudentsHashTable] = useState<HashTable>(
    new HashTable(10)
  );

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
  }, [studentsHashTable])
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
      </div>
    </>
  );
}
