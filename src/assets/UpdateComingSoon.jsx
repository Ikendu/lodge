import { Link } from "react-router-dom";

export default function UpdateComingSoon() {
  return (
    <div>
      <p className="text-red-600 pb-5 italic text-center font-semibold">
        More updates are coming on this section,
        <Link to="/contact-us" className="underline">
          Contact Support
        </Link>{" "}
        for more information or questions you may have for now, thank you.
      </p>
    </div>
  );
}
