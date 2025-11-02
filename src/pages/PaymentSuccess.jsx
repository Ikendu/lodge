import { useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logos/logo.png";
import { useEffect, useState } from "react";

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  const lodge = location.state?.lodge || {};
  const profile = location.state?.profile || {};
  const provider = location.state?.provider || "unknown";

  const flutterdata = location.state?.flutterwave?.data;

  const paystackdata = location.state?.paystackdata?.data;

  console.log("Paystack data:", paystackdata);
  console.log("Lodge data:", lodge);
  console.log("Profile data:", profile);

  const formatDate = (raw) => {
    if (!raw) return "-";
    const parsed = new Date(raw);
    if (isNaN(parsed.getTime())) return raw;
    return parsed.toLocaleString();
  };

  const reference = flutterdata?.flw_ref || paystackdata?.reference || "-";

  const paymentReference = flutterdata?.tx_ref || paystackdata.order_id || "-";

  const paymentType = flutterdata?.payment_type || paystackdata?.channel || "-";

  const [saveStatus, setSaveStatus] = useState(null);

  const amount =
    Number(flutterdata?.ammout) || Number(paystackdata?.amount / 100) || "-";

  const date =
    formatDate(paystackdata?.paid_at) || formatDate(flutterdata?.created_at);

  const fullName = `${profile?.firstName || ""} ${profile?.lastName || ""}`;

  useEffect(() => {
    // Build payload - normalize fields to what the backend expects
    const payload = {
      fullname: fullName, // string
      email: profile?.userLoginMail || null,
      nin: profile?.nin || null,
      mobile: profile?.mobile || null,
      gender: profile?.gender || null,
      amount,
      reference: reference || null,
      paid_at: date || new Date().toISOString(),
      channel: paymentType || "unknown",
      lodge_title: lodge?.title || null,
      lodge_location: lodge?.location || lodge?.address || null,
      order_id: paymentReference || null,
    };
    // Avoid duplicate saves: guard with localStorage key or saveStatus
    const key = `payment_saved_${reference}`;
    if (!payload.reference) {
      console.warn("No payment reference available, skipping DB save.");
      return;
    }
    if (localStorage.getItem(key)) {
      console.log("Payment already saved, skipping.");
      return;
    }

    async function save() {
      try {
        const res = await fetch(
          "https://lodge.morelinks.com.ng//api/save_payment.php",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        const text = await res.text();
        let json;
        try {
          json = JSON.parse(text);
        } catch (e) {
          throw new Error("Invalid JSON response from save endpoint: " + text);
        }

        if (!res.ok) {
          throw new Error(json.message || `Save failed: HTTP ${res.status}`);
        }

        if (json.success) {
          setSaveStatus("saved");
          localStorage.setItem(key, "1"); // mark as saved to avoid duplicates
          console.log("Payment saved:", json);
        } else {
          setSaveStatus("error");
          console.error("Save failed:", json);
        }
      } catch (err) {
        setSaveStatus("error");
        console.error("Error saving payment:", err);
      }
    }

    save();
    // we only want to run once on mount, so omit dependencies that would cause re-run:
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // empty deps: runs once on mount
  // Helper: format date from various possible keys

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <style>
        {`
  @media print {
    /* Hide everything except the receipt */
    body * {
      visibility: hidden;
    }

    .receipt-card, .receipt-card * {
      visibility: visible;
    }

    .receipt-card {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      box-shadow: none !important;
      background: white !important;
    }

    .no-print {
      display: none !important;
    }

    /* Force background colors to print */
    @page {
      margin: 20mm;
    }
    body {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      background: #f9fafb !important; /* your gray-50 background */
    }
  }
`}
      </style>

      <div className="w-full max-w-3xl bg-white receipt-card rounded shadow p-6">
        <div className="flex justify-center m-4">
          <img
            src={logo}
            alt=""
            className="bg-blue-600 px-4 rounded-xl max-w-52"
          />
        </div>
        <hr />
        <div className="flex items-start justify-between mb-6 mt-4">
          <div>
            <h1 className="text-2xl font-bold">Payment Receipt</h1>
            <p className="text-sm text-gray-500">
              Reference: <span className="font-medium">{reference}</span>
            </p>
          </div>

          <div className="text-right no-print">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-green-600 text-white rounded mr-2"
            >
              Print
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 border rounded"
            >
              Done
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm text-gray-500 uppercase">Payer</h3>
            <p className="text-lg font-medium">{fullName}</p>
            <p className="text-sm text-gray-600">
              {profile?.userLoginMail || profile?.email || "-"}
            </p>
            {profile?.mobile && (
              <p className="text-sm text-gray-600">{profile.mobile}</p>
            )}
          </div>

          <div>
            <h3 className="text-sm text-gray-500 uppercase">Lodge</h3>
            <p className="text-lg font-medium">{lodge?.title || "-"}</p>
            <p className="text-sm text-gray-600">
              {lodge?.location || lodge?.address || "-"}
            </p>
            {lodge?.room && (
              <p className="text-sm text-gray-600">Room: {lodge.room}</p>
            )}
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-sm text-gray-500 uppercase mb-3">
            Payment Details
          </h3>

          <div className="mb-4 flex flex-col gap-3">
            <div className="flex justify-between text-sm text-gray-700">
              <div>Payment Provider</div>
              <div className="font-medium capitalize">{provider}</div>
            </div>
            <div className="flex justify-between text-sm text-gray-700">
              <div>Amount Paid</div>
              <div className="font-medium">₦{amount.toLocaleString()}</div>
            </div>
            <div className="flex justify-between text-sm text-gray-700">
              <div>Transaction Date</div>
              <div className="font-medium">
                {provider === "paystack"
                  ? formatDate(paystackdata?.created_at)
                  : formatDate(flutterdata?.created_at)}
              </div>
            </div>
            <div className="flex justify-between text-sm text-gray-700">
              <div>Transaction ID</div>
              <div className="font-medium">{paymentReference}</div>
            </div>
            <div className="flex justify-between text-sm text-gray-700">
              <div>Payment Method</div>
              <div className="font-medium">{paymentType?.toUpperCase()}</div>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          This is an electronic receipt. No signature is required.
        </p>
      </div>
    </div>
  );
}
