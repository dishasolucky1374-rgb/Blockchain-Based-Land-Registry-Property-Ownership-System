// scripts/generateHash.js
// Generates SHA-256 hashes of the dummy property documents to demonstrate
// document-hash verification (Section 15 of the project).
//
// Run with:  node scripts/generateHash.js
//
// This proves that even a tiny change to a document (e.g. area:
// 1200 -> 1500) produces a completely different hash, which is the basis
// for tamper-evidence: the smart contract only stores the hash on-chain,
// while the actual document stays off-chain.

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

function hashFile(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hash = crypto.createHash("sha256");
  hash.update(fileBuffer);
  return hash.digest("hex");
}

const originalPath = path.join(__dirname, "../sample_documents/property_001.json");
const modifiedPath = path.join(__dirname, "../sample_documents/property_001_modified.json");

const originalHash = hashFile(originalPath);
const modifiedHash = hashFile(modifiedPath);

console.log("=== Document Hash Verification Demo ===\n");
console.log("Original document:", originalPath);
console.log("SHA-256 Hash:", originalHash);
console.log("\nModified document:", modifiedPath);
console.log("SHA-256 Hash:", modifiedHash);

console.log("\nHashes match?", originalHash === modifiedHash);

const outputDir = path.join(__dirname, "../hashes");
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

fs.writeFileSync(
  path.join(outputDir, "property_001_hashes.json"),
  JSON.stringify(
    {
      originalDocument: "sample_documents/property_001.json",
      originalHash,
      modifiedDocument: "sample_documents/property_001_modified.json",
      modifiedHash,
      hashesMatch: originalHash === modifiedHash,
      generatedAt: new Date().toISOString(),
    },
    null,
    2
  )
);

console.log("\nSaved result to hashes/property_001_hashes.json");
