import { useNavigate } from "react-router-dom";
import logo from "../assets/logos/MoreLinksLogo.png";
export default function Header() {
  const navigate = useNavigate();
  return (
    <header className="bg-blue-600 text-white p-4 flex justify-center">
      <img
        src={logo}
        alt="MoreLinks Logo"
        className="h-8 w-auto cursor-pointer"
        onClick={() => navigate("/")}
      />
    </header>
  );
}
