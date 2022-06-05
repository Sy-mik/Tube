import * as d3 from "d3";
import * as d3Geo from "d3-geo";
import * as L from "leaflet";
import { useEffect, useState } from "react";
import { Station } from "../model/Station";
import { StationsPath } from "../StationsPath";
import { traverseAllAndAddStations } from "./stationsBuilder";

export default function useDrawOnMap(map, startingPoint, endingPoint) {
  const [isLoading, setIsLoading] = useState(false);
  const [stations, setStations] = useState<any>();
  const [currentPath, setCurrentPath] = useState<StationsPath>();
  const [visiblePath, setVisiblePath] = useState<StationsPath[]>();
  const [linesGuide, setLinesGuide] =
    useState<Map<string, { order; station }>>();

  useEffect(() => {
    d3.selectAll("svg").remove();
    if (visiblePath && endingPoint) {
      drawOnMap(map, visiblePath, true);
    } else if (stations) {
      drawOnMap(map, stations);
    }
  }, [stations, visiblePath]);

  useEffect(() => {
    console.log("starting point has changed to ", startingPoint);

    if (startingPoint) {
      let visible = new Map();
      let lanes = new Set<string>();

      visible.set(startingPoint.name, {
        seconds: 0,
        coordinates: startingPoint.coordinates,
        name: startingPoint.name,
      });

      setIsLoading(true);
      traverseAllAndAddStations(startingPoint, 3, lanes, 0, visible, 0);
      setStations(Array.from(visible.values()));
      setIsLoading(false);
    }
  }, [startingPoint]);

  useEffect(() => {
    if (endingPoint && stations) {
      let path = stations.find((x) => x.name === endingPoint.name);
      setCurrentPath(path);

      let visiblePath: StationsPath[] = [];
      while (path) {
        visiblePath.push(path);
        path = path.previousStation;
      }
      setVisiblePath(visiblePath);
    }
  }, [endingPoint]);

  useEffect(() => {
    // Create map of places where there needs to be transfer
    let lines: Map<string, { order; station }> = new Map(); // line - station to change

    if (currentPath) {
      let previous: StationsPath = currentPath;
      let index = 0;
      while (previous) {
        if (
          previous.previousStation &&
          previous.previousStation.previousByLine != previous.previousByLine
        ) {
          lines.set(previous.previousByLine, {
            order: index,
            station: previous.previousStation.name,
          });
          index++;
        }

        previous = previous.previousStation;
      }
      setLinesGuide(lines);
    }
  }, [currentPath]);

  useEffect(() => {
    if (linesGuide) {
      linesGuide.forEach((item, key) => {
        console.log("doing transition on ", item);
        d3.select(`#${getId(item.station)}`)
          .transition()
          .duration(200)
          .style("fill", function (d) {
            // return myColor(d.seconds);
            return getColour(d.seconds, true, key.toLowerCase());
          })
          .style("stroke", function (d) {
            return getColour(d.seconds, true, key.toLowerCase());
          })
          .attr("r", 12);

        // TODO - colour with line
      });
    }

    if (endingPoint) {
      d3.select(`#${getId((endingPoint as Station).name)}`)
        .transition()
        .duration(200)
        .style("fill", function (d) {
          // return myColor(d.seconds);
          return getColour(d.seconds, true);
        })
        .attr("fill-opacity", 1)
        .style("stroke", function (d) {
          return getColour(d.seconds, true);
        })
        .attr("r", 12);

      // TODO - colour with line
    }
  }, [linesGuide]);

  function drawOnMap(map, data, skipColour = false) {
    L.svg().addTo(map);

    // d3.svg.selectAll("*").remove();

    console.log("redrawing items with ", data);
    var myColor = d3
      .scaleSequential()
      .interpolator(d3.interpolateInferno)
      .domain([3600, 1]);

    var tooltip = d3
      .select("body")
      .append("span")
      .attr("id", "tooltip")
      .style("position", "fixed")
      .style("z-index", "100")
      .style("background", "white")
      .style("user-select", "none")
      .text("a simple tooltip");

    let currentSvg = d3
      .select("#map")
      .select("svg")
      .selectAll("myCircles")
      .data(data)
      .enter()
      .append("circle")
      .attr("style", "pointer-events: auto;")
      .attr("cx", function (d) {
        return map.latLngToLayerPoint([d.coordinates[1], d.coordinates[0]]).x;
      })
      .attr("cy", function (d) {
        return map.latLngToLayerPoint([d.coordinates[1], d.coordinates[0]]).y;
      })
      .attr("r", 8)
      .style("fill", function (d) {
        // return myColor(d.seconds);
        return getColour(d.seconds, skipColour);
      })
      .style("stroke", function (d) {
        return getColour(d.seconds, true);
      })
      .style("cursor", "pointer")
      .style("z-index", 100)
      .attr("id", function (d) {
        return getId(d.name);
      })
      .attr("stroke-width", 3)
      .attr("fill-opacity", 0.6)
      .on("mouseover", function (d, e) {
        d3.select(this)
          .transition()
          .duration(200)
          .style("opacity", 1)
          .style("stroke", "black");

        d3.select("#tooltip")
          // .transition()
          // .duration(200)
          .style("opacity", 1)
          .style("top", function () {
            return d.clientY - 30 + "px";
          })
          .style("left", function () {
            return d.clientX + "px";
          })
          .text(
            (e as StationsPath).name +
              " " +
              (e.seconds != 0 ? Math.round((e.seconds ?? 0) / 60) + "min" : "")
          );
      })
      .on("mouseout", function (d, e) {
        d3.select(this)
          .transition()
          .duration(200)
          .style("opacity", 1)
          .style("stroke", "gray");

        d3.select("#tooltip").style("opacity", 0);
      });

    if (startingPoint) {
      d3.select(`#${getId((startingPoint as Station).name)}`)
        .transition()
        .duration(300)
        .style("fill", "white")
        .attr("fill-opacity", 0.8)
        .style("stroke", "gray")
        .attr("r", 12);
    }

    //   .on("mouseleave", mouseleave);

    // Function that update circle position if something change
    function update() {
      d3.selectAll("circle")
        .attr("cx", function (d) {
          return map.latLngToLayerPoint([d.coordinates[1], d.coordinates[0]]).x;
        })
        .attr("cy", function (d) {
          return map.latLngToLayerPoint([d.coordinates[1], d.coordinates[0]]).y;
        })
        .on("mousemove", function () {
          console.log("mouse mousemove");
        });
    }

    // If the user change the map (zoom or drag), I update circle position:
    map.on("moveend", update);
  }

  const getColour = (seconds, isLineColour = false, line = "") => {
    const list = new Map<string, string>([
      ["bakerloo", "#B36305"],
      ["central", "#E32017"],
      ["circle", "#FFD300"],
      ["district", "#00782A"],
      ["hammersmith & city", "pink"],
      ["jubilee", "#868F98"],
      ["metropolitan", "#9B0056"],
      ["northern", "#000000"],
      ["piccadilly", "#003688"],
      ["victoria", "#0098D4"],
      ["waterloo & city", "#95CDBA"],
      ["", "gray"],
    ]);

    if (isLineColour) return list.get(line);
    if (seconds > 1800) return "red";
    if (seconds > 600) return "orange";
    else return "green";
  };

  function onHover(that, colour) {
    d3.select(that)
      .transition()
      .duration(200)
      .style("opacity", 1)
      .style("stroke", colour);
  }

  function onLeave(that, colour) {
    d3.select(that)
      .transition()
      .duration(200)
      .style("opacity", 1)
      .style("stroke", colour);
  }

  const getId = (name) => {
    return name.replace(/\s/g, "");
  };

  return { isLoading, currentPath, linesGuide };
}
