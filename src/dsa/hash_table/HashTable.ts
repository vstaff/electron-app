import HashNode from "./HashNode";
import Key from "./Key";
import Value from "./Value";
import { Status, MIN_HASH_TABLE_SIZE, MAX_HASH_TABLE_SIZE } from "../../util";

export default class HashTable {
  private size: number;
  private step: number; // Шаг для линейного пробирования
  private nodes: HashNode[];
  private occupiedCount: number; // Количество OCCUPIED записей
  private removedCount: number;  // Количество REMOVED записей

  constructor(initialSize: number) {
    this.size = Math.max(initialSize, MIN_HASH_TABLE_SIZE); // Минимум согласно константе
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

  getRemovedCount(): number {
    return this.removedCount;
  }

  // Получить количество ячеек со статусом OCCUPIED или REMOVED
  getUsedCellsCount(): number {
    return this.occupiedCount + this.removedCount;
  }

  // Публичный метод для изменения размера таблицы пользователем
  resizeTable(newSize: number): boolean {
    // Валидация размера с использованием констант
    if (newSize < MIN_HASH_TABLE_SIZE || newSize > MAX_HASH_TABLE_SIZE || !Number.isInteger(newSize)) {
      console.log(`Неправильный размер: ${newSize}. Размер должен быть от ${MIN_HASH_TABLE_SIZE} до ${MAX_HASH_TABLE_SIZE}`);
      return false;
    }

    // Если таблица пуста, можем изменить размер на любой допустимый
    if (this.occupiedCount === 0 && this.removedCount === 0) {
      console.log(`Изменяем размер пустой таблицы с ${this.size} на ${newSize}`);
      this.size = newSize;
      this.step = this.calculateStep(this.size);
      this.nodes = Array.from({ length: this.size }, () => new HashNode({}));
      return true;
    }

    // Новое условие: размер должен быть >= количеству ячеек со статусом OCCUPIED или REMOVED
    const usedCells = this.getUsedCellsCount();
    if (newSize < usedCells) {
      console.log(`Новый размер ${newSize} меньше количества используемых ячеек ${usedCells} (OCCUPIED: ${this.occupiedCount}, REMOVED: ${this.removedCount})`);
      return false;
    }

    // Изменяем размер с сохранением данных
    console.log(`Изменяем размер таблицы с ${this.size} на ${newSize} (используемых ячеек: ${usedCells})`);
    this.resize(newSize);
    return true;
  }

  // Создание уникального ключа для записи
  private createRecordKey(key: Key): string {
    return `${key.name}|${key.birthDate}`;
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
    const middleString = doubled.substring(startPos, startPos + middleLength);
    
    return parseInt(middleString || '0', 10) % this.size;
  }

  // Поиск позиции для поиска/удаления
  private findPosition(key: Key): { position: number; found: boolean; attempts: number } {
    const initialHash = this.hash(key);
    let position = initialHash;
    let attempts = 1;
    
    while (attempts <= this.size) {
      const node = this.nodes[position];
      
      // Если дошли до свободной ячейки - элемента нет
      if (node.status === Status.FREE) {
        return { position, found: false, attempts };
      }
      
      // Если нашли нужный ключ и он не удален
      if (node.status === Status.OCCUPIED && node.key && 
          node.key.name === key.name && node.key.birthDate === key.birthDate) {
        return { position, found: true, attempts };
      }
      
      // Переходим к следующей позиции
      // position = (position + this.step) % this.size;
      position = (initialHash + this.step * attempts) % this.size;
      attempts++;
    }
    
    return { position: -1, found: false, attempts };
  }

  // Поиск позиции для вставки
  private findInsertPosition(key: Key): { position: number; attempts: number } {
    const initialHash = this.hash(key);
    let position = initialHash;
    let attempts = 1;
    let firstRemovedPos = -1;
    
    while (attempts <= this.size) {
      const node = this.nodes[position];
      
      // Если нашли дубликат
      if (node.status === Status.OCCUPIED && node.key && 
          node.key.name === key.name && node.key.birthDate === key.birthDate) {
        return { position: -1, attempts }; // Дубликат
      }
      
      // Если нашли свободную ячейку
      if (node.status === Status.FREE) {
        const finalPos = firstRemovedPos !== -1 ? firstRemovedPos : position;
        return { position: finalPos, attempts };
      }
      
      // Запоминаем первую удаленную позицию
      if (node.status === Status.REMOVED && firstRemovedPos === -1) {
        firstRemovedPos = position;
      }
      
      // position = (position + this.step) % this.size;
      position = (initialHash + this.step * attempts) % this.size;
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
    return this.size > MIN_HASH_TABLE_SIZE && loadFactor < 0.2 && this.removedCount > this.occupiedCount;
  }

  // Увеличение размера таблицы
  private grow(): void {
    console.log(`Увеличиваем размер с ${this.size} до ${this.size * 2}`);
    this.resize(this.size * 2);
  }

  // Уменьшение размера таблицы
  private shrink(): void {
    // const newSize = Math.max(Math.ceil(this.size / 2), MIN_HASH_TABLE_SIZE);
    // console.log(`Уменьшаем размер с ${this.size} до ${newSize}`);
    // this.resize(newSize);

    const notFreeCellsCount = this.nodes.reduce((count, node) => node.status !== Status.FREE ? count + 1 : count, 0);
    const newSize = Math.max(Math.ceil(this.size / 2), MIN_HASH_TABLE_SIZE, notFreeCellsCount);
    console.log(`Уменьшаем размер с ${this.size} до ${newSize}`);
    this.resize(newSize);
  }

  // Перестроение таблицы с новым размером
  private resize(newSize: number): void {
    const oldNodes = this.nodes;
    const oldSize = this.size;
    
    // Собираем ВСЕ записи: OCCUPIED и REMOVED
    const activeItems: { key: Key; value: Value }[] = [];
    const removedItems: { key: Key; value?: Value }[] = [];
    
    for (const node of oldNodes) {
      if (node.status === Status.OCCUPIED && node.key && node.value) {
        activeItems.push({ key: node.key, value: node.value });
      } else if (node.status === Status.REMOVED && node.key) {
        // Сохраняем удаленные записи тоже
        removedItems.push({ key: node.key, value: node.value });
      }
    }
    
    // Создаем новую таблицу
    this.size = newSize;
    this.step = this.calculateStep(this.size);
    this.nodes = Array.from({ length: this.size }, () => new HashNode({}));
    this.occupiedCount = 0;
    this.removedCount = 0;
    
    // Сначала вставляем активные записи
    for (const { key, value } of activeItems) {
      this.insertInternal(key, value);
    }
    
    // Затем размещаем REMOVED записи в свободных позициях
    for (const { key, value } of removedItems) {
      // Ищем любую свободную позицию для REMOVED записи
      for (let i = 0; i < this.size; i++) {
        if (this.nodes[i].status === Status.FREE) {
          this.nodes[i] = new HashNode({
            key,
            value,
            status: Status.REMOVED,
            initialHash: this.hash(key),
            secondaryHash: i
          });
          this.removedCount++;
          break;
        }
      }
    }
    
    console.log(`Resize завершен: ${oldSize} -> ${this.size}, активных: ${this.occupiedCount}, удаленных: ${this.removedCount}`);
  }

  // Внутренняя вставка (без resize и проверок дубликатов)
  private insertInternal(key: Key, value: Value): boolean {
    const result = this.findInsertPosition(key);
    
    if (result.position === -1) {
      return false; // Не удалось найти место
    }
    
    const wasRemoved = this.nodes[result.position].status === Status.REMOVED;
    
    // Вставляем новую запись
    this.nodes[result.position] = new HashNode({
      key,
      value,
      status: Status.OCCUPIED,
      initialHash: this.hash(key),
      secondaryHash: result.position
    });
    
    this.occupiedCount++;
    if (wasRemoved) { // если мы вставили новый элемент на место ранее удаленной записи - то количество ячеек со статусом 2 становится на 1 меньше
      this.removedCount--;
    }
    
    return true;
  }

  // Публичная вставка
  insert(key: Key, value: Value): boolean {
    const result = this.findInsertPosition(key);
    
    if (result.position === -1) {
      console.log(`Не удалось вставить ${key.name}: дубликат или таблица полна`);
      return false;
    }
    
    const wasRemoved = this.nodes[result.position].status === Status.REMOVED;
    const removedRecord = wasRemoved ? {
      key: this.nodes[result.position].key,
      value: this.nodes[result.position].value
    } : null;
    
    // Вставляем новую запись
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
      console.log(`Заменили REMOVED запись: ${removedRecord?.key?.name} -> ${key.name} в позиции ${result.position}`);
    }
    
    console.log(`Вставлен ${key.name} в позицию ${result.position} за ${result.attempts} попыток`);
    // Проверяем, нужно ли увеличить размер
    if (this.needsGrowth()) {
      this.grow();
    }
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

  // Удаление ключа - только меняем статус, данные остаются
  remove(key: Key): boolean {
    const result = this.findPosition(key);
    
    if (!result.found || result.position === -1) {
      console.log(`Не удалось удалить ${key.name}: не найден`);
      return false;
    }
    
    // Просто меняем статус на REMOVED, данные остаются в таблице
    this.nodes[result.position].status = Status.REMOVED;
    this.occupiedCount--;
    this.removedCount++;
    
    console.log(`Удален ${key.name} из позиции ${result.position} (статус изменен на REMOVED)`);
    
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
    const optimalSize = Math.max(this.occupiedCount * 2, MIN_HASH_TABLE_SIZE);
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
        console.log(`[${i}] REMOVED`);
      } else {
        console.log(`[${i}] FREE`);
      }
    });
    
