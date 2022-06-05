import * as L from "leaflet";
import { useEffect, useState } from "react";

export default function useLeafletMap() {
  const [map, setMap] = useState(null);

  useEffect(() => {
    if (!map) {
      try {
        const m = L.map("map", { zoomControl: false });
        m.setView([51.505, -0.09], 13);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(m);
        if (m) {
          setMap(m);
        }
      } catch {}
    }
  }, []);

  return { map };
}
