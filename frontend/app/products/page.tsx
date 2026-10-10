'use client';
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import ProductCard from "@/components/productCard";
import { GetProducts, Product } from "@/services/products";
import ProductDetails from "@/components/ProductDetails";

const ProductsPage = () => {
    const sectionTitle: string[] = ["Men", "Women", "Kids", "Technologies"];
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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

    useEffect(() => {
        getData();
    }, []);

    return (
        <main className="w-full max-w-6xl mx-auto my-12 px-4 md:px-6 flex flex-col gap-14 min-h-screen">
            
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-100 pb-6">
                <Link 
                    href="/" 
                    className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-emerald-600 transition-colors group self-start sm:self-auto"
                >
                    <ArrowLeft size={16} className="transition-transform duration-200 group-hover:-translate-x-1" />
                    <span>Back to Home</span>
                </Link>
                
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 tracking-tight text-center sm:text-right">
                    All <span className="text-emerald-600">Products</span> Collection
                </h1>
            </div>

            {loading ? (
                <div className="w-full py-32 flex justify-center items-center flex-1">
                    <Loader2 className="h-12 w-12 animate-spin text-emerald-600 font-bold" />
                </div>
            ) : (
                <div className="flex flex-col gap-12">
                    {sectionTitle.map((title) => {
                        const categoryProducts = products.filter(
                            (product: Product) => product.category?.toLowerCase() === title.toLowerCase()
                        );

                        if (categoryProducts.length === 0) return null;

                        return (
                            <section id={`${title.toLowerCase()}`} key={title} className="w-full flex flex-col gap-5">
                                <div className="flex items-center gap-3 border-l-4 border-emerald-500 pl-3">
                                    <h2 className="text-xl font-extrabold text-gray-800 tracking-tight capitalize">
                                        {title} <span className="text-emerald-600">Section</span>
                                    </h2>
                                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                                        {categoryProducts.length} Items
                                    </span>
                                </div>

                                <div className="grid gap-3 sm:gap-6 justify-items-center justify-center items-center grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 py-2">
                                    {categoryProducts.map((product: Product) => {
                                        return (
                                            <ProductCard 
                                                key={product._id}
                                                product={product}
                                                onOpenModal={() => {
                                                    setSelectedProduct(product);
                                                    setIsModalOpen(true);
                                                }} />
                                        );
                                    })}
                                </div>

                                {isModalOpen && selectedProduct ? <ProductDetails 
                                    isOpen={isModalOpen}
                                    onClose={() => setIsModalOpen(false)}
                                    product={selectedProduct}
                                /> : ''}

                            </section>
                        );
                    })}
                </div>
            )}
        </main>
    );
};

export default ProductsPage;
