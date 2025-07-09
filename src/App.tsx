import React, { useEffect } from "react";

// <styles>
import "./styles/global.css";
import "./styles/App.css";
// </styles>
import StudentsSection from "./components/StudentsSection";

export default function App() {
  
  return (
    <>
      <div className="open-sans-regular" id="app">
        <StudentsSection />
      </div>
    </>
  );
}