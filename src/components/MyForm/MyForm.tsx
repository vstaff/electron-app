import {
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormLabel,
  FormControlLabel,
  RadioGroup,
  Radio,
  TextField,
  Button,
  MenuItem,
  Select,
} from "@mui/material";
import React from "react";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DialogActions } from "@mui/material";
import { MyFormProps } from "../../util";

export default function MyForm({
  keyOnly,
  formTitle,
  formMessage,
  isFormOpen,
  handleClose,
  handleStudentSubmit,
  handleGradeSubmit,
  setRecordType,
  recordType,
}: MyFormProps) {
  keyOnly = keyOnly ?? false;
  return (
    <Dialog open={isFormOpen} onClose={handleClose}>
      <DialogTitle>{formTitle}</DialogTitle>

      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: "10px" }}
      >
        <DialogContentText>{formMessage}</DialogContentText>
        <form
          onSubmit={
            recordType === "student" ? handleStudentSubmit : handleGradeSubmit
          }
        >
          <FormLabel id="chose-new-record-type-label">Тип записи</FormLabel>
          <RadioGroup
            aria-labelledby="demo-radio-buttons-group-label"
            defaultValue={recordType}
            name="new-record-type"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setRecordType(event.target.value as "student" | "grade")
            }
          >
            <FormControlLabel
              value="student"
              control={<Radio />}
              label="Студент"
            />
            <FormControlLabel
              value="grade"
              control={<Radio />}
              label="Оценка"
            />
          </RadioGroup>

          {recordType === "student" ? (
            <>
              <TextField
                // autoFocus
                required
                margin="dense"
                id="student-name"
                name="student-name"
                label="ФИО Студента"
                type="text"
                fullWidth
                variant="standard"
              />

              {!keyOnly && (
                <>
                  <TextField
                    required
                    margin="dense"
                    id="student-class-number"
                    name="student-class-number"
                    label="Класс Студента"
                    type="number"
                    fullWidth
                    variant="standard"
                    inputProps={{
                      min: 1,
                      max: 11,
                      step: 1,
                    }}
                  />
                  <FormLabel id="student-class-letter-label">
                    Параллель*
                  </FormLabel>
                  <Select
                    required
                    labelId="student-class-letter-label"
                    name="student-class-letter"
                    id="student-class-letter"
                    label="Параллель"
                    // value={"А"}
                  >
                    <MenuItem value={"А"}>А</MenuItem>
                    <MenuItem value={"Б"}>Б</MenuItem>
                    <MenuItem value={"В"}>В</MenuItem>
                    <MenuItem value={"Г"}>Г</MenuItem>
                  </Select>
                </>
              )}

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DemoContainer components={["DatePicker"]}>
                  <DatePicker
                    format="DD/MM/YYYY"
                    name="student-birth-date"
                    label="Дата рождения"
                    slotProps={{
                      textField: {
                        required: true,
                        fullWidth: true,
                      },
                    }}
                  />
                </DemoContainer>
              </LocalizationProvider>
            </>
          ) : (
            <>
              <TextField
                // autoFocus
                required
                margin="dense"
                id="grade-student-name"
                name="grade-student-name"
                label="ФИО Студента"
                type="text"
                fullWidth
                variant="standard"
              />

              <TextField
                // autoFocus
                required
                margin="dense"
                id="grade-subject"
                name="grade-subject"
                label="Предмет"
                type="text"
                fullWidth
                variant="standard"
              />

              <TextField
                required
                margin="dense"
                id="grade-grade"
                name="grade-grade"
                label="Оценка"
                type="number"
                fullWidth
                variant="standard"
                inputProps={{
                  min: 2,
                  max: 5,
                  step: 1,
                }}
              />

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DemoContainer components={["DatePicker"]}>
                  <DatePicker
                    name="grade-date"
                    label="Дата оценки"
                    slotProps={{
                      textField: {
                        required: true,
                        fullWidth: true,
                      },
                    }}
                  />
                </DemoContainer>
              </LocalizationProvider>
            </>
          )}

          <DialogActions>
            <Button onClick={handleClose}>Отмена</Button>
            <Button type="submit">Подтвердить</Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
}
