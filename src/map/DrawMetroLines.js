import React, { useEffect, useState } from "react";
import { TubeLinePath } from "./TubeLinePath";
import { trains as trainsData } from "../resources/tfl_lines.js";

export function DrawMetroLines({ visibleStations }) {
  const [items, setItems] = useState(trainsData.features);
  const [visibleLines, setVisibleLines] = useState([]);


  useEffect(() => {
    const list = [
      { name: "bakerloo", color: "#B36305" },
      { name: "central", color: "#E32017" },
      { name: "circle", color: "#FFD300" },
      { name: "district", color: "#00782A" },
      { name: "hammersmith & city", color: "pink" },
      { name: "jubilee", color: "#868F98" },
      { name: "metropolitan", color: "#9B0056" },
      { name: "northern", color: "#000000" },
      { name: "piccadilly", color: "#003688" },
      { name: "victoria", color: "#0098D4" },
      { name: "waterloo & city", color: "#95CDBA" },
    ];

    list.forEach((line) => {
      const stationObjectLine = [];
      items.forEach((station) => {
        let stationLines = station.properties.lines.find(
          (x) => x.name.toString().toLowerCase() === line.name
        );

        if (stationLines) {
          let stationCopy = Object.assign({}, station);
          stationCopy.lines = stationLines;
          stationObjectLine.push(station);
        }
      });

      let listItem = list.find((x) => x.name === line.name);
      if (listItem) {
        listItem.data = stationObjectLine;
        listItem.isVisible = false;
      }
    });

    setVisibleLines(list);
  }, []);

  useEffect(() => {
    if (visibleStations && visibleLines) {
      console.log(visibleStations);
      console.log(visibleLines);
      const arr = [...visibleLines];
      for (let i = 0; i < arr.length; i++) {
        if (visibleStations.includes(arr[i].name.toLowerCase())) {
          arr[i].isVisible = true;
        } else {
          arr[i].isVisible = false;
        }
        setVisibleLines(arr);
      }
    }
  }, [visibleStations]);

  return visibleLines.map((line, index) => (
    <TubeLinePath key={line.name + index} item={line}></TubeLinePath>
  ));
}
