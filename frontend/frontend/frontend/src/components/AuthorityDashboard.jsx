// frontend/src/components/AuthorityDashboard.jsx
import React, { useState } from "react";
import { useLandRegistry } from "../useLandRegistry";

export default function AuthorityDashboard() {
  const { account, connectWallet, registerProperty, verifyProperty, error } = useLandRegistry();

  const [form, setForm] = useState({
    propertyNumber: "",
    location: "",
    area: "",
    propertyType: "Residential",
    initialOwner: "",
    documentHash: "",
  });
  const [verifyId, setVerifyId] = useState("");
  const [status, setStatus] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setStatus("Submitting registration...");
      await registerProperty(
        form.propertyNumber,
        form.location,
        Number(form.area),
        form.propertyType,
        form.initialOwner,
        form.documentHash
      );
      setStatus("Property registered successfully.");
    } catch (err) {
      setStatus("Error: " + (err.message || "registration failed"));
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      setStatus("Submitting verification...");
      await verifyProperty(Number(verifyId));
      setStatus("Property verified successfully.");
    } catch (err) {
      setStatus("Error: " + (err.message || "verification failed"));
    }
  };

  return (
    <div>
      <h2>Land Authority Dashboard</h2>
      {!account ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <p>Connected as: {account}</p>
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <h3>Register Property</h3>
      <form onSubmit={handleRegister}>
        <input name="propertyNumber" placeholder="Property Number (e.g. P001)" onChange={handleChange} />
        <input name="location" placeholder="Location" onChange={handleChange} />
        <input name="area" placeholder="Area" type="number" onChange={handleChange} />
        <input name="propertyType" placeholder="Property Type" onChange={handleChange} />
        <input name="initialOwner" placeholder="Initial Owner Wallet Address" onChange={handleChange} />
        <input name="documentHash" placeholder="Document Hash" onChange={handleChange} />
        <button type="submit">Register Property</button>
      </form>

      <h3>Verify Property</h3>
      
      <form onSubmit={handleVerify}>
        <input placeholder="Property ID" value={verifyId} onChange={(e) => setVerifyId(e.target.value)} />
        <button type="submit">Verify Property</button>
      </form>

      {status && <p>{status}</p>}
    </div>
  );
}
