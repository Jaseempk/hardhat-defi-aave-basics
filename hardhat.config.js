/** @type import('hardhat/config').HardhatUserConfig */

require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-deploy");
require("solidity-coverage");
require("hardhat-gas-reporter");
require("hardhat-contract-sizer");
require("dotenv").config();
//require("hardhat-test-utils");

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL;
const PRIVATE_KEY = process.env.METAMASK_PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const COINMARKETCAP_KEY = process.env.COINMARKETCAP_KEY;
const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL;

module.exports = {
    solidity: {
        compilers: [
            { version: "0.8.17" },
            { version: "0.4.19" },
            { version: "0.8.8" },
            { version: "0.6.12" },
        ],
    },
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
            blockConfirmations: 6,
            forking: {
                url: MAINNET_RPC_URL,
            },
            //accounts:[PRIVATE_KEY]
        },
        goerli: {
            chainId: 5,
            url: GOERLI_RPC_URL,
            accounts: [PRIVATE_KEY],
        },
    },
    etherscan: {
        apiKey: {
            goerli: ETHERSCAN_API_KEY,
            hardhat: ETHERSCAN_API_KEY,
        },
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
        player: {
            default: 1,
        },
    },
    gasReporter: {
        enabled: false,
        currency: "USD",
        outputFile: "gas-report.txt",
        noColors: true,
        // coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    },
    mocha: {
        timeout: 500000, // 500 seconds max for running tests
    },
};
