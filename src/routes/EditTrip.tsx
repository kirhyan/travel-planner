import { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";

interface Trip {
  id: number;
  name: string;
}

export default function EditTrip() {
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
    <div>
      <h1>Edit Trip</h1>
    </div>
  );
}
