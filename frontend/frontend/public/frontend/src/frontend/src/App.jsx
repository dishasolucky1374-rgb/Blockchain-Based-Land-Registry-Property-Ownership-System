// frontend/src/App.jsx
import React, { useState } from "react";
import AuthorityDashboard from "./components/AuthorityDashboard";
import OwnerDashboard from "./components/OwnerDashboard";
import PropertyVerificationPage from "./components/PropertyVerificationPage";

const TABS = {
  authority: "Authority Dashboard",
  owner: "Owner Dashboard",
  verify: "Public Verification",
};

export default function App() {
  const [activeTab, setActiveTab] = useState("authority");

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 720, margin: "0 auto", padding: 24 }}>
      <h1>Blockchain Land Registry (Prototype)</h1>
      <p style={{ color: "#a00" }}>
        Educational demo only — uses dummy data and test wallets. Not a legal ownership system.
      </p>

      <nav style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        {Object.entries(TABS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            style={{ fontWeight: activeTab === key ? "bold" : "normal" }}
          >
            {label}
          </button>
        ))}
      </nav>

      {activeTab === "authority" && <AuthorityDashboard />}
      {activeTab === "owner" && <OwnerDashboard />}
      {activeTab === "verify" && <PropertyVerificationPage />}
    </div>
  );
}
