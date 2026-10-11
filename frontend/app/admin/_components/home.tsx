"use client";
import React, { useState, useEffect } from "react";
import {
    ShieldCheck,
    Mail,
    Calendar,
    Clock,
    DollarSign,
    ShoppingBag,
    Users,
    Loader2,
} from "lucide-react";

interface UserType {
    _id: string;
    name: string;
    email: string;
    admin: boolean;
    cartData: object;
    createdAt?: number;
}

interface AdminHomeProps {
    user: UserType | null;
}

interface StatsType {
    totalUsers: number;
    totalOrders: number;
    totalEarnings: number;
}

const Home = ({ user }: AdminHomeProps) => {
    const [stats, setStats] = useState<StatsType>({
        totalUsers: 0,
        totalOrders: 0,
        totalEarnings: 0,
    });
    const [loading, setLoading] = useState<boolean>(true);

    const getData = async () => {
        setLoading(true);
        const api: string = process.env.NEXT_PUBLIC_COUTER_API || "";
        if (!api) {
            setLoading(false);
            return;
        }
        try {
            const res = await fetch(api, {
                method: "GET",
                credentials: "include",
            });
            const result = await res.json();
            if (res.ok && result.success) {
                setStats(result.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getData();
    }, []);

    return (
        <div className="w-full flex flex-col gap-6 animate-in fade-in duration-200">
            <div className="flex flex-col gap-1 mt-2 md:mt-0">
                <h2 className="text-xl md:text-2xl font-extrabold text-gray-800 tracking-tight">
                    Overview Dashboard
                </h2>
                <p className="text-xs text-gray-400">
                    Live configuration and main supervisor metadata.
                </p>
            </div>

            <div className="w-full bg-white border border-gray-100 shadow-sm rounded-2xl p-4 md:p-6 flex flex-col md:flex-row gap-6 items-center">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500 text-emerald-500 text-2xl md:text-3xl font-black flex items-center justify-center shrink-0">
                    {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
                </div>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-50 text-gray-500 rounded-lg">
                            <ShieldCheck size={14} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                                Manager Name
                            </span>
                            <span className="text-xs font-bold text-gray-700">
                                {user?.name || "Admin Supervisor"}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-50 text-gray-500 rounded-lg">
                            <Mail size={14} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                                Secure Email
                            </span>
                            <span className="text-xs font-bold text-gray-700 break-all text-[11px] sm:text-xs">
                                {user?.email || "admin@admin.admin"}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-50 text-gray-500 rounded-lg">
                            <Calendar size={14} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                                Created At
                            </span>
                            <span className="text-xs font-bold text-gray-700">
                                {user?.createdAt
                                    ? new Date(user.createdAt).toLocaleDateString("en-EG", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                    })
                                    : "October 10, 2026"}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-50 text-gray-500 rounded-lg">
                            <Clock size={14} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                                Creation Time
                            </span>
                            <span className="text-xs font-bold text-emerald-600">
                                {user?.createdAt
                                    ? new Date(user.createdAt).toLocaleTimeString("en-EG", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })
                                    : "05:20 PM"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="w-full py-16 flex justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-600 font-bold" />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full pb-4">
                    <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between gap-4 group hover:border-emerald-500/20 hover:shadow-md transition-all duration-200">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">
                                Total Revenue
                            </span>
                            <span className="text-lg font-black text-gray-800">
                                {stats.totalEarnings}.00{" "}
                                <span className="text-xs font-bold text-emerald-600">EGP</span>
                            </span>
                        </div>
                        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-105 transition-transform">
                            <DollarSign size={18} />
                        </div>
                    </div>

                    <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between gap-4 group hover:border-blue-50 text-gray-700 hover:shadow-md transition-all duration-200">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">
                                Total Orders
                            </span>
                            <span className="text-lg font-black text-gray-800">
                                {stats.totalOrders}{" "}
                                <span className="text-xs font-bold text-gray-400">Orders</span>
                            </span>
                        </div>
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-105 transition-transform">
                            <ShoppingBag size={18} />
                        </div>
                    </div>

                    <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between gap-4 group hover:border-purple-50 text-gray-700 hover:shadow-md transition-all duration-200">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">
                                Active Users
                            </span>
                            <span className="text-lg font-black text-gray-800">
                                {stats.totalUsers}{" "}
                                <span className="text-xs font-bold text-gray-400">Clients</span>
                            </span>
                        </div>
                        <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl group-hover:scale-105 transition-transform">
                            <Users size={18} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
