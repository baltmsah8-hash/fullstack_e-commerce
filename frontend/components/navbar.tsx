"use client";
import { Menu, ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useContext } from "react";
import { CartContext } from "@/context/cartContext";
import CartModal from "./cart";
import { getUserData } from "@/services/auth";

const MainNavbar = () => {
    const myarr: string[][] = [ 
        ['Home', 'Collections', 'About', 'Contact'], 
        ["Men", "Women", "Kids", "Technologies"]
    ];

    const pathname = usePathname();
    const router = useRouter();
    const [num, setNum] = useState<number>(0);
    const [display, setDisplay] = useState<boolean>(false);
    const [cartOpen, setCartOpen] = useState<boolean>(false);

    const context = useContext(CartContext);
    const cartItems = context ? context.cartItems : [];

    const handelUserPath = async () => {
        try {
            const user = await getUserData();

            if (user?.admin) {
                router.push('/admin');
            } else if (!user?.admin) {
                router.push('/profile');
            } else {
                router.push("/login");
            }
        } catch (error) {
            console.error("Navigation error:", error);
            router.push("/login");
        }
    };

    const productNum = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    useEffect(() => {
        const width = window.innerWidth;
        if (width >= 768) {
            setDisplay(true);
        } else {
            setDisplay(false);
        }
    }, []);

    useEffect(() => {
        setNum(0);
    }, [pathname]);

    const isHome = pathname === '/';

    if (pathname != '/admin') {
        return (
            <nav className="w-full px-4 py-7 flex flex-row justify-between items-center 
            bg-white shadow-md shadow-emerald-400/10 sticky top-0 z-50 border-b border-gray-50">
                <div className="h-full flex gap-6 flex-row items-center max-md:flex-row-reverse">
                    <h1 className="text-3xl font-bold">
                        <span className="text-emerald-600 text-4xl">Woo</span> Store
                    </h1>
                { 
                pathname == '/' || pathname == '/products' ?
                    <div className="relative">
                        <Menu 
                            className="hidden cursor-pointer max-md:block text-gray-700" 
                            onClick={() => setDisplay(!display)} />
                        <ul className={`flex md:flex-row gap-6 
                            ${display ? "block" : "hidden"} 
                            max-md:flex-col max-md:gap-4 max-md:text-left
                            max-md:absolute max-md:top-full max-md:left-0 
                            max-md:mt-4 max-md:w-48 max-md:p-4 max-md:rounded-lg 
                            max-md:bg-white max-md:text-gray-800 max-md:shadow-lg max-md:border 
                            max-md:border-gray-100`} >
                            {
                                (pathname === '/' ? myarr[0] : myarr[1]).map((el: string, index: number) => {
                                    const isActive = num === index;
    
                                    return (
                                        <li 
                                            key={index} 
                                            onClick={() => {
                                                setNum(index);
                                                if (window.innerWidth < 768) setDisplay(false);
                                            }}
                                            className={`text-base font-medium text-gray-400 cursor-pointer
                                            transition-all duration-200 pb-1 border-b-emerald-600
                                            ${isActive ? "text-gray-950 font-semibold border-b-2" : ""}
                                            hover:text-gray-950`}
                                        >
                                            {el === 'Home' && !isHome ? (
                                                <Link href="/">Home</Link>
                                            ) : (
                                                <Link href={`#${el.toLowerCase()}`}>{el}</Link>
                                            )}
                                        </li>
                                    );
                                })
                            }
                        </ul>
                    </div>
                    : null
                }
                </div>
                <div className="flex flex-row gap-5 items-center">
                    <div 
                    className="relative p-1 cursor-pointer group"
                    onClick={() => setCartOpen(!cartOpen)}>
                        <ShoppingCart className="transition-all duration-150 hover:text-emerald-600 max-md:text-3xl text-gray-700" />
                        <span className={`${productNum === 0 ? "hidden" : "flex"} absolute -top-1.5 -right-1.5 
                        w-5 h-5 items-center justify-center rounded-full
                        bg-red-600 text-[10px] font-bold text-white shadow-sm shadow-red-200`}
                        >
                            {productNum || 0}
                        </span>
                    </div>
                    <button onClick={handelUserPath} className="p-1.5 border border-gray-200 rounded-full text-gray-700
                    transition-all duration-200 hover:text-emerald-600 hover:border-emerald-600">
                        <User size={20} />
                    </button>
                </div>
                <CartModal isOpen={cartOpen} onClose={() => setCartOpen(false)} />
            </nav>
        );
    }
};

export default MainNavbar;
