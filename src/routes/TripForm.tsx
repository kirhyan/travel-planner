import { useState } from "react";
import styles from "./TripForm.module.css";
import Button from "@mui/material/Button";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import CityInput from "../components/CityInput";
import { useNavigate } from "react-router-dom";

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

interface WaypointErrors {
  origin: string;
  destination: string;
  date: string;
}

interface TripErrors {
  name: string;
  waypoints: WaypointErrors[];
}

const buttonStyle = {
  backgroundColor: "#2a70b5ba",
  color: "white",
  padding: "0.6rem",
  width: "80%",
  fontSize: "15px",
  "&:hover": {
    backgroundColor: "black",
  },
};

const inputStyle = {
  backgroundColor: "white",
  borderRadius: "8px",
};

function newWaypoint(): Waypoint {
  return {
    origin: {
      name: "",
      countryCode: "",
      latitude: 0,
      longitude: 0,
    },
    destination: {
      name: "",
      countryCode: "",
      latitude: 0,
      longitude: 0,
    },
    date: 0,
  };
}

const TripForm = () => {
  const [waypoints, setWaypoints] = useState<Waypoint[]>([newWaypoint()]);
  const [tripName, setTripName] = useState("");
  const [errors, setErrors] = useState<TripErrors>({
    name: "",
    waypoints: [
      {
        origin: "",
        destination: "",
        date: "",
      },
    ],
  });

  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const body = JSON.stringify({ name: tripName, waypoints });
    const url = `http://localhost:3000/trips`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body,
      });

      const data = await response.json();
      console.log(`Got response from server: ${JSON.stringify(data)}`);

      if (response.ok) {
        const tripId = data.tripId;
        navigate(`/trips/${tripId}`);
        return;
      }

      if (response.status === 400) {
        const errorDetails = data.details;

        const newErrors = {
          name: "",
          waypoints: waypoints.map(() => ({
            origin: "",
            destination: "",
            date: "",
          })),
        };

        for (const errDetail of errorDetails) {
          const message = errDetail.message;

          const match = errDetail.field.match(/^((\w+)\[(\d+)\]\.)?(\w+)$/);
          if (!match) {
            continue;
          }

          const base = match[2] || undefined;
          const index = match[3] || undefined;
          const field = match[4];

          if (base) {
            newErrors[base][index][field] = message;
          } else {
            newErrors[field] = message;
          }
        }

        setErrors(newErrors);
      }
    } catch (error) {
      console.error(`Error from server: ${error}`);
    }

    // Hay que hacer
    // POST
    // http://localhost:3000/trips
    // body: { "name": "...", "waypoints": [{...}]}
    // poner cabecera con el content-type apropiado
  };

  const updateTripName = (event) => {
    const name = event.target.value;
    setTripName(name);
    setErrors((prev) => {
      return {
        ...prev,
        name: name.length < 3 ? "Trip name must be at least 3 characters" : "",
      };
    });
  };

  const addWaypoint = () => {
    setWaypoints([...waypoints, newWaypoint()]);
  };

  const cleanErrors = (
    index: number,
    field: "origin" | "destination" | "date"
  ) => {
    setErrors((prev) => {
      const updatedWaypoints = prev.waypoints.map((err, i) =>
        i === index ? { ...err, [field]: "" } : err
      );

      return {
        ...prev,
        waypoints: updatedWaypoints,
      };
    });
  };

  return (
    <div className={styles.content}>
      <form onSubmit={handleSubmit} className={styles.formContainer}>
        <div className={styles.inputGroup}>
          <label>Trip Name</label>
          <input type="text" onChange={updateTripName} value={tripName} />
          {errors.name && <p className={styles.errorName}>{errors.name}</p>}
        </div>
        {waypoints.map((waypoint, index) => {
          return (
            <div className={styles.waypointCard}>
              <h3>Waypoint {index + 1}</h3>
              <CityInput
                label="Origin"
                onChange={(city) => {
                  const nextWaypoints = waypoints.map((w, i) => {
                    if (i === index) {
                      const copy = { ...w };
                      copy.origin = city;
                      return copy;
                    } else {
                      // The rest haven't changed
                      return w;
                    }
                  });
                  setWaypoints(nextWaypoints);
                  cleanErrors(index, "origin");
                }}
              />
              {errors.waypoints[index] && errors.waypoints[index].origin && (
                <p className={styles.error}>{errors.waypoints[index].origin}</p>
              )}
              <CityInput
                label="Destination"
                onChange={(city) => {
                  const nextWaypoints = waypoints.map((w, i) => {
                    if (i === index) {
                      const copy = { ...w };
                      copy.destination = city;
                      return copy;
                    } else {
                      return w;
                    }
                  });
                  setWaypoints(nextWaypoints);
                  cleanErrors(index, "destination");
                }}
              />
              {errors.waypoints[index] &&
                errors.waypoints[index].destination && (
                  <p className={styles.error}>
                    {errors.waypoints[index].destination}
                  </p>
                )}
              <div className={styles.datePicker}>
                <DatePicker
                  label="Date"
                  onChange={(date) => {
                    if (!date) {
                      return;
                    }
                    const nextWaypoints = waypoints.map((w, i) => {
                      if (i === index) {
                        const copy = { ...w };
                        copy.date = date.unix();
                        return copy;
                      } else {
                        return w;
                      }
                    });
                    setWaypoints(nextWaypoints);
                    cleanErrors(index, "date");
                  }}
                  sx={inputStyle}
                  slotProps={{ textField: { size: "small" } }}
                />
              </div>
              {errors.waypoints[index] && errors.waypoints[index].date && (
                <p className={styles.error}>{errors.waypoints[index].date}</p>
              )}
            </div>
          );
        })}

        <div className={styles.buttonGroup}>
          <Button style={buttonStyle} type="button" onClick={addWaypoint}>
            Add Waypoint
          </Button>
          <Button style={buttonStyle} type="submit">
            Submit Trip
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TripForm;
