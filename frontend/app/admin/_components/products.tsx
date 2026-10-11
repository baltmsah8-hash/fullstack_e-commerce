"use client";
import React, { useEffect, useState } from "react";
import { ShoppingBag, Loader2 } from "lucide-react";
import ProductCard from "./productCard";
import { GetProducts, Product } from "@/services/products";


const ProductsList = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [removingId, setRemovingId] = useState<string | null>(null);

    const getData = async () => {
        setLoading(true);
        try {
            const mainData: Product[] = (await GetProducts()) ?? [];
            setProducts(mainData);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveProduct = async (id: string) => {
        setRemovingId(id);
        const api: string = process.env.NEXT_PUBLIC_REMOVE_PRODUCTS_API || "";
        try {
            const res = await fetch(api, {
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }, 
                body: JSON.stringify({ id: id }),
                credentials: 'include'
            });
            if (res.ok) {
                setProducts(products.filter(prev => prev._id != id))
                console.log('remove product successful')
            }
        } catch (error) {
            console.error(error);
        } finally {
            setRemovingId(null);
        }
    };

    useEffect(() => {
        getData();
    }, [])

    return (
        <div className="w-full flex flex-col gap-6 animate-in fade-in duration-200">
            <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight flex items-center gap-2">
                    <ShoppingBag size={24} className="text-emerald-600" />
                    <span>Products Inventory</span>
                </h2>
                <p className="text-xs text-gray-400">Review, audit and remove published items from the live database.</p>
            </div>

            {loading ? (
                <div className="w-full py-20 flex flex-col items-center justify-center gap-3 text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-emerald-600 font-bold" />
                    <p className="text-xs text-gray-400 font-medium">Fetching inventory list, please wait...</p>
                </div>
            ) : products.length === 0 ? (
                <div className="w-full bg-white border border-gray-100 p-12 rounded-2xl text-center shadow-xs flex flex-col items-center justify-center gap-2">
                    <ShoppingBag size={32} className="text-gray-300 animate-pulse" />
                    <h4 className="text-sm font-bold text-gray-700">Inventory Empty</h4>
                    <p className="text-xs text-gray-400 max-w-xs">No commercial items found in the database. Use Add Product tab to publish.</p>
                </div>
            ) : (
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-8">
                    {products.map((item) => (
                        <ProductCard
                            key={item._id}
                            product={item}
                            onRemove={handleRemoveProduct}
                            isRemoving={removingId === item._id}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default ProductsList;
