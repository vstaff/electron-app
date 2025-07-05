import React from "react"
import "./styles/global.css"
import MyDND from "./components/MyDND/MyDND";

export default function App() {
  return (
    <>
      <div id="app">
        <h1 className="open-sans-regular">Привет из Electron!</h1>
        <p>👋</p>
        
        <MyDND />
        <MyDND />
      </div>
    </>
  )
}