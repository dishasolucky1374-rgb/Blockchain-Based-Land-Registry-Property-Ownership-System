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
