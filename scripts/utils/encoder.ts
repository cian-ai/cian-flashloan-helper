import { BigNumber, Contract, providers, utils } from "ethers";
import { ethers, network } from "hardhat";

const encodeAbi = (keys: any, values: any) => {
    return ethers.utils.defaultAbiCoder.encode(keys, values);
};

async function getCallArg(types: string[], parameters: any[]) {
    const adapterData: string = encodeAbi(types, parameters);
    return adapterData;
}

async function getAdapterCallArg(types: string[], parameters: any[], adapterAddress: string, selector: string) {
    const adapterData: string = encodeAbi(types, parameters);
    const arg: string = encodeAbi(
        ["address", "bytes4", "uint256", "bool", "bytes"],
        [adapterAddress, selector, 0, false, adapterData]
    );
    return arg;
}

async function getAdapterCallArgETH(
    types: string[],
    parameters: any[],
    adapterAddress: string,
    selector: string,
    costETH: BigNumber
) {
    const adapterData: string = encodeAbi(types, parameters);
    const arg: string = encodeAbi(
        ["address", "bytes4", "uint256", "bool", "bytes"],
        [adapterAddress, selector, costETH, false, adapterData]
    );
    return arg;
}

export { getCallArg, getAdapterCallArg, getAdapterCallArgETH };
