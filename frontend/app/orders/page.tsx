"use client";
import React, { useEffect, useState } from "react";
import {
    ShoppingBag,
    Loader2,
    Package,
    Clock,
    Truck,
    CheckCircle2,
    CreditCard,
} from "lucide-react";

interface OrderAddress {
    city: string;
    full_address: string;
}

interface OrderProduct {
    _id: string;
    name: string;
    price: string;
    quantity: number;
}

interface OrderType {
    _id: string;
    amount: number;
    address: OrderAddress;
    status: "pending" | "on the way" | "delivered";
    payment: boolean;
    products: string;
    createdAt: string;
}

const UserOrdersPage = () => {
    const [orders, setOrders] = useState<OrderType[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchUserOrders = async () => {
        const api: string = process.env.NEXT_PUBLIC_USER_ORDER_API || "";
        if (!api) {
            setLoading(false);
            return;
        }
        try {
            const res = await fetch(api, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                credentials: "include",
            });

            const result = await res.json();
            if (res.ok) {
                setOrders(result.data || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserOrders();
    }, []);

    return (
        <div className="w-full min-h-screen bg-gray-50/50 py-10 px-4 md:px-10 lg:px-20 animate-in fade-in duration-200">
            <div className="max-w-3xl mx-auto flex flex-col gap-6">
                <div className="flex flex-col gap-1 border-b border-gray-100 pb-4">
                    <h1 className="text-2xl font-black text-gray-800 tracking-tight flex items-center gap-2">
                        <ShoppingBag size={24} className="text-emerald-600" />
                        <span>Track Tracked Orders</span>
                    </h1>
                    <p className="text-xs text-gray-400">
                        Monitor your personalized transaction ledger and live courier
                        delivery status trajectories.
                    </p>
                </div>

                {loading ? (
                    <div className="w-full py-20 flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-emerald-600 font-bold" />
                        <p className="text-xs text-gray-400 font-medium">
                            Syncing your personal commercial history pipeline...
                        </p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="w-full bg-white border border-gray-100 p-12 rounded-2xl text-center shadow-xs flex flex-col items-center justify-center gap-2">
                        <Package size={32} className="text-gray-300 animate-pulse" />
                        <h4 className="text-xs font-bold text-gray-700">
                            No Orders Dispatched
                        </h4>
                        <p className="text-[11px] text-gray-400 max-w-xs">
                            Your purchase pipeline is empty. Secure some commercial vault
                            products to populate this directory.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-5">
                        {orders.map((order) => {
                            let parsedProducts: OrderProduct[] = [];
                            try {
                                parsedProducts = JSON.parse(order.products);
                            } catch (e) {
                                console.error(e);
                            }

                            return (
                                <div
                                    key={order._id}
                                    className="w-full bg-white border border-gray-100 rounded-2xl p-5 md:p-6 shadow-xs flex flex-col gap-4 transition-all hover:border-gray-200/60"
                                >
                                    <div className="flex items-center justify-between gap-3 border-b border-gray-50 pb-2.5">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] text-gray-400 uppercase tracking-widest font-black">
                                                Receipt Reference: #{order._id.slice(-8)}
                                            </span>
                                        </div>
                                        <span
                                            className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider border flex items-center gap-1 ${order.payment
                                                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                                    : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                                }`}
                                        >
                                            <CreditCard size={10} />
                                            <span>
                                                {order.payment ? "Paid Secure" : "Pending Clearance"}
                                            </span>
                                        </span>
                                    </div>

                                    <div className="flex flex-col gap-2.5 divide-y divide-gray-50">
                                        {parsedProducts.map((p, idx) => (
                                            <div
                                                key={p._id || idx}
                                                className="flex justify-between items-center text-xs font-bold text-gray-700 pt-2.5 first:pt-0"
                                            >
                                                <div className="flex flex-col">
                                                    <span className="text-gray-800 font-black">
                                                        {p.name}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 font-semibold mt-0.5 uppercase tracking-wider">
                                                        Quantity Count: {p.quantity}
                                                    </span>
                                                </div>
                                                <span className="text-emerald-600 font-black shrink-0">
                                                    {p.price}{" "}
                                                    <span className="text-[9px] font-medium text-gray-400">
                                                        EGP
                                                    </span>
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between border-t border-gray-50 pt-4 mt-1">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] uppercase font-black tracking-wider text-gray-400">
                                                Delivery Trajectory:
                                            </span>
                                            <span
                                                className={`text-[10px] px-3 py-1 rounded-xl font-black uppercase tracking-wider border flex items-center gap-1.5 ${order.status === "delivered"
                                                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                                        : order.status === "on the way"
                                                            ? "bg-blue-50 text-blue-600 border-blue-100"
                                                            : "bg-amber-50 text-amber-600 border-amber-100"
                                                    }`}
                                            >
                                                {order.status === "delivered" ? (
                                                    <CheckCircle2 size={11} />
                                                ) : order.status === "on the way" ? (
                                                    <Truck size={11} />
                                                ) : (
                                                    <Clock size={11} />
                                                )}
                                                <span>{order.status}</span>
                                            </span>
                                        </div>

                                        <div className="text-right">
                                            <span className="text-gray-400 text-[9px] font-bold uppercase tracking-wider block">
                                                Gross Total Paid
                                            </span>
                                            <span className="text-gray-900 text-base font-black">
                                                {order.amount}.00{" "}
                                                <span className="text-[10px] font-bold text-gray-500">
                                                    EGP
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserOrdersPage;
