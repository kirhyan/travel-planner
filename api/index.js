import express from "express";
import pg from "pg";

const pool = new pg.Pool({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "postgres",
  port: 5432,
});

const app = express();
app.use(express.json());

const port = 3000;

app.get("/trips", listTrips);
app.post("/trips", createTrip);

app.get("/trips/:tripId", getTrip);
app.put("/trips/:tripId", updateTrip);
app.delete("/trips/:tripId", deleteTrip);

function listTrips(req, res) {
  console.log("Accessing to listTrips");
  pool.query("SELECT * FROM trips ORDER BY id ASC", (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
      return;
    }
    res.status(200).json(results.rows);
  });
}

//El paso 1 es enviar en una petición de curl a este endpoint que contenga cuerpo.
//El cuerpo tiene que ser un JSON que represente un viaje. Puedes usar este para probar:
// {"name":"Viaje a Japón","waypoints":[{"origin":"Madrid","destination":"Tokyo","date":1741820400},{"origin":"Tokyo","destination":"Madrid","date":1744840800}]}
function createTrip(req, res) {
  console.log(`Accessing to createTrip: ${JSON.stringify(req.body)}`);

  const trip = req.body;
  const error = validateTrip(trip);
  if (error !== null) {
    res.status(400).send(error);
    return;
  }

  pool.query(
    "INSERT INTO trips (name) VALUES $1 RETURNING *",
    [trip.name],
    (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
        return;
      }
      const newTrip = results.rows[0];
      res.status(201).json({
        message: "Trip created successfully",
        tripId: newTrip.id,
      });
    }
  );
}

function getTrip(req, res) {
  console.log("Accessing to getTrip");
  const tripId = req.params.tripId;
  pool.query(
    "SELECT * FROM trips WHERE id = $1",
    [tripId],
    (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
        return;
      }
      res.status(200).json(results.rows);
    }
  );
}

function updateTrip(req, res) {
  console.log("Accessing to updateTrip");
  const tripId = req.params.tripId;
  pool.query(
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

function deleteTrip(req, res) {
  console.log("Accessing to deleteTrip");
  const tripId = req.params.tripId;
  pool.query("DELETE FROM trips WHERE id = $1", [tripId], (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
      return;
    }
    res.status(200).send(`Trip deleted with ID: ${tripId}`);
  });
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
  // al final del todo
  if (errors.length === 0) {
    return null;
  } else {
    return { error: "Validation error", details: errors };
  }
}
