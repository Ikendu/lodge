import React, { useState } from "react";

export default function DojahNINLookup() {
  const [nin, setNin] = useState("70123456789"); // Test NIN
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const verifyNIN = async () => {
    setError(null);
    setData(null);

    try {
      const response = await fetch(
        `https://sandbox.dojah.io/api/v1/kyc/nin/advance?nin=${nin}`,
        {
          method: "GET",
          headers: {
            Authorization: `test_sk_1BDJiWdVVPjUcpdK0YA5cHUZn`, // ✅ Use public key
            AppId: "68f8faa4d25a14fb83d48866", // ✅ Add your AppId
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("✅ Dojah Sandbox Response:", result);
      setData(result.entity || result);
    } catch (err) {
      console.error("❌ Error verifying NIN:", err);
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h2>Dojah Sandbox NIN Lookup</h2>
      <input
        type="text"
        value={nin}
        onChange={(e) => setNin(e.target.value)}
        placeholder="Enter NIN"
        style={{ padding: 8, width: 250 }}
      />
      <button
        onClick={verifyNIN}
        style={{ marginLeft: 10, padding: "8px 16px" }}
      >
        Verify NIN
      </button>

      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {data && (
        <div style={{ marginTop: 20 }}>
          <h3>Result:</h3>
          <p>
            <strong>Name:</strong> {data.first_name} {data.last_name}
          </p>
          <p>
            <strong>Gender:</strong> {data.gender}
          </p>
          <p>
            <strong>DOB:</strong> {data.date_of_birth}
          </p>
          {data.photo && (
            <img
              src={`data:image/jpeg;base64,${data.photo}`}
              alt="NIN photo"
              width="150"
              style={{ borderRadius: 8, marginTop: 10 }}
            />
          )}
        </div>
      )}
    </div>
  );
}
