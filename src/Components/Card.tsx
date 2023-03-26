import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Avatar, Box, Text, Button, Center, FormControl, FormLabel, Heading, HStack, Icon, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure, useToast, VStack, InputGroup, InputLeftElement, Spinner, Flex } from '@chakra-ui/react';
import { PlusSquareIcon } from '@chakra-ui/icons';
import { GlobalContext } from '@/contexts/global';
import { FaGlobeAfrica, FaPersonBooth, FaSearch } from 'react-icons/fa';
import { ethers } from "ethers";
import { NumericFormat } from 'react-number-format';
import ERC20 from "../utils/abi/ERC20.json"
import POOL from "../utils/abi/PoolFactory.json"
import WBIT from "../utils/abi/WBIT9.json"
import bs58 from "bs58";
import { getTokenSybmol, pinJSONToIPFS } from '@/utils/helpers/functions';
import { BsCheckCircle } from 'react-icons/bs';
import { useRouter } from 'next/router';
import BigNumber from "bignumber.js"

export function divideBigIntegers(a: bigint, b: bigint) {

    let quotient = BigInt(0); // Initialize quotient to 0
    let sign = BigInt(0); // Initialize sign to positive

    // Handle negative inputs
    if (a < BigInt(0)) {
        a = -a;
        sign = -sign;
    }
    if (b < BigInt(0)) {
        b = -b;
        sign = -sign;
    }

    // Compute quotient using long division method
    let remainder = BigInt(0);
    for (let i = a.toString().length - 1; i >= 0; i--) {
        let digit = BigInt(a.toString()[i]);
        let temp = remainder * BigInt(10) + digit;
        if (temp >= b) {
            remainder = temp % b;
            quotient = quotient * BigInt(10) + (temp - remainder) / b;
        } else {
            remainder = temp;
            quotient = quotient * BigInt(10);
        }
    }

    // Apply sign to quotient and return
    return sign * quotient;
}



interface WalletObjectType {
    symbol: string,
    balance: string
}

interface DAOType {
    id: number,
    avatar: string,
    name: string,
    pools: bigint,
    token: string,
    symbol: string

}

