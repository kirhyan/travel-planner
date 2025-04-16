import { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import { FaLeftLong } from "react-icons/fa6";
import styles from "./ShowTrip.module.css";
import { TripMap } from "../components/TripMap";

interface Trip {
  id: string;
  name: string;
  waypoints: Waypoint[];
}
interface City {
  name: string;
  countryCode: string;
  latitude: number;
  longitude: number;
}

interface Waypoint {
  origin: City;
  destination: City;
  date: number;
}

export default function Trip() {
  const params = useParams();
  const tripId = params.tripId;
  console.log(params);

  const [trip, setTrip] = useState<Trip | null>(null);

  const [loading, setLoading] = useState(false);

  async function fetchTrips() {
    setLoading(true);

    const url = `http://localhost:3000/trips/${tripId}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      });
      const data = await response.json();
      console.log(`Got response from server: ${JSON.stringify(data)}`);
      setTrip(data);
    } catch (error) {
      console.error(`Error from server: ${error}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTrips();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.icon}>
        <NavLink to="/trips">
          <FaLeftLong />
        </NavLink>
      </div>
      <div>
        <h1>Trip {trip?.id}: </h1>
        <h2>{trip?.name}</h2>
        <ul>
          <li>
            {trip?.waypoints.map((waypoint, index) => {
              const userLocale = navigator.language;
              const date = new Date(waypoint.date * 1000);
              const formatted = date.toLocaleDateString(userLocale);
              return (
                <p key={index}>
                  {waypoint.origin.name} - {waypoint.destination.name} -{" "}
                  {formatted}
                </p>
              );
            })}
          </li>
        </ul>
        {trip?.waypoints && trip.waypoints.length > 0 && (
          <TripMap waypoints={trip?.waypoints} />
        )}
      </div>
    </div>
  );
}
