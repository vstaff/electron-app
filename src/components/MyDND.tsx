import React, { useCallback, useState } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";
// styles
import "./styles/MyDND.css";

// <icons>
import AttachFileIcon from "@mui/icons-material/AttachFile";
import DescriptionIcon from "@mui/icons-material/Description";
// </icons>

import { MyDNDProps } from "../util";

export default function MyDND({
  name,
  setRawData,
  toggleAlert,
  alertName,
  validateFile,
  contentRejected,
  setContentRejected,
  prevFileName,
  setPrevFileName,
}: MyDNDProps) {
  const [currentFileName, setCurrentFileName] = useState<string>("");

  const onDrop = useCallback((acceptedFiles: readonly FileWithPath[]) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];

    file
      .text()
      .then((text) => {
        if (!validateFile(text)) {
          toggleAlert(alertName);
          setContentRejected(true);
          // НЕ обновляем prevFileName при ошибке валидации
        } else {
          setContentRejected(false);
          setRawData(text.trim().split(/\r?\n/));
          // Обновляем prevFileName только при успешной валидации
          setPrevFileName(file.name);
        }
        // Сохраняем текущее имя файла для отображения
        setCurrentFileName(file.name);
      })
      .catch((err) => {
        console.error("Ошибка чтения файла:", err);
      });
  }, [validateFile, toggleAlert, alertName, setContentRejected, setRawData, setPrevFileName]);

  const onDragEnter = () => {
    setContentRejected(false);
  };

  const { acceptedFiles, getRootProps, getInputProps, isDragReject } =
    useDropzone({
      onDrop,
      onDragEnter,
      maxFiles: 1,
      accept: {
        "text/plain": [".txt"],
      },
    });

  return (
    <section
      {...getRootProps({ className: "dropzone" })}
      className="dropzone my-dnd-container open-sans-regular"
    >
      {(() => {
        if (!prevFileName && !currentFileName) {
          // Нет файла вообще
          return (
            <>
              <AttachFileIcon />
              <input {...getInputProps()} />
              <p className="text">Справочник {name} (только .txt)</p>
            </>
          );
        } else if (contentRejected) {
          // Файл отклонен - показываем предыдущий корректный или сообщение об ошибке
          return (
            <>
              <DescriptionIcon />
              <input {...getInputProps()} />
              <p className="text" style={{ color: "red" }}>
                {prevFileName || "Файл отклонен"}
              </p>
            </>
          );
        } else {
          // Файл принят - показываем текущий корректный файл
          return (
            <>
              <DescriptionIcon />
              <input {...getInputProps()} />
              <p className="text">{prevFileName}</p>
            </>
          );
        }
      })()}
    </section>
  );
}