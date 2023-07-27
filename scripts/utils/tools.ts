// import { ethers } from "hardhat";
import { CURRENT_RPC } from "../../hardhat.config";

import { BigNumber, Contract } from "ethers";
import { ethers, network } from "hardhat";
import { params } from "../params/params";
import hre = require("hardhat");

async function impersonateAccount(address: string) {
    const provider = new ethers.providers.JsonRpcProvider(CURRENT_RPC);
    const balance: BigNumber = await hre.ethers.provider.getBalance(address);
    if (!balance.gt(params.oneEther)) {
        await setETH(address, 2);
    }
    await provider.send("hardhat_impersonateAccount", [address]);
    const signer = provider.getSigner(address);
    return signer;
}

async function stopImpersonateAccount(address: string) {
    const provider = new ethers.providers.JsonRpcProvider(CURRENT_RPC);
    await provider.send("hardhat_stopImpersonatingAccount", [address]);
}

async function printBalance(owner: string, owner_name: string, tokenAddress: string = "", tokenSymbol: string = "") {
    if (tokenAddress == "") {
        var token: Contract = await params[tokenSymbol];
    } else {
        var token: Contract = await ethers.getContractAt("IERC20", tokenAddress);
    }
    var balance: number = await token.balanceOf(owner);
    var decimals: number;
    try {
        decimals = await token.decimals();
        console.log(`${owner_name} ${owner} ${tokenSymbol} Balance : ${ethers.utils.formatUnits(balance, decimals)}`);
    } catch (err) {
        var accountInfo = "{}";
        console.log(`${owner_name} ${owner} ${tokenSymbol} Balance : ${balance}`);
    }
}

async function getBalance(owner: string, tokenAddress: string = "", blockNumber?: number) {
    const token: Contract = await ethers.getContractAt("IERC20", tokenAddress);
    const balance: BigNumber = await token.balanceOf(owner, { blockTag: blockNumber });
    return balance;
}

async function printGas(txResult: any) {
    console.log("gasPrice : ", txResult.gasPrice);
    console.log("gasLimit : ", txResult.gasLimit);
    console.log("gasUsed  : ", ethers.utils.formatEther(txResult.gasPrice.mul(txResult.gasLimit)));
}

async function printETHBalance(owner: string, name: string) {
    const balance: BigNumber = await hre.ethers.provider.getBalance(owner);
    console.log(`${name} ${owner} ETH Balance : ${ethers.utils.formatUnits(balance, 18)}`);
}

async function getETHBalance(owner: string) {
    const balance: BigNumber = await hre.ethers.provider.getBalance(owner);
    return balance;
}

const encodeAbi = (keys: any, values: any) => {
    return ethers.utils.defaultAbiCoder.encode(keys, values);
};

async function getCallArgs(types: string[], parameters: any[], adapterAddress: string, selector: string, costETH: BigNumber = params.oneEther.mul(0)) {
    const adapterData: string = encodeAbi(types, parameters);
    const arg: string = encodeAbi(["address", "uint256", "bytes4", "bytes"], [adapterAddress, costETH, selector, adapterData]);
    return arg;
}

async function getDelegatecallArgs(types: string[], parameters: any[], adapterAddress: string, selector: string) {
    const adapterData: string = encodeAbi(types, parameters);
    const callArgs = selector + adapterData.substring(2, adapterData.length);
    const arg = encodeAbi(["address", "bytes"], [adapterAddress, callArgs]);

    return arg;
}

async function setETH(address: string, amount: number, name: string = "") {
    const ETH_amount: string = params.oneEther.mul(amount).toHexString();
    await hre.network.provider.send("hardhat_setBalance", [address, ETH_amount]);
    // await printETHBalance(address, name);
}
async function robFromWhale(tokenAddress: string, whaleAddress: string, to: string, num: number, decimals: number) {
    const token: Contract = await ethers.getContractAt("IERC20", tokenAddress);
    await setETH(whaleAddress, 1000);
    const provider = new ethers.providers.JsonRpcProvider(CURRENT_RPC);

    const code = await provider.getCode(whaleAddress);
    await network.provider.request({
        method: "hardhat_setCode",
        params: [whaleAddress, "0x"],
    });

    const signer = await impersonateAccount(whaleAddress);

    const balance0 = await token.balanceOf(whaleAddress);
    let wantAmount;
    if (num == 0) {
        wantAmount = balance0;
    } else {
        wantAmount = ethers.utils.parseUnits(num.toString(), decimals);
    }

    if (balance0.gte(wantAmount)) {
        await token.connect(signer).transfer(to, wantAmount);
    } else {
        console.log("Whale Balance Not Enough:", tokenAddress);
        await token.connect(signer).transfer(to, balance0);
    }

    await stopImpersonateAccount(whaleAddress);
    await network.provider.request({
        method: "hardhat_setCode",
        params: [whaleAddress, code],
    });
}
async function robAssetsFromWhale(targetAddress: string) {
    await robFromWhale(params.wethAddr, params.wethWhale, targetAddress, 1000, 18);
    await robFromWhale(params.stethAddr, params.stethWhale, targetAddress, 1000, 18);
    await robFromWhale(params.wstethAddr, params.wstethWhale, targetAddress, 1000, 18);
}

async function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

async function getEta() {
    const web3 = await params.web3;
    const result = await web3.eth.getBlock("latest");
    const nowTime = result.timestamp;
    const interval = 3600 * 24 + 600; // 24 hours + 10 mins
    const eta = nowTime + interval;

    console.log("ETA :", eta);
    return eta;
}

export {
    impersonateAccount,
    printBalance,
    printETHBalance,
    getETHBalance,
    getBalance,
    printGas,
    encodeAbi,
    getCallArgs,
    getDelegatecallArgs,
    robFromWhale,
    robAssetsFromWhale,
    setETH,
    sleep,
    getEta,
};
