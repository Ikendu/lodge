import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

// Vite environment variables (add these to your .env file as VITE_PAYSTACK_KEY and VITE_FLUTTERWAVE_KEY)
const PAYSTACK_KEY = import.meta.env.VITE_PAYSTACK_KEY || "";
const FLUTTERWAVE_KEY = import.meta.env.VITE_FLUTTERWAVE_KEY || "";

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const lodge = location.state?.lodge;
  const profile =
    location.state?.profile ||
    JSON.parse(localStorage.getItem("customerProfile") || "null");

  const [method, setMethod] = useState("paystack");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Load Paystack and Flutterwave scripts dynamically so the page can use inline SDKs
    if (!window.PaystackPop && PAYSTACK_KEY) {
      const s = document.createElement("script");
      s.src = "https://js.paystack.co/v1/inline.js";
      s.async = true;
      document.body.appendChild(s);
    }

    if (!window.getpaidSetup && FLUTTERWAVE_KEY) {
      const s2 = document.createElement("script");
      s2.src = "https://checkout.flutterwave.com/v3.js";
      s2.async = true;
      document.body.appendChild(s2);
    }
  }, []);

  if (!lodge) return <p className="p-6">No lodge selected for payment.</p>;
  if (!profile)
    return (
      <p className="p-6">
        Please complete your profile before proceeding to payment.
      </p>
    );

  const amount = lodge.price || 0;

  const startPaystack = async () => {
    setProcessing(true);

    // Recommended: create a transaction on your backend which returns a reference
    // and/or verify payment server-side after callback. For demo, we'll open
    // Paystack inline and generate a client-side ref.
    const reference = `PSK_${Date.now()}`;

    if (!window.PaystackPop) {
      alert(
        "Paystack SDK not loaded. Add VITE_PAYSTACK_KEY and ensure internet access."
      );
      setProcessing(false);
      return;
    }

    const handler = window.PaystackPop.setup({
      key: PAYSTACK_KEY,
      email: profile.email,
      amount: Number(amount) * 100, // in kobo
      ref: reference,
      metadata: {
        custom_fields: [
          {
            display_name: "Customer NIN",
            variable_name: "nin",
            value: profile.nin,
          },
        ],
      },
      onClose: function () {
        setProcessing(false);
        // user closed the modal
      },
      callback: function (response) {
        // response.reference - verify with your backend
        // Example: POST /api/paystack/verify { reference }
        // For demo we'll assume success and navigate to payment-success
        setProcessing(false);
        navigate("/payment-success", {
          state: {
            lodge,
            profile,
            provider: "paystack",
            reference: response.reference,
          },
        });
      },
    });

    handler.openIframe();
  };

  const startFlutterwave = async () => {
    setProcessing(true);

    if (!window.getpaidSetup) {
      alert(
        "Flutterwave SDK not loaded. Add VITE_FLUTTERWAVE_KEY and ensure internet access."
      );
      setProcessing(false);
      return;
    }

    const tx_ref = `FLW_${Date.now()}`;

    window.getpaidSetup({
      PBFPubKey: FLUTTERWAVE_KEY,
      customer_email: profile.email,
      amount: Number(amount),
      currency: "NGN",
      txref: tx_ref,
      onclose: function () {
        setProcessing(false);
      },
      callback: function () {
        // verify with your backend in production
        setProcessing(false);
        navigate("/payment-success", {
          state: { lodge, profile, provider: "flutterwave", reference: tx_ref },
        });
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Payment</h2>
        <div className="mb-4">
          <div className="text-gray-700">Lodge: {lodge.title}</div>
          <div className="text-gray-700">
            Amount: ₦{Number(amount).toLocaleString()}
          </div>
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-medium">
            Select payment provider
          </label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="paystack">Paystack</option>
            <option value="flutterwave">Flutterwave</option>
          </select>
        </div>

        <div className="flex gap-3">
          <button
            disabled={processing}
            onClick={() =>
              method === "paystack" ? startPaystack() : startFlutterwave()
            }
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {processing
              ? "Processing..."
              : `Pay ₦${Number(amount).toLocaleString()}`}
          </button>

          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>
        </div>

        <div className="mt-6 text-sm text-gray-500">
          <strong>Note:</strong> This page includes inline integrations for
          Paystack and Flutterwave. For production you must:
          <ul className="list-disc ml-6 mt-2">
            <li>
              Set VITE_PAYSTACK_KEY and VITE_FLUTTERWAVE_KEY in your .env
              (public keys).
            </li>
            <li>
              Create server-side endpoints to initialize transactions and verify
              receipts securely.
            </li>
            <li>
              Verify the payment on the server using secret keys before granting
              booking confirmation.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
