function HeroHome() {
    return (
        <section className="">
            <br />
            <br />
            <br />
            <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
                {/* Hero content */}
                <div className="relative pt-32 pb-10 md:pt-40 md:pb-16">
                    {/* Section header */}
                    <div className="max-w-3xl mx-auto text-center pb-12 md:pb-16">
                        <h1 className="h1 m-2">
                            {"<"}
                            <span className="text-[color:#B106CD]">
                                NEXA
                            </span>
                            {">"}
                            <p className="mt-3 text-5xl text-gray-500">
                                {"Event Management"}
                            </p>
                        </h1>
                        <p className="text-2xl text-gray-500 mb-8">
                            "Making Events Easy: From Registration to Tickets, All in One Place"
                        </p>

                        {/* Images Section with Hover Effects */}
                        <div className="flex justify-center space-x-4 mb-8">
                            <img
                                src="https://images.unsplash.com/photo-1531058020387-3be344556be6?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                alt="Event Image 1"
                                className="w-32 h-32 object-cover rounded-md transform transition-transform duration-300 hover:scale-105 hover:brightness-110"
                            />
                            <img
                                src="https://images.unsplash.com/photo-1522158637959-30385a09e0da?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                alt="Event Image 2"
                                className="w-32 h-32 object-cover rounded-md transform transition-transform duration-300 hover:scale-105 hover:brightness-110"
                            />
                            <img
                                src="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=2012&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                alt="Event Image 3"
                                className="w-32 h-32 object-cover rounded-md transform transition-transform duration-300 hover:scale-105 hover:brightness-110"
                            />
                        </div>

                        {/* Buttons Section */}
                        <div className="max-w-xs mx-auto sm:max-w-none sm:flex sm:justify-center">
                            <div>
                                <a
                                    href="/users/signin"
                                    className="btn text-white bg-[color:#B106CD] hover:bg-[color:#5400D1] w-full mb-4 sm:w-auto sm:mb-0"
                                >
                                    Signin
                                </a>
                            </div>
                            <div>
                                <a
                                    className="btn text-white bg-gray-700 hover:bg-gray-800 w-full sm:w-auto sm:ml-4"
                                    href="/users/signup"
                                >
                                    Signup
                                </a>
                            </div>
                            <div>
                                <a
                                    className="btn text-white bg-[color:#B106CD] hover:bg-[color:#5400D1] w-full sm:w-auto sm:ml-4"
                                    href="/admin/auth"
                                >
                                    Admin
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default HeroHome;
