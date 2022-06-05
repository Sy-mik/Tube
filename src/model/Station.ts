export class ConnectionBetweenStations {
  direction: string;
  station: Station;
  min: number;
  seconds: number;

  constructor(
    direction: string,
    station: Station,
    min: number,
    seconds: number
  ) {
    this.direction = direction;
    this.station = station;
    this.min = min;
    this.seconds = seconds;
  }
}

export class Station {
  name: string;
  coordinates: any;
  connections: Map<string, ConnectionBetweenStations[]>;
  previous: Map<string, ConnectionBetweenStations[]>;

  constructor(name: string, coordinates: any) {
    this.name = name;
    this.coordinates = coordinates;
    this.connections = new Map<string, ConnectionBetweenStations[]>(); // LineName -
    this.previous = new Map<string, ConnectionBetweenStations[]>(); // LineName -
  }

  getFirstAvailableLine() {
    if (this.previous.size > 0) {
      return this.previous.keys().next().value;
    }
    if (this.connections.size > 0) {
      return this.connections.keys().next().value;
    }
  }

  connectPrevious(
    anotherStation: Station,
    lineName: string,
    direction: string,
    min: string
  ) {
    let mins = Number(parseFloat(min.replace(/,/, ".")).toFixed(2));
    let line = new ConnectionBetweenStations(
      direction,
      anotherStation,
      mins,
      Math.round((mins * 60))
    );
    let connectedStation = this.previous.get(lineName);

    if (connectedStation) {
      connectedStation.push(line);
      this.previous.set(lineName, connectedStation);
    } else {
      this.previous.set(lineName, [line]);
    }
  }

  connect(
    anotherStation: Station,
    lineName: string,
    direction: string,
    min: string
  ) {
    let mins = Number(parseFloat(min.replace(/,/, ".")).toFixed(2));
    let line = new ConnectionBetweenStations(
      direction,
      anotherStation,
      mins,
      Math.round((mins * 60))
    );

    let connectedStation = this.connections.get(lineName);

    if (connectedStation) {
      connectedStation.push(line);
      this.connections.set(lineName, connectedStation);
    } else {
      this.connections.set(lineName, [line]);
    }
  }

}
