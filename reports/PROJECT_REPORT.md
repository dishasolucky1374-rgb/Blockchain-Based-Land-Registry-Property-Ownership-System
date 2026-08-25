# Project Report: Blockchain-Based Land Registry & Property Ownership System

## Abstract
This project implements a prototype land registry system on Ethereum-compatible blockchain infrastructure using Solidity smart contracts. It simulates property registration, verification, and ownership transfer with tamper-evident, event-logged history, using exclusively dummy data and test wallets for educational purposes.

## Introduction
Land ownership records are traditionally maintained in centralized, often paper-based or siloed digital systems that are vulnerable to duplication, manual error, and undetectable tampering. This project explores how blockchain's core properties — immutability, transparency, and cryptographic verification — can address specific pain points in the record-keeping layer of land administration, while being explicit about what blockchain alone cannot solve.

## Problem Statement
Key issues in conventional land registries include duplicate/conflicting ownership claims, slow manual verification, lack of a visible audit trail for record changes, and fragmented systems across departments. These create fertile ground for disputes and fraud.

## Traditional Land Registry Challenges
- No single tamper-evident source of truth
- Manual cross-checking is slow and error-prone
- Historical ownership changes are hard to audit
- Document forgery is difficult to detect after the fact

## Proposed Blockchain System
A smart contract (`LandRegistry.sol`) acts as the authoritative on-chain registry. An "authority" role (representing a land office) registers properties; an authority or appointed verifier confirms records; and only the current owner can transfer their property to a new wallet address, provided the property is verified and not disputed. Every state change emits an event, forming a permanent, publicly auditable history.

## Objectives
Simulate registration, verification, ownership transfer, and status tracking; preserve ownership history via events; demonstrate document-hash tamper-evidence; provide full automated test coverage; and produce a beginner-friendly, GitHub-ready, placement-ready proof of work.

## Architecture
A three-layer design: an optional React/Ethers.js frontend for Authority, Owner, and public Verification dashboards; the `LandRegistry` smart contract holding the property registry, ownership mapping, verification and transfer logic, and event log; and an off-chain layer for the dummy property document, referenced on-chain only by its SHA-256 hash.

## Actors
Authority (admin), optional appointed Verifiers, Property Owners, and Buyers/New Owners — each with clearly scoped permissions enforced by Solidity modifiers.

## Property Data Model
The `Property` struct captures `propertyId`, `propertyNumber`, `location`, `area`, `propertyType`, `currentOwner`, `previousOwner`, `documentHash`, `verified`, `status` (enum), `registeredAt`, and `lastTransferredAt`.

## Smart Contract Design
Access control is enforced through `onlyAuthority`, `onlyAuthorityOrVerifier`, `onlyPropertyOwner`, and `propertyExists` modifiers. State transitions are validated with `require()` statements covering zero addresses, duplicate IDs, unverified transfers, and disputed properties.

## Registration Workflow
The authority calls `registerProperty()` with property details and an initial owner wallet; the contract validates uniqueness and required fields, stores the record, and emits `PropertyRegistered`.

## Verification Workflow
A separate `verifyProperty()` step — callable by the authority or an appointed verifier — marks a record verified and blocks re-verification or verification of disputed properties, modeling a distinct confirmation step as in real registrar workflows.

## Ownership Transfer
`transferOwnership()` is restricted to the current owner, requires a non-zero new owner, requires the property to be verified and not disputed, and updates `previousOwner`/`currentOwner`/`lastTransferredAt` before emitting `OwnershipTransferred`.

## Document Hashing
A dummy JSON document (`property_001.json`) is SHA-256 hashed via `scripts/generateHash.js`; only the hash is stored on-chain. A modified copy of the document produces a completely different hash, demonstrating tamper-evidence without storing sensitive documents on-chain.

## Security
Validations prevent duplicate property numbers, zero-address owners, unauthorized registration/verification/transfer, transfers of unverified or disputed properties, and repeat transfers by a former owner.

## Implementation
Built with Solidity ^0.8.20 and Hardhat, with an optional React + Ethers.js v6 frontend using MetaMask for wallet connection.

## Testing
`test/LandRegistry.test.js` covers deployment, registration (success and all rejection paths), verification (success, unauthorized, double-verify), transfer (success, non-owner, zero address, unverified, disputed, repeat-transfer prevention), event emission, and read/lookup functions.

## Simulation
A manual Remix IDE walkthrough using four test accounts (Authority, Owner A, Buyer B, Unauthorized User) validates the full registration → verification → transfer → repeat-transfer-rejection flow end-to-end.

## Results
All implemented functions behave as specified under both the Hardhat automated test suite and manual Remix simulation; document hash verification correctly distinguishes an unmodified document from a modified one.

## Applications
Government land registries, PropTech platforms, housing societies, mortgage due-diligence, and title/document verification systems could draw on these patterns for their record-keeping layer.

## Advantages
Tamper-evident history, transparent and auditable ownership records, faster verification, reduced duplicate records, and a clear digital transfer workflow.

## Limitations
Blockchain guarantees only that recorded data has not been altered after the fact — it cannot guarantee the recorded data was accurate or legally valid to begin with (the "garbage in, garbage out" problem). Wallet addresses are not verified legal identities.

## Legal Considerations
A production system would require a legally empowered authority, KYC-based identity verification, integration with cadastral/survey databases, and defined legal processes for disputes, inheritance, court orders, and mortgages/liens.

## Future Scope
Multi-step transfer approval, IPFS document storage, escrow/payment simulation, and multi-verifier governance.

## Conclusion
This prototype demonstrates, using entirely synthetic data, how core blockchain primitives — structs, mappings, access-control modifiers, and events — can model a tamper-evident property registry, while making clear the boundary between technical tamper-evidence and legal ownership validity.
