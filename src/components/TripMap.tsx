import {
  AdvancedMarker,
  APIProvider,
  Map,
  useMap,
} from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";

const getMidpoint = (
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
) => ({
  lat: (a.lat + b.lat) / 2,
  lng: (a.lng + b.lng) / 2,
});

export function TripMap(props) {
  const center = {
    lat: props.waypoints[0].origin.latitude,
    lng: props.waypoints[0].origin.longitude,
  };

  const markers = props.waypoints.map((waypoint, idx) => {
    const origin = {
      lat: waypoint.origin.latitude,
      lng: waypoint.origin.longitude,
    };
    const dest = {
      lat: waypoint.destination.latitude,
      lng: waypoint.destination.longitude,
    };

    const midPoint = getMidpoint(origin, dest);
    const date = new Date(waypoint.date * 1000).toLocaleDateString();

    return (
      <>
        <AdvancedMarker
          key={`origin-${idx}`}
          position={origin}
          title={waypoint.origin.name}
        >
          <div
            style={{
              backgroundColor: "#fff",
              border: "2px solid #4285F4",
              borderRadius: "50%",
              padding: "6px",
              fontWeight: "bold",
              color: "#4285F4",
            }}
          >
            {waypoint.origin.name}
          </div>
        </AdvancedMarker>

        <AdvancedMarker key={`date-${idx}`} position={midPoint}>
          <div
            style={{
              background: "#fff",
              padding: "4px 8px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "12px",
              color: "#333",
              boxShadow: "0px 2px 6px rgba(0,0,0,0.1)",
            }}
          >
            {date}
          </div>
        </AdvancedMarker>

        <AdvancedMarker
          key={`destination-${idx}`}
          position={dest}
          title={waypoint.destination.name}
        >
          <div
            style={{
              backgroundColor: "#fff",
              border: "2px solid #4285F4",
              borderRadius: "50%",
              padding: "6px",
              fontWeight: "bold",
              color: "#4285F4",
            }}
          >
            {waypoint.destination.name}
          </div>
        </AdvancedMarker>
      </>
    );
  });

  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <Map
        style={{ width: "100vw", height: "70vh" }}
        defaultCenter={center}
        defaultZoom={2.5}
        gestureHandling={"greedy"}
        disableDefaultUI={true}
        mapId="DEMO_MAP_ID"
      >
        <Directions waypoints={props.waypoints} />
        {markers}
      </Map>
    </APIProvider>
  );
}

function Directions(props) {
  const map = useMap();
  const [directionsRenderer, setDirectionsRenderer] =
    useState<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    if (!map) return;

    const directionsService = new google.maps.DirectionsService();
    const renderer = new google.maps.DirectionsRenderer();
    renderer.setMap(map);
    setDirectionsRenderer(renderer);

    const waypoints = [];

    for (const waypoint of props.waypoints) {
      waypoints.push({
        lat: waypoint.origin.latitude,
        lng: waypoint.origin.longitude,
      });
      waypoints.push({
        lat: waypoint.destination.latitude,
        lng: waypoint.destination.longitude,
      });
    }

    waypoints.forEach((_, index) => {
      if (index < waypoints.length - 1) {
        const flightPath = new google.maps.Polyline({
          path: [waypoints[index], waypoints[index + 1]],
          geodesic: false,
          strokeColor: "#FF0000",
          strokeOpacity: 0.8,
          strokeWeight: 2,
        });

        flightPath.setMap(map);
      }
    });
  }, [map, props.waypoints]);

  return null;
}