    console.log(`Всего активных записей: ${count}`);
    return count;
  }

  // Клонирование таблицы
  clone(): HashTable {
    const copy = new HashTable(this.size);
    copy.occupiedCount = 0;
    copy.removedCount = 0;

    // Создаем глубокую копию узлов
    this.nodes.forEach((node, idx) => {
      if (node.key && node.value && node.status === Status.OCCUPIED) {
        // Создаем новые экземпляры Key и Value для активных записей
        const newKey = new Key(node.key.name, node.key.birthDate);
        const newValue = new Value(node.value.classCode);
        copy.nodes[idx] = new HashNode({
          key: newKey,
          value: newValue,
          status: node.status,
          initialHash: node.initialHash,
          secondaryHash: node.secondaryHash
        });
        copy.occupiedCount++;
      } else if (node.status === Status.REMOVED && node.key) {
        // Копируем REMOVED записи с их данными
        const newKey = new Key(node.key.name, node.key.birthDate);
        const newValue = node.value ? new Value(node.value.classCode) : undefined;
        copy.nodes[idx] = new HashNode({
          key: newKey,
          value: newValue,
          status: node.status,
          initialHash: node.initialHash,
          secondaryHash: node.secondaryHash
        });
        copy.removedCount++;
      } else {
        // FREE записи
        copy.nodes[idx] = new HashNode({
          status: Status.FREE,
          initialHash: node.initialHash,
          secondaryHash: node.secondaryHash
        });
      }
    });

    return copy;
  }
}