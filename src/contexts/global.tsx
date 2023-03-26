/* eslint-disable react-hooks/rules-of-hooks */
import { ReactNode, createContext, useState, useEffect } from "react";
import { CHAIN_ID } from "../utils/helpers/constants";
import POOL from "../utils/abi/PoolFactory.json"

//import { useCancellableQuery } from "../hooks/useCancellableQuery";
import { useRouter } from "next/router";
import { BrowserProvider, ethers } from "ethers";
import { getTokenSybmol } from "@/utils/helpers/functions";


export interface AuthContext {
  values: {};
}


export const GlobalContext = createContext<AuthContext["values"] | null>(null);

export const GlobalContextProvider = ({ children }: { children: ReactNode }) => {

  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [DAOS, setDAOS] = useState<any[] | null>(null)

  let query: any;
  // Function to any fetchprofile from metadatahash
  async function fetchProfile(cid: any) {
    const res = await fetch(
      `https://ipfs.infura.io:5001/api/v0/cat?arg=${cid}`,
      {
        method: "POST",
        headers: {
          Authorization:
            "Basic " +
            btoa(
              "2M5MWb0YnyHo9UzoPcl8m6XnQKt:cdc90170d4fa13d0325870442ff11eeb"
            ),
        },
      }
    )
    const data = await res.text()
    return JSON.parse(data)

  }



  /* Function to connect with MetaMask wallet */
  const connectWallet = async () => {
    try {
      const ethereum = (window as any).ethereum;
      await ethereum.request({ method: "eth_requestAccounts" });
      const web3Provider = new ethers.BrowserProvider(ethereum);
      /* Get the signer from the provider */
      const signer = web3Provider.getSigner();
      const address = await (await signer).getAddress();
      const oldAddress = localStorage.getItem("address");
      console.log("old address", oldAddress);
      console.log("address", address);
      if (!oldAddress) {
        localStorage.setItem("address", address);
      } else if (oldAddress !== address) {
        console.log("clearing local storage")
        localStorage.clear();
        window.location.reload();
      } else {

        setProvider(web3Provider);
        setAddress(address);
      }
      return web3Provider;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  /* Function to check if the network is the correct one */
  const checkNetwork = async (provider: BrowserProvider) => {
    try {
      const network = await provider.getNetwork();
      if (network) {
        if (network.chainId !== BigInt(CHAIN_ID)) {
          /* Switch network if the chain id doesn't correspond to Goerli Testnet Network */
          await provider.send("wallet_switchEthereumChain", [
            { chainId: "0x" + CHAIN_ID.toString(16) },
          ]);
          /* Trigger a page reload */
          window.location.reload();
        }
      }

    } catch (error: any) {
      /* This error code indicates that the chain has not been added to MetaMask */
      if (error.code === 4902) {


        await provider.send('wallet_addEthereumChain', [
          {
            chainId: '0x61',
            chainName: 'Binance Smart Chain Testnet',
            nativeCurrency: {
              name: 'BNB',
              symbol: 'bnb',
              decimals: 18,
            },
            rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
            blockExplorerUrls: ['https://testnet.bscscan.com'],
          },
        ]);

        // await provider.send("wallet_addEthereumChain", [
        //   {
        //     chainId: "0x" + CHAIN_ID.toString(16),
        //     rpcUrls: ["https://data-seed-prebsc-1-s1.binance.org:8545"],
        //   },
        // ]);

        /* Trigger a page reload */
        window.location.reload();
      } else {
        /* Throw the error */
        throw error;
      }
    }
  };


  // Check that a connected wallet is in the right network
  useEffect(() => {
    /* Check if the user connected with wallet */
    if (!(provider && address)) return;
    try {
      /* Function to check if the network is the correct one */
      checkNetwork(provider);
    } catch (error: any) {
      /* Display error message */
      alert(error.message);
    }
  }, [provider, address]);

  // Function to register DAO
  async function registerDAO() {

  }

  async function fetchDAOs() {
    const ethereum = (window as any)
      .ethereum
    const provider =
      new ethers.BrowserProvider(
        ethereum
      )
    const signer = provider.getSigner()

    const Poolcontract = new ethers.Contract(process.env.NEXT_PUBLIC_POOLIFY_ADDRESS!, POOL.abi, await signer);
    const counts = await Poolcontract.daoCount();
    const count = ethers.getBigInt(counts);
    const index = Number(count.toString());


    let das = []
    for (let i = 0; i < index; i++) {

      const daos = await Poolcontract.daos(i);

      das.push([...daos, i]);
    }

    console.log(das)
    const xx = Promise.all(
      das.map(async ({ 0: owner, 1: pools, 2: cid, 3: id }: any) => {
        const res = await fetch(`https://ipfs.infura.io:5001/api/v0/cat?arg=${cid}`, {
          method: "POST",
          headers: {
            Authorization: "Basic " + btoa("2M5MWb0YnyHo9UzoPcl8m6XnQKt:cdc90170d4fa13d0325870442ff11eeb")
          }
        });
        const data = await res.text();


        const { avatar, name, token }: any = JSON.parse(data);
        const symbol = await getTokenSybmol(token)
        return {
          id,
          owner,
          pools,
          avatar,
          name,
          token,
          symbol
        };

      })
    )

    const list = await xx
    // const filtered = (await xx).filter((x) => x.name != undefined);
    // console.log(filtered)
    setDAOS(list)

  }
  //Fetch All DAOs
  useEffect(() => {


    if (!DAOS && address) {
      fetchDAOs()
    }

  },);


  // useEffect(() => {
  //   if (address) {
  //     router.push("/home")
  //   }
  // }, [address]);

  useEffect(() => {
    connectWallet()
  }, [])





  return (
    <GlobalContext.Provider
      value={{
        address,
        setAddress,
        checkNetwork,
        connectWallet,
        registerDAO,
        DAOS,
        setDAOS
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};



// const getEssences = async () => {
//   const { data } = await getEssencesByFilter({
//     variables: {
//       address: routerAddress as string,
//       // chainID: 5,
//       myAddress:
//         accessToken && address
//           ? address
//           : "0x0000000000000000000000000000000000000000",
//     },
//   });

//   setFeaturedPosts(
//     data?.address.wallet.primaryProfile.essences.edges.map(
//       (item: any) => item.node
//     ) || []
//   );

//   setIsLoading(false);
// };
