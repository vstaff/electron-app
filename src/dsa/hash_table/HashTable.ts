import HashNode from "./HashNode";
import Key from "./Key";
import Value from "./Value";
import { Status } from "../../util";

export default class HashTable {
  private size: number;
  private step: number; // Шаг для линейного пробирования
  private nodes: HashNode[];
  private occupiedCount: number; // Количество OCCUPIED записей
  private removedCount: number;  // Количество REMOVED записей

  constructor(initialSize: number) {
    this.size = Math.max(initialSize, 3); // Минимум 3 для корректной работы
    this.step = this.calculateStep(this.size);
    this.nodes = Array.from({ length: this.size }, () => new HashNode({}));
    this.occupiedCount = 0;
    this.removedCount = 0;
    
    console.log(`Создана хеш-таблица: размер=${this.size}, шаг=${this.step}`);
  }

  getNodes(): readonly HashNode[] {
    return this.nodes;
  }

  getSize(): number {
    return this.size;
  }

  getOccupiedCount(): number {
    return this.occupiedCount;
  }

  // Вычисляем шаг для линейного пробирования (взаимно простой с размером)
  private calculateStep(tableSize: number): number {
    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
    
    // Ищем наименьшее число > 1, взаимно простое с размером таблицы
    for (let step = 2; step < tableSize; step++) {
      if (gcd(tableSize, step) === 1) {
        return step;
      }
    }
    return 1; // Fallback
  }

  // Метод середины квадрата для первичного хеширования
  private hash(key: Key): number {
    let hashValue = 0;
    
    // Суммируем коды символов имени
    for (const char of key.name) {
      hashValue += char.charCodeAt(0);
    }
    
    // Добавляем числовое значение даты рождения
    const dateNumber = parseInt(key.birthDate.replace(/\D/g, ''), 10);
    hashValue += dateNumber;
    
    // Метод середины квадрата
    const squared = hashValue * hashValue;
    const squaredStr = squared.toString();
    
    // Удваиваем строку для стабильности
    const doubled = squaredStr + squaredStr;
    const length = doubled.length;
    
    // Выбираем середину
    const middleLength = length % 2 === 0 ? 2 : 3;
    const startPos = Math.floor(length / 2) - Math.floor(middleLength / 2);
    const middleDigits = doubled.substring(startPos, startPos + middleLength);
    
    const finalHash = parseInt(middleDigits, 10) % this.size;
    
    console.log(`hash(${key.name}): ${hashValue} -> ${squared} -> ${middleDigits} -> ${finalHash}`);
    return finalHash;
  }

  // Линейное пробирование
  private probe(initialHash: number, attempt: number): number {
    return (initialHash + attempt * this.step) % this.size;
  }

  // Проверка, совпадает ли ключ в данной позиции
  private keyMatches(position: number, key: Key): boolean {
    const node = this.nodes[position];
    return node.key !== undefined && 
           node.key.name === key.name && 
           node.key.birthDate === key.birthDate;
  }

  // Поиск позиции ключа (для поиска и удаления)
  private findPosition(key: Key): { found: boolean; position: number; attempts: number } {
    const initialHash = this.hash(key);
    let attempts = 0;
    
    while (attempts < this.size) {
      const position = this.probe(initialHash, attempts);
      const node = this.nodes[position];
      
      // Если нашли точное совпадение в статусе OCCUPIED
      if (node.status === Status.OCCUPIED && this.keyMatches(position, key)) {
        return { found: true, position, attempts: attempts + 1 };
      }
      
      // Если дошли до свободной ячейки - ключа нет
      if (node.status === Status.FREE) {
        return { found: false, position, attempts: attempts + 1 };
      }
      
      attempts++;
    }
    
    // Таблица полностью заполнена
    return { found: false, position: -1, attempts };
  }

  // Поиск позиции для вставки
  private findInsertPosition(key: Key): { position: number; attempts: number } {
    const initialHash = this.hash(key);
    let attempts = 0;
    let firstRemovedPos = -1;
    
    while (attempts < this.size) {
      const position = this.probe(initialHash, attempts);
      const node = this.nodes[position];
      
      // Если ключ уже существует
      if (node.status === Status.OCCUPIED && this.keyMatches(position, key)) {
        return { position: -1, attempts: attempts + 1 }; // Дубликат
      }
      
      // Запоминаем первую REMOVED позицию
      if (node.status === Status.REMOVED && firstRemovedPos === -1) {
        firstRemovedPos = position;
      }
      
      // Если нашли свободную позицию
      if (node.status === Status.FREE) {
        const finalPos = firstRemovedPos !== -1 ? firstRemovedPos : position;
        return { position: finalPos, attempts: attempts + 1 };
      }
      
      attempts++;
    }
    
    // Если есть REMOVED позиция, используем её
    if (firstRemovedPos !== -1) {
      return { position: firstRemovedPos, attempts };
    }
    
    return { position: -1, attempts }; // Таблица полна
  }

  // Проверка необходимости увеличения размера
  private needsGrowth(): boolean {
    const loadFactor = (this.occupiedCount + this.removedCount) / this.size;
    return loadFactor > 0.7;
  }

  // Проверка необходимости уменьшения размера
  private needsShrinking(): boolean {
    const loadFactor = this.occupiedCount / this.size;
    return this.size > 3 && loadFactor < 0.2 && this.removedCount > this.occupiedCount;
  }

  // Увеличение размера таблицы
  private grow(): void {
    console.log(`Увеличиваем размер с ${this.size} до ${this.size * 2}`);
    this.resize(this.size * 2);
  }

  // Уменьшение размера таблицы
  private shrink(): void {
    const newSize = Math.max(Math.ceil(this.size / 2), 3);
    console.log(`Уменьшаем размер с ${this.size} до ${newSize}`);
    this.resize(newSize);
  }

