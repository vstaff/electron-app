import {
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";
import React from "react";
import { DialogActions } from "@mui/material";
import { MyFormProps2 } from "../util";

export default function MyForm2({
  keyOnly,
  formTitle,
  formMessage,
  isFormOpen,
  handleClose,
  handleSubmit,
  children,
}: MyFormProps2) {
  keyOnly = keyOnly ?? false;
  return (
    <Dialog open={isFormOpen} onClose={handleClose}>
      <DialogTitle>{formTitle}</DialogTitle>
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: "10px" }}
      >
        <DialogContentText>{formMessage}</DialogContentText>
        <form onSubmit={handleSubmit}>
          {children}

          <DialogActions>
            <Button onClick={handleClose}>Отмена</Button>
            <Button type="submit">Подтвердить</Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
}
