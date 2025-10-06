// src/components/Footer.jsx
export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white p-4 text-center flex justify-around">
      <p>© {new Date().getFullYear()} MoreLinks Lodge. All rights reserved.</p>
      <p>
        <a href="">Privacy</a>{" "}
      </p>
      <p>
        <a href="">Terms of Service</a>
      </p>
      <p>Designed by MoreLinks Tech Concept</p>
    </footer>
  );
}
