import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

interface Trip {
  id: number;
  name: string;
}

export default function ListTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchTrips() {
    setLoading(true);

    const url = `http://localhost:3000/trips`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      });
      const data = await response.json();
      console.log(`Got response from server: ${JSON.stringify(data)}`);
      setTrips(data);
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
    <div>
      <h1>Trips List</h1>
      <ul>
        {trips.map((trip) => (
          <li>
            <NavLink to={`/trips/${trip.id}`}>{trip.name}</NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
