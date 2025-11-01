import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const PAYSTACK_KEY = import.meta.env.VITE_PAYSTACK_KEY;
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
  const [refAccess, setRefAccess] = useState(null);
  const [verifyPaystack, setVerifyPaystack] = useState(null);

  // ✅ move this before useEffect
  const amount = 100; // or lodge?.price || 0
  // profile?.userLoginMail = "davidaniedexp@gmail.com";

  useEffect(() => {
    // load Paystack script
    if (!window.PaystackPop && PAYSTACK_KEY) {
      const s = document.createElement("script");
      s.src = "https://js.paystack.co/v1/inline.js";
      s.async = true;
      document.body.appendChild(s);
    }

    const payload = JSON.stringify({
      email: profile?.userLoginMail,
      amount: Number(amount) * 50, // in kobo
    });

    async function fetchData() {
      try {
        const res = await fetch(
          "https://lodge.morelinks.com.ng/api/paymentinit.php",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: payload,
          }
        );

        const text = await res.text();
        try {
          const parsed = JSON.parse(text);
          console.log("Init response:", parsed);
          setRefAccess(parsed);
        } catch (err) {
          console.error("Invalid JSON from backend:", text);
        }
      } catch (err) {
        console.error("Error initializing payment:", err);
      }
    }

    fetchData();

    // load Flutterwave script
    if (!window.getpaidSetup && FLUTTERWAVE_KEY) {
      const s2 = document.createElement("script");
      s2.src = "https://checkout.flutterwave.com/v3.js";
      s2.async = true;
      document.body.appendChild(s2);
    }
  }, [profile?.userLoginMail, amount]);

  const startPaystack = async () => {
    if (!refAccess?.data?.reference) {
      alert("Could not initialize payment. Try again.");
      return;
    }

    if (!window.PaystackPop) {
      alert("Paystack script not loaded.");
      return;
    }

    setProcessing(true);
    const reference = refAccess.data.reference;

    const handler = window.PaystackPop.setup({
      key: PAYSTACK_KEY,
      email: profile.userLoginMail,
      amount: Number(amount) * 100,
      ref: reference,
      metadata: {
        custom_fields: [
          {
            display_name: profile.firstName + " " + profile.lastName,
            variable_name: "NIN",
            value: profile.mobile,
          },
        ],
      },
      onClose: () => {
        setProcessing(false);
      },
      callback: function (response) {
        (async () => {
          try {
            const res = await fetch(
              `https://lodge.morelinks.com.ng/api/verifyPaystack.php?reference=${response.reference}`
            );

            const text = await res.text();
            const parsed = JSON.parse(text);
            console.log("Verification result:", parsed);
            setVerifyPaystack(parsed);

            if (parsed.status && parsed.data?.status === "success") {
              navigate("/payment-success", {
                state: {
                  lodge,
                  profile,
                  provider: "paystack",
                  reference: response.reference,
                  verifyPaystack: parsed,
                },
              });
            } else {
              alert("Payment verification failed. Try again.");
            }
          } catch (error) {
            console.error("Error verifying payment:", error);
          } finally {
            setProcessing(false);
          }
        })();
      },
    });

    handler.openIframe();
  };

  const startFlutterwave = async () => {
    setProcessing(true);
    if (!window.getpaidSetup) {
      alert("Flutterwave SDK not loaded.");
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
      onclose: () => setProcessing(false),
      callback: () => {
        setProcessing(false);
        navigate("/payment-success", {
          state: { lodge, profile, provider: "flutterwave", reference: tx_ref },
        });
      },
    });
  };

  if (!lodge) return <p className="p-6">No lodge selected for payment.</p>;
  if (!profile)
    return (
      <p className="p-6">
        Please complete your profile before proceeding to payment.
      </p>
    );

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
      </div>
    </div>
  );
}
