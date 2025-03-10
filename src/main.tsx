import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createHashRouter, RouterProvider } from "react-router-dom";
import Layout from "./routes/Layout.tsx";
import Home from "./routes/Home.tsx";
import "./index.css";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import TripForm from "./routes/TripForm.tsx";

const router = createHashRouter([
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
