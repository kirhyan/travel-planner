CREATE TABLE IF NOT EXISTS trips (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS waypoints (
    id SERIAL PRIMARY KEY,
    trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
    origin_name TEXT NOT NULL,
    origin_country_code TEXT NOT NULL,
    origin_longitude DOUBLE PRECISION NOT NULL,
    origin_latitude DOUBLE PRECISION NOT NULL,
    destination_name TEXT NOT NULL,
    destination_country_code TEXT NOT NULL,
    destination_longitude DOUBLE PRECISION NOT NULL,
    destination_latitude DOUBLE PRECISION NOT NULL,
    date DATE NOT NULL
);