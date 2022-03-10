require("@nomiclabs/hardhat-waffle");
require("dotenv").config();

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.9",
  paths: {
    tests: "./test/optimism"
  },
  networks: {
    kovan: {
      url: process.env.ALCHEMY_MAINNET_API_URL,
      accounts: [`0x${process.env.PRIVATE_KEY}`],
    },
    'optimism-kovan': {
      url: process.env.ALCHEMY_OPTIMISM_API_URL,
      accounts: [`0x${process.env.PRIVATE_KEY}`],
    },
    optimistic: {
      url: 'http://127.0.0.1:8545',
      accounts: { mnemonic: 'test test test test test test test test test test test junk' }
    },
  }
};
