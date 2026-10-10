"use client";
import React, { useEffect, useContext, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CartContext } from "@/context/cartContext";
import { CheckCircle2, XCircle, ShoppingBag, Loader2, ArrowRight } from "lucide-react";

export default function VerifyPage() {
    const searchParams = useSearchParams();
    const context = useContext(CartContext);
    const { clearCart } = context || { clearCart: () => { } };

    const success = searchParams.get("success");
    const orderId = searchParams.get("orderId");
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (success === "true") {
            clearCart();
        }
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, [success]);

    if (loading) {
        return (
            <main className="w-full min-h-screen bg-gray-50/50 flex items-center justify-center p-4">
                <div className="flex flex-col items-center gap-3 text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-emerald-600 font-bold" />
                    <p className="text-sm text-gray-400 font-medium">Securing transaction feedback, please wait...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="w-full min-h-screen bg-gray-50/50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-white border border-gray-100 p-6 md:p-8 rounded-2xl shadow-xl text-center flex flex-col items-center gap-5">
                {success === "true" ? (
                    <>
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full animate-bounce">
                            <CheckCircle2 size={44} />
                        </div>
                        <div className="flex flex-col gap-1">
                            <h2 className="text-xl font-black text-gray-800 tracking-tight">Payment Secured!</h2>
                            <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Order ID: {orderId?.slice(-8)}</p>
                            <p className="text-xs text-gray-400 mt-2 leading-relaxed px-2">
                                Thank you for your purchase! Your invoice has been securely logged into the live database. Our dispatch courier will contact you shortly.
                            </p>
                        </div>
                        <Link
                            href="/orders"
                            className="w-full py-3 mt-2 rounded-xl bg-gray-950 text-white font-semibold text-sm transition-all duration-300 hover:bg-emerald-600 shadow-md shadow-gray-950/10 active:scale-[0.98] transform cursor-pointer flex items-center justify-center gap-2"
                        >
                            <span>Track Your Orders</span>
                            <ArrowRight size={16} />
                        </Link>
                    </>
                ) : (
                    <>
                        <div className="p-3 bg-red-50 text-red-500 rounded-full">
                            <XCircle size={44} />
                        </div>
                        <div className="flex flex-col gap-1">
                            <h2 className="text-xl font-black text-gray-800 tracking-tight">Transaction Cancelled</h2>
                            <p className="text-xs text-red-500 font-bold uppercase tracking-wider">Gateway Fallback Triggered</p>
                            <p className="text-xs text-gray-400 mt-2 leading-relaxed px-2">
                                The Stripe vault corridor did not receive successful clearance credentials. No assets have been deducted from your physical balance.
                            </p>
                        </div>
                        <Link
                            href="/checkout"
                            className="w-full py-3 mt-2 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm transition-all duration-300 hover:bg-gray-200 active:scale-[0.98] transform cursor-pointer flex items-center justify-center gap-2"
                        >
                            <ShoppingBag size={16} />
                            <span>Return to Checkout</span>
                        </Link>
                    </>
                )}
            </div>
        </main>
    );
}
