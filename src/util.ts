import { ReactElement } from "react";
import { Key, Value } from "./dsa/HashTable";
export interface Callback {
  name: string;
  callback: () => any;
}

export interface MyContextMenuStripProps {
  callbacks: Callback[];
  // говорим, что target — это элемент, в пропсах которого есть стандартные
  // HTML-атрибуты, включая onContextMenu, style и т.д.
  target: ReactElement<React.HTMLAttributes<HTMLElement>>;
}

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

export const MONTHS = [
  'янв', 'фев', 'мар', 'апр', 'май', 'июн',
  'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'
];