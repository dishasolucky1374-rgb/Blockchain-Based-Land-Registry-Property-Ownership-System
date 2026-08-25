require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      // default local in-memory network used for testing
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    // Example testnet config (Sepolia) - only used if you add a .env file.
    // Uncomment and fill in your own values if you want to deploy to a testnet.
    // sepolia: {
    //   url: process.env.SEPOLIA_RPC_URL || "",
    //   accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    // },
  },
};
