// frontend/src/useLandRegistry.js
// Minimal Ethers.js v6 + MetaMask integration hook for the LandRegistry dApp.
// Import this into React components (AuthorityDashboard, OwnerDashboard, etc.)

import { useState, useCallback } from "react";
import { BrowserProvider, Contract } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./contractConfig";

export function useLandRegistry() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [error, setError] = useState(null);

  const connectWallet = useCallback(async () => {
    try {
      if (!window.ethereum) {
        setError("MetaMask not detected. Please install MetaMask.");
        return;
      }
      const provider = new BrowserProvider(window.ethereum);
