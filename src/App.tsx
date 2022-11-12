import ArtnetCmp from "Artnet/ArtnetCmp";
import "./App.css";
import MapCmp from "./Map/MapCmp";
import { MapProvider } from "./Map/MapProvider";
import StatusCmp from "./Status/StatusCmp";

function App() {
  return (
    <div className="App">
      <MapProvider>
        <MapCmp />
      </MapProvider>
      <StatusCmp />
      <ArtnetCmp />
    </div>
  );
}

export default App;
