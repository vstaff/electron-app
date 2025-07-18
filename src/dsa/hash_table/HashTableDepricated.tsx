import HashNode from "./HashNode";
import Key from "./Key";
import Value from "./Value";
import { Status } from "../../util";


export default class HashTable {
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
    console.log(`from getInitialHash ${key.birthDate}`);
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

  insert(key: Key, value: Value): boolean {
    if (this.spaceLeft === 0) {
      this.resize(this.size + 5);
    }
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
    this.nodes[insertPos] = new HashNode({ key, value, initialHash, secondaryHash: insertPos, status: Status.OCCUPIED, });
    this.spaceLeft--;

    if (this.spaceLeft === 0) {
      this.resize(this.size + 5);
    }
    return true;
  }

  remove(key: Key): boolean {
    if (this.spaceLeft === 0) {
      return false;
    }

    let initialHash = this.getInitialHash(key);
    let idx = initialHash;
    let i = 1;

    while (this.nodes[idx].status !== Status.FREE) {
      if (this.isKeyAt(key, idx, Status.REMOVED)) break;
      if (this.isKeyAt(key, idx)) {
        this.nodes[idx].status = Status.REMOVED;
        this.spaceLeft++;
        if (this.spaceLeft >= this.size * 0.7 && this.size > 1) {
          const nonEmptyCount = this.nodes.reduce((count, node) => node.status !== Status.FREE ? count + 1 : count, 0);
          this.resize(nonEmptyCount);
        }
        console.log("удаление завершено true");
        return true;
      }
      idx = this.getSecondaryHash(initialHash, i++);
    }
    console.log("удаление завершено false")
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

  private isKeyAt(key: Key, idx: number, expectedStatus: Status = Status.OCCUPIED): boolean {
    const node = this.nodes[idx];
    return node.key !== undefined && node.status === expectedStatus && node.key.name === key.name && node.key.birthDate === key.birthDate;
  }

  resize(newSize: number): void {
    console.log(`Начинаем resize с ${this.size} на ${newSize}`);
    const oldNodes = this.nodes;
    
    // ✅ ИСПРАВЛЕНИЕ: Собираем ВСЕ записи, включая REMOVED
    const allItems: { key: Key; value?: Value, status?: Status, initialHash?: number, secondaryHash?: number, }[] = [];
    
    for (const node of oldNodes) {
      // Переносим все записи, кроме FREE
      if (node.status !== Status.FREE && node.key !== undefined) {
        if (node.status === Status.OCCUPIED && node.value !== undefined) {
          // OCCUPIED записи
          allItems.push({ 
            key: node.key, 
            value: node.value, 
            status: node.status, 
            initialHash: node.initialHash, 
            secondaryHash: node.secondaryHash 
          });
        } else if (node.status === Status.REMOVED) {
          // ✅ REMOVED записи тоже сохраняем для отладки
          allItems.push({ 
            key: node.key, 
            value: node.value, // может быть undefined
            status: node.status, 
            initialHash: node.initialHash, 
            secondaryHash: node.secondaryHash 
          });
        }
        
        // Если новая таблица меньше и мы уже собрали достаточно OCCUPIED записей
        if (newSize < oldNodes.length) {
          const occupiedCount = allItems.filter(item => item.status === Status.OCCUPIED).length;
          if (occupiedCount >= newSize * 0.7) break; // Не переполняем новую таблицу
        }
      }
    }
  
    // Обновляем размеры
    this.size = newSize;
    this.k = this.getMinPrime(this.size);
    this.spaceLeft = this.size - allItems.filter(item => item.status === Status.OCCUPIED).length;
    this.nodes = Array.from({ length: this.size }, () => new HashNode({}));
  
    // Вставляем записи в новую таблицу
    for (const { key, value, status } of allItems) {
      if (status === Status.OCCUPIED && value) {
        // Активные записи вставляем через обычную логику
        const initialHash = this.getInitialHash(key);
        let idx = initialHash;
        let i = 1;
        while (this.nodes[idx].status !== Status.FREE) {
          idx = this.getSecondaryHash(this.getInitialHash(key), i++);
        }
        this.nodes[idx] = new HashNode({ key, value, initialHash, secondaryHash: idx, status: Status.OCCUPIED });
      } else if (status === Status.REMOVED) {
        // ✅ REMOVED записи размещаем отдельно для сохранения истории
        // Находим свободное место для REMOVED записи
        let foundSlot = false;
        for (let idx = 0; idx < this.size && !foundSlot; idx++) {
          if (this.nodes[idx].status === Status.FREE) {
            this.nodes[idx] = new HashNode({ key, value, status: Status.REMOVED, initialHash: 0, secondaryHash: idx });
            foundSlot = true;
          }
        }
      }
    }
    
    console.log(`Resize завершен. Новый размер: ${this.size}, spaceLeft: ${this.spaceLeft}`);
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

  clone(): HashTable {
    const copy = new HashTable(this.size);
    copy.k = this.k;
    copy.spaceLeft = this.spaceLeft;

    // Создаем глубокую копию узлов
    this.nodes.forEach((node, idx) => {
      if (node.key && node.value) {
        // Создаем новые экземпляры Key и Value
        const newKey = new Key(node.key.name, node.key.birthDate);
        const newValue = new Value(node.value.classCode);
        copy.nodes[idx] = new HashNode({
          key: newKey,
          value: newValue,
          status: node.status,
          initialHash: node.initialHash,
          secondaryHash: node.secondaryHash
        });
      } else {
        copy.nodes[idx] = new HashNode({
          status: node.status,
          initialHash: node.initialHash,
          secondaryHash: node.secondaryHash
        });
      }
    });

    return copy;
  }
}
