import { Box, Button, Flex } from '@chakra-ui/react';
import React from 'react';
import { BsDiscord } from "react-icons/bs"
import { FaStar, FaTwitter } from "react-icons/fa"


const Footer = () => {
    return (
        <Box
            w="100%"
            position="absolute"
            className='bg-[#111]'>
            <div className=" items-center flex flex-col space-y-5 justify-center m-auto w-[85%] py-20">
                <div className="space-y-4">
                    <Box color="white" className="">
                        <h1 className="font-semibold text-2xl">Stay in touch</h1>
                        <Flex className=""
                            alignItems={"center"}
                        >
                            Poolify is here to stay!
                            <Box as="span" mx={2}>
                                <FaStar color="gold" />
                            </Box>
                            our repository on github to receive updates and follow our post-hackathon progress</Flex>
                    </Box>
                    <div className="my-3">
                        <Button
                            colorScheme={"green"}
                            py={6}
                            w="100%"
                            type='submit' className='bg-green-500 hover:bg-green-400 py-3 rounded-lg'>GitHub</Button>

                    </div>
                </div>
            </div>
            <div className="m-auto w-[85%] space-y-1 xl:space-y-0 text-center">
                <div className="flex items-center xl:gap-5 gap-3 text-center py-3 justify-center">
                    <FaTwitter className="text-white xl:text-2xl" />
                    <BsDiscord className="text-white xl:text-2xl" />
                </div>

                <hr className="bg-green-500 h-[2px] xl:hidden" />
                <p className="text-white text-center uppercase font-bold pb-5">&copy;Tinybird(<span className='text-green-500'>Dreampiper</span>)</p>
            </div>
        </Box>
    );
};

export default Footer;