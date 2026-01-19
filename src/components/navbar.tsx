"use client";

import { getBrandConfig } from "@/lib/brand-config";
import { usePathname } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import logo from '@/../public/images/logo/devizurLogo.svg'
export function Navbar() {
    const config = getBrandConfig();
    const pathname = usePathname();
    const [activeLink, setActiveLink] = useState('Home');
    const { navContent  } = config.content;
 
    if (pathname === "/brands") return null;
 
    return (

        <>
            <nav className="w-full h-24 px-8 md:px-16 flex items-center justify-between z-50 absolute   top-0 ">
                {/* Logo: DEV [Yellow Box with Star] ZUR */}
                <div className="">

                    <Image src={logo} alt="Logo" width={98} height={32} />

                </div>

                {/* Navigation Links */}
                <ul className="hidden lg:flex items-center space-x-10">
  

                    {config.navItems.map((item) => (
                        <li key={item.href}>
                            <button
                                onClick={() => setActiveLink(item.label)}
                                className={`relative text-[14px] font-medium transition-colors duration-300 ${activeLink === item.label ? 'text-primary-1' : 'text-gray-300 hover:text-white'
                                    }`}
                            >
                                {item.label}
                                {activeLink === item.label && (
                                    <div className="absolute -bottom-1.5 left-0 right-0 h-[1.5px] bg-primary-1 flex justify-between items-center px-0">
                                        <div className="w-1 h-1 bg-primary-1 rotate-45 -ml-0.5"></div>
                                        <div className="w-1 h-1 bg-primary-1 rotate-45 -mr-0.5"></div>
                                    </div>
                                )}
                            </button>
                        </li>
                    ))}
                </ul>

                {/* Action Buttons */}
                <div className="flex items-center space-x-6">
                    <button className="hidden md:block px-6 py-2 border bg-primary-1/10 border-primary-1 text-primary-1 text-sm font-semibold rounded-full hover:bg-primary-1 hover:text-black transition-all duration-300">
                        {navContent.bookings}
                    </button>
                    <div className="relative cursor-pointer group">
                        <div className="w-10 h-10 border-2 border-primary-1 rounded-xl flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5 text-primary-1" strokeWidth={2.5} />
                        </div>
                        <span className="absolute -top-1.5 -right-1.5 bg-primary-1 text-black text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-[#05080d]">
                            2
                        </span>
                    </div>
                </div>
            </nav>
         
        </>
    );
}
