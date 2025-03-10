import { NavLink } from "react-router-dom";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const linkClassName = styles.navlink;
  return (
    <ul className={styles.navMenu}>
      <li>
        <NavLink to="/" className={linkClassName}>
          Home
        </NavLink>
      </li>
      <li>
        <NavLink to="/trips/new" className={linkClassName}>
          New Trip
        </NavLink>
      </li>
    </ul>
  );
}
