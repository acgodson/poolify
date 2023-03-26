import axios from "axios";
import pinataSDK from "@pinata/sdk";
import bs58 from "bs58";
import multihashes from "multihashes";
import { ethers } from "ethers";
import ERC20 from "../../utils/abi/ERC20.json";

const apiKey = process.env.NEXT_PUBLIC_API_KEY;
const apiSecret = process.env.NEXT_PUBLIC_API_SECRET;

const pinata = new pinataSDK(apiKey, apiSecret);

export function isValidUrl(urlString: string) {
  try {
    const url: any = new URL(urlString);
    const fileExtension = url.pathname.split(".").pop().toLowerCase();
    const isImage = ["jpg", "jpeg", "png", "gif"].includes(fileExtension);
    const isVideo = ["mp4", "webm", "ogg"].includes(fileExtension);
    if (isImage || !isVideo) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}

export const pinFileToIPFS = async (file: any) => {
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

  //we gather a local file for this example, but any valid readStream source will work here.
  let data = new FormData();
  // data.append('file', fs.createReadStream('./yourfile.png'));
  data.append("file", file);

  //pinataOptions are optional
  const pinataOptions = JSON.stringify({
    cidVersion: 1,
    customPinPolicy: {
      regions: [
        {
          id: "FRA1",
          desiredReplicationCount: 1,
        },
        {
          id: "NYC1",
          desiredReplicationCount: 2,
        },
      ],
    },
  });
  data.append("pinataOptions", pinataOptions);

  return axios
    .post(url, data, {
      maxBodyLength: Infinity, //this is needed to prevent axios from erroring out with large files
      headers: {
        // @ts-ignore
        "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
        pinata_api_key: apiKey,
        pinata_secret_api_key: apiSecret,
      },
    })
    .then(function (response) {
      return { ipfshash: response.data.IpfsHash };
      //handle response here
    })
    .catch(function (error) {
      //handle error here

      return { error: true };
    });
};

export const pinJSONToIPFS = async (data: any) => {
  // Add and pin the metadata to IPFS
  const metadataPinned = await pinata.pinJSONToIPFS(data);
  const metadataHash = metadataPinned.IpfsHash;
  console.log(metadataHash);
  console.log(metadataHash);
  return metadataHash;
};

export const getBytes32FromIpfsHas = (hash: string) => {
  // @ts-ignore
  return "0x" + bs58.decode(hash).slice(2).toString("hex");
};

export const ipfs2multihash = (hash: string) => {
  let mh = multihashes.fromB58String(Buffer.from(hash));
  return {
    // @ts-ignore
    hashFunction: "0x" + mh.slice(0, 2).toString("hex"),
    // @ts-ignore
    digest: "0x" + mh.slice(2).toString("hex"),
    size: mh.length - 2,
  };
};

export const parseURL = (url: string) => {
  if (!url) return "";
  const str = url.substring(0, 4);

  if (str === "http") {
    return url;
  } else {
    return `https://gateway.pinata.cloud/ipfs/${url}`;
  }
};

export const extractCID = (ipfsLink: string) => {
  const cidIndex = ipfsLink.lastIndexOf("/") + 1;
  return cidIndex !== -1 ? ipfsLink.slice(cidIndex) : null;
};

export const timeout = async (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const timeSince = (date: any) => {
  let seconds = Math.floor(((new Date() as any) - date) / 1000);
  let interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + "y";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + "mo";
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + "d";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + "h";
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + "m";
  }
  return Math.floor(seconds) + "s";
};

export const getTokenSybmol = async (addr: string) => {
  async function fetchDetails() {
    const ethereum = (window as any).ethereum;
    await ethereum.request({ method: "eth_requestAccounts" });
    const provider = new ethers.JsonRpcProvider(
      "https://rpc.testnet.mantle.xyz"
    );
    const signer = provider.getSigner();
    const contract = new ethers.Contract(addr, ERC20.abi, await signer);

    try {
      const [symbol] = await Promise.all([contract.symbol()]);

      return symbol;
    } catch (error) {
      console.log("Error:", error);
    }
  }

  const symbol = await fetchDetails();

  return symbol;
};