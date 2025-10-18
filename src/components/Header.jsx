import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logos/logo.png";
import { useState, useRef } from "react";
import { Menu, X, User } from "lucide-react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebaseConfig";
import { signOut } from "firebase/auth";
import { lodges } from "../lodgedata";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const hintRef = useRef(null);
  const [user] = useAuthState(auth);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const parsePriceRange = (text) => {
    // detect patterns like 1000-5000 or ₦1,000-5,000 or min:1000 max:5000
    const cleaned = text.replace(/₦|,|\s/g, "");
    const dashMatch = cleaned.match(/^(\d+)-(\d+)$/);
    if (dashMatch) {
      return { min: Number(dashMatch[1]), max: Number(dashMatch[2]) };
    }
    const minMatch = text.match(/min\s*:?\s*(\d[\d,]*)/i);
    const maxMatch = text.match(/max\s*:?\s*(\d[\d,]*)/i);
    if (minMatch || maxMatch) {
      return {
        min: minMatch ? Number(minMatch[1].replace(/,/g, "")) : undefined,
        max: maxMatch ? Number(maxMatch[1].replace(/,/g, "")) : undefined,
      };
    }
    return {};
  };

  const handleSearch = (text) => {
    const q = (text || query || "").trim();
    const params = new URLSearchParams();
    const range = parsePriceRange(q);
    if (q) params.set("q", q);
    if (range.min !== undefined) params.set("min", String(range.min));
    if (range.max !== undefined) params.set("max", String(range.max));
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

        {/* Search bar (desktop) - single input with suggestions */}
        <div className="hidden md:flex items-center gap-2 relative">
          <input
            ref={hintRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSuggestionsOpen(Boolean(e.target.value.trim()));
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                setSuggestionsOpen(false);
                handleSearch();
              }
            }}
            placeholder="Search lodges by name, city, state or price (e.g. 4000-8000)"
            className="px-3 py-2 rounded-l-md text-gray-800 w-80"
          />
          <button
            onClick={() => {
              setSuggestionsOpen(false);
              handleSearch();
            }}
            className="bg-yellow-400 text-blue-800 px-3 py-2 rounded-r-md font-semibold"
          >
            Search
          </button>

          {/* Suggestions dropdown */}
          {suggestionsOpen && query.trim() && (
            <div className="absolute top-full left-0 mt-2 w-96 bg-white text-gray-800 rounded shadow-lg z-50">
              {(() => {
                const ql = query.toLowerCase();
                const range = parsePriceRange(query);
                const matches = lodges
                  .filter((l) => {
                    const hay = (
                      l.title +
                      " " +
                      l.description +
                      " " +
                      l.location
                    ).toLowerCase();
                    if (range.min !== undefined || range.max !== undefined) {
                      const min = range.min ?? 0;
                      const max = range.max ?? Number.POSITIVE_INFINITY;
                      if (l.price >= min && l.price <= max) return true;
                    }
                    if (hay.includes(ql)) return true;
                    // numeric search: match price
                    const num = Number(query.replace(/[^0-9]/g, ""));
                    if (!Number.isNaN(num) && l.price === num) return true;
                    return false;
                  })
                  .slice(0, 8);

                if (!matches.length)
                  return <div className="p-3 text-sm">No suggestions</div>;

                return matches.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      // navigate directly to lodge details
                      navigate(`/lodge/${m.id}`, { state: { lodge: m } });
                      setSuggestionsOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-3"
                  >
                    <img
                      src={m.images?.[0]}
                      alt={m.title}
                      className="w-12 h-8 object-cover rounded"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{m.title}</div>
                      <div className="text-xs text-gray-500">
                        {m.location} • ₦{m.price.toLocaleString()}
                      </div>
                    </div>
                  </button>
                ));
              })()}
            </div>
          )}
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
          <div className="flex gap-2 relative">
            <input
              placeholder="Search lodges"
              className="w-full p-2 rounded"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSuggestionsOpen(Boolean(e.target.value.trim()));
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  setMenuOpen(false);
                  handleSearch();
                }
              }}
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

            {suggestionsOpen && query.trim() && (
              <div className="absolute top-full left-0 mt-2 w-full bg-white text-gray-800 rounded shadow-lg z-50">
                {lodges
                  .filter((l) => {
                    const hay = (
                      l.title +
                      " " +
                      l.description +
                      " " +
                      l.location
                    ).toLowerCase();
                    return (
                      hay.includes(query.toLowerCase()) ||
                      String(l.price).includes(query.replace(/\D/g, ""))
                    );
                  })
                  .slice(0, 6)
                  .map((m) => (
                    <button
                      key={m.id}
                      className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-3"
                      onClick={() => {
                        setMenuOpen(false);
                        navigate(`/lodge/${m.id}`, { state: { lodge: m } });
                      }}
                    >
                      <img
                        src={m.images?.[0]}
                        alt={m.title}
                        className="w-12 h-8 object-cover rounded"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{m.title}</div>
                        <div className="text-xs text-gray-500">
                          {m.location} • ₦{m.price.toLocaleString()}
                        </div>
                      </div>
                    </button>
                  ))}
              </div>
            )}
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
