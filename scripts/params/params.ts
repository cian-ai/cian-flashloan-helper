import { BigNumber } from "ethers";
import { CURRENT_RPC } from "../../hardhat.config";
import * as fs from "fs";
const hre = require("hardhat");
const { ethers } = hre;

const web3EndPoint = CURRENT_RPC;
const Web3 = require("web3");
const web3 = new Web3(web3EndPoint);

try {
    var info = fs.readFileSync("deployments/deployedAddress/deployed.json", "utf8");
} catch (err) {
    var info = "{}";
} finally {
    var Project = JSON.parse(info);
}

const localAddressesFromMnemonic = [
    "0xFBef33e09081236cC4A1f8D2C175E9fEf6Aa2DFa",
    "0x431e3Da4C2f47ebf8B953d07cDA01e43CC932d3F",
    "0x9EcefC6bFeB5d482c0aD5b63FbE5AEBFc175D5C3",
    "0x921913f5707bBf6DF6cE55d20A47678b0aEd8cD8",
    "0x3a5f44EE6C908a6D22F58979510329E4c340D3DE",
    "0xc180Aeb70cf544fE2a61C63c95384E2449Ff5631",
    "0xa1c07723A9D0C55AF4265670c153D36CEfDA812A",
    "0xE642696D242A2eA681a41Ace3CA9C5bf8808f9A6",
    "0x33de02503a08623e4C0d9B09DF78358AaD3b15de",
    "0x48FfF35975Ad6e1bd350D63a8c2E5a6679c48725",
];

const localAddressesFromPrivatekey = [
    "0x77905972FBAa90Bf98A8C5cab3ED7703BBb82414",
    "0x578C0c57136F87D617276EbFB403485c7487821B",
    "0xb78bC9e922DE5fCbda4b41d13188f310f29791b1",
    "0x0965E063086A431771A1AE0d3f8A9d2498D04134",
    "0x884719928F154FC17B51F08e8BcE0B2D9fd36Bd8",
    "0x0Ea54b25928E09F9B56064FbfE3f76EF7f8b4321",
    "0x3786408769b55219014D9A6d87568521d2E36dB2",
    "0x9296bd2553Ce65aE0CcDc34A572eef8012966C35",
    "0x286913E0A954FCD31ce53149d9F75d9D580F5e9E",
    "0xA00B0D83A78204AEf063A2cF096eBa0b9a0a074D",
];

// const localAddresses = localAddressesFromMnemonic;
const localAddresses = localAddressesFromPrivatekey;

const oneEther: BigNumber = ethers.utils.parseEther("1.0");
const oneUsd: BigNumber = ethers.utils.parseUnits("1.0", 6);
const oneBtc: BigNumber = ethers.utils.parseUnits("1.0", 8);

const fullAmount = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

const zeroAddr: string = "0x0000000000000000000000000000000000000000";
const ethAddr: string = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
const wethAddr: string = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const stethAddr: string = "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84";
const wstethAddr: string = "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0";

const awethAddr: string = "0x030bA81f1c18d280636F32af80b9AAd02Cf0854e";
const astethAddr: string = "0x1982b2F5814301d4e9a8b0201555376e62F82428";
const dwethAddr: string = "0xF63B34710400CAd3e044cFfDcAb00a0f32E33eCf";

const ethWhale: string = "0x00000000219ab540356cBB839Cbe05303d7705Fa";
const wethWhale: string = "0x2f0b23f53734252bda2277357e97e1517d6b042a";
const stethWhale: string = "0x1982b2F5814301d4e9a8b0201555376e62F82428";
const wstethWhale: string = "0x10CD5fbe1b404B7E19Ef964B63939907bdaf42E2";

const params = {
    web3: web3,
    Project: Project,

    localAddresses: localAddresses,
    oneEther: oneEther,
    oneUsd: oneUsd,
    oneBtc: oneBtc,
    fullAmount: fullAmount,
    // token
    zeroAddr: zeroAddr,
    ethAddr: ethAddr,
    wethAddr: wethAddr,
    stethAddr: stethAddr,
    wstethAddr: wstethAddr,
    awethAddr: awethAddr,
    astethAddr: astethAddr,
    dwethAddr: dwethAddr,
    // whale
    ethWhale: ethWhale,
    wethWhale: wethWhale,
    stethWhale: stethWhale,
    wstethWhale: wstethWhale,

    web3EndPoint: web3EndPoint,
};

export { params };
