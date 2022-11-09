// import React from "react";
// import logo from "./logo.svg";
import "./App.css";
import MapCmp from "./Map/MapCmp";
import { MapProvider } from "./Map/MapProvider";
import StatusCmp from "./Status/StatusCmp";

function App() {
  return (
    <div className="App">
      <MapProvider>
        <MapCmp></MapCmp>
      </MapProvider>
      <StatusCmp></StatusCmp>
    </div>
  );
}

export default App;
