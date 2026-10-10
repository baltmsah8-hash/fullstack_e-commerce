"use client";
import React from "react";
import Image from "next/image";
import { Trash2, Layers } from "lucide-react";

interface ProductType {
    _id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image: string;
}

interface ProductCardProps {
    product: ProductType;
    onRemove: (id: string) => void;
    isRemoving: boolean;
}

const ProductCard = ({ product, onRemove, isRemoving }: ProductCardProps) => {
    const imageUrl = product.image.startsWith("http")
        ? product.image
        : `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${product.image}`;

    return (
        <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between group transition-all duration-300 hover:shadow-md hover:border-gray-200/60 animate-in fade-in duration-200">
            <div className="relative w-full h-44 bg-gray-50 flex items-center justify-center overflow-hidden">
                <Image
                    src={imageUrl}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 250px"
                    className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute top-3 left-3 text-[9px] uppercase font-black tracking-wider bg-gray-900/80 backdrop-blur-xs text-white px-2.5 py-1 rounded-lg flex items-center gap-1">
                    <Layers size={10} className="text-emerald-400" />
                    <span>{product.category}</span>
                </span>
            </div>

            <div className="p-4 flex flex-col gap-4 flex-1 justify-between">
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-black text-gray-800 tracking-tight line-clamp-1">
                            {product.name}
                        </h4>
                        <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg shrink-0">
                            {product.price} <span className="text-[9px] font-bold">EGP</span>
                        </span>
                    </div>
                    <p className="text-xs font-medium text-gray-400 leading-relaxed line-clamp-2 h-8">
                        {product.description}
                    </p>
                </div>

                <button
                    onClick={() => onRemove(product._id)}
                    disabled={isRemoving}
                    className="w-full py-2.5 rounded-xl border border-red-100 bg-red-50/20 text-red-500 text-xs font-bold flex items-center justify-center gap-2 transition-all duration-300 hover:bg-red-500 hover:text-white hover:border-red-500 shadow-xs active:scale-95 transform cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Trash2 size={13} />
                    <span>Remove Item</span>
                </button>
            </div>
        </div>
    );
};

export default ProductCard;
