import { ReactElement, ReactNode } from "react";
import React from "react";
import Key from "./dsa/hash_table/Key";
import Value from "./dsa/hash_table/Value";
export interface Callback {
  name: string;
  callback: (...args: any) => any;
}
import HashTable from "./dsa/hash_table/HashTable";

// alerts
export interface alert_object {
  name: string;
  title: string;
  message: string;
  open: boolean;
}

export const initialAlerts: alert_object[] = [
  {
    name: "read_file_error",
    title: "Не получилось загрузить данные из файла",
    message: "Проверьте корректность данных в файле",
    open: false,
  },
  {
    name: "insert_error",
    title: "Не получилось добавить данные в справочник",
    message: "Проверьте корректность вводимых данных",
    open: false,
  },
  {
    name: "search_error",
    title: "Запись не найдена",
    message: "Указанной записи не существует в указанном справочнике",
    open: false,
  },
  {
    name: "delete_error",
    title: "Не получилось удалить запись",
    message: "Указанной записи не существует в указанном справочнике",
    open: false,
  },
  {
    name: "duplicate_error",
    title: "Не получилось добавить данные в справочник",
    message: "Данная запись уже существует",
    open: false,
  }
]

// <validation>
export const validateStudentsFile = (text: string): boolean => {
  const arr = text.trim().split(/\r?\n/);
  for (const line of arr) {
    if (line === "") return false;
    if (line.split(";").length != 3) return false;
    const [name, classCode, birthDate] = line.split(";");

    try {
      Key.validateName(name);
      Value.validate(classCode);
      Key.validateBirthDate(birthDate);
    } catch (err) {
      setTimeout(() => alert(err), 0);
      return false;
    }
  }

  return true;
}

export const correctDate = (num: string): string => {
  const parts = num.split("/");
  return `${parts[0]} ${MONTHS[Number(parts[1]) - 1]} ${parts[2]}`;
};
// </validation>


// <props>
export interface MyContextMenuStripProps {
  callbacks: Callback[];
  // говорим, что target — это элемент, в пропсах которого есть стандартные
  // HTML-атрибуты, включая onContextMenu, style и т.д.
  target: ReactElement<React.HTMLAttributes<HTMLElement>>;
}

export interface table_row {
  content: string[],
  callbacks: Callback[],
}

export interface MyTableProps {
  highlightRow?: number | null;
  tableFor: "students" | "grades",
  tableHead: string[];
  tableContent: Student[];
  tableHeadCallbacks: Callback[],
  removedRows?: number[],
  isRowRemoved?: (rowIndex: number) => boolean;
}

export interface MyFormProps2 {
  keyOnly?: boolean;
  formTitle: string;
  formMessage: string;
  isFormOpen: boolean;
  handleClose: () => void;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  children: ReactNode,
}

export interface MyDNDProps {
  name: string;
  setRawData: React.Dispatch<React.SetStateAction<string[]>>;
  toggleAlert: (name: string) => void,
  alertName: string,
  validateFile: (text: string) => boolean;
  contentRejected: boolean;
  setContentRejected: React.Dispatch<React.SetStateAction<boolean>>;
  prevFileName: string;
  setPrevFileName: React.Dispatch<React.SetStateAction<string>>;
}
// </props>

// <constructors>
export interface HashNodeConstructor {
  key?: Key;
  value?: Value;
  status?: Status;
  initialHash?: number;
  secondaryHash?: number;
  // originRow?: number;
}
// </constructors>

// other
const BLANK_IN_TABLE = "_";
export const INITIAL_HASH_SIZE = 1;

export const MONTHS = [
  'янв', 'фев', 'мар', 'апр', 'май', 'июн',
  'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'
];

export enum Status {
  FREE = 0,
  OCCUPIED = 1,
  REMOVED = 2,
}

export interface StudentFormDataJSON {
  "new-record-type": string;
  "student-birth-date": string;
  "student-class-letter": string;
  "student-class-number": string;
  "student-name": string;
}

export type Student = {
  index: number;
  status: 0 | 1 | 2;
  initialHash: number;
  secondaryHash: number;
  fullName: string;
  class_: string;
  birthDate: string;
}

// преобразовать хеш-таблицу для отображения в обычной таблице 
export const makeHTRaw = (hashTable: HashTable): Student[] => {
  const result: Student[] = [];

  hashTable.getNodes().forEach((node, idx) => {
    if (node !== undefined && node.key !== undefined && node.value !== undefined && node.status !== undefined && node.initialHash !== undefined && node.secondaryHash !== undefined) {
      result.push(
        { index: idx, status: node.status, initialHash: node.initialHash, secondaryHash: node.secondaryHash, fullName: node.key.name, class_: node.value.classCode, birthDate: node.key.birthDate }
      )
    } else {
      result.push(
        { index: idx, status: 0, initialHash: 0, secondaryHash: 0, fullName: BLANK_IN_TABLE, class_: BLANK_IN_TABLE, birthDate: BLANK_IN_TABLE }
      )
    }
  });

  return result;
}