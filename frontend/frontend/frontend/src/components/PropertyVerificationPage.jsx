// frontend/src/components/PropertyVerificationPage.jsx
import React, { useState } from "react";
import { useLandRegistry } from "../useLandRegistry";

const STATUS_LABELS = ["REGISTERED", "VERIFIED", "TRANSFER_PENDING", "TRANSFERRED", "DISPUTED"];

export default function PropertyVerificationPage() {
  const { account, connectWallet, getProperty, error } = useLandRegistry();
  const [propertyId, setPropertyId] = useState("");
  const [property, setProperty] = useState(null);
  const [status, setStatus] = useState("");

  const handleLookup = async (e) => {
    e.preventDefault();
    try {
      setStatus("Looking up property...");
      const result = await getProperty(Number(propertyId));
      setProperty(result);
      setStatus("");
    } catch (err) {
      setStatus("Error: " + (err.message || "property not found"));
      setProperty(null);
    }
  };

  return (
    <div>
      <h2>Public Property Verification</h2>
      {!account ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <p>Connected as: {account}</p>
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleLookup}>
        <input placeholder="Property ID" value={propertyId} onChange={(e) => setPropertyId(e.target.value)} />
        <button type="submit">Verify / Look Up</button>
      </form>

      {status && <p>{status}</p>}

      {property && (
        <table>
          <tbody>
            <tr><td>Property Number</td><td>{property.propertyNumber}</td></tr>
            <tr><td>Location</td><td>{property.location}</td></tr>
            <tr><td>Area</td><td>{property.area.toString()}</td></tr>
            <tr><td>Type</td><td>{property.propertyType}</td></tr>
            <tr><td>Current Owner</td><td>{property.currentOwner}</td></tr>
            <tr><td>Verified</td><td>{property.verified ? "Yes" : "No"}</td></tr>
            <tr><td>Status</td><td>{STATUS_LABELS[Number(property.status)]}</td></tr>
            <tr><td>Document Hash</td><td>{property.documentHash}</td></tr>
          </tbody>
        </table>
      )}
    </div>
  );
}
