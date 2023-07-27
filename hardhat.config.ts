// import "hardhat-deploy";
import "@nomiclabs/hardhat-waffle";
require("@nomiclabs/hardhat-etherscan");

const mnemonic = "season turtle oblige language winner purpose call engine thunder pepper cactus base";
const privateKey = [
    "0x6a4843f986e41899fa98984f0a559d8e870f2bb5552bfeb79b427c1199386710",
    "0x6a4843f986e41899fa98984f0a559d8e870f2bb5552bfeb79b427c1199386711",
    "0x6a4843f986e41899fa98984f0a559d8e870f2bb5552bfeb79b427c1199386722",
    "0x6a4843f986e41899fa98984f0a559d8e870f2bb5552bfeb79b427c1199386733",
    "0x6a4843f986e41899fa98984f0a559d8e870f2bb5552bfeb79b427c1199386744",
    "0x6a4843f986e41899fa98984f0a559d8e870f2bb5552bfeb79b427c1199386755",
    "0x6a4843f986e41899fa98984f0a559d8e870f2bb5552bfeb79b427c1199386766",
    "0x6a4843f986e41899fa98984f0a559d8e870f2bb5552bfeb79b427c1199386777",
    "0x6a4843f986e41899fa98984f0a559d8e870f2bb5552bfeb79b427c1199386788",
    "0x6a4843f986e41899fa98984f0a559d8e870f2bb5552bfeb79b427c1199386799",
];
const LOCAL_RPC = "http://127.0.0.1:9545";
const SELF_RPC = "http://192.168.1.104:10005";

// const CURRENT_RPC = TEST_RPC;
const CURRENT_RPC = LOCAL_RPC;
const NETWORK = "localhost";

// const CURRENT_RPC = SELF_RPC;
// const NETWORK = "mainnet";

const GasPrice = 50e9;
const globalGasPrice = {
    gasPrice: GasPrice,
};

export default {
    solidity: {
        compilers: [
            {
                version: "0.8.20",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 10000,
                    },
                },
            },
        ],
    },
    paths: {
        sources: "./contracts",
        artifacts: "./artifacts",
        tests: "./test",
    },
    defaultNetwork: NETWORK,
    networks: {
        hardhat: {
            gasPrice: GasPrice,
            chainId: 1, //Only specify a chainId if we are not forking
            // forking: forkingData,
            throwOnTransactionFailures: false,
            throwOnCallFailures: false,
            // accounts: { mnemonic },
            accounts: { privateKey },
            mining: {
                auto: true,
                interval: 10000,
            },
            allowUnlimitedContractSize: true,
            // ms，default 2000ms
            timeout: 1000000,
        },
        localhost: {
            gasPrice: GasPrice,
            // accounts: { mnemonic },
            accounts: privateKey,
            url: CURRENT_RPC,
            chainId: 1,
            allowUnlimitedContractSize: true,
            timeout: 1000000,
        },
        goerli: {
            url: CURRENT_RPC,
            gasPrice: GasPrice,
            chainId: 5,
            accounts: privateKey,
        },
        mainnet: {
            url: CURRENT_RPC,
            gasPrice: GasPrice,
            chainId: 1,
            accounts: privateKey,
        },
    },
    //Used for code verification
    etherscan: {
        apiKey: "",
    },
};

export { CURRENT_RPC, globalGasPrice };
