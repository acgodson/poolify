import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Card from '../Components/Card';
import Features from '../Components/Features';
import { Box, Text, Button, Center, Flex, FormControl, FormLabel, Heading, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spinner, useDisclosure, useToast, VStack } from '@chakra-ui/react';
import Navbar from '@/Components/Layout/Navbar';
import { FaGlobeAfrica } from 'react-icons/fa';
import { GlobalContext } from '@/contexts/global';
import { BsCheckCircle } from 'react-icons/bs';
import { NumericFormat } from 'react-number-format';
import { ethers } from "ethers";
import { pinJSONToIPFS } from '@/utils/helpers/functions';
import ERC20 from "../utils/abi/ERC20.json"
import POOL from "../utils/abi/PoolFactory.json"
import WBIT from "../utils/abi/WBIT9.json"
import bs58 from "bs58";
import BigNumber from 'bignumber.js';


interface WalletObjectType {
    symbol: string,
    balance: string
}


const Home = () => {
    const { connectWallet, address }: any = useContext(GlobalContext);
    const [avatarUrl, setAvatarUrl] = useState("https://pbs.twimg.com/profile_images/1524805339417350145/xdXKjnJe_400x400.png");
    const [pairSymbol, setPairSymbol] = useState<string | null>(null);
    // const [tokenSymbol, setTokenSymbol] = useState<string | null>(null)
    const [price, setPrice] = useState<bigint | null>(null);
    const [balance, setBalance] = useState("");
    const [name, setName] = useState("Dreampiper")
    const { isOpen, } = useDisclosure();
    const [openModal, setOpenModal] = useState(false);
    const [tokenAddress, setTokenAddress] = useState<string>("0x69AC69b272f96F5f17DDD9da3832ad9Dc86D1d8A"); //WBIT for demo replace with yours
    const [fetching, setFetching] = useState(false);
    const [walletObject, setWalletObject] = useState<WalletObjectType | null>(null)
    const [deposit, setDeposit] = useState<string>("0.00");
    const [pairAddress, setPairAddress] = useState("0xdEAddEaDdeadDEadDEADDEAddEADDEAddead1111")
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [creating, setCreating] = useState(false);
    const [allowCreate, setAllowCreate] = useState(false);
    const [gettingPrice, setGettingPrice] = useState(false);
    const [waiting, setWaiting] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [registering, setRegistering] = useState(false);
    const [creatingPool, setCreatingPool] = useState(false);
    const toast = useToast()
    const handleCreate = () => setCreating(!creating);
    function onClose() {
        setOpenModal(false)
    }


    useEffect(() => {
        function handleMouseMove(e: any) {
            setMousePos({ x: e.clientX, y: e.clientY });
        }

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    useEffect(() => {

        if (creating) {
            //Check if wallet is there
            if (address) {
                //open creating modal
                setOpenModal(true)

            } else {
                setCreating(false);
                toast({
                    title: "Check you wallet to sign in",
                    status: "info",
                    duration: 9300,
                });
                //connect walet first
                connectWallet();
            }
        }
    }, [address, creating, connectWallet]);


    const handleBlur = async () => {
        if (tokenAddress.trim() !== "") {
            setFetching(true)
        } else {
            setFetching(false);
        }
    }

    // const getEstimates = async (provider: any, tx: any) => {
    //     return {
    //         totalCost: await provider.getGasPrice(tx),
    //     }
    // }

    const handleBlur2 = async () => {
        const ethereum = (window as any).ethereum;
        await ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.JsonRpcProvider("https://rpc.testnet.mantle.xyz");
        const depositAmountr = ethers.parseEther("200");
        const signer = provider.getSigner();
        const hash = "QmSB2oPuVjpFkRKbwT2RPY7SFtVaDU785uNjVRhcrE4jm8"
        const bytes = bs58.decode(hash);
        const rawBytes = bytes.slice(2);
        const bytes32String = '0x' + Buffer.from(rawBytes).toString('hex').padStart(64, '0');
        console.log(pairAddress);
        const tokenAContract: any = new ethers.Contract(pairAddress, ERC20.abi, await signer);
        console.log(process.env.NEXT_PUBLIC_POOLIFY_ADDRESS)
        try {
            const [symbol] = await Promise.all([
                tokenAContract.symbol(),
            ]);
            if (symbol) {
                console.log(symbol)
                setPairSymbol(symbol);
                setAllowCreate(true);
            }
        } catch (error) {
            console.log('Error:', error);
            setGettingPrice(false)
        }
    }

    useEffect(() => {
        async function fetchDetails() {
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



                // if (balance) {
                setWalletObject({
                    symbol,
                    balance: balance
                })
                console.log("balance", balance);
                const bal = ethers.formatUnits(balance, 18);
                setBalance(parseInt(bal).toFixed(2))
                // 
                setFetching(false)
            } catch (error) {
                console.log('Error:', error);
            }
        }
        if (fetching) {
            fetchDetails()
        }
    }, [fetching])




    async function handleSubmit() {
        setSubmitting(true)
        try {
            const date = new Date();
            const metdata = {
                avatar: avatarUrl,
                name: name,
                token: tokenAddress,
                creaed: date.toDateString()
            }
            const ipfsHash = await pinJSONToIPFS(metdata)
            if (ipfsHash) {

                //Register DAO
                const ethereum = (window as any).ethereum;
                await ethereum.request({ method: "eth_requestAccounts" });
                const provider = new ethers.BrowserProvider(ethereum);
                const signer = provider.getSigner()

                const Tokencontract = new ethers.Contract(tokenAddress, WBIT.abi, await signer);
                const Poolcontract = new ethers.Contract(process.env.NEXT_PUBLIC_POOLIFY_ADDRESS!, POOL.abi, await signer);

                // Get Allowance
                const allowance = parseInt(deposit);
                const check = ethers.parseEther(allowance.toString());
                const tx = await Tokencontract.approve(process.env.NEXT_PUBLIC_POOLIFY_ADDRESS, check);
                setWaiting(true);
                await tx.wait();
                console.log("allowance given", tx);
                setWaiting(false);

                // //Register DAO
                const tx2 = await Poolcontract.registerDAO(ipfsHash);
                setRegistering(true);
                await tx.wait();
                setRegistering(false);
                console.log("DAO registerd", tx);
                // //Retrieve]DAO index
                setCreatingPool(true)
                const daoCount = await Poolcontract.daoCount();
                const count = ethers.getBigInt(daoCount);
                const index = Number(count.toString());
                const lastDaoIndex = index - 1;
                const lastDao = await Poolcontract.daos(lastDaoIndex);
                console.log(lastDao);

                //FetchPair Price from redstone oracle
                const getExchangeRatePrice = async () => {
                    const tokenResponse = await fetch(`https://api.redstone.finance/prices/?symbol=BIT&provider=redstone&limit=1`);
                    const tokenData = await tokenResponse.json();
                    const tokenPrice = tokenData[0].value;
                    if (tokenPrice) {
                        const pairResponse = await fetch(`https://api.redstone.finance/prices/?symbol=ETH&provider=redstone&limit=1`);
                        const pairData = await pairResponse.json();
                        const pairPrice = await pairData[0].value;
                        if (pairPrice) {
                            const exchangeRatePrice = tokenPrice / pairPrice
                            console.log("exchange rate", exchangeRatePrice);
                            return exchangeRatePrice;
                        }
                    }
                };

                getExchangeRatePrice().then(async (result) => {


                    console.log("result to be changed", result);
                    const multiplier = new BigNumber('10').pow(18);
                    const bigIntValue = new BigNumber(result!).times(multiplier).integerValue(BigNumber.ROUND_DOWN).toFixed();
                    console.log("big int", BigInt(bigIntValue));
                    const bigN = BigInt(bigIntValue)
                    //Create single asset Pool
                    const tx3 = await Poolcontract.createSingleAssetPool(
                        lastDaoIndex,
                        tokenAddress,
                        pairAddress,
                        bigN,
                        ethers.parseEther(deposit)
                    );
                    await tx3.wait();
                    setCreatingPool(false)
                    toast({
                        title: "Success",
                        description: `New DAOr registered and ${walletObject?.symbol} asset pool added`,
                        status: "success",
                        duration: 4000,
                    })
                    setSubmitting(false)
                }).catch(error => console.error(error));
            }
        } catch (e) {
            console.log(e)
            setSubmitting(false);
            setWaiting(false);
            setRegistering(false);
            setCreating(false)
        }
    }




    return (
        <Box className='general'
            w="100%"
            animation="move 30s linear infinite"


            sx={{
                overflowX: "hidden",
                // animation: "move-left-to-right move 30s linear infinite"
            }}
        >
            <Box
                bg="transparent"
                sx={{
                    backdropFilter: "blur(5px)",
                    overflowX: "hidden",
                }}
                style={{ overflowX: "hidden", }}>
                <Box
                    bg="whiteAlpha.400"
                    sx={{
                        position: "relative",
                        width: "100%",
                        overflowX: "hidden",

                    }}>


                    <Box className="mouse-tracker" overflowX={"hidden"}>
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
                        />

                        <Box
                            bottom={0}
                            as="img"
                            src="/circle1.png"
                            opacity={0.5}
                            h="50vh"
                            w="40%"
                            right={0}
                            zIndex={-1}
                            position={"fixed"}
                        />


                        <Box className="w-[85% ">

                            <Box className="flex flex-col xl:h-[100vh] md:h-[100vh] h-[100vh] justify-center items-center">
                                <div className='space-y-6 text-center'>
                                    <h1 className="xl:text-7xl text-3xl uppercase font-bold"><span
                                        style={{
                                            textDecoration: "line-through"
                                        }}
                                    >
                                        Amplify
                                    </span>
                                        &nbsp;
                                        <span style={{
                                            color: "green"
                                        }}>
                                            Poolify
                                        </span> your <br /> Tokens</h1>
                                    <Box

                                        fontWeight="semibold"
                                        fontSize={['lg', "lg", "xl"]}
                                        px={3}
                                    >
                                        <p className="xl:w-[70%] m-auto tracking-wider">
                                            We empower DAOs to create their own liquidity pools and drive the growth of  projects that depend on their native tokens
                                        </p>
                                    </Box>
                                    <Box
                                        w="80%"
                                        p={0}
                                        display={"flex"}
                                        zIndex={"tooltip"} position="absolute" justifyContent={"center"}

                                    >
                                        <Button
                                            py={3}
                                            h="48px"
                                            onClick={address ?
                                                handleCreate :
                                                connectWallet
                                            }
                                            background={"blackAlpha.100"}
                                            className=" hover:bg-green-500 border border-green-500 xl:px-8 xl:py-4 py-3 px-5 rounded-full"
                                        >
                                            {address ?
                                                "Register DAO" : " Get Started"
                                            }
                                        </Button>
                                        <Button
                                            py={3}
                                            h="48px"
                                            color="white"
                                            background={"green.500"}
                                            ml={3}
                                            _hover={{
                                                background: "green.700",
                                                color: "white"
                                            }}
                                            className=" hover:bg-green-500 border border-green-500 xl:px-8 xl:py-4 py-3 px-5 rounded-full"
                                        >Explore DAOs
                                        </Button>
                                    </Box>
                                </div>
                            </Box>
                        </Box>
                        <Box
                            p={0}
                            display={"center"}
                            position="relative" justifyContent={"center"}
                            minH="90vh"
                            bg="whiteAlpha.700"
                            pt={"10vh"}
                            px={2}

                        >
                            <Box className="w-[85%] "
                                pb={32} bg="white"
                            >
                                <Card />


                            </Box>

                        </Box>
                    </Box>
                </Box>
            </Box>





            <Modal isOpen={openModal} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Register DAO</ModalHeader>

                    <ModalBody>

                        <FormControl>
                            <FormLabel>Avatar</FormLabel>
                            <Input
                                placeholder="Upload avatar image URL"
                                value={avatarUrl}
                                onChange={(e) => setAvatarUrl(e.target.value)}
                            />
                        </FormControl>
                        <br />

                        <FormControl>
                            <FormLabel>
                                Name of organization
                            </FormLabel>
                            <Input
                                type="text"
                                placeholder="eg. dreampiper"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </FormControl>

                        <br />
                        <FormControl>
                            <FormLabel>
                                <Flex align={"center"} justifyContent="space-between">
                                    <Box>
                                        <Flex alignItems={"center"}>      Default Token address

                                            {walletObject && (
                                                <Box ml={1}>
                                                    <BsCheckCircle color="green" />
                                                </Box>
                                            )}
                                        </Flex>
                                    </Box>
                                    <Box>
                                        {walletObject?.symbol}
                                    </Box>
                                </Flex>

                            </FormLabel>
                            <Input
                                type="text"
                                placeholder="Enter your erc20 token address"
                                value={tokenAddress!}
                                onChange={(e) => setTokenAddress(e.target.value)}
                                onBlur={handleBlur}

                            />
                        </FormControl>
                        {
                            fetching && (
                                <Box py={12}>
                                    <Center>
                                        <Spinner />
                                    </Center>
                                </Box>
                            )
                        }


                        {!fetching && walletObject && (
                            <VStack>
                                <Flex py={4} color="#333">
                                    <span
                                        style={{
                                            color: "red"
                                        }}
                                    > Balance: &nbsp; </span>{balance.toString()}
                                    {walletObject.symbol}
                                </Flex>

                                <FormControl bg="whitesmoke" px={3} py={6}>
                                    <FormLabel>
                                        <Flex align={"center"} justifyContent="space-between">
                                            <Text>   Stake</Text>
                                            <Button
                                                bg="transparent"
                                                color="green"
                                                _hover={{
                                                    background: "transparent"
                                                }}
                                            >max</Button>
                                        </Flex>

                                    </FormLabel>
                                    {/* //ts-ignore */}
                                    <NumericFormat
                                        value={deposit}
                                        style={{
                                            height: "45px",
                                            border: "1px solid gray",
                                            padding: 3,
                                            borderRadius: "12px",
                                            width: "100%"

                                        }}
                                        thousandSeparator={true}
                                        decimalScale={18}
                                        allowNegative={false}
                                        onValueChange={(values) => setDeposit(values.value)}
                                        placeholder="0.00"
                                    />

                                </FormControl>

                                <br />
                                <FormControl>
                                    <FormLabel>
                                        <Flex align={"center"} justifyContent="space-between">
                                            <Box>
                                                <Flex alignItems={"center"}>      Default Pair address

                                                    <Box ml={1}>
                                                        <BsCheckCircle color="green" />
                                                    </Box>
                                                </Flex>
                                            </Box>
                                            <Box>
                                                {pairSymbol}
                                            </Box>
                                        </Flex>

                                    </FormLabel>
                                    <Input
                                        type="text"
                                        placeholder="Enter your erc20 token address"
                                        value={pairAddress!}
                                        onChange={(e) => setPairAddress(e.target.value)}
                                        onBlur={handleBlur2}


                                    />
                                </FormControl>


                            </VStack>

                        )}


                    </ModalBody>
                    <ModalFooter w="100%">
                        <Button

                            w={waiting || submitting || registering || creatingPool ? "100%" : "50%"}
                            disabled={!pairSymbol ? true : false}
                            colorScheme={!pairSymbol ? "ghost" : "green"}
                            h="55px"
                            mr={3} onClick={
                                !pairSymbol ? () => { } : handleSubmit

                            }>
                            {

                                waiting ? <>
                                    <Spinner mr={2} />
                                    Approving
                                </>
                                    :
                                    registering ?

                                        <>
                                            <Spinner mr={2} />
                                            Creating DAO
                                        </> :

                                        creatingPool ?
                                            <>
                                                <Spinner mr={2} />
                                                Adding New Pool"
                                            </>
                                            :


                                            submitting ? <Spinner mr={2} /> :
                                                "SUBMIT"
                            }

                        </Button>
                        {!waiting || !submitting || !creatingPool || !registering && (
                            <Button
                                h="55px"
                                w="50%" onClick={onClose}>Cancel</Button>
                        )}
                    </ModalFooter>
                </ModalContent>
            </Modal>

        </Box>
    );
};


export default Home;

