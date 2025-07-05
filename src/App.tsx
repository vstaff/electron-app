import React from "react"
import "./styles/global.css";

export default function App() {
  return (
    <>
      <div id="app">
        <h1 className="text">Привет из Electron!</h1>
        <p>👋</p>
        <p id="info"></p>
      </div>
    </>
  )
}