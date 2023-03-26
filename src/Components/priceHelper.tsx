
import { WrapperBuilder } from "@redstone-finance/evm-connector";
import POOL from "../utils/abi/PoolFactory.json"
import ethers from "ethers"

export const fetchPairPrice = async (symbol: string) => {
    const ethereum = (window as any).ethereum;
    await ethereum.request({ method: "eth_requestAccounts" });
    const provider = new ethers.JsonRpcProvider(ethereum);
    const signer = provider.getSigner();
    const contract: any = new ethers.Contract(process.env.NEXT_PUBLIC_POOLIFY_ADDRESS!, POOL.abi, await signer);
    const wrappedContract = WrapperBuilder.wrap(contract).usingDataService(
        {
            dataServiceId: "redstone-main-demo",
            uniqueSignersCount: 1,
            dataFeeds: [symbol.toString()],
        },
        ["https://d33trozg86ya9x.cloudfront.net"]
    );
    const bytesData = ethers.encodeBytes32String(symbol.toString());
    // Interact with the contract (getting oracle value securely)
    const symbolrice = await wrappedContract.getLatestTokenPrice(bytesData);

    // Convert the BigNumber to a string, and then to a BigNumber with 18 decimal places
    const pairPrice = ethers.parseUnits(symbolrice.toString(), 18);
    console.log(pairPrice);
    return pairPrice;
}