import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./routes/Layout.tsx";
import Home from "./routes/Home.tsx";
import "./index.css";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import TripForm from "./routes/TripForm.tsx";
import ListTrips from "./routes/ListTrips.tsx";
import ShowTrip from "./routes/ShowTrip.tsx";
import EditTrip from "./routes/EditTrip.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/trips/new",
        element: <TripForm />,
      },
      {
        path: "/trips",
        element: <ListTrips />,
      },
      {
        path: "/trips/:tripId",
        element: <ShowTrip />,
      },
      {
        path: "/trips/:tripId/edit",
        element: <EditTrip />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  </LocalizationProvider>
);
