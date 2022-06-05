import React from "react";
import { GeoJSON } from "react-leaflet";
import { lineColors } from "../resources/lineColors";

const lineSizes = new Map([
  ["circle", 6],
  ["hammersmith & city", 3],
  ["bakerloo", 6],
  ["waterloo & city", 6],
  ["jubilee", 6],
]);

export function TubeLinePath({ item }) {
  if (item && item.isVisible) {
    return (
      <GeoJSON
        onMouseOver={() => console.log("mouse over line")}
        key={item.name}
        className={item.name}
        attribution="&copy; credits due..."
        style={{
          color: item.color,
          weight: lineSizes.get(item.name) ?? 3,
        }}
        data={item.data}
      />
    );
  } else return null;
}
