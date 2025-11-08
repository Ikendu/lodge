import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logos/logo.png";
import { useState, useRef, useEffect } from "react";
import { Menu, X, User, Search } from "lucide-react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebaseConfig";
import { signOut } from "firebase/auth";
import { lodges } from "../lodgedata";
import toast from "react-hot-toast";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [mobileSearchVisible, setMobileSearchVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const hintRef = useRef(null);
  const mobileSearchRef = useRef(null);

  useEffect(() => {
    if (mobileSearchVisible && mobileSearchRef.current) {
      try {
        mobileSearchRef.current.focus();
      } catch {
        // ignore focus errors
      }
    }
  }, [mobileSearchVisible]);

  // debounce query for suggestions/filtering
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 250);
    return () => clearTimeout(t);
  }, [query]);
  const [user] = useAuthState(auth);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  // Prefer stored login info for avatar (set at login) falling back to Firebase user.photoURL
  let storedLogin = null;
  try {
    storedLogin = JSON.parse(localStorage.getItem("userLogin") || "null");
  } catch (e) {
    storedLogin = null;
  }
  const avatarSrc = storedLogin?.photoURL || (user && user.photoURL) || null;
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
    { name: "Get Lodge", path: "/apartments" },
    { name: "List a Lodge", path: "/list_new_lodge" },
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
            className="px-3 py-2 rounded-l-md bg-white text-black placeholder-gray-500 w-80"
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
                const ql = debouncedQuery.toLowerCase();
                const range = parsePriceRange(debouncedQuery);
                const matches = lodges
                  .filter((l) => {
                    // ensure we only return matches when there's a non-empty query
                    if (!ql) return false;
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
                    if (
                      !Number.isNaN(num) &&
                      String(num).length &&
                      l.price === num
                    )
                      return true;
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
                if (link.path === "/list_new_lodge" && !user) {
                  navigate("/login", {
                    state: { from: { pathname: "/list_new_lodge" } },
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
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={
                      user?.displayName || storedLogin?.displayName || "User"
                    }
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={18} />
                )}
              </button>

              {accountMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white text-gray-800 rounded shadow-lg py-2 z-50">
                  <button
                    onClick={() => setAccountMenuOpen(false)}
                    className="absolute top-1 right-1 text-gray-500 hover:text-gray-700"
                    aria-label="Close menu"
                  >
                    <X size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setAccountMenuOpen(false);
                      // If no customerProfile stored, send user to registration
                      const cp = localStorage.getItem("customerProfile");
                      if (!cp) {
                        toast("Complete your profile to continue", {
                          icon: "ℹ️",
                        });
                        navigate("/registeruser", {
                          state: { from: location.pathname },
                        });
                      } else {
                        navigate("/profile");
                      }
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Profile
                  </button>
                  <button
                    onClick={async () => {
                      await signOut(auth);
                      setAccountMenuOpen(false);
                      localStorage.removeItem("customerProfile");
                      localStorage.removeItem("userLogin");
                      alert("Logged out successfully!");
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
          {/* Mobile search icon */}
          <button
            className="text-yellow-300"
            aria-label="Open search"
            onClick={() => {
              setMobileSearchVisible(true);
              setSuggestionsOpen(Boolean(query.trim()));
            }}
          >
            <Search size={20} />
          </button>
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
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={
                      user?.displayName || storedLogin?.displayName || "User"
                    }
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={18} />
                )}
              </button>

              {accountMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white text-gray-800 rounded shadow-lg py-2 z-50">
                  <button
                    onClick={() => setAccountMenuOpen(false)}
                    className="absolute top-1 right-1 text-gray-500 hover:text-gray-700"
                    aria-label="Close menu"
                  >
                    <X size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setAccountMenuOpen(false);
                      const cp = localStorage.getItem("customerProfile");
                      if (!cp) {
                        toast("Complete your profile to continue", {
                          icon: "ℹ️",
                        });
                        navigate("/registeruser", {
                          state: { from: location.pathname },
                        });
                      } else {
                        navigate("/profile");
                      }
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Profile
                  </button>
                  <button
                    onClick={async () => {
                      await signOut(auth);
                      setAccountMenuOpen(false);
                      localStorage.removeItem("customerProfile");
                      localStorage.removeItem("userLogin");
                      alert("Logged out successfully!");
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
          <div className="flex gap-2 relative items-center">
            <div className="relative flex-1">
              <input
                placeholder="Search lodges"
                className="w-full p-2 rounded bg-white text-black placeholder-gray-500"
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

              {suggestionsOpen && query.trim() && (
                <div className="absolute top-full left-0 mt-2 w-full bg-white text-gray-800 rounded shadow-lg z-50">
                  {lodges
                    .filter((l) => {
                      const ql2 = query.toLowerCase().trim();
                      if (!ql2) return false;
                      const hay = (
                        l.title +
                        " " +
                        l.description +
                        " " +
                        l.location
                      ).toLowerCase();
                      return (
                        hay.includes(ql2) ||
                        (String(l.price).includes(query.replace(/\D/g, "")) &&
                          query.replace(/\D/g, "").length)
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
                if (link.path === "/list_new_lodge" && !user) {
                  navigate("/login", {
                    state: { from: { pathname: "/list_new_lodge" } },
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

      {/* Mobile search overlay */}
      {mobileSearchVisible && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-start p-4 md:hidden">
          <div className="w-full max-w-md bg-white rounded shadow p-3">
            <div className="flex items-center gap-2">
              <input
                ref={mobileSearchRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSuggestionsOpen(Boolean(e.target.value.trim()));
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    setMobileSearchVisible(false);
                    handleSearch();
                  }
                }}
                placeholder="Search lodges"
                className="flex-1 p-2 border rounded bg-white text-black placeholder-gray-500"
              />
              <button
                onClick={() => {
                  setMobileSearchVisible(false);
                  setSuggestionsOpen(false);
                }}
                className="text-gray-600"
                aria-label="Close search"
              >
                Close
              </button>
            </div>

            {suggestionsOpen && query.trim() && (
              <div className="mt-2 max-h-60 overflow-auto">
                {lodges
                  .filter((l) => {
                    const ql3 = query.toLowerCase().trim();
                    if (!ql3) return false;
                    const hay = (
                      l.title +
                      " " +
                      l.description +
                      " " +
                      l.location
                    ).toLowerCase();
                    return (
                      hay.includes(ql3) ||
                      (String(l.price).includes(query.replace(/\D/g, "")) &&
                        query.replace(/\D/g, "").length)
                    );
                  })
                  .slice(0, 8)
                  .map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setMobileSearchVisible(false);
                        setSuggestionsOpen(false);
                        navigate(`/lodge/${m.id}`, { state: { lodge: m } });
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-3"
                    >
                      <img
                        src={m.images?.[0]}
                        alt={m.title}
                        className="w-12 h-8 object-cover rounded"
                      />
                      <div>
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
        </div>
      )}
    </header>
  );
}
