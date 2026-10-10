"use client";
import React from "react";
import Link from "next/link";
import { LayoutDashboard, PlusCircle, ShoppingBag, Users, Bell, ArrowLeft, LogOut, X, Package } from "lucide-react";

interface SidebarProps {
    activeTab: "home" | "addProduct" | "productsList" | "orders" | "users" | "notifications";
    setActiveTab: (tab: "home" | "addProduct" | "productsList" | "orders" | "users" | "notifications") => void;
    isOpen: boolean;
    onClose: () => void;
    onLogout: () => void;
    num: number;
}

const Sidebar = ({ activeTab, setActiveTab, isOpen, onClose, onLogout, num }: SidebarProps) => {
    return (
        <>
            <div
                onClick={onClose}
                className={`fixed inset-0 z-40 bg-gray-950/40 backdrop-blur-sm md:hidden transition-all duration-300 ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"
                    }`}
            />

            <aside className={`fixed md:sticky top-0 left-0 h-full w-64 bg-gray-950 text-gray-400 p-6 flex flex-col gap-6 shrink-0 border-r border-gray-800 z-50 transition-transform duration-300 md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
                }`}>
                <div className="flex items-center justify-between w-full">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                            <span className="text-emerald-500">Woo</span> Admin
                        </h1>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Control Panel</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-gray-900 text-gray-500 hover:text-white transition-colors cursor-pointer md:hidden"
                    >
                        <X size={18} />
                    </button>
                </div>

                <nav className="flex flex-col gap-2.5 flex-1 mt-4 overflow-y-auto pr-1">
                    <button
                        onClick={() => { setActiveTab("home"); onClose(); }}
                        className={`w-full px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 transition-all cursor-pointer ${activeTab === "home" ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/10" : "hover:bg-gray-900 hover:text-gray-200"
                            }`}
                    >
                        <LayoutDashboard size={16} />
                        <span>Admin Dashboard</span>
                    </button>

                    <button
                        onClick={() => { setActiveTab("addProduct"); onClose(); }}
                        className={`w-full px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 transition-all cursor-pointer ${activeTab === "addProduct" ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/10" : "hover:bg-gray-900 hover:text-gray-200"
                            }`}
                    >
                        <PlusCircle size={16} />
                        <span>Add Product</span>
                    </button>

                    <button
                        onClick={() => { setActiveTab("productsList"); onClose(); }}
                        className={`w-full px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 transition-all cursor-pointer ${activeTab === "productsList" ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/10" : "hover:bg-gray-900 hover:text-gray-200"
                            }`}
                    >
                        <ShoppingBag size={16} />
                        <span>Products List</span>
                    </button>

                    <button
                        onClick={() => { setActiveTab("orders"); onClose(); }}
                        className={`w-full px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 transition-all cursor-pointer ${activeTab === "orders" ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/10" : "hover:bg-gray-900 hover:text-gray-200"
                            }`}
                    >
                        <Package size={16} />
                        <span>Manage Orders</span>
                    </button>

                    <button
                        onClick={() => { setActiveTab("users"); onClose(); }}
                        className={`w-full px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 transition-all cursor-pointer ${activeTab === "users" ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/10" : "hover:bg-gray-900 hover:text-gray-200"
                            }`}
                    >
                        <Users size={16} />
                        <span>Manage Users</span>
                    </button>

                    <button
                        onClick={() => { setActiveTab("notifications"); onClose(); }}
                        className={`relative w-full px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 transition-all cursor-pointer ${activeTab === "notifications" ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/10" : "hover:bg-gray-900 hover:text-gray-200"
                            }`}
                    >
                            <span 
                            className={`absolute -top-1 left-2 w-5 h-5 rounded-full 
                            text-[10px] font-black text-white bg-red-600 
                            flex items-center justify-center shadow-sm animate-pulse
                            ${!num && "hidden"}`}>
                                {num}
                            </span>
                        <Bell size={16} />
                        <span>Notifications Center</span>
                    </button>
                </nav>

                <div className="flex flex-col gap-2 border-t border-gray-800 pt-4 mt-auto">
                    <Link href="/" className="flex items-center gap-2 text-xs font-semibold hover:text-white transition-colors group">
                        <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
                        <span>Back to Store</span>
                    </Link>
                    <button
                        onClick={onLogout}
                        className="w-full px-4 py-2.5 mt-1 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-50/10 text-xs font-bold flex items-center gap-3 transition-all cursor-pointer transform active:scale-95"
                    >
                        <LogOut size={16} />
                        <span>Log Out Account</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
