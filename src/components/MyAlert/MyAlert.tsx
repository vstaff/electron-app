import React, { useEffect, useRef } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

export interface MyAlertProps {
  title: string;
  message: string;
  open: boolean;
  onClose: () => void;
}

export default function MyAlert({
  title,
  message,
  open,
  onClose,
}: MyAlertProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" && open) {
        // Проверяем, что фокус находится внутри диалога или на кнопке
        const activeElement = document.activeElement;
        const dialogElement = dialogRef.current;

        if (
          dialogElement &&
          (dialogElement.contains(activeElement) ||
            activeElement?.getAttribute("role") === "button")
        ) {
          onClose();
        }
      }
    };

    if (open) {
      // Добавляем небольшую задержку, чтобы избежать конфликта с submit формы
      const timer = setTimeout(() => {
        document.addEventListener("keydown", handleKeyDown);
      }, 100);

      return () => {
        clearTimeout(timer);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [open, onClose]);

  return (
    <>
      <Dialog
        ref={dialogRef}
        open={open}
        onClose={onClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{title}</DialogTitle>

        <DialogContent>
          <DialogContentText id="alert-dialog-text">
            {message}
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} autoFocus>
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
