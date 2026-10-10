"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, Send, MessageCircle, Mail, Phone, MapPin } from "lucide-react";

function Footer() {
    const currentYear = new Date().getFullYear();
    const path = usePathname();

    if (path != '/admin') {
        return (
            <footer className="w-full bg-gray-900 text-gray-300 pt-16 pb-8 px-4 md:px-8 border-t border-gray-800">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
                    <div className="flex flex-col gap-4 text-center md:text-left">
                        <h3 className="text-2xl font-extrabold text-white tracking-tight">
                            Woo <span className="text-emerald-500">Store</span>
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Your premium destination for high-quality fashion, technology, and everyday essentials. Shop with joy and safety.
                        </p>
                        <div className="flex justify-center md:justify-start gap-4 mt-2">
                            <a href="#" className="p-2 bg-gray-800 rounded-lg text-gray-400 hover:text-emerald-400 hover:bg-gray-700 transition-colors">
                                <Globe size={18} />
                            </a>
                            <a href="#" className="p-2 bg-gray-800 rounded-lg text-gray-400 hover:text-emerald-400 hover:bg-gray-700 transition-colors">
                                <Send size={18} />
                            </a>
                            <a href="#" className="p-2 bg-gray-800 rounded-lg text-gray-400 hover:text-emerald-400 hover:bg-gray-700 transition-colors">
                                <MessageCircle size={18} />
                            </a>
                        </div>
                    </div>
    
                    <div className="flex flex-col gap-4 text-center md:text-left">
                        <h4 className="text-white font-bold text-base tracking-wide border-b border-gray-800 pb-2">
                            Quick Links
                        </h4>
                        <ul className="flex flex-col gap-2.5 text-sm">
                            <li>
                                <Link href="/" className="hover:text-emerald-400 transition-colors">Home</Link>
                            </li>
                            <li>
                                <Link href="/all-products" className="hover:text-emerald-400 transition-colors">Shop All</Link>
                            </li>
                            <li>
                                <Link href="/about" className="hover:text-emerald-400 transition-colors">Our Story</Link>
                            </li>
                        </ul>
                    </div>
    
                    <div className="flex flex-col gap-4 text-center md:text-left">
                        <h4 className="text-white font-bold text-base tracking-wide border-b border-gray-800 pb-2">
                            Categories
                        </h4>
                        <ul className="flex flex-col gap-2.5 text-sm">
                            <li><a href="#" className="hover:text-emerald-400 transition-colors">Men&apos;s Fashion</a></li>
                            <li><a href="#" className="hover:text-emerald-400 transition-colors">Women&apos;s Clothing</a></li>
                            <li><a href="#" className="hover:text-emerald-400 transition-colors">Smart Technologies</a></li>
                            <li><a href="#" className="hover:text-emerald-400 transition-colors">Kids Corner</a></li>
                        </ul>
                    </div>
    
                    <div className="flex flex-col gap-4 text-center md:text-left">
                        <h4 className="text-white font-bold text-base 
                        tracking-wide border-b border-gray-800 pb-2">
                            Contact Info
                        </h4>
                        <ul className="flex flex-col gap-3 text-sm items-center md:items-start">
                            <li className="flex items-center gap-2.5 text-gray-400">
                                <MapPin size={16} className="text-emerald-500 shrink-0" />
                                <span>Cairo, Egypt</span>
                            </li>
                            <li className="flex items-center gap-2.5 text-gray-400">
                                <Phone size={16} className="text-emerald-500 shrink-0" />
                                <span>+20 123 456 7890</span>
                            </li>
                            <li className="flex items-center gap-2.5 text-gray-400">
                                <Mail size={16} className="text-emerald-500 shrink-0" />
                                <span>support@woostore.com</span>
                            </li>
                        </ul>
                    </div>
                </div>
    
                <div className="max-w-6xl mx-auto pt-8 border-t border-gray-800 
                text-center text-xs text-gray-500 
                flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p>© {currentYear} <span className="text-gray-400 font-medium">Woo Store</span>. All rights reserved.</p>
                    <p className="tracking-wide">Designed with ❤️ for premium shoppers</p>
                </div>
            </footer>
        );
    }
}  

export default Footer;