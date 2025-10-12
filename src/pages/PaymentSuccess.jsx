import { useLocation, useNavigate } from "react-router-dom";

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const lodge = location.state?.lodge;
  const profile = location.state?.profile;
  const provider = location.state?.provider;

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 p-6">
      <div className="bg-white p-8 rounded shadow max-w-xl text-center">
        <h2 className="text-2xl font-bold mb-4">Payment Successful</h2>
        <p className="mb-4">
          Thank you, {profile?.firstName || "Customer"} — your payment via{" "}
          {provider} was successful.
        </p>
        <p className="mb-4">Lodge: {lodge?.title}</p>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-indigo-600 text-white rounded"
          >
            Back to Home
          </button>
          <button
            onClick={() => navigate("/profile")}
            className="px-4 py-2 border rounded"
          >
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
}
