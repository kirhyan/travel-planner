import { FaPlus } from "react-icons/fa";
import styles from "./Trips.module.css";
import { useState } from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TextField, Autocomplete } from "@mui/material";

interface Trip {
  origin: string;
  destination: string;
  depart: string;
  return: string;
}

interface City {
  id: number;
  name: string;
  country: string;
}

export default function Trips() {
  // type hints
  const initialState: Trip[] = [
    {
      origin: "",
      destination: "",
      depart: "",
      return: "",
    },
  ];
  const [trips, setTrips] = useState(initialState);
  const [suggestions, setSuggestions] = useState<{
    origin: City[];
    destination: City[];
  }>({ origin: [], destination: [] });

  const addTrip = () => {
    setTrips((prevTrips) => [
      ...prevTrips,
      { origin: "", destination: "", depart: "", return: "" },
    ]);
  };

  const fetchCities = async (
    input: string,
    field: "origin" | "destination"
  ) => {
    if (input.length < 2) {
      setSuggestions((prev) => ({
        // prev[field] = []
        ...prev,
        [field]: [],
      }));

      return;
    }

    try {
      const response = await fetch(
        `http://geodb-free-service.wirefreethought.com/v1/geo/places?namePrefix=${input}`
      );

      if (!response.ok) {
        throw new Error("error fetching cities");
      }
      const data = await response.json();
      setSuggestions((prev) => ({
        // prev[field] = data.data
        ...prev,
        [field]: data.data,
      }));
    } catch (error) {
      console.error("Error fetching cities", error);
    }
  };

  const changeTrip = (id: number, field: string, value: any) => {
    setTrips(
      trips.map((trip, idx) =>
        idx === id ? { ...trip, [field]: value } : trip
      )
    );

    if (field === "origin" || field === "destination") {
      fetchCities(value, field);
    }
  };

  const formStyle = {
    backgroundColor: "white",
    borderRadius: "8px",
  };

  const tripForm = (trip: Trip, id: number) => (
    <section className={styles.box} key={id}>
      <h4>From:</h4>
      <Autocomplete
        freeSolo
        disableClearable
        options={suggestions.origin.map((city) => ({
          label: `${city.name} (${city.country})`,
          id: city.name,
        }))}
        renderInput={(params) => (
          <TextField
            {...params}
            value={trip.origin}
            sx={formStyle}
            label="Enter city"
            size="small"
            fullWidth
            onChange={(event) => {
              console.log(event);
              changeTrip(id, "origin", event.target.value);
            }}
          />
        )}
      />
      <h4>To:</h4>
      <TextField
        value={trip.destination}
        sx={formStyle}
        label="Enter city"
        size="small"
        fullWidth
        onChange={(event) => changeTrip(id, "destination", event.target.value)}
      />
      <div>
        <h4>Depart:</h4>
        <DatePicker
          onChange={(data) => console.log(data?.toISOString())}
          sx={formStyle}
          label="Add date"
        />
      </div>

      <div>
        <h4>Return:</h4>
        <DatePicker sx={formStyle} label="Add date" />
      </div>
    </section>
  );

  const addButton = (
    <form>
      <label htmlFor="name">Trip name:</label>
      <br />
      <input type="text" id="name" name="name" />
      <br />

      <label htmlFor="destinations">Destinations:</label>
      <div className={styles.initial}>
        <button onClick={addTrip}>
          <FaPlus className={styles.plusIcon} />
        </button>
        <h3 className={styles.italicText}>Add a new destination</h3>
      </div>
      <div className={styles.form}>
        {trips.map((trip, idx) => {
          return tripForm(trip, idx);
        })}
      </div>

      <button>Create</button>
    </form>
  );

  return <div className={styles.content}>{addButton}</div>;
}
