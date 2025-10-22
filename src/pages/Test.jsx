import React, { useState } from "react";

export default function DojahNINTest() {
  const [nin, setNin] = useState("70123456789");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  //   const DOJA_TEST_PUBLIC_KEY = "test_pk_xBqyPxRGAACASQgvhAF57UlCq"; // 🔹 Replace with your Dojah test public key

  const DOJA_TEST_PUBLIC_KEY = "test_sk_1BDJiWdVVPjUcpdK0YA5cHUZn"; // 🔹 Replace with your Dojah test public key
  const API_URL = "https://sandbox.dojah.io/api/v1/kyc/nin/verify"; // Sandbox base URL

  const verifyNIN = async () => {
    if (!nin) return alert("Please enter a NIN");

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          Authorization: DOJA_TEST_PUBLIC_KEY,
          AppId: "68ee3f3ffd71c34bdb0c6524",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nin }),
      });

      const data = await response.json();
      console.log("✅ Dojah Sandbox Response:", data);

      setResult(data);
    } catch (err) {
      console.error("❌ Error:", err);
      setError("Error verifying NIN. Check your console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Dojah NIN Verification (Sandbox Mode)</h2>
      <input
        style={styles.input}
        type="text"
        value={nin}
        onChange={(e) => setNin(e.target.value)}
        placeholder="Enter NIN"
      />
      <button style={styles.button} onClick={verifyNIN} disabled={loading}>
        {loading ? "Verifying..." : "Verify NIN"}
      </button>

      {error && <p style={styles.error}>{error}</p>}

      {result && (
        <pre style={styles.result}>{JSON.stringify(result, null, 2)}</pre>
      )}
      <img src={`data:image/jpeg;base64,${result?.entity?.image}`} alt="" />
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 500,
    margin: "40px auto",
    padding: 20,
    border: "1px solid #ccc",
    borderRadius: 10,
    fontFamily: "sans-serif",
  },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
    borderRadius: 5,
    border: "1px solid #ccc",
  },
  button: {
    padding: "10px 20px",
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
  },
  error: {
    color: "red",
    marginTop: 10,
  },
  result: {
    background: "#f5f5f5",
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
    fontSize: 14,
  },
};
