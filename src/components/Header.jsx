import logo from "../assets/logos/MoreLinksLogo.png";
export default function Header() {
  return (
    <header className="bg-blue-600 text-white p-4">
      <img src={logo} alt="MoreLinks Logo" className="h-8 w-auto" />
    </header>
  );
}
