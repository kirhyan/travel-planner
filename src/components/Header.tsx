import styles from "./Header.module.css";
import Navbar from "./Navbar";

export default function Header() {
  return (
    <header className={styles.content}>
      <Navbar />
    </header>
  );
}
