import React, { useState } from "react";
import { TextField, Button, Box, Typography } from "@mui/material";
import { validateHashTableSize, MIN_HASH_TABLE_SIZE, MAX_HASH_TABLE_SIZE } from "../util";

interface HashTableSizeControlProps {
  currentSize: number;
  usedCells?: number; // Количество используемых ячеек (OCCUPIED + REMOVED)
  onSizeChange: (newSize: number) => boolean;
  disabled?: boolean;
}

export default function HashTableSizeControl({ 
  currentSize, 
  usedCells = 0,
  onSizeChange, 
  disabled = false 
}: HashTableSizeControlProps) {
  const [inputValue, setInputValue] = useState<string>(currentSize.toString());
  const [error, setError] = useState<string>("");

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);
    setError("");
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    const newSize = parseInt(inputValue, 10);
    
    // Валидация введенного значения
    if (isNaN(newSize) || !validateHashTableSize(newSize)) {
      setError(`Размер должен быть целым числом от ${MIN_HASH_TABLE_SIZE} до ${MAX_HASH_TABLE_SIZE}`);
      return;
    }

    // Попытка изменить размер
    const success = onSizeChange(newSize);
    
    if (!success) {
      setError("Не удается изменить размер. Проверьте условия.");
    } else {
      setError("");
    }
  };

  const handleReset = () => {
    setInputValue(currentSize.toString());
    setError("");
  };

  // Обновляем input когда изменяется currentSize извне
  React.useEffect(() => {
    setInputValue(currentSize.toString());
    setError("");
  }, [currentSize]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400 }}>
      <Typography variant="h6" component="h3">
        Управление размером хеш-таблицы
      </Typography>
      
      <Typography variant="body2" color="text.secondary">
        Текущий размер: {currentSize} элементов
      </Typography>
      
      {usedCells > 0 && (
        <Typography variant="body2" color="text.secondary">
          Используемых ячеек: {usedCells} (минимальный размер)
        </Typography>
      )}

      <Box 
        component="form" 
        onSubmit={handleSubmit}
        sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}
      >
        <TextField
          label="Новый размер"
          type="number"
          value={inputValue}
          onChange={handleInputChange}
          disabled={disabled}
          error={!!error}
          helperText={error || `Введите размер от ${MIN_HASH_TABLE_SIZE} до ${MAX_HASH_TABLE_SIZE}`}
          inputProps={{
            min: MIN_HASH_TABLE_SIZE,
            max: MAX_HASH_TABLE_SIZE,
            step: 1
          }}
          size="small"
          sx={{ flexGrow: 1 }}
        />
        
        <Button
          type="submit"
          variant="contained"
          disabled={disabled || inputValue === currentSize.toString()}
          size="small"
          sx={{ height: 40 }}
        >
          Применить
        </Button>
        
        <Button
          type="button"
          variant="outlined"
          onClick={handleReset}
          disabled={disabled}
          size="small"
          sx={{ height: 40 }}
        >
          Сброс
        </Button>
      </Box>

      <Typography variant="caption" color="text.secondary">
        * Новый размер должен быть не меньше количества используемых ячеек ({usedCells})
      </Typography>
    </Box>
  );
}