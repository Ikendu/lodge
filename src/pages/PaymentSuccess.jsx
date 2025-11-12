import { useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logos/logo.png";
import { useEffect, useState, useRef } from "react";

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  const lodge = location.state?.lodge || {};
  const profile = location.state?.profile || {};
  const provider = location.state?.provider || "unknown";
  const flutterdata = location.state?.flutterwave;
  const paystackdata = location.state?.paystackdata;

  console.log("Payment data:", { flutterdata, paystackdata });
  console.log("Lodge data:", lodge);

  const formatDate = (raw) => {
    if (!raw) return "-";
    const parsed = new Date(raw);
    if (isNaN(parsed.getTime())) return raw;
    return parsed.toLocaleString();
  };

  const reference =
    flutterdata?.flw_ref || paystackdata?.data?.reference || "-";
  const paymentReference = flutterdata?.tx_ref || paystackdata?.data?.id || "-";
  const paymentType =
    flutterdata?.payment_type || paystackdata?.data?.channel || "-";
  const startDate = flutterdata?.startDate || paystackdata?.startDate || null;
  const endDate = flutterdata?.endDate || paystackdata?.endDate || null;
  const nights = flutterdata?.nights || paystackdata?.nights || null;

  const [saveStatus, setSaveStatus] = useState(null);
  const hasSaved = useRef(false); // prevent double execution

  const amount =
    Number(flutterdata?.amount) ||
    Number(paystackdata?.data?.amount / 100) ||
    "-";
  const date =
    formatDate(paystackdata?.data?.paid_at) ||
    formatDate(flutterdata?.created_at);
  const fullName = `${profile?.firstName || ""} ${profile?.lastName || ""}`;
  const owner = JSON.parse(localStorage.getItem("ownerProfile"));
  console.log("Owner data:", owner);
  useEffect(() => {
    if (hasSaved.current) return;
    hasSaved.current = true;

    const payload = {
      fullname: fullName,
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
      amenities: lodge?.raw?.amenities || null,
      bathroomType: lodge?.raw?.bathroomType || null,
      capacity: lodge?.raw?.capacity || null,
      description: lodge?.description || null,
      lodge_email: lodge?.raw?.userLoginMail || null,
      type: lodge?.raw?.type || null,
      lodge_nin: lodge?.raw?.nin || null,
      price: lodge?.price || null,
      startDate: startDate || null,
      endDate: endDate || null,
      nights: nights || null,

      image_first_url: lodge?.raw?.image_first_url || null,
      image_second_url: lodge?.raw?.image_second_url || null,
      image_third_url: lodge?.raw?.image_third_url || null,

      order_id: paymentReference || null,
    };

    const key = `payment_saved_${reference}`;
    const lodgeKey =
      lodge?.id ||
      lodge?._id ||
      lodge?.raw?.id ||
      lodge?.title ||
      "unknown_lodge";
    if (!payload.reference) {
      console.warn("No payment reference available, skipping DB save.");
      return;
    }
    if (localStorage.getItem(key)) {
      console.log("Payment already saved locally, skipping DB save.");
      return;
    }

    async function save() {
      try {
        const res = await fetch(
          "https://lodge.morelinks.com.ng/api/save_payment.php",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        const text = await res.text();
        const json = JSON.parse(text);

        if (!res.ok)
          throw new Error(json.message || `Save failed: HTTP ${res.status}`);

        if (json.success) {
          setSaveStatus("saved");
          localStorage.setItem(key, "1");
          // mark this lodge as paid so other pages can reveal protected contact info
          try {
            localStorage.setItem(
              `paid_lodge_${encodeURIComponent(lodgeKey)}`,
              "1"
            );
          } catch (e) {
            // ignore storage errors
          }
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
  }, []);

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <style>
        {`
  @media print {
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
    @page { margin: 20mm; }
    body {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      background: #f9fafb !important;
    }
  }
`}
      </style>

      <div className="w-full max-w-3xl bg-white receipt-card rounded shadow p-6">
        <div className="flex justify-center m-4">
          <img
            src={logo}
            alt="Logo"
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

          <div className="text-right no-print text-xs">
            <button
              onClick={handlePrint}
              className="px-2 py-1 bg-green-600 text-white rounded md:mr-2"
            >
              Print
            </button>
            <button
              onClick={() =>
                navigate(`/lodge/${lodge.id}`, { state: { lodge } })
              }
              className="px-2 py-1 border  bg-blue-600 text-white rounded md:mr-2"
            >
              Lodge Details
            </button>
            <button
              onClick={() => navigate("/profile")}
              className="px-2 py-1 border rounded"
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
              <div className="font-medium">
                ₦{lodge?.amount || amount?.toLocaleString()}
              </div>
            </div>
            <div className="flex justify-between text-sm text-gray-700">
              <div>Transaction Date</div>
              <div className="font-medium">
                {provider === "paystack"
                  ? formatDate(paystackdata?.data?.created_at)
                  : provider === "flutterwave"
                  ? formatDate(flutterdata?.created_at)
                  : lodge?.created_at}
              </div>
            </div>
            <div className="flex justify-between text-sm text-gray-700">
              <div>Transaction ID</div>
              <div className="font-medium">{paymentReference || lodge?.id}</div>
            </div>
            <div className="flex justify-between text-sm text-gray-700">
              <div>Payment Method</div>
              <div className="font-medium">
                {paymentType?.toUpperCase() || "-"}
              </div>
            </div>
            <div className="flex justify-between text-sm text-gray-700">
              <div>Start Date</div>
              <div className="font-medium">
                {lodge?.startDate || startDate || "-"}
              </div>
            </div>
            <div className="flex justify-between text-sm text-gray-700">
              <div>End Date</div>
              <div className="font-medium">
                {lodge?.endDate || endDate || "-"}
              </div>
            </div>
            <div className="flex justify-between text-sm text-gray-700">
              <div>Number of Night(s)</div>
              <div className="font-medium">
                {lodge?.nights || nights || "-"}
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          This is an electronic receipt. No signature is required.
        </p>

        {/* Owner contact (shown here since this is the payment success page) */}
        <div className="mt-6 border-t pt-4">
          <h3 className="text-sm text-gray-500 uppercase mb-2">
            Owner Contact
          </h3>
          {owner ? (
            <div className="text-sm text-gray-700 space-y-1">
              <div>
                <strong className="text-gray-700">Email:</strong>{" "}
                {owner?.userLoginMail ||
                  owner?.email ||
                  owner?.ownerEmail ||
                  "Not provided"}
              </div>
              <div>
                <strong className="text-gray-700">Mobile:</strong>{" "}
                {owner?.mobile ||
                  owner?.phone ||
                  owner?.ownerMobile ||
                  "Not provided"}
              </div>
              <div>
                <strong className="text-gray-700">Phone:</strong>{" "}
                {owner?.phone ||
                  owner?.telephone ||
                  owner?.contact ||
                  "Not provided"}
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-600">
              Owner contact not available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
