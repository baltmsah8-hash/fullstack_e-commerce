"use client";
import Image from "next/image";
import { useState, useEffect, useRef, useContext } from "react";
import { Plus, Check } from "lucide-react";
import { CartContext } from "@/context/cartContext";
import type { Product } from "@/services/products";

interface ProductsCard {
    product: Product;
    onOpenModal?: () => void;
}

const ProductCard = ({ product, onOpenModal }: ProductsCard) => {
    const [added, setAdded] = useState<boolean>(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const context = useContext(CartContext);
    const addToCart = context ? context.addToCart : () => {};

    const handeClick = () => {
        if (!added) {
            setAdded(true);

            if (timerRef.current) clearTimeout(timerRef.current);

            timerRef.current = setTimeout(() => {
                setAdded(false);
            }, 5000);
        } else {
            setAdded(false);
            if (timerRef.current) clearTimeout(timerRef.current);
        }
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    return (
        <div 
            className="w-60 h-85 p-3 rounded-xl flex flex-col justify-between
            bg-white border border-gray-100 shadow-md shadow-emerald-50/60
            transition-all duration-150 hover:scale-[1.02] cursor-pointer 
            hover:shadow-lg hover:shadow-emerald-100/80 max-md:w-52 max-sm:w-44"
            onClick={onOpenModal}
        >
            <div className="w-full h-36 relative rounded-lg overflow-hidden border border-gray-100 bg-gray-50/50 group">
                <Image 
                    src={product.image.startsWith("http")
                        ? product.image
                        : `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${product.image}`}
                    alt={product.name} 
                    fill
                    sizes="(max-width: 768px) 150px, 220px"
                    className="object-contain p-2" 
                />
            </div>

            <div className="flex-1 flex flex-col justify-center mt-2">
                <h3 className="text-base md:text-lg font-bold text-gray-800 line-clamp-1 leading-tight">
                    {product.name}
                </h3>
                <p className="text-xs md:text-sm text-gray-400 line-clamp-2 mt-1 leading-relaxed">
                    {product.description}
                </p>
            </div>

            <div className="w-full flex justify-between items-center mt-3 pt-2 border-t border-gray-50">
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Price</span>
                    <span className="text-sm md:text-base font-bold text-emerald-600">
                        {product.price}.00 <span className="text-[10px] font-normal text-gray-500">EGP</span>
                    </span>
                </div>
                
                <button 
                    className={`p-2 rounded-lg transition-all duration-300 cursor-pointer
                        transform active:scale-95 flex items-center justify-center ${
                        added 
                            ? "bg-emerald-600 text-white shadow-md shadow-emerald-200" 
                            : "bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white"
                    }`} 
                    onClick={e => {
                        e.stopPropagation();
                        handeClick();
                        addToCart(product);
                    }}
                    aria-label={added ? "Remove from cart" : "Add to cart"}
                >
                    {added ? <Check size={18} /> : <Plus size={18} />}
                </button>
            </div>
        </div>
    );
};

export default ProductCard;
