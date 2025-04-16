import express from "express";
import pg from "pg";
import cors from "cors";

const pool = new pg.Pool({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "postgres",
  port: 5432,
});

// Initial check to verify DB connection
(async () => {
  try {
    const client = await pool.connect();
    await client.query("SELECT 1"); // basic query to confirm connection
    console.log("✅ Connected to the database successfully");
    client.release();
  } catch (error) {
    console.error("❌ Failed to connect to the database:", error);
    process.exit(1); // Exit the app if DB is not reachable
  }
})();

const app = express();
app.use(express.json());
app.use(cors());

const port = 3000;

app.get("/trips", listTrips);
app.post("/trips", createTrip);

app.get("/trips/:tripId", getTrip);
app.put("/trips/:tripId", updateTrip);
app.delete("/trips/:tripId", deleteTrip);

async function listTrips(req, response) {
  console.log("Accessing to listTrips");
  const client = await pool.connect();

  try {
    const tripsResult = await client.query(
      "SELECT * FROM trips ORDER BY id ASC"
    );

    if (tripsResult.rows.length !== 0) {
      response.status(200).json(tripsResult.rows);
      return;
    }
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
}

//El paso 1 es enviar en una petición de curl a este endpoint que contenga cuerpo.
//El cuerpo tiene que ser un JSON que represente un viaje. Puedes usar este para probar:
// {"name":"Viaje a Japón","waypoints":[{"origin":"Madrid","destination":"Tokyo","date":1741820400},{"origin":"Tokyo","destination":"Madrid","date":1744840800}]}
async function createTrip(req, response) {
  console.log(`Accessing to createTrip: ${JSON.stringify(req.body)}`);

  const trip = req.body;
  const errors = validateTrip(trip);
  if (errors.length > 0) {
    response.status(400).json({ error: "Validation error", details: errors });
    return;
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const tripResult = await client.query(
      "INSERT INTO trips (name) VALUES ($1) RETURNING *",
      [trip.name]
    );

    const tripId = tripResult.rows[0].id;

    const columns = [
      "trip_id",
      "origin_name",
      "origin_country_code",
      "origin_longitude",
      "origin_latitude",
      "destination_name",
      "destination_country_code",
      "destination_longitude",
      "destination_latitude",
      "date",
    ];

    const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");

    const query = `
  INSERT INTO waypoints (${columns.join(", ")})
  VALUES (${placeholders})
  RETURNING *;
`;

    for (const waypoint of trip.waypoints) {
      const date = new Date(waypoint.date * 1000);

      const values = [
        tripId,
        waypoint.origin.name,
        waypoint.origin.countryCode,
        waypoint.origin.longitude,
        waypoint.origin.latitude,
        waypoint.destination.name,
        waypoint.destination.countryCode,
        waypoint.destination.longitude,
        waypoint.destination.latitude,
        date,
      ];

      await client.query(query, values);
    }

    await client.query("COMMIT");

    response.status(201).json({
      message: "Trip created successfully",
      tripId: tripId,
    });
    console.log(`Trip ${tripId} created`);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    response.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
}

async function getTrip(req, response) {
  console.log("Accessing to getTrip");

  const tripId = req.params.tripId;

  const client = await pool.connect();

  try {
    const tripResult = await client.query("SELECT * FROM trips WHERE id = $1", [
      tripId,
    ]);

    if (tripResult.rows.length === 0) {
      response.status(404).json({ error: "Trip Not Found" });
      return;
    }

    const tripData = tripResult.rows[0];

    const waypoints = await client.query(
      "SELECT * FROM waypoints WHERE trip_id = $1",
      [tripId]
    );

    const waypointsData = waypoints.rows.map((waypoint) => {
      const date = waypoint.date;
      const timestamp = Math.floor(date.getTime() / 1000);
      return {
        origin: {
          name: waypoint.origin_name,
          countryCode: waypoint.origin_country_code,
          longitude: waypoint.origin_longitude,
          latitude: waypoint.origin_latitude,
        },
        destination: {
          name: waypoint.destination_name,
          countryCode: waypoint.destination_country_code,
          longitude: waypoint.destination_longitude,
          latitude: waypoint.destination_latitude,
        },
        date: timestamp,
      };
    });

    return response.status(200).json({
      id: tripData.id,
      name: tripData.name,
      waypoints: waypointsData,
    });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
}

async function updateTrip(req, res) {
  console.log("Accessing to updateTrip");
  const client = await pool.connect();

  const tripId = req.params.tripId;
  client.query(
    "UPDATE trips SET name = $1 WHERE id = $2",
    [tripId],
    (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
        return;
      }
      res.status(200).send(`Trip modified with ID: ${tripId}`);
    }
  );
}

async function deleteTrip(req, response) {
  console.log("Accessing to deleteTrip");
  const client = await pool.connect();

  const tripId = req.params.tripId;

  try {
    const tripResult = await client.query("DELETE FROM trips WHERE id = $1", [
      tripId,
    ]);
    if (tripResult.rowCount === 0) {
      response.status(404).json({ error: "Trip Not Found" });
      return;
    }
    response.sendStatus(204);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
}

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

// Ahora vamos a validar la petición:
// 1. Si no está vacia y es un JSON que el campon "name" no esté vacio.
// 2. Lo mismo con el campo "waypoints". Como mínimo tiene que haber uno.
// 3. Por cada "waypoint" que te envie, hay que validar que "origin", "destination" y "date" no están vacios.
// 4. Vamos a verificar que las fechas son posteriores.
// Si cualquiera de estas validaciones falla, vamos a enviar una respuesta de tipo 400 al cliente.
// (Investigar en REST que código se usa para estos casos)
function validateTrip(trip) {
  //Si no hay ningún fallo tiene que devolver null
  //Si hay algún fallo hay que dedvolver un objeto que va a tener las siguientes propiedades:
  // 1. error: "validation error"
  // 2. details: [{field:"name", message: "cannot be empty"}, {field: "waypoints[1].date", message: "cannot be empty"}]
  const errors = [];
  if (!trip.name) {
    errors.push({ field: "name", message: "Cannot be empty" });
  }
  // hacer las que faltan
  // console.log(trip);
  if (trip.waypoints && trip.waypoints.length >= 1) {
    for (let i = 0; i < trip.waypoints.length; i++) {
      const waypoint = trip.waypoints[i];

      // TODO: validate city fields properly

      if (!waypoint.origin) {
        errors.push({
          field: `waypoints[${i}].origin`,
          message: "Cannot be empty",
        });
      }

      if (!waypoint.destination) {
        errors.push({
          field: `waypoints[${i}].destination`,
          message: "Cannot be empty",
        });
      }

      if (!waypoint.date) {
        errors.push({
          field: `waypoints[${i}].date`,
          message: "Cannot be empty",
        });
      }
    }
    //Aqui vamos a validar que las fechas son posteriores
    for (let i = 1; i < trip.waypoints.length; i++) {
      const curWaypoint = trip.waypoints[i];
      const prevWaypoint = trip.waypoints[i - 1];
      if (prevWaypoint.date > curWaypoint.date) {
        errors.push({
          field: `waypoints[${i}].date`,
          message:
            "The date cannot be earlier than the date of the previous waypoint.",
        });
      }
    }
  } else {
    errors.push({ field: "waypoints", message: "Cannot be empty" });
  }

  return errors;
}
