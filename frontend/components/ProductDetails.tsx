"use client";
import Image from "next/image";
import { X, ShoppingCart, ShieldCheck, RefreshCw } from "lucide-react";
import type { Product } from "@/services/products";
import { CartContext } from "@/context/cartContext";
import { useContext } from "react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product;
}

const ProductDetails = ({ isOpen, onClose, product }: ModalProps) => {
    const context = useContext(CartContext);
    const addToCart = context ? context.addToCart : () => {};
    if (!isOpen || !product) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 
        bg-white/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 duration-200">
                
                <button 
                    onClick={onClose}
                    className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm text-gray-500 hover:text-gray-800 border border-gray-100 shadow-sm transition-colors cursor-pointer"
                >
                    <X size={18} />
                </button>

                <div className="w-full md:w-1/2 h-64 md:h-auto relative bg-gray-50/50 p-6 flex items-center justify-center">
                    <Image 
                        src={product.image.startsWith("http")
                            ? product.image
                            : `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${product.image}`}
                        alt={product.name} 
                        fill
                        sizes="(max-width: 768px) 100vw, 320px"
                        className="object-contain p-6"
                    />
                </div>

                <div className="w-full md:w-1/2 p-6 flex flex-col justify-between gap-6 bg-white">
                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full self-start">
                            {product.category || "Premium Item"}
                        </span>
                        <h2 className="text-xl md:text-2xl font-extrabold text-gray-800 leading-tight">
                            {product.name}
                        </h2>
                        <p className="w-full text-gray-500 text-wrap text-xs md:text-sm leading-relaxed mt-2 max-h-24">
                            {product.description}
                        </p>
                    </div>

                    <div className="flex flex-col gap-2 border-t border-b border-gray-50 py-3 text-[11px] text-gray-400 font-medium">
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={14} className="text-emerald-500" />
                            <span>100% Original Authentic Product</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <RefreshCw size={14} className="text-emerald-500" />
                            <span>14-Day Free Returns & Exchange</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-2">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase text-gray-400 font-medium">Total Price</span>
                            <span className="text-lg md:text-xl font-bold text-emerald-600">
                                {product.price}.00 <span className="text-xs font-normal text-gray-500">EGP</span>
                            </span>
                        </div>

                        <button 
                            className="px-5 py-2.5 rounded-xl bg-gray-900 text-white font-semibold text-sm
                            flex items-center gap-2 transition-all duration-300 hover:bg-emerald-600 transform active:scale-95 shadow-md shadow-gray-900/10 cursor-pointer"
                            onClick={() => addToCart(product)}
                        >
                            <ShoppingCart size={16} />
                            <span>Add To Cart</span>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ProductDetails;
