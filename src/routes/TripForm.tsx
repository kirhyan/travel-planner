import { useState } from "react";
import styles from "./TripForm.module.css";
import Button from "@mui/material/Button";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { autocompleteCities, City } from "../api/autocomplete";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

interface Waypoint {
  origin: string;
  destination: string;
  date: number;
}

function capitalize(val: string): string {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

const TripForm = () => {
  const [tripName, setTripName] = useState("");
  const [waypoints, setWaypoints] = useState<Waypoint[]>([
    { origin: "", destination: "", date: 0 },
  ]);
  const [suggestedCities, setSuggestedCities] = useState<{
    [key: string]: City[];
  }>({ origin: [], destination: [] });

  const handleTripNameChange = (e) => setTripName(e.target.value);

  const handleWaypointChange = async (index, field, value) => {
    const newWaypoints = [...waypoints];
    //Esto está mal
    newWaypoints[index][field] = value;
    setWaypoints(newWaypoints);
  };

  const fetchCities = async (index, field, value) => {
    const cities = await autocompleteCities(value);
    setSuggestedCities((prev) => ({
      ...prev,
      [field]: cities,
    }));
  };

  const addWaypoint = () => {
    setWaypoints([...waypoints, { origin: "", destination: "", date: 0 }]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(JSON.stringify({ name: tripName, waypoints }));

    // TODO: mandar un post al endpoint para crear el trip
  };

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

  const autoCompleteCityInput = (
    index: number,
    waypoint: Waypoint,
    field: "origin" | "destination"
  ) => {
    return (
      <Autocomplete
        freeSolo
        disableClearable
        options={suggestedCities[field].map((city) => ({
          label: `${city.name} (${city.country})`,
          id: city.name,
        }))}
        filterOptions={(x) => x}
        onChange={(_e, value) => {
          handleWaypointChange(index, field, value.id);
        }}
        renderInput={(params) => (
          <TextField
            className={styles.waypointCard}
            {...params}
            value={waypoint[field]}
            label={capitalize(field)}
            size="small"
            sx={inputStyle}
            fullWidth
            onChange={(e) => fetchCities(index, field, e.target.value)}
          />
        )}
      />
    );
  };

  return (
    <div className={styles.content}>
      <form onSubmit={handleSubmit} className={styles.formContainer}>
        <div className={styles.inputGroup}>
          <label>Trip Name</label>
          <input type="text" value={tripName} onChange={handleTripNameChange} />
        </div>
        {waypoints.map((waypoint, index) => (
          <div key={index} className={styles.waypointCard}>
            <h3>Waypoint {index + 1}</h3>
            {autoCompleteCityInput(index, waypoint, "origin")}
            {autoCompleteCityInput(index, waypoint, "destination")}
            <DatePicker
              className={styles.datePicker}
              slotProps={{ textField: { size: "small" } }}
              sx={inputStyle}
              label="Date"
              onChange={(value) => {
                handleWaypointChange(index, "date", value?.unix());
              }}
            />
          </div>
        ))}
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
