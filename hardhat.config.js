require("@nomiclabs/hardhat-waffle");
require('dotenv').config();

module.exports = {
  solidity: "0.7.3",
  networks: {
    hardhat: {
      forking: {
        url: process.env.FORKING_URL,
        blockNumber: 11395144
      }
    }
  }
};
