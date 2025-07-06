import { MONTHS } from "../../util";

export default class Key {
  public name: string;
  public birthDate: string;

  constructor(name: string, birthDate: string) {
    if (!Key.validateName(name)) {
      throw new Error(`Invalid full name format: "${name}"`);
    }
    if (!Key.validateBirthDate(birthDate)) {
      throw new Error(`Invalid birth date format: "${birthDate}"`);
    }
    this.name = name;
    this.birthDate = birthDate;
  }

  // ФИО: три слова, разделённых пробелами. Каждое слово с большой буквы, далее строчные.
  // Фамилия может быть двойной, через дефис: Иванов-Петров
  static validateName(name: string): boolean {
    name = name.trim();
    const parts = name.split(' ');
    if (parts.length !== 3) return false;
    const regex_1 = /[А-Я][а-я]* [А-Я][а-я]+ [А-Я][а-я]+/;
    const regex_2 = /[А-Я][а-я]+\-[А-Я][а-я]+ [А-Я][а-я]+ [А-Я][а-я]+/;
    return regex_1.test(name) || regex_2.test(name);
  }

  // ДД МММ ГГГГ, MMM - три буквы месяца в именительном падеже
  static validateBirthDate(birthDate: string): boolean {
    const parts = birthDate.trim().split(' ');
    if (parts.length !== 3) return false;
    const [day, mon, year] = parts;
    const dayNum = Number(day);
    const yearNum = Number(year);
    if (!Number.isInteger(dayNum) || dayNum < 1 || dayNum > 31) return false;
    if (!MONTHS.includes(mon)) return false;
    if (!Number.isInteger(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear()) return false;
    const monthIndex = MONTHS.indexOf(mon);
    const daysInMonth = [31,
      (yearNum % 4 === 0 && yearNum % 100 !== 0) || (yearNum % 400 === 0) ? 29 : 28,
      31, 30, 31, 30, 31, 31, 30, 31, 30, 31][monthIndex];
    return dayNum <= daysInMonth;
  }
}