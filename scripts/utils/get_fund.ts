import { params } from "../params/params";
import { setETH, robAssetsFromWhale, impersonateAccount } from "./tools";
const hre = require("hardhat");

async function ethInit() {
    let i: number = 0;

    const sender = await impersonateAccount(params.ethWhale);
    for (; i < 2; i++) {
        const amount = params.oneEther.mul(1000000);
        let tx = {
            to: params.localAddresses[i],
            value: amount,
        };
        await sender.sendTransaction(tx);
        console.log(`users ${params.localAddresses[i]} ETH balance set as ${amount.div(params.oneEther)}.`);

        await robAssetsFromWhale(params.localAddresses[i]);
    }
}

const main = async (): Promise<any> => {
    console.log("ETH amount init");
    await ethInit();
};

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