  // Перестроение таблицы с новым размером
  private resize(newSize: number): void {
    const oldNodes = this.nodes;
    const oldSize = this.size;
    
    // Собираем все активные записи
    const activeItems: { key: Key; value: Value }[] = [];
    for (const node of oldNodes) {
      if (node.status === Status.OCCUPIED && node.key && node.value) {
        activeItems.push({ key: node.key, value: node.value });
      }
    }
    
    // Создаем новую таблицу
    this.size = newSize;
    this.step = this.calculateStep(this.size);
    this.nodes = Array.from({ length: this.size }, () => new HashNode({}));
    this.occupiedCount = 0;
    this.removedCount = 0;
    
    // Вставляем все активные записи
    for (const { key, value } of activeItems) {
      this.insertInternal(key, value); // Внутренняя вставка без проверок
    }
    
    console.log(`Resize завершен: ${oldSize} -> ${this.size}, записей: ${this.occupiedCount}`);
  }

  // Внутренняя вставка (без resize и проверок дубликатов)
  private insertInternal(key: Key, value: Value): boolean {
    const result = this.findInsertPosition(key);
    
    if (result.position === -1) {
      return false; // Не удалось найти место
    }
    
    const wasRemoved = this.nodes[result.position].status === Status.REMOVED;
    
    this.nodes[result.position] = new HashNode({
      key,
      value,
      status: Status.OCCUPIED,
      initialHash: this.hash(key),
      secondaryHash: result.position
    });
    
    this.occupiedCount++;
    if (wasRemoved) {
      this.removedCount--;
    }
    
    return true;
  }

  // Публичная вставка
  insert(key: Key, value: Value): boolean {
    // Проверяем, нужно ли увеличить размер
    if (this.needsGrowth()) {
      this.grow();
    }
    
    const result = this.findInsertPosition(key);
    
    if (result.position === -1) {
      console.log(`Не удалось вставить ${key.name}: дубликат или таблица полна`);
      return false;
    }
    
    const wasRemoved = this.nodes[result.position].status === Status.REMOVED;
    
    this.nodes[result.position] = new HashNode({
      key,
      value,
      status: Status.OCCUPIED,
      initialHash: this.hash(key),
      secondaryHash: result.position
    });
    
    this.occupiedCount++;
    if (wasRemoved) {
      this.removedCount--;
    }
    
    console.log(`Вставлен ${key.name} в позицию ${result.position} за ${result.attempts} попыток`);
    return true;
  }

  // Поиск ключа
  search(key: Key): number | null {
    const result = this.findPosition(key);
    
    if (result.found) {
      console.log(`Найден ${key.name} в позиции ${result.position} за ${result.attempts} попыток`);
      return result.position;
    } else {
      console.log(`Не найден ${key.name} (${result.attempts} попыток)`);
      return null;
    }
  }

  // Удаление ключа
  remove(key: Key): boolean {
    const result = this.findPosition(key);
    
    if (!result.found || result.position === -1) {
      console.log(`Не удалось удалить ${key.name}: не найден`);
      return false;
    }
    
    // Помечаем как удаленный
    this.nodes[result.position].status = Status.REMOVED;
    this.occupiedCount--;
    this.removedCount++;
    
    console.log(`Удален ${key.name} из позиции ${result.position}`);
    
    // Проверяем, нужно ли уменьшить размер
    if (this.needsShrinking()) {
      this.shrink();
    }
    
    return true;
  }

  // Очистка всех REMOVED записей
  cleanup(): void {
    console.log(`Начинаем очистку: ${this.removedCount} REMOVED записей`);
    
    if (this.removedCount === 0) {
      console.log("Нечего очищать");
      return;
    }
    
    // Пересоздаем таблицу оптимального размера
    const optimalSize = Math.max(this.occupiedCount * 2, 3);
    this.resize(optimalSize);
    
    console.log("Очистка завершена");
  }

  // Отладочная печать
  print(): number {
    console.log(`\n=== Хеш-таблица (размер: ${this.size}, шаг: ${this.step}) ===`);
    console.log(`Занято: ${this.occupiedCount}, Удалено: ${this.removedCount}, Свободно: ${this.size - this.occupiedCount - this.removedCount}`);
    
    let count = 0;
    this.nodes.forEach((node, i) => {
      if (node.status === Status.OCCUPIED && node.key && node.value) {
        console.log(`[${i}] OCCUPIED: ${node.key.name} (${node.key.birthDate}) -> ${node.value.classCode}`);
        count++;
      } else if (node.status === Status.REMOVED) {
        console.log(`[${i}] REMOVED: ${node.key?.name || 'unknown'}`);
      } else {
        console.log(`[${i}] FREE`);
      }
    });
    
    console.log(`=== Итого активных записей: ${count} ===\n`);
    return count;
  }

  // Глубокое клонирование
  clone(): HashTable {
    const copy = new HashTable(this.size);
    copy.step = this.step;
    copy.occupiedCount = this.occupiedCount;
    copy.removedCount = this.removedCount;
    
    // Копируем все узлы
    this.nodes.forEach((node, idx) => {
      if (node.key && node.value) {
        const newKey = new Key(node.key.name, node.key.birthDate);
        const newValue = new Value(node.value.classCode);
        copy.nodes[idx] = new HashNode({
          key: newKey,
          value: newValue,
          status: node.status,
          initialHash: node.initialHash,
          secondaryHash: node.secondaryHash
        });
      } else if (node.key) {
        const newKey = new Key(node.key.name, node.key.birthDate);
        copy.nodes[idx] = new HashNode({
          key: newKey,
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
