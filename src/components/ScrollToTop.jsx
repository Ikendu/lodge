import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    // Scroll to anchor if there's a hash, otherwise jump to top.
    // Listen to pathname, search, hash and location.key so we catch all navigation types.
    const { hash } = location;

    if (hash) {
      // Remove the leading '#' and try to find the element.
      const id = hash.replace(/^#/, "");
      // A small delay lets the new page render before we query the element.
      setTimeout(() => {
        const el = document.getElementById(id) || document.querySelector(hash);
        if (el && typeof el.scrollIntoView === "function") {
          try {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          } catch (e) {
            el.scrollIntoView();
          }
        } else {
          try {
            window.scrollTo({ top: 0, left: 0, behavior: "auto" });
          } catch (e) {
            window.scrollTo(0, 0);
          }
        }
      }, 50);
      return;
    }

    try {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    } catch (e) {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, location.search, location.hash, location.key]);

  return null;
}
