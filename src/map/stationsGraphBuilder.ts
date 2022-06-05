import * as geolib from "geolib";

export class TubeLine {
  name: string;
  previous: TubeLine[];
  next: TubeLine[];
  root: TubeLine;

  intersection: TubeLine[];
  minutes: number;
  minutesFromRoot: number;
  alreadyChecked: Object = {};

  constructor(name: string, minutes: number, minutesFromRoot: number = 0) {
    this.name = name;
    this.intersection = [];
    this.next = [];
    this.previous = [];
    this.minutes = minutes;
    this.minutesFromRoot = minutesFromRoot;
    this.root = new TubeLine("none", 0);
  }

  addNext(newStation: TubeLine, previousStationName: string) {
    if (!this.previous && !this.next) this.root = this;

    newStation.root = this.root;
    if (previousStationName === this.name) {
      // if station name match, add proper mapping
      this.next.push(newStation);
      newStation.addPrev(this); // TODO - handle scenario of minutes, when there are many prev
      newStation.minutesFromRoot += this.minutes;
    } else if (!this.next) {
      // If next is empty try finding from root
      this.root.addNext(newStation, previousStationName);
    } else {
      // go through all next and try adding
      for (let i = 0; i < this.next.length; i++)
        this.next[i].addNext(newStation, previousStationName);
    }
  }

  addPrev(previous: TubeLine) {
    this.previous.push(previous);
  }

  addIntersection(line: TubeLine) {
    this.intersection.push(line);
  }
}

export function displayLanesAndStations(
  stationsData: any,
  value: any,
  distance: any
) {
  let newVisibleStations = [];
  let newClosestStations = [];
  for (let i = 0; i < stationsData.length; i++) {
    const station = stationsData[i];
    const latlng = {
      lat: station.coordinates[1],
      lng: station.coordinates[0],
    };
    if (isWithinRadius(value, latlng, distance)) {
      let laneName = stationsData[i].Line.toString().toLowerCase();
      if (newVisibleStations.indexOf(laneName) === -1)
        newVisibleStations.push(laneName);
      if (!newClosestStations[laneName]) {
        newClosestStations[laneName] = stationsData[i].A;
      }
    }
  }

  console.log("closest stations");
  console.log(newClosestStations);
  console.log(newVisibleStations);

  // setClosestStations(newClosestStations);
  // setVisibleStations(newVisibleStations);
}

function isWithinRadius(a: any, b: any, distance: any) {
  return geolib.isPointWithinRadius(
    { latitude: a.lat, longitude: a.lng },
    { latitude: b.lat, longitude: b.lng },
    distance
  );
}
