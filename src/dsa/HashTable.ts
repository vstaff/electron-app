export enum Status {
  FREE = 0,
  OCCUPIED = 1,
  REMOVED = 2,
}

// Helper for date validation
const MONTHS = [
  'янв', 'фев', 'мар', 'апр', 'май', 'июн',
  'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'
];

export class Key {
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

export class Value {
  public classCode: string;

  constructor(classCode: string) {
    if (!Value.validate(classCode)) {
      throw new Error(`Invalid class format: "${classCode}"`);
    }
    this.classCode = classCode;
  }

  // Формат NL, где N - число 1..11, L - буква из АБВГ
  static validate(code: string): boolean {
    return /^([1-9]|10|11)[АБВГ]$/.test(code);
  }
}

interface HashNodeConstructor {
  key?: Key;
  value?: Value;
  status?: Status;
  initialHash?: number;
  secondaryHash?: number;
  originRow?: number;
}

class HashNode {
  public key?: Key;
  public value?: Value;
  public status?: Status;
  public initialHash?: number;
  public secondaryHash?: number;
  public originRow?: number;

  constructor({ key, value, initialHash, secondaryHash, status, originRow, }: HashNodeConstructor) {
    this.key = key;
    this.value = value;
    this.status = status ?? Status.FREE;
    this.initialHash = initialHash;
    this.secondaryHash = secondaryHash;
    this.originRow = originRow;
  }
}

export class HashTable {
  private size: number;
  private k: number;
  private nodes: HashNode[];
  private spaceLeft: number;

  constructor(initialSize: number) {
    this.size = initialSize;
    this.k = this.getMinPrime(this.size);
    this.spaceLeft = this.size;
    this.nodes = Array.from({ length: this.size }, () => new HashNode({}));
  }

  getNodes(): readonly HashNode[] {
    return this.nodes;
  }

  private getMinPrime(n: number): number {
    if (n <= 1) return 1;
    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
    for (let i = 2; i < n; i++) {
      if (gcd(n, i) === 1) return i;
    }
    return 1;
  }

  private getInitialHash(key: Key): number {
    let hash = 0;
    for (const c of key.name) hash += c.charCodeAt(0);
    hash += parseInt(key.birthDate.replace(/\D/g, ''), 10);
    hash = hash * hash;
    const hashStr = hash.toString();
    const doubled = hashStr + hashStr;
    const len = doubled.length;
    const substrLen = len % 2 === 0 ? 2 : 3;
    const start = Math.floor(len / 2) - (substrLen === 2 ? 0 : 1);
    const mid = doubled.substr(start, substrLen);
    return parseInt(mid, 10) % this.size;
  }

  private getSecondaryHash(initialHash: number, i: number): number {
    return (initialHash + i * this.k) % this.size;
  }

  insert(key: Key, value: Value, originRow: number): boolean {
    const initialHash = this.getInitialHash(key);
    let idx = initialHash;
    let i = 1;
    let firstRemoved: number | null = null;

    while (this.nodes[idx].status !== Status.FREE) {
      if (this.isKeyAt(key, idx)) return false;
      if (this.nodes[idx].status === Status.REMOVED && firstRemoved === null) {
        firstRemoved = idx;
      }
      idx = this.getSecondaryHash(initialHash, i++);
    }

    const insertPos = firstRemoved !== null ? firstRemoved : idx;
    // this.nodes[insertPos] = new HashNode(key, value, Status.OCCUPIED);
    this.nodes[insertPos] = new HashNode({ key, value, initialHash, secondaryHash: insertPos, status: Status.OCCUPIED, originRow, });
    this.spaceLeft--;

    if (this.spaceLeft <= this.size * 0.3) {
      this.resize(this.size * 2);
    }
    return true;
  }

  remove(key: Key): boolean {
    let initialHash = this.getInitialHash(key);
    let idx = initialHash;
    let i = 1;

    while (this.nodes[idx].status !== Status.FREE) {
      if (this.isKeyAt(key, idx)) {
        this.nodes[idx].status = Status.REMOVED;
        this.spaceLeft++;
        if (this.spaceLeft >= this.size * 0.7 && this.size > 1) {
          this.resize(Math.floor(this.size / 2));
        }
        return true;
      }
      idx = this.getSecondaryHash(initialHash, i++);
    }
    return false;
  }

  search(key: Key): number | null {
    let initialHash = this.getInitialHash(key);
    let idx = initialHash;
    let i = 1;

    while (this.nodes[idx].status !== Status.FREE) {
      if (this.isKeyAt(key, idx)) return idx;
      idx = this.getSecondaryHash(initialHash, i++);
    }
    return null;
  }

  private isKeyAt(key: Key, idx: number): boolean {
    const node = this.nodes[idx];
    return node.key !== undefined && node.status === Status.OCCUPIED && node.key.name === key.name && node.key.birthDate === key.birthDate;
  }

  resize(newSize: number): void {
    const oldNodes = this.nodes;
    /* 
    key
    value
    status
    initialHash
    secondaryHash
    originRow
    */
    const items: { key: Key; value?: Value, status?: Status, initialHash?: number, secondaryHash?: number, originRow?: number, }[] = [];
    for (const node of oldNodes) {
      if (node.status !== Status.FREE && node.key !== undefined && node.value !== undefined) {
        items.push({ key: node.key, value: node.value, status: node.status, initialHash: node.initialHash, secondaryHash: node.secondaryHash, originRow: node.originRow, });
        if (newSize < oldNodes.length && items.length >= newSize) break;
      }
    }

    this.size = newSize;
    this.k = this.getMinPrime(this.size);
    this.spaceLeft = this.size - items.length;
    this.nodes = Array.from({ length: this.size }, () => new HashNode({}));

    for (const { key, value, status, originRow, } of items) {
      const initialHash = this.getInitialHash(key);
      let idx = initialHash;
      let i = 1;
      while (this.nodes[idx].status !== Status.FREE) {
        idx = this.getSecondaryHash(this.getInitialHash(key), i++);
      }
      this.nodes[idx] = new HashNode({ key, value, initialHash, secondaryHash: idx, status, originRow });
    }
  }

  print(): number {
    let count = 0;
    this.nodes.forEach((node, i) => {
      if (node.status === Status.OCCUPIED && node.key && node.value) {
        console.log(`[${i}] ${node.key.name} ${node.key.birthDate}: ${node.value.classCode}`);
        count++;
      } else if (node.status === Status.REMOVED && node.key) {
        console.log(`[${i}] XXX ${node.key.name} ${node.key.birthDate}`);
      } else {
        console.log(`[${i}] `);
      }
    });
    return count;
  }
}
