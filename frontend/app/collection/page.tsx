"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import ProductCard from "@/components/productCard";
import ListCategory from "@/components/listCategory";
import { GetProducts, Product } from "@/services/products";
import ProductDetails from "@/components/ProductDetails";

const Collection = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

    const getRandomElements = (arr: Product[], count: number): Product[] => {
        const copy: Product[] = [];
        const maxItems = Math.min(count, arr.length);
        while (copy.length < maxItems) {
            const randomIndex = Math.floor(Math.random() * arr.length);
            const randomProduct = arr[randomIndex];
            if (!copy.some(pro => pro._id === randomProduct._id)) {
                copy.push(randomProduct);
            }
        }
        return copy;
    };

    const getData = async () => {
        setLoading(true);
        try {
            const mainData: Product[] = (await GetProducts()) ?? [];
            setProducts(mainData);

            const randomInitial = getRandomElements(mainData, 8);
            setFilteredProducts(randomInitial);

            console.log("Products loaded successfully via Service!");
        } catch (error) {
            console.error("Registration Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handelCategory = (selected: string): void => {
        if (selected === "All") {
            const randomNew = getRandomElements(products, 8);
            setFilteredProducts(randomNew);
        } else {
            const filtered = products.filter(pro => pro.category?.toLowerCase() === selected.toLowerCase());
            setFilteredProducts(filtered);
        }
    };


    useEffect(() => {
        getData();
    }, []);

    return (
        <section id="collections" className="w-full min-h-[450px] py-6 px-2.5 flex gap-6 flex-col items-center justify-center bg-white">
            <ListCategory onCategoryChange={handelCategory} />

            {loading ? (
                <div className="w-full py-20 flex justify-center items-center">
                    <Loader2 className="h-12 w-12 animate-spin text-emerald-600 font-bold" />
                </div>
            ) : (
                <div className="w-full py-4 grid gap-6 justify-items-center justify-center items-center grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => {
                            return (
                                <ProductCard
                                    key={product._id}
                                    product={product}
                                    onOpenModal={() => {
                                        setSelectedProduct(product);
                                        setIsModalOpen(true);
                                    }}
                                />
                            );
                        })
                    ) : (
                        <div className="col-span-full text-center py-16">
                            <h1 className="text-2xl font-bold text-gray-400 tracking-tight">No data to show</h1>
                        </div>
                    )}
                </div>
            )}

            {!loading && filteredProducts.length > 0 && (
                <div className="w-full flex justify-center mt-4">
                    <Link
                        href="/products"
                        className="group px-6 py-3 rounded-xl bg-emerald-500 text-white font-semibold text-sm
                        flex items-center gap-2 shadow-md shadow-emerald-500/10
                        transition-all duration-300 hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/20 
                        transform active:scale-95"
                    >
                        <span>See All Products</span>
                        <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                </div>
            )}

            {isModalOpen && selectedProduct ? <ProductDetails
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                product={selectedProduct}
            /> : ''}
        </section>
    );
}

export default Collection;
