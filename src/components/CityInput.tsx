import React, { useEffect, useState } from "react";
import styles from "./CityInput.module.css";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { autocompleteCities, City } from "../api/autocomplete";

const textFieldStyles = {
  backgroundColor: "white",
  borderRadius: "8px",
};

const CityInput = (props) => {
  const [input, setInput] = useState("");
  const [suggestedCities, setSuggestedCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  useEffect(() => {
    setLoading(true);

    const timer = setTimeout(() => {
      autocompleteCities(input).then((cities) => {
        setSuggestedCities(cities);
        setLoading(false);
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [input]);

  return (
    <Autocomplete
      freeSolo
      disableClearable
      loading={loading}
      options={suggestedCities.map((city) => ({
        label: `${city.name}, ${city.country}`,
        city: {
          name: city.name,
          countryCode: city.countryCode,
          latitude: city.latitude,
          longitude: city.longitude,
        },
      }))}
      filterOptions={(x) => x}
      onChange={(e, value) => {
        if (!props.onChange) {
          return;
        }
        props.onChange(value.city);
      }}
      renderInput={(params) => (
        <TextField
          className={styles.waypointCard}
          {...params}
          value={input}
          label={props.label}
          size="small"
          sx={textFieldStyles}
          fullWidth
          onChange={handleTextChange}
        />
      )}
    />
  );
};

export default CityInput;
