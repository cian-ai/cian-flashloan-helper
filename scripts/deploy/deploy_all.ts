import { params } from "../params/params";
import { robAssetsFromWhale } from "../utils/tools";
const hre = require("hardhat");
import { ethers } from "hardhat";
const fs = require("fs");
let ALL = new Object();

const { LedgerSigner } = require("@anders-t/ethers-ledger");
const Web3 = require("web3");

var web3 = new Web3(params.web3EndPoint);
const ledger = new LedgerSigner(hre.ethers.provider);
var signer;

async function deploy_contract(name: string, arg: any = [], accountIndex: number = 1) {
    const _contract = await hre.ethers.getContractFactory(name);
    const ret = await _contract.connect(signer).deploy(...arg);
    await ret.deployTransaction.wait();
    console.log(name + " deployed to:", ret.address);
    if (arg.length != 0) {
        await argsWriteToFile(name, arg);
    }
    return ret;
}

async function deploy_pool() {
    const FlashloanHelper = await deploy_contract("FlashloanHelper");
    const Test = await deploy_contract("Test", [FlashloanHelper.address]);
    await robAssetsFromWhale(Test.address);
    const FlashloanHelperContract = await ethers.getContractAt("FlashloanHelper", FlashloanHelper.address);
    await FlashloanHelperContract.connect(signer).addToWhitelist(Test.address);
    Object.assign(ALL, {
        FlashloanHelper,
        Test,
    });
}

async function argsWriteToFile(name: string, arg: any = []) {
    let data;
    if (arg.length == 0) {
        data = "module.exports = " + `[` + `]`;
    } else {
        data = "module.exports = " + `["` + arg.toString().replace(/,/g, `","`) + `"]`;
    }

    const options = { encoding: "utf8", flag: "w+" };
    const fileName: string = "scripts/deploy/constructor_args/" + name + ".js";
    fs.writeFileSync(fileName, data, options);
}

async function writeToFile() {
    let addresses = {
        FlashloanHelper: (ALL as any).FlashloanHelper.address,
        Test: (ALL as any).Test.address,
    };
    console.log(addresses);
    let data = JSON.stringify(addresses);
    const options = { encoding: "utf8", flag: "w+" };
    fs.writeFileSync("deployments/deployedAddress/deployed.json", data, options);
}

async function main() {
    // signer = await ledger;
    signer = (await ethers.getSigners())[1];
    await deploy_pool();
    await writeToFile();
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
