import { useNavigate } from "react-router-dom";
import logo from "../assets/logos/MoreLinksLogo.png";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Header() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { name: "Find Lodge", path: "/lodges" },
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

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-6 font-medium justify-center">
          {links.map((link, i) => (
            <button
              key={i}
              onClick={() => navigate(link.path)}
              className="hover:text-yellow-300 transition-colors"
            >
              {link.name}
            </button>
          ))}
          {/* Login Link */}
          <button
            onClick={() => navigate("/login")}
            className="bg-yellow-400 text-blue-800 px-4 py-1 rounded-md font-semibold hover:bg-yellow-300 transition-colors"
          >
            Login
          </button>
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-3">
          <button
            onClick={() => navigate("/login")}
            className="text-yellow-300 font-semibold hover:underline"
          >
            Login
          </button>
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
          {links.map((link, i) => (
            <button
              key={i}
              onClick={() => {
                navigate(link.path);
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
