  import React, { useCallback, useState } from "react";
  import { FileWithPath, useDropzone } from "react-dropzone";
  // styles
  import "./MyDND.css";
  // icons
  import AttachFileIcon from "@mui/icons-material/AttachFile";
  import DescriptionIcon from '@mui/icons-material/Description';

  interface MyDNDProps {
    name: string,
    setRawData: React.Dispatch<React.SetStateAction<string[]>>;
    alertMessage: string,
    validateFile: (text: string) => boolean,
    contentRejected: boolean,
    setContentRejected: React.Dispatch<React.SetStateAction<boolean>>
  }

  export default function MyDND({ name, setRawData, alertMessage, validateFile, contentRejected, setContentRejected, }: MyDNDProps) {
    // const [contentRejected, setContentRejected] = useState(false);
    const onDrop = useCallback((acceptedFiles: readonly FileWithPath[]) => {
      if (acceptedFiles.length === 0) return; // по идее этого не должно случиться, но на всякий случай
      const file = acceptedFiles[0];

      file
          .text()
          .then((text) => {
            // разбиваем по переводу строки (поддерживает Windows/Mac/Linux)
            if (!validateFile(text)) {
              alert(alertMessage);
              setContentRejected(true);
            } else {
              setContentRejected(false);
              setRawData(text.trim().split(/\r?\n/));
            }
            // const arr = text.trim().split(/\r?\n/);
            // for (const line of arr) {
            //   if (line === "") return;
            //   if (line.split(";").length != 3) {
            //     alert(alertMessage);
            //     setContentRejected(true);
            //     break;
            //   } else {
            //     setContentRejected(false);
            //     setRawData(arr);
            //   }
            // }
          })
          .catch((err) => {
            console.error("Ошибка чтения файла:", err);
          });
    }, []);

    const onDragEnter = () => {
      setContentRejected(false);
    }

    const {
      acceptedFiles,
      getRootProps,
      getInputProps,
      isDragReject,
    } = useDropzone({
      onDrop,
      onDragEnter,
      maxFiles: 1,
      accept: {
        "text/plain": [".txt"],
      },
    });

    return (
      <section {...getRootProps({ className: "dropzone" })} className="dropzone my-dnd-container open-sans-regular">
        {(() => {
            if (acceptedFiles.length == 0 || contentRejected) {
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
