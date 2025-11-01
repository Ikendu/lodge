import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const PAYSTACK_KEY = import.meta.env.VITE_PAYSTACK_KEY;
const FLUTTERWAVE_KEY = import.meta.env.VITE_FLUTTERWAVE_KEY;

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

  // const amount = lodge?.price || 0;
  const amount = 100;
  const fullname = `${profile?.firstName || ""} ${profile?.lastName || ""}`;

  const startPaystack = async () => {
    setProcessing(true);

    const handler = window.PaystackPop.setup({
      key: PAYSTACK_KEY,
      email: profile.userLoginMail,
      amount: Number(amount) * 100,
      currency: "NGN",
      ref: "REF_" + Date.now(),
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
                  paystackdata: parsed,
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
        email: profile.userLoginMail,
        phone_number: profile.mobile,
        name: fullname,
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
