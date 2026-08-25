// frontend/src/components/OwnerDashboard.jsx
import React, { useState } from "react";
import { useLandRegistry } from "../useLandRegistry";

export default function OwnerDashboard() {
  const { account, connectWallet, getPropertiesByOwner, getProperty, transferOwnership, error } =
    useLandRegistry();

  const [properties, setProperties] = useState([]);
  const [transferId, setTransferId] = useState("");
  const [newOwner, setNewOwner] = useState("");
  const [status, setStatus] = useState("");

  const loadMyProperties = async () => {
    try {
      const ids = await getPropertiesByOwner(account);
      const details = await Promise.all(ids.map((id) => getProperty(id)));
      setProperties(details);
    } catch (err) {
      setStatus("Error loading properties: " + err.message);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    try {
      setStatus("Submitting transfer...");
      await transferOwnership(Number(transferId), newOwner);
      setStatus("Ownership transferred successfully.");
      loadMyProperties();
    } catch (err) {
      setStatus("Error: " + (err.message || "transfer failed"));
    }
  };

  return (
    <div>
      <h2>Property Owner Dashboard</h2>
      {!account ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <p>Connected as: {account}</p>
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <button onClick={loadMyProperties}>Load My Properties</button>
      <ul>
        {properties.map((p) => (
          <li key={p.propertyId.toString()}>
            #{p.propertyId.toString()} - {p.propertyNumber} - {p.location} - Status: {p.status.toString()}
          </li>
        ))}
      </ul>

      <h3>Transfer Property</h3>
      <form onSubmit={handleTransfer}>
        <input placeholder="Property ID" value={transferId} onChange={(e) => setTransferId(e.target.value)} />
        <input placeholder="New Owner Address" value={newOwner} onChange={(e) => setNewOwner(e.target.value)} />
        <button type="submit">Transfer Ownership</button>
      </form>

      {status && <p>{status}</p>}
    </div>
  );
}
