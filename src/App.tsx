import "leaflet/dist/leaflet.css";
import React, { useEffect, useState } from "react";
import "./App.css";
import { TwoPointsPicker } from "./components/TwoPointsPicker";
import useLeafletMap from "./map/MapContainer";
import { buildStations } from "./map/stationsBuilder";
import useDrawOnMap from "./map/useDrawOnMap";
import { Station } from "./model/Station";
import { timetables as stationsData } from "./resources/tfl_timetables";
import { StationsPath } from "./StationsPath";

function App() {
  const [data, setData] = useState<any>();
  const [startingPoint, setStartingPoint] = useState();

  const [endingPoint, setEndingPoint] = useState();

  const [stationsStructure, setStationsStructure] = useState<
    Map<String, Station>
  >(new Map<String, Station>());

  let { map } = useLeafletMap();
  let { isLoading, currentPath, linesGuide } = useDrawOnMap(
    map,
    startingPoint,
    endingPoint
  );

  useEffect(() => {
    console.log("map changed to ", map);
    if (map) {
      let stations: any = buildStations(stationsData);
      setStationsStructure(stations);
      console.log("built stations ", stations);
    }
  }, [map]);

  return (
    <>
      <TwoPointsPicker
        stationsData={stationsStructure}
        startingPointHandler={setStartingPoint}
        endingPointHandler={setEndingPoint}
      />
      <div
        style={{
          zIndex: 99,
          position: "absolute",
          left: "20px",
          top: "70px",
          opacity: 0.8,
          width: "550px",
          height: "auto",
          background: "white",
          visibility: startingPoint && endingPoint ? "visible" : "hidden",
        }}
      >
        {linesGuide &&
          Array.from(linesGuide)
            .sort((x) => x[1].order)
            .reverse()
            .map((key) => {
              return key[0] + " at " + key[1].station;
            })
            .map((item, index) => {
              if (index == 0) return <div key={item}> Take {item} </div>;
              else return <div key={item}> Change to {item} </div>;
            })}
        <div>
          Estimated travel time {Math.round((currentPath?.seconds ?? 0) / 60)}
          min
        </div>
      </div>
    </>
  );
}

export default App;
