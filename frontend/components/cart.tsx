"use client";
import { useContext } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { CartContext } from "@/context/cartContext";

interface CartModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CartModal = ({ isOpen, onClose }: CartModalProps) => {
    const context = useContext(CartContext);
    const cartItems = context ? context.cartItems : [];
    const removeFromCart = context ? context.removeFromCart : () => {};
    const clearCart = context ? context.clearCart : () => {};
    const plusQuantity = context ? context.plusQuantity : () => {};
    const minusQuantity = context ? context.minusQuantity : () => {};

    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/40 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100/80 flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200">
                
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
                    <div className="flex items-center gap-2">
                        <ShoppingBag size={20} className="text-emerald-600" />
                        <h2 className="font-extrabold text-gray-800 text-base">Your Shopping Cart</h2>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">{cartItems.length}</span>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-50 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer">
                        <X size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 min-h-[200px]">
                    {cartItems.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 py-12">
                            <div className="p-3 rounded-full bg-gray-50 text-gray-400">
                                <ShoppingBag size={28} />
                            </div>
                            <h3 className="font-bold text-gray-700 text-sm">Your cart is empty</h3>
                            <p className="text-xs text-gray-400 max-w-[200px]">Add some items from Woo Store to fill it up!</p>
                        </div>
                    ) : (
                        <>
                            <button onClick={clearCart} className="self-end text-[11px] font-semibold text-red-500 hover:text-red-700 transition-colors cursor-pointer flex items-center gap-1">
                                <Trash2 size={12} />
                                <span>Clear All</span>
                            </button>

                            {cartItems.map((item) => {
                                const imageSrc = item.image.startsWith("http") 
                                    ? item.image 
                                    : `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${item.image}`;

                                return (
                                    <div key={item._id} className="p-2.5 rounded-xl border border-gray-100 bg-white shadow-sm flex items-center gap-3 transition-all hover:shadow-md">
                                        <div className="relative w-16 h-16 bg-gray-50 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                                            <Image src={imageSrc} alt={item.name} fill sizes="64px" className="object-contain p-1" />
                                        </div>

                                        <div className="flex-1 flex flex-col justify-between h-14">
                                            <div className="flex justify-between items-start gap-1">
                                                <h4 className="font-bold text-xs text-gray-800 line-clamp-1 flex-1">{item.name}</h4>
                                                <span className="text-xs font-bold text-emerald-600 shrink-0">{(item.price).toFixed(0)} EGP</span>
                                            </div>

                                            <div className="flex items-center justify-between mt-auto">
                                                <div className="flex items-center gap-1.5 border border-gray-100 rounded-md p-0.5 bg-gray-50/50">
                                                    <button 
                                                    className="p-0.5 rounded bg-white border border-gray-100 text-gray-500 hover:text-gray-800 active:scale-90 transform cursor-pointer"
                                                    onClick={() => item._id && minusQuantity(item._id)}>
                                                        <Minus size={20} />
                                                    </button>
                                                    <span className="text-[18px] font-bold text-gray-800 px-1.5 min-w-[14px] text-center">{item.quantity}</span>
                                                    <button 
                                                    onClick={() => item._id && plusQuantity(item._id)}
                                                    className="p-0.5 rounded bg-white border border-gray-100 text-gray-500 hover:text-gray-800 active:scale-90 transform cursor-pointer">
                                                        <Plus size={20} />
                                                    </button>
                                                </div>

                                                <button onClick={() => item._id && removeFromCart(item._id)} className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer rounded p-1 hover:bg-red-50">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                    )}
                </div>

                {cartItems.length > 0 && (
                    <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col gap-3 shrink-0">
                        <div className="flex justify-between items-center text-sm font-bold text-gray-800">
                            <span>Subtotal Amount</span>
                            <span className="text-emerald-600 text-base">{subtotal.toFixed(2)} EGP</span>
                        </div>
                        
                        <Link href={'/checkout'}
                        onClick={onClose} 
                        className="w-full py-2.5 rounded-xl bg-gray-900 text-white font-semibold text-sm transition-all duration-300 hover:bg-emerald-600 shadow-md shadow-gray-900/10 active:scale-[0.98] transform cursor-pointer flex items-center justify-center gap-2">
                            <span>Proceed to Checkout</span>
                        </Link>
                    </div>
                )}

            </div>
        </div>
    );
};

export default CartModal;
