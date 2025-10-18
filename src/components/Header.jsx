import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logos/logo.png";
import { useState } from "react";
import { Menu, X, User } from "lucide-react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebaseConfig";
import { signOut } from "firebase/auth";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQ, setSearchQ] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [user] = useAuthState(auth);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const handleSearch = () => {
    // build query params and navigate to apartments
    const params = new URLSearchParams();
    if (searchQ) params.set("q", searchQ);
    if (searchLocation) params.set("location", searchLocation);
    if (minPrice) params.set("min", minPrice);
    if (maxPrice) params.set("max", maxPrice);
    navigate("/apartments?" + params.toString());
  };

  const links = [
    { name: "Find Lodge", path: "/apartments" },
    { name: "List Your Property", path: "/registerowner" },
    { name: "About Us", path: "/about" },
    { name: "Contact", path: "/contact" },
    { name: "FAQs", path: "/faqs" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-blue-600 text-white shadow-md">
      <div className="container mx-auto flex items-center md:justify-center justify-between px-4 py-3 md:gap-3">
        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img src={logo} alt="MoreLinks Logo" className="h-10 w-auto" />
          {/* <span className="font-bold text-lg hidden sm:inline">
            MoreLinks Lodge
          </span> */}
        </div>

        {/* Search bar (desktop) */}
        <div className="hidden md:flex items-center gap-2">
          <input
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
            placeholder="Search by name, city, state or text"
            className="px-3 py-2 rounded-l-md text-gray-800 w-64"
          />
          <input
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            placeholder="City or state"
            className="px-3 py-2 text-gray-800 w-44"
          />
          <input
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Min ₦"
            type="number"
            className="px-3 py-2 text-gray-800 w-28"
          />
          <input
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Max ₦"
            type="number"
            className="px-3 py-2 text-gray-800 w-28"
          />
          <button
            onClick={() => handleSearch()}
            className="bg-yellow-400 text-blue-800 px-3 py-2 rounded-r-md font-semibold"
          >
            Search
          </button>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-6 font-medium justify-center">
          {/* small search icon could be here for compact layouts */}
          {links.map((link, i) => (
            <button
              key={i}
              onClick={() => {
                if (link.path === "/registerowner" && !user) {
                  navigate("/login", {
                    state: { from: { pathname: "/registerowner" } },
                  });
                } else {
                  navigate(link.path);
                }
              }}
              className="hover:text-yellow-300 transition-colors"
            >
              {link.name}
            </button>
          ))}
          {/* Login / Account */}
          {!user ? (
            <button
              onClick={() =>
                navigate("/login", { state: { from: location.pathname } })
              }
              className="bg-yellow-400 text-blue-800 px-4 py-1 rounded-md font-semibold hover:bg-yellow-300 transition-colors"
            >
              Login
            </button>
          ) : (
            <div className="relative">
              <button
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center overflow-hidden"
                aria-label="Account menu"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={18} />
                )}
              </button>

              {accountMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white text-gray-800 rounded shadow-lg py-2 z-50">
                  <button
                    onClick={() => {
                      setAccountMenuOpen(false);
                      navigate("/profile");
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Profile
                  </button>
                  <button
                    onClick={async () => {
                      await signOut(auth);
                      setAccountMenuOpen(false);
                      // after logout, redirect to home
                      navigate("/");
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Mobile Menu Button / Account */}
        <div className="md:hidden flex items-center gap-3">
          {!user ? (
            <button
              onClick={() =>
                navigate("/login", { state: { from: location.pathname } })
              }
              className="text-yellow-300 font-semibold hover:underline"
            >
              Login
            </button>
          ) : (
            <div className="relative">
              <button
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center overflow-hidden"
                aria-label="Account menu"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={18} />
                )}
              </button>

              {accountMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white text-gray-800 rounded shadow-lg py-2 z-50">
                  <button
                    onClick={() => {
                      setAccountMenuOpen(false);
                      navigate("/profile");
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Profile
                  </button>
                  <button
                    onClick={async () => {
                      await signOut(auth);
                      setAccountMenuOpen(false);
                      navigate("/");
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle Menu"
          >
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-blue-700 px-4 py-3 space-y-3 text-center animate-slideDown">
          <div className="flex gap-2">
            <input
              placeholder="Search"
              className="w-full p-2 rounded"
              onChange={(e) => setSearchQ(e.target.value)}
            />
            <button
              onClick={() => {
                setMenuOpen(false);
                handleSearch();
              }}
              className="bg-yellow-400 text-blue-800 px-3 py-2 rounded"
            >
              Go
            </button>
          </div>
          {links.map((link, i) => (
            <button
              key={i}
              onClick={() => {
                if (link.path === "/registerowner" && !user) {
                  navigate("/login", {
                    state: { from: { pathname: "/registerowner" } },
                  });
                } else {
                  navigate(link.path);
                }
                setMenuOpen(false);
              }}
              className="block w-full hover:text-yellow-300 transition-colors"
            >
              {link.name}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
