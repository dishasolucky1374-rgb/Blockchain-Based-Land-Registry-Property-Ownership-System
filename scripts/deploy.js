// scripts/deploy.js
// Deploys LandRegistry to whichever network Hardhat is pointed at
// (default: local Hardhat network). Run with:
//   npx hardhat run scripts/deploy.js --network localhost

const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying LandRegistry with account:", deployer.address);

  const LandRegistry = await hre.ethers.getContractFactory("LandRegistry");
  const landRegistry = await LandRegistry.deploy();
  await landRegistry.waitForDeployment();

  const address = await landRegistry.getAddress();
  console.log("LandRegistry deployed to:", address);
  console.log("Authority (deployer) address:", deployer.address);

  console.log("\nSave this address to interact with the contract from a frontend or script.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
