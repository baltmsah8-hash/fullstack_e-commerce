'use client';
import { Product } from "@/services/products";
import { createContext, ReactNode, useCallback, useEffect, useState } from "react";

interface CartItem extends Product { quantity: number };

interface CartApiResponse {
    success?: boolean;
    message?: string;
    cart?: Record<string, number>;
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (product: Product) => void;
    removeFromCart: (id: string) => void;
    clearCart: () => void;
    plusQuantity: (id: string) => void;
    minusQuantity: (id: string) => void;
    getData: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    const requestCartApi = useCallback(async (api: string | undefined, init?: RequestInit) => {
        if (!api) {
            throw new Error("Cart API URL is not configured");
        }

        const res = await fetch(api, {
            ...init,
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                ...init?.headers,
            },
            credentials: "include",
        });

        if (res.status === 401) {
            return undefined;
        }

        let data: CartApiResponse | undefined;
        try {
            data = await res.json();
        } catch {
            if (res.ok) {
                throw new Error("Cart API returned an invalid response");
            }
        }

        if (!res.ok || data?.success === false) {
            throw new Error(data?.message || `Cart API request failed (${res.status})`);
        }

        return data;
    }, []);

    const addToCart = async (product: Product) => {
        setCartItems((items) => {
            const isExisting = items.find((item) => item._id === product._id);
            if (isExisting) {
                return items.map((item) => item._id === product._id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item);
            }
            return [...items, { ...product, quantity: 1 }];
        });

        try {
            await requestCartApi(process.env.NEXT_PUBLIC_ADD_CART_API, {
                method: "POST",
                body: JSON.stringify({ id: product._id }),
            });
        } catch (error) {
            console.error("Failed to sync add action to database:", error);
        }
    };

    const removeFromCart = async (id: string) => {
        setCartItems((items) => items.filter((item) => item._id !== id));

        try {
            await requestCartApi(process.env.NEXT_PUBLIC_REMOVE_CART_API, {
                method: "POST",
                body: JSON.stringify({ id, type: "delete" }),
            });
        } catch (error) {
            console.error("Failed to sync remove action to database:", error);
        }
    };

    const plusQuantity = async (id: string) => {
        setCartItems((items) => items.map((item) => item._id === id
            ? { ...item, quantity: item.quantity + 1 }
            : item));

        try {
            await requestCartApi(process.env.NEXT_PUBLIC_ADD_CART_API, {
                method: "POST",
                body: JSON.stringify({ id }),
            });
        } catch (error) {
            console.error("Failed to sync add action to database:", error);
        }
    };

    const minusQuantity = async (id: string) => {
        let shouldRemove = false;
        setCartItems((items) => {
            const target = items.find((item) => item._id === id);
            if (target && target.quantity <= 1) shouldRemove = true;
            return items.map((item) => item._id === id
                ? { ...item, quantity: Math.max(item.quantity - 1, 1) }
                : item);
        });

        if (shouldRemove) {
            await removeFromCart(id);
            return;
        }

        try {
            await requestCartApi(process.env.NEXT_PUBLIC_REMOVE_CART_API, {
                method: "POST",
                body: JSON.stringify({ id, type: "decrease" }),
            });
        } catch (error) {
            console.error("Failed to sync a minus action to database:", error);
        }
    };

    const clearCart = async () => {
        setCartItems([]);

        try {
            await requestCartApi(process.env.NEXT_PUBLIC_CLEAR_CART_API, {
                method: "POST",
            });
        } catch (error) {
            console.error("Failed to sync clear action to database:", error);
        }
    };

    const loadCartData = useCallback(async (): Promise<CartItem[] | undefined> => {
        try {
            const data = await requestCartApi(process.env.NEXT_PUBLIC_GET_CART_API);
            if (!data) {
                return undefined;
            }

            const productsApi = process.env.NEXT_PUBLIC_PRODUCTS_API;
            if (!productsApi) {
                throw new Error("Products API URL is not configured");
            }

            const prodRes = await fetch(productsApi, {
                headers: { Accept: "application/json" },
            });
            if (!prodRes.ok) {
                throw new Error(`Products API request failed (${prodRes.status})`);
            }

            const prodData = await prodRes.json();
            const allProducts: Product[] = prodData.data || prodData.products || prodData;
            if (!Array.isArray(allProducts)) {
                throw new Error("Products API returned an invalid product list");
            }

            const hydratedItems: CartItem[] = Object.entries(data.cart || {}).flatMap(([itemId, quantity]) => {
                const matchProduct = allProducts.find((product) => product._id === itemId);
                return matchProduct && Number.isFinite(quantity) && quantity > 0
                    ? [{ ...matchProduct, quantity }]
                    : [];
            });
            return hydratedItems;
        } catch (error) {
            console.error("Failed to sync get action to database:", error);
            return undefined;
        }
    }, [requestCartApi]);

    const getData = useCallback(async () => {
        const items = await loadCartData();
        if (items) {
            setCartItems(items);
        }
    }, [loadCartData]);

    useEffect(() => {
        let isActive = true;
        void loadCartData().then((items) => {
            if (isActive && items) {
                setCartItems(items);
            }
        });

        return () => {
            isActive = false;
        };
    }, [loadCartData]);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, plusQuantity, minusQuantity, getData }}>
            {children}
        </CartContext.Provider>
    );
};

export { CartContext, CartProvider };
export type { CartItem };
