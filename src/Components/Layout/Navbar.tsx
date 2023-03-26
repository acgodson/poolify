import { GlobalContext } from '@/contexts/global';
import { Box, Button } from '@chakra-ui/react';
import Link from 'next/link';
import React, { useContext, useLayoutEffect, useRef, useState } from 'react';

const Navbar = () => {
    const [isSticky, setIsSticky] = useState(false);
    const { connectWallet, address }: any = useContext(GlobalContext);
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

    return (

        <Box as="nav"
            position={"fixed"}
            w="100%"
            zIndex={"tooltip"}
            top={0}
            // background={"blackAlpha.100"}
            sx={{
                backdropFilter: "blur(5px)"
            }}
            background={isSticky ? "blackAlpha.100" : "transparent"}
            ref={topNavbarRef}

        >
            <div className="m-auto w-[85%] py-1 flex items-center justify-between">
                <div className="">
                    <Box
                        // position={"absolute"}
                        zIndex={"tooltip"}
                        h="65px"
                        src="/logo.svg"
                        as="img" />
                    {/* <Link href="/">
                        <h1 className="font-bold text-md xl:text-xl md:text-md uppercase" >Street<span className='text-green-500'>Money</span></h1>
                    </Link> */}
                </div>
                <div className="">
                    {/* <Link to="/exchange"><h1 className="hidden xl:flex font-semibold text-lg tracking-wider hover:text-green-400 text-green-500"> <span className='text-white'>Ex</span>change</h1></Link> */}
                </div>
                <div className="">
                    <>
                        <Box
                            onClick={address ? () => { } : connectWallet}
                            bg="green.200"
                            as="button" className="bg-transparent hover:bg-green-500 border border-green-500 xl:px-8 xl:py-3 py-2 px-5 rounded-full">


                            {address ? "Connected" :
                                "Connect"
                            }



                        </Box>
                    </>
                </div>
            </div>
        </Box>
    );
};

export default Navbar;