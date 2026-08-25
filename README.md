# Blockchain-Based Land Registry & Property Ownership System

An educational blockchain prototype that simulates property registration, ownership verification, and ownership transfer using Solidity smart contracts, Hardhat, and (optionally) a React/Ethers.js frontend.

> ⚠️ **Educational Disclaimer:** This project uses only **dummy/synthetic property data and test wallets**. It is a course/learning prototype and does **not** create legally valid property ownership. Real-world land ownership requires integration with government land authorities, cadastral/survey records, identity verification systems, courts, and applicable property law. See [Limitations](#limitations--real-world-considerations) below.

---

## Overview

This project models how a land registry *could* use blockchain to keep a tamper-evident, auditable record of property registration, verification, and ownership transfer — with every state change permanently logged as an on-chain event.

## Problem Statement

Traditional, paper- or siloed-database-based land records suffer from:
- Duplicate or conflicting ownership entries
- Manual, slow verification processes
- Records that can be altered without a visible trail
- Difficulty auditing who owned what and when
- Fragmented systems across departments/registrars

## Objectives

- Simulate property registration by an authority
- Simulate authority/verifier-based property verification
- Enforce that only the current owner can transfer a property
- Preserve an immutable, event-based ownership history
- Demonstrate document-hash verification for tamper-evidence
- Provide full automated test coverage
- Provide a beginner-friendly, GitHub-ready proof-of-work project

## Industry Relevance

Concepts here are directly relevant to: government land registries, property management platforms, real-estate technology (PropTech), housing societies, mortgage/loan due-diligence, title verification, and document authentication systems. The business value is transparency, tamper-evident history, faster verification, fewer duplicate records, and stronger auditability — **not** automatic legal validity.

## Blockchain Concepts Used

Blockchain, Ethereum, smart contracts, Solidity, wallet addresses, `msg.sender`, `struct`, `mapping`, `array`, `enum`, `modifier`, `events`, `require()`, access control, document hashing, transaction hashes, immutability, audit trails, testnets, dApps, gas, off-chain metadata.

## Actors

| Actor | Responsibilities |
|---|---|
| **Authority (Admin)** | Registers properties, appoints verifiers, verifies records, can flag disputes |
| **Verifier (optional)** | Appointed by authority; can verify property records |
| **Property Owner** | Views owned properties, initiates transfer of properties they own |
| **Buyer / New Owner** | Receives ownership, can verify property details publicly |

## Technology Stack

- **Solidity ^0.8.20** — smart contract language
- **Hardhat** — compilation, local blockchain, testing, deployment
- **Ethers.js v6** — contract interaction
- **MetaMask** — wallet connection (frontend)
- **React** — optional frontend dashboards
- **Remix IDE** — quick manual/virtual simulation

Three implementation tiers were considered (Easy/Remix-only, Recommended/Hardhat+React, Advanced/IPFS+multi-party approval). This repository implements the **Recommended** tier, with the contract also fully compatible with Remix for quick manual testing.

## System Architecture

```
                     ┌─────────────────────────┐
                     │      FRONTEND (React)    │
                     │  Authority / Owner /      │
                     │  Verification Dashboards  │
                     └────────────┬─────────────┘
                                  │ Ethers.js + MetaMask
                                  ▼
                     ┌─────────────────────────┐
                     │   LandRegistry.sol        │
                     │  (Ethereum-compatible     │
                     │   smart contract)         │
                     │  - Property Registry      │
                     │  - Ownership Mapping      │
                     │  - Verification Logic     │
                     │  - Transfer Logic         │
                     │  - Event History          │
                     └────────────┬─────────────┘
                                  │ document hash only
                                  ▼
                     ┌─────────────────────────┐
                     │  OFF-CHAIN (optional)     │
                     │  sample_documents/         │
                     │  property_001.json (dummy) │
                     └─────────────────────────┘
```

**Registration flow:** Authority → `registerProperty()` → Property struct stored → `PropertyRegistered` event.
**Verification flow:** Authority/Verifier → `verifyProperty()` → status updated → `PropertyVerified` event.
**Transfer flow:** Owner → `transferOwnership()` → contract validates ownership & verification → new owner assigned → `OwnershipTransferred` event.

Only property ID, owner wallet, status, document hash, and timestamps are stored on-chain — never raw personal identity documents.

## Property Data Model

```solidity
struct Property {
    uint256 propertyId;
    string propertyNumber;
    string location;
    uint256 area;
    string propertyType;
    address currentOwner;
    address previousOwner;
    string documentHash;
    bool verified;
    Status status; // REGISTERED, VERIFIED, TRANSFER_PENDING, TRANSFERRED, DISPUTED
    uint256 registeredAt;
    uint256 lastTransferredAt;
    bool exists;
}
```

## Smart Contract Functions

| Function | Access | Purpose |
|---|---|---|
| `registerProperty(...)` | Authority only | Registers a new property |
| `verifyProperty(id)` | Authority/Verifier | Marks a property verified |
| `transferOwnership(id, newOwner)` | Current owner only | Transfers ownership |
| `updatePropertyStatus(id, status)` | Authority only | Flags/updates status (e.g. DISPUTED) |
| `getProperty(id)` | Public view | Returns full property record |
| `getPropertiesByOwner(addr)` | Public view | Lists property IDs held by an address |
| `getPropertyIdByNumber(number)` | Public view | Resolves human ID → internal ID |
| `addVerifier(addr)` / `removeVerifier(addr)` | Authority only | Manages verifier role |

## Events

`PropertyRegistered`, `PropertyVerified`, `OwnershipTransferred`, `PropertyStatusUpdated`, `VerifierAdded`, `VerifierRemoved` — these logs are what a frontend indexer would use to reconstruct full ownership history without extra on-chain storage cost.

## Security Controls

- Duplicate `propertyNumber` rejected
- Zero-address owners rejected (registration & transfer)
- Only authority can register/verify/flag disputes
- Only current owner can transfer their own property
- Unverified properties cannot be transferred
- Disputed properties cannot be transferred or re-verified
- All state changes emit events for auditability

## Folder Structure

```
Blockchain-Land-Registry-Property-Ownership/
├── contracts/LandRegistry.sol       # Main smart contract
├── scripts/deploy.js                # Hardhat deployment script
├── scripts/generateHash.js          # Document hash demo script
├── test/LandRegistry.test.js        # Full Hardhat test suite
├── frontend/                        # Optional React + Ethers.js dApp
│   └── src/{components,useLandRegistry.js,contractConfig.js}
├── sample_documents/                # Dummy property documents
├── hashes/                          # Generated hash output (JSON)
├── screenshots/                     # Proof-of-work screenshots (add your own)
├── reports/                         # Project report (see docs/)
├── docs/                            # Extra documentation
├── README.md
├── hardhat.config.js
├── package.json
└── .gitignore
```

## Installation

```bash
git clone https://github.com/<your-username>/Blockchain-Land-Registry-Property-Ownership.git
cd Blockchain-Land-Registry-Property-Ownership
npm install
npx hardhat compile
```

See `docs/IMPLEMENTATION_PLAN.md` for the full 14-phase build plan and `docs/REMIX_SIMULATION.md` for the detailed step-by-step walkthrough below.

## Remix Simulation (Quick Manual Test)

1. Open [Remix IDE](https://remix.ethereum.org)
2. Create `LandRegistry.sol`, paste the contract from `contracts/`
3. Compile with Solidity 0.8.20
4. Deploy using **Remix VM**
5. Using **Account 1 (Authority)**: call `registerProperty("P001", "Sector 12", 1200, "Residential", <Account2>, "<hash>")`
6. Call `getProperty(1)` → confirm owner = Account 2
7. Using **Account 4 (unauthorized)**: try `verifyProperty(1)` → expect revert
8. Using **Account 1**: call `verifyProperty(1)` → succeeds
9. Using **Account 2 (Owner A)**: call `transferOwnership(1, <Account3>)` → new owner = Account 3
10. Using **Account 2** again: try transferring again → expect revert (no longer the owner)
11. Review emitted events in the Remix terminal log for the ownership history

## Hardhat Testing

```bash
npx hardhat test
```

The suite in `test/LandRegistry.test.js` covers: deployment, correct authority assignment, registration (success + all rejection cases), verification (success + unauthorized + double-verify), ownership transfer (success + non-owner + zero address + unverified + disputed + repeat-transfer prevention), event emission, and read/lookup functions.

## Document Hash Verification

```bash
node scripts/generateHash.js
```

This hashes `sample_documents/property_001.json` and a modified copy (`area` changed from 1200 → 1500 sq. ft.) using SHA-256, proving that even a one-field change produces a completely different hash — the basis for tamper-evidence when only the hash (not the raw document) is stored on-chain.

Example real output from this repository:
```
Original SHA-256: 29aab86b0fea7771d5e78bf815890e00ece623f1e24f69d9bbbbc87317f419c1
Modified SHA-256:  66d80729a0c2eecd411c204d07e741cf7494d3df24f26151e3565ba234dacae2
Hashes match? false
```

## Optional Frontend

`frontend/` is a self-contained Create-React-App-style project: `useLandRegistry.js` (wallet connect + contract calls), three dashboards (`AuthorityDashboard`, `OwnerDashboard`, `PropertyVerificationPage`), and `App.jsx`/`index.js` wiring them into a tabbed UI. To run it:

```bash
cd frontend
npm install
# paste your deployed contract address + ABI into src/contractConfig.js
npm start
```

Get the ABI from `artifacts/contracts/LandRegistry.sol/LandRegistry.json` (the `"abi"` field) after running `npx hardhat compile` in the project root.

## Limitations & Real-World Considerations

Blockchain can preserve a **tamper-evident** ownership record, but it **cannot verify that the original information entered was legally correct** — this is the "garbage in, garbage out" problem. A wallet address is not a verified legal identity. Real-world deployment would additionally require:

- A legally empowered government land authority operating the "authority" role
- Identity verification (KYC) tied to wallet addresses
- Integration with cadastral/survey databases
- Legal processes for disputes, inheritance, court orders, and mortgages/liens
- Registrar and judicial system integration

This project intentionally keeps document data off-chain and only stores hashes, and uses only test wallets and synthetic data throughout.

## Future Improvements

- Multi-step transfer flow (`requestTransfer` → `approveTransfer` → `completeTransfer`)
- IPFS-based document storage referenced by hash
- Escrow/payment simulation
- Role-based multi-verifier approval workflows
- Subgraph-based indexing for full ownership history queries

## Learning Outcomes

Practical experience with Solidity data structures (structs, mappings, enums), access-control modifiers, event-driven audit trails, Hardhat testing, and the real boundary between blockchain tamper-evidence and legal ownership validity.

## Author

Student Developer — Blockchain Course Project (Proof of Work)
