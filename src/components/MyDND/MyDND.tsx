import React, { useCallback } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";
// styles
import "./MyDND.css";
// icons
import AttachFileIcon from "@mui/icons-material/AttachFile";
import DescriptionIcon from '@mui/icons-material/Description';

interface MyDNDProps {
  name: string,
  setRawData: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function MyDND({ name, setRawData, }: MyDNDProps) {
  const onDropAccepted = useCallback((acceptedFiles: readonly FileWithPath[]) => {
    if (acceptedFiles.length === 0) return; // по идее этого не должно случиться, но на всякий случай
    const file = acceptedFiles[0];

    file
        .text()
        .then((text) => {
          // разбиваем по переводу строки (поддерживает Windows/Mac/Linux)
          const arr = text.trim().split(/\r?\n/);
          arr.forEach(line => {
            if (line === "") return;
            if (line.split(";").length != 3) {
              throw new Error("Для справочника Студенты каждая строка входного файла должна содержать: ФИО;Класс;Дата рождения")
            }
          })

          setRawData(arr);
        })
        .catch((err) => {
          console.error("Ошибка чтения файла:", err);
        });
  }, []);

  const {
    acceptedFiles,
    getRootProps,
    getInputProps,
  } = useDropzone({
    onDropAccepted,
    maxFiles: 1,
    accept: {
      "text/plain": [".txt"],
    },
  });

  return (
    <section {...getRootProps({ className: "dropzone" })} className="dropzone my-dnd-container open-sans-regular">
      {(() => {
          if (acceptedFiles.length == 0) {
            return (
              <>
                <AttachFileIcon />
                <input {...getInputProps()} />
                <p className="text">Справочник {name} (только .txt)</p>
              </>
            );
          } else {
            return (
              <>
                
                <DescriptionIcon />
                <input {...getInputProps()} />
                <p className="text">{acceptedFiles[0].name}</p>
              </>
            )
          }
        })()}
      {/* <aside>
        <h4>Accepted files</h4>
        <ul>{acceptedFileItems.length ? "accepted" : "none"}</ul>
      </aside> */}
    </section>
  );
}
