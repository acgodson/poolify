import { GlobalContext } from '@/contexts/global';
import { Box, Button, Text, Center, Select, Spinner, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import { ethers } from 'ethers';
import { useRouter } from 'next/router';
import React, { useState, useEffect, useContext } from 'react';
import { TbArrowsSort } from "react-icons/tb"
import ERC20 from "../utils/abi/ERC20.json"
import POOL from "../utils/abi/PoolFactory.json"

const Exchange = () => {
    const [swap, setSwap] = useState<boolean>(true)
    const [watcher, setWatcher] = useState<boolean>(false)
    const [daoDetails, setDaoDetails] = useState<any | null>(null)
    const [pools, setPools] = useState<any | null>(null);
    const { address }: any = useContext(GlobalContext)
    const [selectedPool, setselectedPool] = useState<any>("");
    const [swapAmount, setSwapAmount] = useState<string>("");
    const [waiting, setWaiting] = useState<boolean>(false);
    const [swapping, setSwapping] = useState<boolean>(false)
    const router = useRouter()
    const [tokenValue, setTokenValue] = useState("");

    function handleSwap() {
        setSwap(true)
        setWatcher(false)
    }

    function handleBuy() {
        setSwap(false)
        setWatcher(true)
    }


    async function fetchDAO(id: number) {

        const poolAddress = process.env.NEXT_PUBLIC_POOLIFY_ADDRESS;
        const ethereum = (window as any).ethereum;
        await ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.JsonRpcProvider("https://rpc.testnet.mantle.xyz");
        const signer = provider.getSigner()
        const contract = new ethers.Contract(poolAddress!, POOL.abi, await signer);
        const [owner, numPools, cid] = await contract.daos(id);



        const poolCountData = await contract.poolCount();
        let pools = [];

        const count = ethers.getBigInt(poolCountData);
        const poolCount = Number(count.toString());
        console.log(poolCount);
        // convert poolcount to number


        //Fetch pol count

        for (let i = 0; i < poolCount; i++) {
            console.log(i);
            const [
                creator,
                token,
                pair,
                price,
                balance,
                active,
                arbitrageurCount,
                daoIndex
            ] = await contract.pools(i)
            pools.push({
                creator,
                token,
                pair,
                price,
                balance,
                active,
                arbitrageurCount,
                daoIndex
            });

        }


        let filteredPools = [];
        if (pools.length === poolCount) {

            for (let i = 0; i < pools.length; i++) {
                const unit = pools[i].daoIndex
                const count = ethers.getBigInt(unit);
                const daoIndex = Number(count.toString());

                if (daoIndex === id
                ) {
                    console.log("filtered", pools[i]);
                    console.log("this is matching", i)
                    const daoToken = pools[i].token;
                    const pairToken = pools[i].pair;

                    console.log("pair token", pairToken);
                    console.log("dao token", daoToken)

                    const nativeTokenDetails = await fetchTokenDetails(ethers.getAddress(daoToken), true);
                    const pairDetails = await fetchTokenDetails(ethers.getAddress(pairToken), false);
                    filteredPools.push({
                        ...pools[i],
                        poolIndex: i,
                        nativeTokenDetails,
                        pairDetails
                    });

                }
            }
            setDaoDetails(owner)
            setPools(filteredPools);
            setselectedPool(filteredPools[0])
        }
    }



    useEffect(() => {

        const { id }: any = router.query;
        if (id) {
            if (!daoDetails && address) {
                fetchDAO(parseInt(id));
            }
        }
    },);


    async function fetchTokenDetails(tokenAddress: string, native: boolean) {
        const ethereum = (window as any).ethereum;
        await ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.JsonRpcProvider("https://rpc.testnet.mantle.xyz");
        const signer = provider.getSigner()
        const contract = new ethers.Contract(tokenAddress, ERC20.abi, await signer);

        try {
            const [symbol, balance] = await Promise.all([
                contract.symbol(),
                contract.balanceOf(ethers.getAddress(address))
            ]);


            const bal = ethers.formatUnits(balance, 18);
            const balAbbr = parseInt(bal).toFixed(2);
            console.log("balance", bal);

            if (native) {
                return {
                    tokenSymbol: symbol,
                    tokenBal: bal
                }
            } else {
                return {
                    pairSymbol: symbol,
                    pairBalance: bal
                }
            }

        } catch (error) {
            console.log('Error:', error);
        }
    }



    async function swapToken() {
        //Here we'll call the swap function in our contract
        const ethereum = (window as any).ethereum;
        await ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.BrowserProvider(ethereum);
        const signer = provider.getSigner()
        const poolContractAddress = process.env.NEXT_PUBLIC_POOLIFY_ADDRESS!;
        const tokenContract = new ethers.Contract(selectedPool.pair, ERC20.abi, await signer);
        const poolContract = new ethers.Contract(poolContractAddress, POOL.abi, await signer);
        //Swap Details
        const { id }: any = router.query; //DAO ID
        const poolIndex = selectedPool.poolIndex;
        const amount = ethers.parseEther(swapAmount);
        const priceBigInt = ethers.getBigInt(selectedPool.price);
        const price = Number(priceBigInt.toString());

        //Get allowance for contract to spend pair token on behalf of the user
        const allowance = parseInt(swapAmount) * 0.25; //Added 50 to compensate for gas price, this should not be used for production

        console.log("allowance", ethers.parseEther(swapAmount))

        const tx = await tokenContract.approve(poolContractAddress, ethers.parseEther(swapAmount));
        setWaiting(true);
        await tx.wait();
        console.log("allowance given", tx);
        setWaiting(false);
        //Initiate swap afterwards
        // return;
        await poolContract.swap(Number(id), Number(poolIndex.toString()), amount, price)
    }




    // useEffect(() => {
    //     console.log(pools)
    // }, [pools])

    // useEffect(() => {
    //     console.log("seleted pool", selectedPool)
    // }, [selectedPool])


    useEffect(() => {
        function calculateTokenAmount(swap: number, rate: number) {
            // const tokenAmount = swap * rate;
            console.log("swap", swap)
            console.log("rate", rate)
            const tokenAmount = Number((swap / rate).toFixed(10));
            console.log("tokenAmount", tokenAmount)
            return tokenAmount;
        }

        if (swapAmount && selectedPool) {
            //Calulate the equivalent token to recieve based on the exchange rate or pool price
            const count = ethers.getBigInt(selectedPool.price);
            // const exchangePrice = Number(count.toString());
            const exchangePrice = ethers.formatUnits(selectedPool.price, 18);

            console.log("exchange price", exchangePrice)
            const amount = calculateTokenAmount(Number(swapAmount), Number(exchangePrice))
            setTokenValue(amount.toString())
        }


    }, [swapAmount, selectedPool])


    return (
        pools && pools.length > 0 ? (
            <Box
                // className='general'
                mt="-60px"

            >
                {/* 
            <Box
                as="img"
                src="/circle1.png"
                opacity={0.5}
                h="50vh"
                w="40%"
                top={-200}
                left={-100}
                zIndex={1}
                position={"absolute"}
            /> */}
                <Box
                    as="img"
                    src="/circle1.png"
                    opacity={0.5}
                    h="100vh"
                    w="auto"
                    top={-200}
                    right={100}

                    position={"absolute"}
                />



                <Box className='h-[85vh]'
                    background={"transparent"}
                    sx={{
                        backdropFilter: "blur(5px)"
                    }}
                    mt="100px"
                >
                    <Box


                        px={6}
                        className="flex flex-col justify-center items-center h-[85vh] w-[100%]">
                        <Box
                            h="600px"
                            // border="4px solid white"
                            bg="blackAlpha.400"
                            sx={{
                                backdropFilter: "blur(5px)"
                            }}
                            className=" border rounded-2xl  m-auto xl:w-[40%] md:w-[85%] w-[100%]">
                            <Box

                                bg="blackAlpha.700"
                                color="white"
                                sx={{
                                    backdropFilter: "blur(5px)"
                                }}
                                className="py-5 rounded-2xl">
                                <div className="flex items-center  justify-between xl:w-[80%] w-[85%] m-auto">
                                    <div className="cursor-pointer">
                                        <h1 className={swap ? " bg-green-500 xl:px-10 px-4 py-2 rounded-full" : "xl:px-10 px-4 py-2"} onClick={handleSwap}>Swap</h1>
                                    </div>
                                    <div className="cursor-pointer">
                                        <h1 className={watcher ? " bg-green-500 xl:px-10 px-4 py-2 rounded-full" : "xl:px-10 px-4 py-2"} onClick={handleBuy} >Stake</h1>
                                    </div>
                                </div>
                            </Box>

                            {swap && <div className="py-5">
                                <div className="flex flex-col items-center  justify-between space-y-5">
                                    <div className="xl:w-[80%] w-[85%]">
                                        <div className="flex items-center  justify-between ">
                                            <div className="">
                                                <Box
                                                    fontSize={"sm"}
                                                    fontWeight="bold"
                                                    pb={1}

                                                    className="">Pools</Box>
                                                {pools && pools.length > 0 ?

                                                    <Select
                                                        value={selectedPool}
                                                        onChange={(e) => setselectedPool(e.target.value)}
                                                    >
                                                        {pools.map((x: any, i: number) => (
                                                            <option
                                                                key={i}
                                                                value="">{x.pairDetails.pairSymbol}</option>
                                                        )
                                                        )}

                                                    </Select> :

                                                    <Center>
                                                        <Spinner />
                                                    </Center>


                                                }
                                            </div>
                                            <div className="">
                                                <Box
                                                    fontSize={"sm"}
                                                    fontWeight="bold"
                                                    pb={1}


                                                    className="">Balance: {selectedPool.pairDetails.pairBalance}</Box>
                                            </div>
                                        </div>
                                        <div className="py-3">
                                            <div className="bg-white rounded-full px-5">
                                                <div className="flex items-center">
                                                    <div className="">
                                                        <input

                                                            value={swapAmount}
                                                            onChange={(e) => setSwapAmount(e.target.value)}

                                                            type="text" className="py-4 outline-none  rounded-xl w-[100%] text-black" placeholder='0.0' />
                                                    </div>
                                                    <div className="flex justify-end w-[100%]">
                                                        <p className="text-black">

                                                            {selectedPool.pairDetails.pairSymbol}


                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-center">
                                        <TbArrowsSort className="text-4xl bg-green-500 p-2 rounded-full" />
                                    </div>

                                    <div className="  xl:w-[80%] w-[85%]">


                                        <div className="flex items-center  justify-between ">
                                            <div className="">

                                                <Button
                                                    isDisabled={true}
                                                    leftIcon={<Box
                                                        as="img"
                                                        src="/wbit.webp"
                                                        h="20px"
                                                        w="auto"

                                                    />}
                                                >
                                                    {/* it is assumed that the native token is the same for every daoIndex */}
                                                    {pools[0].nativeTokenDetails.tokenSymbol}

                                                </Button>
                                            </div>
                                            <div className="">
                                                <Box
                                                    fontSize={"sm"}
                                                    fontWeight="bold"
                                                    pb={1}


                                                    className="">Balance:

                                                    {pools[0].nativeTokenDetails.tokenBal}

                                                </Box>
                                            </div>
                                        </div>
                                        <div className="py-3">
                                            <div className="bg-white rounded-full px-5">
                                                <div className="flex items-center">
                                                    <div className="">
                                                        <input
                                                            value={tokenValue}
                                                            readOnly={true}
                                                            type="text" className="py-4 outline-none  rounded-xl w-[100%] text-black" placeholder='0.0' />
                                                    </div>
                                                    <div className="flex justify-end w-[100%] ">
                                                        <p className="text-black">
                                                            {pools[0].nativeTokenDetails.tokenSymbol}

                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <Box
                                        w="100%"
                                        px={12}
                                        className="">
                                        <Box
                                            as="button"
                                            w="100%"
                                            fontWeight={"bold"}
                                            fontSize="xl"
                                            onClick={swapToken}
                                            className="hover:bg-green-400 bg-green-500 border border-green-500 xl:px-12 xl:py-4 py-3 px-6 rounded-full">

                                            {waiting ?

                                                "waiting for Approval" : "Swap Now"

                                            }
                                        </Box>
                                    </Box>
                                </div>
                            </div>}


                            {watcher && <div className="py-5">
                                <div className="flex flex-col items-center  justify-between space-y-5">
                                    <div className="xl:w-[80%] w-[85%]">
                                        <div className="flex items-center  justify-between ">
                                            <div className="">
                                                <Box
                                                    fontSize={"sm"}
                                                    fontWeight="bold"
                                                    pb={1}

                                                    className="">Pools</Box>
                                                {pools && pools.length > 0 ?

                                                    <Select
                                                        value={selectedPool}
                                                        onChange={(e) => setselectedPool(e.target.value)}
                                                    >
                                                        {pools.map((x: any, i: number) => (
                                                            <option
                                                                key={i}
                                                                value="">{x.pairDetails.pairSymbol}</option>
                                                        )
                                                        )}

                                                    </Select> :

                                                    <Center>
                                                        <Spinner />
                                                    </Center>


                                                }
                                            </div>
                                            <div className="">
                                                <Box

                                                    fontSize={"sm"}
                                                    fontWeight="bold"
                                                    pb={1}

                                                    className="">Rewards: 0</Box>
                                            </div>
                                        </div>
                                        <div className="py-3">
                                            <Box as="button"
                                                w="100%"
                                                bg="blackAlpha.600"
                                                fontWeight={"bold"}
                                                _hover={{
                                                    color: "white"
                                                }}
                                                className="hover:bg-black  xl:px-12 xl:py-4 py-3 px-6 rounded-full">Claim Rewards</Box>
                                        </div>
                                    </div>



                                    <div className="  xl:w-[80%] w-[85%]">
                                        {/* Add Tabs Here */}

                                        <Tabs py={3}>
                                            <TabList
                                                _selected={{
                                                    color: "green"
                                                }}
                                            >
                                                <Tab>Watcher</Tab>
                                                <Tab>Remove Liquidity</Tab>
                                            </TabList>

                                            <TabPanels>

                                                {/* Add liquidity */}
                                                <TabPanel>
                                                    <div className="">
                                                        <Box
                                                            fontSize={"sm"}
                                                            fontWeight="bold"
                                                            pb={1}
                                                            className="">Join Pool Watchers (Add Liquidity)</Box>
                                                    </div>
                                                    <div className="py-3">
                                                        <div className="bg-white rounded-full px-5">
                                                            <div className="flex items-center">
                                                                <div className="">
                                                                    <input type="text" className="py-4 outline-none  rounded-xl w-[100%] text-black" placeholder='0.0' />
                                                                </div>
                                                                <Box as="div"
                                                                    cursor={"pointer"}
                                                                    className="flex justify-end w-[100%] ">
                                                                    <p className="text-black">{pools[0].nativeTokenDetails.tokenSymbol}</p>
                                                                </Box>

                                                            </div>

                                                        </div><Box
                                                            py={2}
                                                            color="teal"
                                                            fontWeight={"bold"}
                                                            fontSize="xs"
                                                        >Pool Share</Box>
                                                    </div>

                                                    <div className="">
                                                        <Box as="button"
                                                            w="100% ts"
                                                            fontWeight={"bold"}
                                                            className="hover:bg-green-400 bg-green-500 border border-green-500 xl:px-12 xl:py-4 py-3 px-6 rounded-full">Stake</Box>

                                                    </div>

                                                </TabPanel>

                                                <TabPanel>
                                                    {/* Remove liquidity */}
                                                    <Text fontSize="xs">
                                                        no liquidity found
                                                    </Text>
                                                </TabPanel>
                                            </TabPanels>


                                        </Tabs>


                                    </div>

                                </div>
                            </div>}
                        </Box>
                    </Box >
                </Box >
            </Box>
        ) :
            <Center minH={"100vh"}>
                <Spinner />
            </Center>
    );
};

export default Exchange;

