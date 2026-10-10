"use client";
import Image from "next/image";
import Link from "next/link";

const Text = () => {
    return (
        <div className="flex gap-5 flex-col items-start max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-700">
            <span className="text-xs uppercase font-bold tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                New Collection 2026
            </span>
            <h1 className="text-4xl md:text-5xl xl:text-6xl font-black text-gray-800 leading-tight tracking-tight">
                Welcome To <br /> 
                <span className="text-emerald-600 inline-block mt-1 drop-shadow-sm">Woo Store</span>
            </h1>
            <p className="text-base md:text-lg xl:text-xl text-gray-400 font-medium leading-relaxed">
                Find everything you need in one place. Discover a premium shopping experience tailored just for you, from anywhere.
            </p>
            <Link href={'#collections'} className="mt-2 py-3.5 px-8 rounded-xl font-bold text-sm xl:text-base bg-gray-900 text-white shadow-xl shadow-gray-900/10 transition-all duration-300 hover:bg-emerald-600 hover:shadow-emerald-500/20 active:scale-95 transform cursor-pointer flex items-center gap-2">
                <span>Let&apos;s Go Shopping</span>
            </Link>
        </div>
    );
};

const Home = () => {
    return (
        <section id="home" className="w-full min-h-[85vh] md:h-[90vh] px-4 md:px-12 flex flex-col md:flex-row justify-center items-center gap-12 bg-gradient-to-r from-white to-emerald-50/40 border-b border-gray-50">
            <div className="w-full max-w-6xl mx-auto flex flex-col-reverse md:flex-row justify-between items-center gap-10">
                <Text />
                
                <div className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center animate-in fade-in zoom-in-95 duration-1000 delay-200 group">
                    <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-3xl animate-pulse -z-10" />
                    
                    <div className="absolute w-[98%] h-[98%] rounded-full bg-gradient-to-tr from-emerald-600 via-transparent to-emerald-400 opacity-80 animate-[spin_8s_linear_infinite] group-hover:animate-[spin_4s_linear_infinite] transition-all" />
                    
                    <div className="relative w-[95%] h-[95%] bg-white rounded-full p-4 flex items-center justify-center overflow-hidden shadow-xl shadow-emerald-500/5">
                        <Image 
                            src="/imageForHeroSection.webp" 
                            alt="Premium Store Hero" 
                            fill
                            priority
                            sizes="(max-width: 768px) 288px, 384px"
                            className="object-contain p-6 transition-all duration-500 group-hover:scale-[1.04] transform" 
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Home;
