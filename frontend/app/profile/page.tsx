"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User,
    Mail,
    Calendar,
    ShieldCheck,
    LogOut,
    Loader2,
    ArrowLeft,
    ShoppingBag } from "lucide-react";
import { getUserData, UserType } from "@/services/auth";

const ProfilePage = () => {
    const router = useRouter();
    const [user, setUser] = useState<UserType | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const handleLogOut = async () => {
        setLoading(true)
        const api: string = process.env.NEXT_PUBLIC_LOGOUT_API || "";
        try {
            const res = await fetch(api, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: "include"
            });

            if (res.ok) {
                router.push("/login");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        let cancelled = false;

        const loadUser = async () => {
            try {
                const myData = await getUserData();
                if (cancelled) return;

                if (myData) {
                    setUser(myData);
                } else {
                    router.push("/login");
                }
            } catch (error) {
                if (cancelled) return;
                console.error("Error during get your data:", error);
                router.push("/login");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        void loadUser();

        return () => {
            cancelled = true;
        };
    }, [router]);

    if (loading) {
        return (
            <main className="w-full min-h-screen bg-gray-50/50 flex items-center justify-center p-4">
                <div className="flex flex-col items-center gap-3 text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-emerald-600 font-bold" />
                    <p className="text-sm text-gray-400 font-medium">Verifying session, please wait...</p>
                </div>
            </main>
        );
    }

    return (
    <main className="w-full min-h-screen bg-gray-50/50 py-12 px-4 md:px-8">
        <div className="max-w-4xl mx-auto flex flex-col gap-6 animate-in fade-in duration-300">
            
            <Link href="/" className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-emerald-600 transition-colors group self-start">
                <ArrowLeft size={14} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
                <span>Back to Store</span>
            </Link>

            <div className="w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col md:flex-row">
                
                <div className="w-full md:w-1/3 bg-gray-950 p-8 flex flex-col items-center justify-center text-center gap-4 text-white">
                    <div className="w-24 h-24 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 text-4xl font-black shadow-lg shadow-emerald-500/10 animate-pulse">
                        {user?.name ? user.name.charAt(0).toUpperCase() : "W"}
                    </div>
                    <div className="flex flex-col gap-2">
                        <h2 className="text-xl font-extrabold tracking-tight text-gray-100">{user?.name || "Woo User"}</h2>
                        <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full self-center ${
                            user?.admin 
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                                : "bg-gray-800 text-gray-400"
                        }`}>
                            {user?.admin ? "Admin Dashboard" : "Premium Client"}
                        </span>
                    </div>
                </div>

                <div className="w-full md:w-2/3 p-6 md:p-8 flex flex-col justify-between gap-8 bg-white">
                    <div className="flex flex-col gap-6">
                        <h3 className="text-lg font-extrabold text-gray-800 tracking-tight border-b border-gray-100 pb-2">
                            Account Information
                        </h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3.5 p-3 rounded-xl border border-gray-100 bg-gray-50/20">
                                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                                    <User size={18} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase text-gray-400 font-semibold tracking-wider">Full Name</span>
                                    <span className="text-sm font-bold text-gray-700">{user?.name || "Not Available"}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3.5 p-3 rounded-xl border border-gray-100 bg-gray-50/20">
                                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                                    <Mail size={18} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase text-gray-400 font-semibold tracking-wider">Email Address</span>
                                    <span className="text-sm font-bold text-gray-700 break-all">{user?.email || "Not Available"}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3.5 p-3 rounded-xl border border-gray-100 bg-gray-50/20">
                                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                                    <Calendar size={18} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase text-gray-400 font-semibold tracking-wider">Member Since</span>
                                    <span className="text-sm font-bold text-gray-700">
                                        {user?.createdAt 
                                            ? new Date(user.createdAt).toLocaleDateString("en-EG", { year: 'numeric', month: 'long', day: 'numeric' }) 
                                            : new Date().toLocaleDateString("en-EG", { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3.5 p-3 rounded-xl border border-gray-100 bg-gray-50/20">
                                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                                    <ShieldCheck size={18} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase text-gray-400 font-semibold tracking-wider">Created At (Time)</span>
                                    <span className="text-sm font-bold text-emerald-600">
                                        {user?.createdAt 
                                            ? new Date(user.createdAt).toLocaleTimeString("en-EG", { hour: '2-digit', minute: '2-digit' }) 
                                            : new Date().toLocaleTimeString("en-EG", { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="w-full mt-2 p-4 rounded-xl border border-dashed border-gray-200 bg-gray-50/30 flex justify-between items-center">
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-gray-700">Saved Items In Cart</span>
                                <span className="text-[10px] text-gray-400 mt-0.5">Products currently synchronized with your account</span>
                            </div>
                            <span className="text-xl font-black text-gray-800 bg-white border border-gray-100 shadow-sm px-4 py-1.5 rounded-lg">
                                {user?.cartData ? Object.keys(user.cartData).length : 0}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 pt-4 mt-auto">
                        <Link href="/orders" className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-emerald-600 transition-colors group">
                            <ShoppingBag size={16} />
                            <span className="underline decoration-gray-200 group-hover:decoration-emerald-500">View Order History</span>
                        </Link>
                        
                        <button 
                            onClick={handleLogOut}
                            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-red-100 text-red-500 font-semibold text-xs
                            flex items-center justify-center gap-2 transition-all duration-300 hover:bg-red-50 transform active:scale-95 cursor-pointer"
                        >
                            <LogOut size={14} />
                            <span>Log Out</span>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    </main>
);

};

export default ProfilePage;