import React from 'react';
import { GrStatusGood } from "react-icons/gr"

const Features = () => {
    return (
        <div className='py-20'>
            <div className="xl:grid grid-cols-8 items-center flex flex-col justify-center">
                <div className="col-span-4 py-4 xl:my-0">
                    <div className="text-center space-y-1 my-10">
                        <h1 className="xl:text-6xl text-4xl">How does it work?</h1>
                        <p className="font-light md:text-md text-sm">Well, it's as easy as signup, engage, receive</p>
                    </div>
                </div>
                <div className="col-span-4">
                    <div className="space-y-10 ">
                        <div className="flex gap-5 items-center xl:items-start ">
                            <div className="icon ">
                                <GrStatusGood className='xl:text-5xl text-2xl bg-white rounded-full text-green-500' />
                            </div>
                            <div className="space-y-2">
                                <div className="title">
                                    <h1 className="font-bold xl:text-4xl text-2xl">Sign up easy</h1>
                                </div>
                                <div className="body">
                                    <p className="font-light">Create an account in just a few seconds using your phone number</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-5 items-center xl:items-start">
                            <div className="icon ">
                                <GrStatusGood className='xl:text-5xl text-2xl bg-white rounded-full text-green-500' />
                            </div>
                            <div className="space-y-2">
                                <div className="title">
                                    <h1 className="font-bold xl:text-4xl text-2xl">Engage automatically</h1>
                                </div>
                                <div className="body">
                                    <p className="font-light">Users are notified whenever a request is initiated on the marketplace</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-5 items-center xl:items-start">
                            <div className="icon ">
                                <GrStatusGood className='xl:text-5xl text-2xl bg-white rounded-full text-green-500' />
                            </div>
                            <div className="space-y-2">
                                <div className="title">
                                    <h1 className="font-bold xl:text-4xl text-2xl">Receive anywhere</h1>
                                </div>
                                <div className="body">
                                    <p className="font-light">Update and receive payments on your delivery accounts after successful transactions</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Features;