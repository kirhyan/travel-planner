import { Outlet } from "react-router-dom";
import styles from "./Layout.module.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Layout() {
  return (
    <>
      <div className={styles.app}>
        <div className={styles.container}>
          <Header />
          <div className={styles.content}>
            <Outlet />
          </div>
          <Footer />
        </div>
      </div>
    </>
  );
}
