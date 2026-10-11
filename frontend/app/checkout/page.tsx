"use client";
import React, { useState, useContext } from "react";
import Image from "next/image";
import { CartContext } from "@/context/cartContext";
import { CreditCard, Truck, ShieldCheck, MapPin, User, Phone, Building } from "lucide-react";

export default function CheckoutPage() {
    const context = useContext(CartContext);
    const { cartItems } = context || { cartItems: [] };

    const egyptGovernorates: string[] = [
        "Cairo", "Alexandria", "Giza", "Qalyubia", "Dakahlia", "Monufia",
        "Sharqia", "Gharbia", "Kafr El Sheikh", "Damietta", "Port Said",
        "Ismailia", "Suez", "Beheira", "Matrouh", "North Sinai", "South Sinai",
        "Faiyum", "Beni Suef", "Minya", "Asyut", "Sohag", "Qena", "Luxor",
        "Aswan", "Red Sea", "New Valley"
    ];

    const [shippingForm, setShippingForm] = useState({
        city: "Cairo",
        full_address: "",
    });
    const [loading, setLoading] = useState<boolean>(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setShippingForm((prev) => ({ ...prev, [name]: value }));
    };

    const subtotal = cartItems.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0);
    const shippingFee = cartItems.length > 0 ? 50 : 0;
    const total = subtotal + shippingFee;

    const handleCheckoutSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const api: string = process.env.NEXT_PUBLIC_PLACE_ORDER_API || '';
        if (!api) {
            setLoading(false);
            return;
        }

        const payload = {
            address: {
                city: shippingForm.city,
                full_address: shippingForm.full_address,
            },
            products: cartItems.map((item) => ({
                _id: item._id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
            })),
        };

        try {
            const res = await fetch(api, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload),
                credentials: 'include'
            });

            const data = await res.json();

            if (res.ok && data.success && data.url) {
                setShippingForm({
                    city: "Cairo",
                    full_address: "",
                });
                window.location.href = data.url;
            } else {
                alert(data.message || "Failed to generate Stripe session");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="w-full min-h-screen bg-gray-50 py-10 px-4 md:px-10 lg:px-20 animate-in fade-in duration-200">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                <div className="lg:col-span-7 flex flex-col gap-6 w-full">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight flex items-center gap-2">
                            <Truck size={24} className="text-emerald-600" />
                            <span>Shipping Information</span>
                        </h2>
                        <p className="text-xs text-gray-400">Provide your absolute physical delivery data to secure the dispatch coordinates.</p>
                    </div>

                    <form onSubmit={handleCheckoutSubmit} className="flex flex-col gap-5 bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-xs">
                        <div className="relative w-full">
                            <input
                                type="text"
                                id="visualFullName"
                                placeholder=" "
                                required
                                className="peer w-full px-4 pb-2.5 pt-6 text-sm text-gray-800 border border-gray-200 rounded-xl bg-gray-50/40 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all duration-200"
                            />
                            <label htmlFor="visualFullName" className="absolute left-4 top-4 text-sm text-gray-400 bg-transparent transition-all duration-200 origin-left pointer-events-none peer-focus:text-emerald-600 peer-focus:-translate-y-3 peer-focus:scale-75 peer-not-placeholder-shown:-translate-y-3 peer-not-placeholder-shown:scale-75">
                                Full Name
                            </label>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><User size={16} /></div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
                            <div className="relative w-full">
                                <input
                                    type="tel"
                                    id="visualPhone"
                                    placeholder=" "
                                    required
                                    className="peer w-full px-4 pb-2.5 pt-6 text-sm text-gray-800 border border-gray-200 rounded-xl bg-gray-50/40 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all duration-200"
                                />
                                <label htmlFor="visualPhone" className="absolute left-4 top-4 text-sm text-gray-400 bg-transparent transition-all duration-200 origin-left pointer-events-none peer-focus:text-emerald-600 peer-focus:-translate-y-3 peer-focus:scale-75 peer-not-placeholder-shown:-translate-y-3 peer-not-placeholder-shown:scale-75">
                                    Phone Number
                                </label>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><Phone size={16} /></div>
                            </div>

                            <div className="relative w-full">
                                <select
                                    name="city"
                                    id="city"
                                    value={shippingForm.city}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-4 text-sm text-gray-700 border border-gray-200 rounded-xl bg-gray-50/40 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all duration-200 appearance-none cursor-pointer"
                                >
                                    {egyptGovernorates.map((el, ind) => (
                                        <option key={ind} value={el}>
                                            {el}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><Building size={16} /></div>
                            </div>
                        </div>

                        <div className="relative w-full">
                            <input
                                type="text"
                                name="full_address"
                                id="full_address"
                                placeholder=" "
                                value={shippingForm.full_address}
                                onChange={handleInputChange}
                                required
                                className="peer w-full px-4 pb-2.5 pt-6 text-sm text-gray-800 border border-gray-200 rounded-xl bg-gray-50/40 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all duration-200"
                            />
                            <label htmlFor="full_address" className="absolute left-4 top-4 text-sm text-gray-400 bg-transparent transition-all duration-200 origin-left pointer-events-none peer-focus:text-emerald-600 peer-focus:-translate-y-3 peer-focus:scale-75 peer-not-placeholder-shown:-translate-y-3 peer-not-placeholder-shown:scale-75">
                                Detailed Delivery Street Address, Apartment, Building
                            </label>
                            <div className="absolute right-4 max-md: h-[88px] top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><MapPin size={16} /></div>
                        </div>

                        <div className="flex items-center gap-3 border border-emerald-500/10 bg-emerald-500/5 p-4 rounded-xl text-xs text-gray-400 font-medium leading-relaxed mt-2">
                            <ShieldCheck size={18} className="text-emerald-500 shrink-0" />
                            <span>Your private credentials and logistics remain encrypted. Proceeding will securely forward parameters to the official Stripe transaction corridor.</span>
                        </div>
                    </form>
                </div>

                <div className="lg:col-span-5 flex flex-col gap-6 w-full lg:sticky lg:top-6">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight flex items-center gap-2">
                            <CreditCard size={24} className="text-emerald-600" />
                            <span>Order Summary</span>
                        </h2>
                        <p className="text-xs text-gray-400">Verify invoice calculations before secure vault checkout routing.</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 flex flex-col gap-5 w-full">
                        <div className="flex flex-col gap-4 max-h-60 overflow-y-auto pr-1 divide-y divide-gray-50">
                            {cartItems.map((item) => (
                                <div key={item._id} className="flex items-center justify-between gap-4 pt-3 first:pt-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 relative border border-gray-100 bg-gray-50 rounded-lg p-1 shrink-0 overflow-hidden flex items-center justify-center">
                                            <Image
                                                src={item.image.startsWith("http")
                                                    ? item.image
                                                    : `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${item.image}`}
                                                alt={item.name}
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-gray-800 line-clamp-1">{item.name}</span>
                                            <span className="text-[10px] text-gray-400 font-semibold mt-0.5 uppercase tracking-wider">Qty: {item.quantity}</span>
                                        </div>
                                    </div>
                                    <span className="text-xs font-black text-gray-700 shrink-0">{Number(item.price) * item.quantity} EGP</span>
                                </div>
                            ))}
                            {cartItems.length === 0 && (
                                <p className="text-center py-6 text-xs text-gray-400 font-medium">Your checkout bag is currently empty.</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            <div className="flex justify-between items-center">
                                <span>Subtotal Items</span>
                                <span className="text-gray-700 font-bold">{subtotal}.00 EGP</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Logistics Shipping</span>
                                <span className="text-gray-700 font-bold">{shippingFee}.00 EGP</span>
                            </div>
                            <div className="flex justify-between items-center border-t border-dashed border-gray-100 pt-4 mt-1 text-sm font-black text-gray-800">
                                <span>Invoice Total</span>
                                <span className="text-emerald-600 text-base">{total}.00 EGP</span>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                const form = document.querySelector("form");
                                if (form) form.requestSubmit();
                            }}
                            disabled={loading || cartItems.length === 0}
                            className="w-full py-3.5 mt-2 rounded-xl bg-gray-950 text-white font-semibold text-sm transition-all duration-300 hover:bg-emerald-600 shadow-md shadow-gray-950/10 active:scale-[0.98] transform cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Processing Encryption..." : "Proceed to Stripe Payment"}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );

}