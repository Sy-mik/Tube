import React, { useEffect, useState } from "react";
import { Dropdown } from "./Dropdown";

export function TwoPointsPicker({
  stationsData,
  startingPointHandler,
  endingPointHandler,
}) {
  const [items, setItems] = useState<any[]>();
  useEffect(() => {
    let vals = Array.from(stationsData, function (value) {
      return { label: value[0], value: value[1] };
    });
    setItems(vals);
  }, [stationsData]);
  if (!items) return null;

  return (
    <>
      <div
        style={{
          zIndex: 100,
          position: "absolute",
          left: "20px",
          top: "10px",
          background: "white",
        }}
      >
        <Dropdown
          handler={startingPointHandler}
          label="Starting point"
          options={items}
        ></Dropdown>
      </div>
      <div
        style={{
          zIndex: 100,
          position: "absolute",
          left: "320px",
          top: "10px",
          background: "white",
        }}
      >
        <Dropdown
          handler={endingPointHandler}
          label="Ending point"
          options={items}
        ></Dropdown>
      </div>

      {/* <div
       style={{
        zIndex: 100,
        position: "absolute",
        left: "600px",
        top: "10px",
        background: "white",
      }}
      onClick={() => endingPointHandler(null)}>Reset</div> */}
    </>
  );
}
