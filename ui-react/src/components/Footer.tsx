import styles from "./Footer.module.css";
import { FaHeart } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className={styles.container}>
      <p>
        Created with <FaHeart /> by Miriam Blanco
      </p>
      <p>&copy; {new Date().getFullYear()}</p>
    </footer>
  );
}
