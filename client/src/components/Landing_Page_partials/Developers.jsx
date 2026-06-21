import Image from "next/image";
import { FaGithub, FaLinkedin, FaLink } from "react-icons/fa";

function TeamSection() {
    // Define team members
    const teamMembers = [
        {
            id: 1,
            src: "/img/landing_page_images/kartikey.jpeg",
            title: "Kartikey Agarwal",
            linkedinUrl: "https://www.linkedin.com/in/kartikey-agarwal-48769b31b/",
            githubUrl: "https://github.com/Gewissen65",
        },
        {
            id: 2,
            src: "/img/landing_page_images/anu.jpg",
            title: "Anushka Nim",
            linkedinUrl: "https://www.linkedin.com/in/anushka-nim-861378332",
            githubUrl: "{https://github.com/ANUSHKAANIM",
        }
    ];

    return (
        <div>
            <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-800">
                <br />
                <br />
                <br />
                <div className="max-w-3xl mx-auto text-center pb-12 md:pb-16">
                    <h2 className="h2 mb-4">
                        Our{" "}
                        <span className="text-[color:#B106CD]">
                            Team
                        </span>{" "}
                        
                    </h2>
                </div>

                <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-8 justify-center">
                    {teamMembers.map((member) => (
                        <div key={member.id} className="flex flex-col items-center text-center">
                            <div className="flex-shrink-0">
                                <Image
                                    className="rounded-lg shadow-md w-64 h-64 object-cover"
                                    src={member.src}
                                    alt={member.title}
                                    width={250}
                                    height={250}
                                />
                            </div>
                            <div className="mt-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    {member.title}
                                </h3>
                                <p className="mt-2 text-base text-gray-500">
                                    {member.role}
                                </p>
                            </div>
                            <div className="mt-4 flex space-x-3">
                                {member.githubUrl && (
                                    <a
                                        href={member.githubUrl}
                                        className="text-gray-500 hover:text-[color:#B106CD] transition-all ease-in-out"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <span className="sr-only">GitHub</span>
                                        <FaGithub className="h-6 w-6" />
                                    </a>
                                )}
                                {member.linkedinUrl && (
                                    <a
                                        href={member.linkedinUrl}
                                        className="text-gray-500 hover:text-[color:#B106CD] transition-all ease-in-out"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <span className="sr-only">LinkedIn</span>
                                        <FaLinkedin className="h-6 w-6" />
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Section */}
                <footer className="mt-16 border-t border-gray-800 pt-8">
                    <div className="text-center text-gray-500">
                        <p>&copy; 2024 NEXA. All rights reserved.</p>
                        <div className="flex justify-center space-x-4 mt-4">
                            <a href="https://github.com/ANUSHKAANIM" target="_blank" rel="noopener noreferrer">
                                <FaGithub className="h-6 w-6 hover:text-[color:#B106CD] transition-all ease-in-out" />
                            </a>
                            <a href="https://www.linkedin.com/in/anushka-nim-861378332" target="_blank" rel="noopener noreferrer">
                                <FaLinkedin className="h-6 w-6 hover:text-[color:#B106CD] transition-all ease-in-out" />
                            </a>
                            
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}

export default TeamSection;
