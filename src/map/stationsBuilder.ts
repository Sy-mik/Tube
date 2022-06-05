import { ConnectionBetweenStations, Station } from "../model/Station";
import * as geolib from "geolib";

export function buildStations(stationsData: any): Map<String, Station> {
  let itemsByStation: Map<String, Station> = new Map<String, Station>();

  // TODO - Time is different comparing when going North-South and South-North
  let ignoreRedundantDirection = (val: any) =>
    val == "Northbound" || val == "Westbound" || val == "Inner";

  for (let i = 0; i < stationsData.length; i++) {
    let station = stationsData[i];

    if (
      // station.A !== "VICTORIA" ||
      // (
      //   station.Line !== "Hammersmith & City"
      //   && station.Line !== "Victoria"
      // && station.Line !== "District"
      // &&  station.Line !== "Jubilee"

      //   // && station.Line !== "Metropolitan"
      //   ) ||
      ignoreRedundantDirection(station.Direction)
    )
      continue;

    let existingStation: Station | null | undefined = itemsByStation.get(
      station.A
    );

    let existingDestination = itemsByStation.get(station.B);

    let newConnection = new Station(station.B, [0, 0]);

    if (!existingStation) {
      existingStation = new Station(station.A, station.coordinates);
      itemsByStation.set(station.A, existingStation);
    } else {
      existingStation.coordinates = station.coordinates;
    }

    if (!existingDestination) {
      itemsByStation.set(station.B, newConnection);
    } else {
      newConnection = existingDestination;
    }

    existingStation.connect(
      newConnection,
      station.Line,
      station.Direction,
      station.Min
    );

    newConnection.connectPrevious(
      existingStation,
      station.Line,
      station.Direction,
      station.Min
    );
  }

  return itemsByStation;
}

export function getVisibleLanes(
  value: any,
  distance: any,
  stations: Map<String, Station>
) {
  let closestStation;
  let lanes = new Set<string>();
  let minDistance = Number.MAX_VALUE;
  stations.forEach((station, key) => {
    const latlng = {
      lat: station.coordinates[1],
      lng: station.coordinates[0],
    };

    // TODO - use geoLib.isWithinRadius and get multiple lanes
    let stationDistance = isWithinRadius(value, latlng, distance);

    if (stationDistance < minDistance) {
      // remove Lanes logic
      lanes = new Set<string>();
      minDistance = stationDistance;
      closestStation = station;
      station.connections.forEach((line, key) => {
        lanes.add(key.toLowerCase());
      });
    }
  });
  return { lanes: Array.from(lanes), station: closestStation };
}

function isWithinRadius(a: any, b: any, distance: any) {
  return geolib.getDistance(
    { latitude: a.lat, longitude: a.lng },
    { latitude: b.lat, longitude: b.lng }
  );
}

export function traverseAllAndAddStations(
  station: Station,
  depth: number,
  lines: Set<string>,
  seconds: number,
  stations: Map<string, any>,
  previous: any
) {
  if (!previous)
    // Starting station
    previous = {
      seconds: 0,
      coordinates: station.coordinates,
      name: station.name,
      previousStation: null,
    };

  let it = Array.from(station.previous.values()).flat();
  // Array.from(station.previous.keys())
  //   .filter((x) => !lines.has(x))
  //   .forEach((item) => lines.add(item.toLowerCase()));
  if (it) traverse(station.previous, depth, lines, seconds, stations, previous);

  it = Array.from(station.connections.values()).flat();

  // Array.from(station.connections.keys())
  //   .filter((x) => !lines.has(x))
  //   .forEach((item) => lines.add(item.toLowerCase()));

  // console.log("lines is ", lines);
  if (it)
    traverse(station.connections, depth, lines, seconds, stations, previous);
}

function traverse(
  items: Map<string, ConnectionBetweenStations[]>,
  depth: number,
  lines: Set<string>,
  seconds: number,
  stations: Map<string, any>,
  previous: any
) {
  items.forEach((connections, line) => {
    connections.forEach((item) => {
      let existing = stations.get(item.station.name);
      let secondsSum = seconds + (item.seconds ?? 0);

      if (
        !existing ||
        previous?.previousStation?.line == line ||
        (previous?.previousStation?.line != line &&
          existing.seconds > secondsSum + 300)
      ) {
        let st = {
          seconds: secondsSum,
          coordinates: item.station.coordinates,
          name: item.station.name,
          previousStation: previous,
          previousByLine: line,
        };

        stations.set(st.name, st);

        traverseAllAndAddStations(
          item.station,
          depth,
          lines,
          secondsSum,
          stations,
          st
        );
      }
    });
  });
}

export function flattenStationToLinePrev(
  station: Station,
  depth: number,
  line: string,
  seconds: number,
  stations: any[]
) {
  let prevItems = station.previous.get(line);
  if (prevItems) {
    prevItems.forEach((item) => {
      let secondsSum = seconds + (item.seconds ?? 0);

      let st = {
        seconds: secondsSum,
        coordinates: item.station.coordinates,
        name: item.station.name,
      };
      stations.push(st);
      flattenStationToLinePrev(item.station, depth, line, secondsSum, stations);
    });
  }
}

export function flattenStationToLineNext(
  station: Station,
  depth: number,
  line: string,
  seconds: number,
  stations: any[]
) {
  let items = station.connections.get(line);
  if (items) {
    items.forEach((item) => {
      let secondsSum = seconds + (item.seconds ?? 0);

      let st = {
        seconds: secondsSum,
        coordinates: item.station.coordinates,
        name: item.station.name,
        previous: station,
      };

      stations.push(st);
      flattenStationToLineNext(item.station, depth, line, secondsSum, stations);
    });
  }
}
