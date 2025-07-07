import { ReactElement } from "react";
import React from "react";
import Key from "./dsa/hash_table/Key";
import Value from "./dsa/hash_table/Value";
export interface Callback {
  name: string;
  callback: (...args: any) => any;
}
import HashTable from "./dsa/hash_table/HashTable";

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
      alert(err);
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
  tableContent?: table_row[];
  tableHeadCallbacks: Callback[],
}

export interface MyFormProps {
  formTitle: string;
  formMessage: string;
  isFormOpen: boolean;
  handleClose: () => void;
  handleStudentSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  handleGradeSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  setRecordType: React.Dispatch<React.SetStateAction<"student" | "grade">>;
  recordType: "student" | "grade";
}

export interface MyDNDProps {
  name: string;
  setRawData: React.Dispatch<React.SetStateAction<string[]>>;
  alertMessage: string;
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

// преобразовать хеш-таблицу для отображения в обычной таблице 
export const makeHTRaw = (hashTable: HashTable, callbacks: Callback[]): table_row[] => {
  const result: table_row[] = [];

  hashTable.getNodes().forEach((node, idx) => {
    if (node !== undefined && node.key !== undefined && node.value !== undefined && node.status !== undefined && node.initialHash !== undefined && node.secondaryHash !== undefined) {
      result.push(
        {
          content: [idx.toString(), node.status.toString(), node.initialHash.toString(), node.secondaryHash.toString(), node.key.name, node.value.classCode, node.key.birthDate],
          callbacks: callbacks.map(cb => ({
            name: cb.name,
            callback: () => cb.callback(node.key)
          })),
          // callbacks: callbacks.map(callback => ({ name: callback.name, callback: callback.callback, } as Callback))
        }
      )
    } else {
      result.push({
        content: [idx.toString(), 0, ...Array(5).fill(BLANK_IN_TABLE)],
        callbacks: [],
      })
    }
  });

  return result;
}