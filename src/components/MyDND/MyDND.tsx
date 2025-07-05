import React from "react";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import "./MyDND.css";

interface MyDNDProps {
  maxFiles?: number;
}

export default function MyDND({ maxFiles }: MyDNDProps) {
  maxFiles = maxFiles ?? 1;
  const {
    acceptedFiles,

    getRootProps,
    getInputProps,
  } = useDropzone({
    maxFiles,
    accept: {
      "text/plain": [".txt"],
    },
  });

  const acceptedFileItems = acceptedFiles.map((file) => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
    </li>
  ));

  return (
    <section className="my-dnd-container open-sans-regular">
      <div {...getRootProps({ className: "dropzone" })}>
        {(() => {
          if (acceptedFileItems.length == 0) {
            return (
              <>
                <input {...getInputProps()} />
                <p className="text">Перенеси файлы сюда (только .txt)</p>
                <em className="text">
                  ({maxFiles} максимально количество файлов)
                </em>
              </>
            );
          } else {
            
          }
        })()}
      </div>
      {/* <aside>
        <h4>Accepted files</h4>
        <ul>{acceptedFileItems.length ? "accepted" : "none"}</ul>
      </aside> */}
    </section>
  );
}