const Card = () => {
    const {
        address,
        DAOS,
        checkNetwork,
        registerDAO,
        connectWallet,
    }: any = useContext(GlobalContext);
    // const [avatarUrl, setAvatarUrl] = useState("https://pbs.twimg.com/profile_images/1635245453556998144/q88UJ_i5_400x400.jpg");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [pairSymbol, setPairSymbol] = useState<string | null>(null);
    const [price, setPrice] = useState<bigint | null>(null);
    const [balance, setBalance] = useState("");
    const [name, setName] = useState("Dreampiper")
    const { isOpen, } = useDisclosure();
    const [creating, setCreating] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [tokenAddress, setTokenAddress] = useState<string>(""); //WBIT for demo replace with yours   0x69AC69b272f96F5f17DDD9da3832ad9Dc86D1d8A
    const [fetching, setFetching] = useState(false);
    const [walletObject, setWalletObject] = useState<WalletObjectType | null>(null)
    const [deposit, setDeposit] = useState<string>("0.00");
    const [pairAddress, setPairAddress] = useState("")  //0xdEAddEaDdeadDEadDEADDEAddEADDEAddead1111
    const [gettingPrice, setGettingPrice] = useState(false);
    const [allowCreate, setAllowCreate] = useState(false);
    const [waiting, setWaiting] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [registering, setRegistering] = useState(false);
    const [creatingPool, setCreatingPool] = useState(false);
    const router = useRouter();
    const [isSticky, setIsSticky] = useState(false);
    const topNavbarRef: any = useRef();



    useLayoutEffect(() => {
        const handleScroll = () => {
            const topNavbarHeight = topNavbarRef.current.offsetHeight;
            const isScrolledPastTopNavbar = window.pageYOffset > topNavbarHeight;

            setIsSticky(isScrolledPastTopNavbar);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);


    const count = [1, 2, 3, 4]

    const handleCreate = () => setCreating(!creating);
    function onClose() {
        setOpenModal(false)
    }

    const toast = useToast();
    const tokens = [
        {
            "name": "BIT",
            "value": "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000"
        },
        {
            "name": "ETH",
            "value": "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000"
        },

    ]


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
    }, [address, creating, connectWallet])




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
        <div className=''>
            <div className="text-center space-y-1 py-16">
                <Box
                    fontWeight={"extrabold"}
                    as="h1"
                    className="xl:text-6xl text-3xl">Swap Market<span className='cursor-pointer px-3 text-white bg-green-500'>Place</span></Box>
                <br />
                <Box

                    fontSize={"xl"}
                    fontWeight="semibold"
                    color="#333"
                    className="font-light md:text-md text-sm">Swap your tokens across different pools or join any pool as a watcher to earn incentives.</Box>
            </div>

            <Box display={"flex"} justifyContent="center"
                w="100%"
                pb={0}
                py={3}
                zIndex="tooltip"
                position={isSticky ? "fixed" : "static"}
                top={isSticky ? "0" : "auto"}
                left={isSticky ? "0" : "auto"}
                ref={topNavbarRef}

                background={"White"}
                // h={isSticky ? "100vh" : "fit-content"}
                sx={{
                    backdropFilter: "blur(5px)"
                }}
            >

                <InputGroup size="lg" borderRadius="full"
                    alignItems={"center"} maxW={"400px"}
                    border="none"
                    _focus={{ border: "none" }}
                >
                    <InputLeftElement

                        textAlign={"center"}
                        pointerEvents="none"
                        children={<FaSearch color="gray.300" />}
                    />
                    <Input
                        type="text"
                        placeholder="Search DAO"
                        borderRadius="full"
                        border="2px solid whitesmoke"
                        _focus={{ border: "none" }}
                    />
                </InputGroup>
            </Box>

            <div className="grid xl:grid-cols-3 md:grid-cols-2 grid-cols-1 space-y-5 md:space-y-0 gap-5">



                <Flex
                    color="green"
                    justifyContent={"center"}
                    alignItems="center"

                >

                    <FaGlobeAfrica fontSize="md" /> <Heading pl={3} fontSize="md" as="h6">Featured DAOs</Heading>

                </Flex>


                {
                    DAOS && DAOS.map((x: DAOType, i: number) => (


                        <Box
                            key={i}
                            bg="green.300" borderRadius={"xl"}
                            w="400px"
                            h="28vh"
                            _hover={{
                                shadow: "sm",
                                opacity: "1",
                                color: "white"

                            }}
                            onClick={() => router.push(`/exchange?id=${x.id}`)}
                        >
                            <div className="bg-green.200 shadow-sm border border-gray hover:bg-green.400 cursor-pointer h-20vh flex flex-col justify-start p-3  pb-10  rounded-md">
                                <HStack
                                    h="100%"
                                    justify={"start"}
                                    align="start"

                                >

                                    <Box
                                        bg="white"
                                        rounded={"full"}
                                        h="100%"

                                        px={3}

                                    >
                                        < Box
                                            as="img"
                                            position={"absolute"}
                                            src={x.avatar}
                                            h="20vh"
                                            ml="180px"
                                            mt={-1}
                                            zIndex={0}

                                            opacity={0.05}
                                        />

                                    </Box>


                                    <Box className="icon py-0"

                                    >
                                        <Avatar
                                            h="50px"
                                            w="50px"
                                            bg="white"
                                            src={x.avatar}
                                            opacity={"0.5"}
                                        />
                                    </Box>
                                    <Heading ml={2} color="white" opacity={0.5}
                                        _hover={{
                                            opacity: "1"
                                        }}
                                    >
                                        {x.name}
                                    </Heading>
                                </HStack>


                                <HStack h="5vh" pt={12}>
                                    <VStack
                                        color="white"
                                        w="50%" h="58px">

                                        <Text>Pools</Text>
                                        <Text
                                            fontSize={"20px"}
                                            fontWeight="bold"
                                        >
                                            {Number(x.pools.toString())}
                                        </Text>
                                    </VStack>

                                    <Box
                                        h="40px"
                                        w="0.5px"

                                        bg="white"
                                    />
                                    <VStack
                                        color="white"
                                        w="50%" h="58px">

                                        <Text

                                        >Watchers</Text>
                                        <Text
                                            fontSize={"20px"}
                                            fontWeight="bold"
                                        >0</Text>
                                    </VStack>

                                    <Box
                                        h="40px"
                                        w="0.5px"

                                        bg="white"
                                    />

                                    <VStack
                                        color="white"
                                        w="50%" h="58px">

                                        <Text

                                        >Token</Text>
                                        <Text
                                            fontSize={"20px"}
                                            fontWeight="bold"
                                        >
                                            {(x.symbol)}

                                        </Text>
                                    </VStack>


                                </HStack>
                            </div>
                        </Box>

                    ))
                }

                <Flex
                    color="green"
                    justifyContent={"center"}
                    alignItems="center"

                >

                    <FaPersonBooth fontSize="md" /> <Heading pl={3} fontSize="md" as="h6">For You</Heading>

                </Flex>

                <Box bg="green.50" borderRadius={"xl"}
                    h="28vh"
                    _hover={{
                        background: "green.50"
                    }}
                    onClick={handleCreate}
                >

                    <div


                        className="bg-transparent  hover:color-green-100 cursor-pointer h-[20vh flex flex-col justify-center p-10 rounded-xl">
                        <Center>

                            <Icon
                                fontSize={"100px"}
                                color="gray.300"
                                as={PlusSquareIcon}
                            />
                        </Center>
                        <Center color="gray.400">
                            <Heading fontSize={"md"}>
                                ADD YOURS
                            </Heading>
                        </Center>


                    </div>
                </Box>




            </div>




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
                                                Adding New Pool
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




        </div >
    );
};

