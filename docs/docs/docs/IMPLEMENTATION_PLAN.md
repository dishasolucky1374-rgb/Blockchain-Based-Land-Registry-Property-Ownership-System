# Implementation Plan (14 Phases)

Each phase lists its objective, steps, code involved, expected output, common mistakes, debugging tips, and what to screenshot.

---

### Phase 1 — Development Environment Setup
**Objective:** Get Node.js, Hardhat, and the project skeleton running.
**Steps:** Install Node.js LTS → `npm init -y` → `npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox` → `npx hardhat` (choose "Create a JavaScript project").
**Code involved:** `package.json`, `hardhat.config.js`.
**Expected output:** `npx hardhat compile` runs without error on the sample contract.
**Common mistakes:** Wrong Node version (use an LTS release); running commands outside the project folder.
**Debugging tips:** `node -v` to confirm version; delete `node_modules` and reinstall if install is corrupted.
**Proof to capture:** Terminal showing successful `npx hardhat` init.

### Phase 2 — Architecture Planning
**Objective:** Decide on-chain vs off-chain data split and actor roles before writing code.
**Steps:** Sketch the architecture diagram (see README); list what must never go on-chain (raw documents, personal ID).
**Code involved:** None yet — planning only, captured in `README.md`.
**Expected output:** A clear diagram and data-boundary decision.
**Common mistakes:** Trying to store full documents on-chain (expensive, unnecessary).
**Debugging tips:** N/A.
**Proof to capture:** Architecture diagram (README section).

### Phase 3 — Role Design
**Objective:** Define Authority, Verifier, Owner, Buyer permissions.
**Steps:** Write the role table (see README "Actors"); decide which functions each role can call.
**Code involved:** Modifiers stubbed in `LandRegistry.sol` (`onlyAuthority`, `onlyAuthorityOrVerifier`, `onlyPropertyOwner`).
**Expected output:** A permissions table matching the modifiers you'll implement.
**Common mistakes:** Conflating "authority" and "owner" — they are different roles with different powers.
**Proof to capture:** Role table.

### Phase 4 — Property Data Model
**Objective:** Implement the `Property` struct and `Status` enum.
**Steps:** Define `struct Property {...}` and `enum Status {...}` in `LandRegistry.sol`; add the storage mappings.
**Code involved:** Struct/enum/mappings section of the contract.
**Expected output:** Contract compiles with the new struct.
**Common mistakes:** Forgetting the `exists` boolean flag, which is what `propertyExists` modifier relies on.
**Debugging tips:** Compile after every struct field addition to catch typos early.
**Proof to capture:** Struct/enum code in editor.

### Phase 5 — Property Registration
**Objective:** Implement `registerProperty()` with full validation.
**Steps:** Write the function, add `require()` checks, emit `PropertyRegistered`.
**Code involved:** `registerProperty()` in `LandRegistry.sol`.
**Expected output:** Calling it from Remix/Hardhat creates a retrievable property.
**Common mistakes:** Not checking for duplicate `propertyNumber`; forgetting `nextPropertyId++`.
**Debugging tips:** Use `getProperty(id)` immediately after registering to confirm storage.
**Proof to capture:** Registration transaction + `getProperty()` output.

### Phase 6 — Verification Logic
**Objective:** Implement `verifyProperty()` as a separate, restricted step.
**Steps:** Add `verified` flag update, status transition, `PropertyVerified` event.
**Code involved:** `verifyProperty()`.
**Expected output:** Only authority/verifier can verify; double-verification reverts.
**Common mistakes:** Allowing the property owner to self-verify (should not be possible).
**Proof to capture:** Verification success + unauthorized-verification rejection.

### Phase 7 — Ownership Transfer
**Objective:** Implement `transferOwnership()` with ownership + verification checks.
**Steps:** Add `onlyPropertyOwner` modifier, zero-address check, verified/disputed checks, update owner fields, emit `OwnershipTransferred`.
**Code involved:** `transferOwnership()`.
**Expected output:** Ownership changes correctly; old owner can no longer transfer.
**Common mistakes:** Forgetting to update `previousOwner` before overwriting `currentOwner`.
**Proof to capture:** Transfer transaction, new owner output, repeat-transfer rejection.

### Phase 8 — Ownership History / Events
**Objective:** Ensure every state change is logged for off-chain history reconstruction.
**Steps:** Confirm all four core events fire correctly; consider what an indexer would need (indexed params).
**Code involved:** Event declarations + `emit` statements throughout.
**Expected output:** Full event log tells the complete story of a property's lifecycle.
**Common mistakes:** Missing `indexed` on address/ID fields, making off-chain filtering harder.
**Proof to capture:** Event log screenshot from Remix or Hardhat console.

### Phase 9 — Document Hash Integration
**Objective:** Demonstrate tamper-evidence for off-chain documents.
**Steps:** Create `sample_documents/property_001.json`; run `scripts/generateHash.js`; pass the hash into `registerProperty()`.
**Code involved:** `scripts/generateHash.js`, `documentHash` field.
**Expected output:** Original and modified document hashes differ completely.
**Common mistakes:** Hashing the wrong file path; forgetting hashes are case-sensitive hex strings.
**Proof to capture:** Hash generation output, mismatch after modification.

### Phase 10 — Security Validation
**Objective:** Stress-test every access-control and validation path.
**Steps:** Manually attempt each disallowed action (unauthorized register/verify/transfer, zero address, disputed transfer) and confirm reverts.
**Code involved:** All `require()` statements and modifiers.
**Expected output:** Every disallowed action reverts with a clear message.
**Common mistakes:** Only testing the "happy path" and skipping negative cases.
**Proof to capture:** Revert messages in console.

### Phase 11 — Hardhat Tests
**Objective:** Automate all the manual checks from Phase 10.
**Steps:** Write `test/LandRegistry.test.js`; run `npx hardhat test`.
**Code involved:** Full test suite.
**Expected output:** All tests pass (green checkmarks).
**Common mistakes:** Forgetting `await` on async contract calls, causing false positives/negatives.
**Debugging tips:** Run a single test with `.only` while debugging a failure.
**Proof to capture:** `npx hardhat test` passing output.

### Phase 12 — Remix Simulation
**Objective:** Manually validate the full lifecycle with real Remix test accounts.
**Steps:** Follow `docs/REMIX_SIMULATION.md` step by step.
**Code involved:** No new code — using the deployed contract via Remix's UI.
**Expected output:** Matches automated test results, confirming Remix and Hardhat agree.
**Common mistakes:** Forgetting to switch the active account in Remix before each call.
**Proof to capture:** Screenshots per step (see `docs/SCREENSHOTS_CHECKLIST.md`).

### Phase 13 — Optional Frontend
