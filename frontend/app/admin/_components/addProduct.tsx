"use client";
import React, { useState, useEffect } from "react";
import {
    PlusCircle,
    Loader2,
    Image as ImageIcon,
    BadgeDollarSign,
    Layers,
} from "lucide-react";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const AddProduct = () => {
    interface ProductState {
        name: string;
        description: string;
        price: string;
        category: string;
        image: File | null;
    }

    const [product, setProduct] = useState<ProductState>({
        name: "",
        description: "",
        price: "",
        category: "Men",
        image: null,
    });

    const [loading, setLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
    ) => {
        const { name, value } = e.target;
        setProduct((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const image = e.target.files?.[0];
        if (image) {
            if (image.size > MAX_IMAGE_SIZE) {
                setProduct((prev) => ({ ...prev, image: null }));
                setMessage("❌ Image must be 5MB or smaller");
                e.target.value = "";
                return;
            }
            setMessage("");
            setProduct((prev) => ({ ...prev, image }));
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        const api: string =
            process.env.NEXT_PUBLIC_ADD_PRODUCTS_API ||
            "";

        const formData = new FormData();
        formData.append("name", product.name);
        formData.append("description", product.description);
        formData.append("price", product.price);
        formData.append("category", product.category);
        if (product.image) {
            formData.append("image", product.image);
        }

        try {
            const response = await fetch(api, {
                method: "POST",
                body: formData,
                credentials: "include",
            });

            const data = await response.json();

            if (response.ok) {
                setMessage("✅ Product published successfully into the catalog!");
                setProduct({
                    name: "",
                    description: "",
                    price: "",
                    category: "Men",
                    image: null,
                });
                (e.target as HTMLFormElement).reset();
            } else {
                setMessage(
                    `❌ Failed: ${data.message || "Error occurred during publishing"}`,
                );
            }
        } catch (error) {
            console.error(error);
            setMessage("❌ Connection server error, please try again later");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setMessage("");
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    return (
        <div className="w-full max-w-xl mx-auto flex flex-col gap-6 animate-in fade-in duration-200 bg-white">
            <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight flex items-center gap-2">
                    <PlusCircle size={24} className="text-emerald-600" />
                    <span>Add New Product</span>
                </h2>
                <p className="text-xs text-gray-400">
                    Upload and configure a new commercial item in real-time.
                </p>
            </div>

            <form
                onSubmit={handleSubmit}
                encType="multipart/form-data"
                className="flex flex-col gap-5 bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm"
            >
                {message && (
                    <div
                        className={`p-3 text-xs font-semibold text-center rounded-xl border animate-in fade-in duration-150 ${message.includes("successfully")
                                ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                                : "bg-red-50 border-red-100 text-red-700"
                            }`}
                    >
                        {message}
                    </div>
                )}

                <div className="relative w-full">
                    <input
                        type="text"
                        name="name"
                        id="name"
                        placeholder=" "
                        value={product.name}
                        onChange={handleChange}
                        required
                        className="peer w-full px-4 pb-2.5 pt-6 text-sm text-gray-800 border border-gray-200 rounded-xl bg-gray-50/40 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all duration-200"
                    />
                    <label
                        htmlFor="name"
                        className="absolute left-4 top-4 text-sm text-gray-400 bg-transparent transition-all duration-200 origin-left pointer-events-none peer-focus:text-emerald-600 peer-focus:-translate-y-3 peer-focus:scale-75 peer-not-placeholder-shown:-translate-y-3 peer-not-placeholder-shown:scale-75"
                    >
                        Product Title
                    </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
                    <div className="relative w-full">
                        <input
                            type="number"
                            name="price"
                            id="price"
                            placeholder=" "
                            value={product.price}
                            onChange={handleChange}
                            required
                            className="peer w-full px-4 pb-2.5 pt-6 text-sm text-gray-800 border border-gray-200 rounded-xl bg-gray-50/40 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all duration-200"
                        />
                        <label
                            htmlFor="price"
                            className="absolute left-4 top-4 text-sm text-gray-400 bg-transparent transition-all duration-200 origin-left pointer-events-none peer-focus:text-emerald-600 peer-focus:-translate-y-3 peer-focus:scale-75 peer-not-placeholder-shown:-translate-y-3 peer-not-placeholder-shown:scale-75"
                        >
                            Price (EGP)
                        </label>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                            <BadgeDollarSign size={16} />
                        </div>
                    </div>

                    <div className="relative w-full">
                        <select
                            name="category"
                            id="category"
                            value={product.category}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-4 text-sm text-gray-700 border border-gray-200 rounded-xl bg-gray-50/40 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all duration-200 appearance-none cursor-pointer"
                        >
                            <option value="Men">Men</option>
                            <option value="Women">Women</option>
                            <option value="Kids">Kids</option>
                            <option value="Technologies">Technologies</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                            <Layers size={16} />
                        </div>
                    </div>
                </div>

                <div className="relative w-full">
                    <textarea
                        name="description"
                        id="description"
                        placeholder=" "
                        value={product.description}
                        onChange={handleChange}
                        rows={4}
                        required
                        className="peer w-full px-4 pb-3 pt-6 text-sm text-gray-800 border border-gray-200 rounded-xl bg-gray-50/40 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all duration-200 resize-none"
                    />
                    <label
                        htmlFor="description"
                        className="absolute left-4 top-4 text-sm text-gray-400 bg-transparent transition-all duration-200 origin-left pointer-events-none peer-focus:text-emerald-600 peer-focus:-translate-y-3 peer-focus:scale-75 peer-not-placeholder-shown:-translate-y-3 peer-not-placeholder-shown:scale-75"
                    >
                        Product Full Description
                    </label>
                </div>

                <div className="w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer bg-gray-50/30 transition-all hover:bg-emerald-50/20 hover:border-emerald-300 group relative overflow-hidden">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                            <ImageIcon
                                size={24}
                                className="text-gray-400 group-hover:text-emerald-600 transition-colors mb-2"
                            />
                            <p className="text-xs font-bold text-gray-500 group-hover:text-emerald-700 transition-colors">
                                {product.image
                                    ? product.image.name
                                    : "Click to upload product image"}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">
                                JPG, PNG, WEBP, AVIF, TIFF up to 5MB
                            </p>
                        </div>
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/avif,image/tiff"
                            onChange={handleFileChange}
                            required={!product.image}
                            className="hidden"
                        />
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 mt-2 rounded-xl bg-gray-900 text-white font-semibold text-sm transition-all duration-300 hover:bg-emerald-600 shadow-md shadow-gray-900/10 active:scale-[0.98] transform cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>Uploading Data...</span>
                        </>
                    ) : (
                        <span>Publish Product</span>
                    )}
                </button>
            </form>
        </div>
    );
};

export default AddProduct;
