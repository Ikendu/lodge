import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const PAYSTACK_KEY = import.meta.env.VITE_PAYSTACK_KEY;
const FLUTTERWAVE_KEY = import.meta.env.VITE_FLUTTERWAVE_KEY || "";

if (!PAYSTACK_KEY) {
  console.error(
    "Paystack public key is missing. Please set VITE_PAYSTACK_KEY in your environment."
  );
}

if (!FLUTTERWAVE_KEY) {
  console.error(
    "Flutterwave public key is missing. Please set VITE_FLUTTERWAVE_KEY in your environment."
  );
}

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
  const [flutterwaveLoaded, setFlutterwaveLoaded] = useState(false);

  const amount = lodge?.price || 0;

  useEffect(() => {
    if (!PAYSTACK_KEY) return;

    // Load Paystack script
    if (!window.PaystackPop) {
      const s = document.createElement("script");
      s.src = "https://js.paystack.co/v1/inline.js";
      s.async = true;
      s.onload = () => console.log("Paystack script loaded successfully.");
      s.onerror = () => console.error("Failed to load Paystack script.");
      document.body.appendChild(s);
    }

    const payload = JSON.stringify({
      email: profile?.userLoginMail,
      amount: Number(amount) * 100, // in kobo
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

        if (!res.ok) {
          throw new Error(`Failed to initialize payment: ${res.statusText}`);
        }

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
            value: profile.mobile || "N/A",
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

            if (!res.ok) {
              throw new Error(`Failed to verify payment: ${res.statusText}`);
            }

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

  const startFlutterwave = () => {
    window.FlutterwaveCheckout({
      public_key: import.meta.env.VITE_FLUTTERWAVE_KEY, // from .env
      tx_ref: Date.now(),
      amount: 50,
      currency: "NGN",
      payment_options: "card, banktransfer, ussd",
      customer: {
        email: "davidaniedexp@gmail.com",
        phone_number: "08061632276",
        name: "David Aniede",
      },
      customizations: {
        title: "MoreLinks Lodge Payment",
        description: "Payment for lodge booking",
        logo: "https://lodge.morelinks.com.ng/logos.png",
      },
      callback: function (response) {
        // send to backend for verification
        fetch("https://lodge.morelinks.com.ng/api/verify_flut_payment.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transaction_id: response.transaction_id }),
        })
          .then((res) => res.json())
          .then((data) => {
            console.log("Flutterwave verification response:", data);

            if (
              data.status === "success" &&
              data.data?.status === "successful"
            ) {
              navigate("/payment-success", {
                state: {
                  lodge,
                  profile,
                  provider: "flutterwave",
                  flutterwave: data,
                },
              });
            } else {
              console.log("Payment verification failed. Try again.");
            }
          });
      },
      onclose: function () {
        console.log("Payment modal closed");
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
