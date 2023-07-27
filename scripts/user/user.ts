import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { params } from "../params/params";
import { impersonateAccount, printETHBalance, printBalance, printGas } from "../utils/tools";
const Web3 = require("web3");
var web3 = new Web3(params.web3EndPoint);

var Project;
var TestContract;

async function query() {
    const userAddress = params.localAddresses[0];
    Project = await params.Project;
    console.log(Project);

    TestContract = await ethers.getContractAt("Test", Project.Test);

    await printETHBalance(userAddress, "user");
    await printBalance(Project.Test, "Test", params.wethAddr, "WETH");
}

async function test() {
    console.log("\n\n==== test ====");
    const result = await TestContract.test();
    console.log("\n\n==== test done ====");
    await printGas(result);

    await query();
}

const main = async (): Promise<any> => {
    await query();

    await test();
};

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
