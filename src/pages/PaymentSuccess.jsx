import { useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logos/logo.png";
import { useEffect } from "react";

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  const lodge = location.state?.lodge || {};
  const profile = location.state?.profile || {};
  const provider = location.state?.provider || "unknown";
  const flutterdata = location.state?.flutterwave?.data;
  console.log(flutterdata);

  const paystackdata = location.state?.paystackdata?.data;

  const reference =
    flutterdata?.flw_ref ||
    location.state?.verifyPaystack?.data?.reference ||
    "-";

  const paymentReference =
    flutterdata?.tx_ref ||
    location.state?.verifyPaystack?.data?.reference ||
    "-";

  const paymentType = flutterdata?.payment_type || provider || "-";

  const verifyPaystack = location.state?.verifyPaystack;
  const verifyFlutterwave =
    location.state?.verifyFlutterwave || location.state?.verifyFlutter;

  // Helper: format date from various possible keys
  const extractDate = (verify) => {
    if (!verify || !verify.data) return null;
    const d = verify;
    return (
      d.created_at ||
      d.transaction_date ||
      d.paid_at ||
      d.createdAt ||
      d.updated_at ||
      null
    );
  };
  const formatDate = (raw) => {
    if (!raw) return "-";
    const parsed = new Date(raw);
    if (isNaN(parsed.getTime())) return raw;
    return parsed.toLocaleString();
  };

  const extractAmount = (verify, providerName) => {
    if (!verify || !verify.data) return lodge?.price || 0;
    const d = verify.data;
    // Paystack returns amount in kobo
    if (providerName === "paystack") {
      const amt = d.amount != null ? Number(d.amount) / 100 : lodge?.price || 0;
      return amt;
    }
    // Flutterwave usually in Naira
    if (providerName === "flutterwave") {
      return d.amount != null ? Number(d.amount) : lodge?.price || 0;
    }
    return lodge?.price || 0;
  };

  const paystackDate = extractDate(verifyPaystack);
  const flutterDate = extractDate(flutterdata);

  const amountPaid =
    provider === "paystack"
      ? extractAmount(verifyPaystack, "paystack")
      : extractAmount(verifyFlutterwave, "flutterwave");

  const fullName =
    `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() ||
    profile?.name ||
    profile?.fullname ||
    "Customer";

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
              <div className="font-medium">
                ₦{Number(amountPaid).toLocaleString()}
              </div>
            </div>
            <div className="flex justify-between text-sm text-gray-700">
              <div>Transaction Date</div>
              <div className="font-medium">
                {provider === "paystack"
                  ? formatDate(paystackDate)
                  : formatDate(flutterdata?.created_at)}
              </div>
            </div>
            <div className="flex justify-between text-sm text-gray-700">
              <div>Transaction Reference</div>
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