export default Card;




{/* <Modal isOpen={openModal} onClose={onClose}>
<ModalOverlay />
<ModalContent>
    <ModalHeader>Create DAO</ModalHeader>
    
    <ModalBody>
        <FormControl>
            <FormLabel>Select DAO</FormLabel>
            <Select
                placeholder="Select a native token"
                value={nativeToken}
                onChange={(e) => setNativeToken(e.target.value)}
            >
            </Select>
        </FormControl>
        <FormControl>
            <FormLabel>Avatar</FormLabel>
            <Input
                placeholder="Upload avatar image URL"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
            />
        </FormControl>
        <FormControl>
            <FormLabel>Name of DAO</FormLabel>
            <Input
                placeholder="Upload avatar image URL"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
            />
        </FormControl>
        <FormControl>
            <FormLabel>Native Token</FormLabel>
            <Select
                placeholder="Select a native token"
                value={nativeToken}
                onChange={(e) => setNativeToken(e.target.value)}
            >
                <option value={tokens[0].value}>{tokens[0].name}</option>


            </Select>
        </FormControl>
        <FormControl>
            <FormLabel>Pair</FormLabel>
            <Select
                placeholder="Select a pair"
                value={pair}
                onChange={(e) => setPair(e.target.value)}
            >
                <option value={tokens[1].value}>{tokens[1].name}</option>
            </Select>
        </FormControl>

        <FormControl>
            <FormLabel>
                <HStack>
                    <Text>  Balance</Text>
                    <Text>Balance: </Text>
                </HStack>


            </FormLabel>
            <Input
                type="number"
                placeholder="Enter the balance"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
            />
        </FormControl>
    </ModalBody>
    <ModalFooter>
        <Button colorScheme="blue" mr={3} onClick={handleCreate}>
            Create
        </Button>
        <Button onClick={onClose}>Cancel</Button>
    </ModalFooter>
</ModalContent>
</Modal> */}