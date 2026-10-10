"use client";
import React from "react";
import { Menu, ShieldAlert } from "lucide-react";

interface AdminNavbarProps {
    onMenuClick: () => void;
}

const AdminNavbar = ({ onMenuClick }: AdminNavbarProps) => {
    return (
        <header className="w-full h-16 bg-gray-950 border-b border-gray-800 px-4 flex flex-row items-center justify-between sticky top-0 z-30 shadow-md md:hidden block animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
                <button 
                    onClick={onMenuClick}
                    className="p-2 -ml-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-900 transition-all cursor-pointer"
                >
                    <Menu size={20} />
                </button>
                <div className="flex flex-col">
                    <h1 className="text-sm font-black text-white tracking-tight">
                        <span className="text-emerald-500">Woo</span> Admin
                    </h1>
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Control Panel</span>
                </div>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                <ShieldAlert size={12} className="animate-pulse" />
                <span>Secure Console</span>
            </div>
        </header>
    );
};

export default AdminNavbar;
