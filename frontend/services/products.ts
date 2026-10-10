interface Product {
    _id?: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category?: string;
}

const GetProducts = async (): Promise<Product[] | undefined>  => {
    const api: string | undefined = process.env.NEXT_PUBLIC_PRODUCTS_API;
    if (!api) {
        console.error("Products API URL is not configured");
        return;
    }
    try {
        const res: Response = await fetch(api);
        const data = await res.json();
        if (res.ok) {
            const mainData: Product[] = data.data;
            console.log("Products loaded successfully");
            return mainData;
        } else {
            throw new Error("Error in loaded products");
        }
    } catch (error) {
        console.error("Registration Error:", error);
    }
};


export { GetProducts };
export type { Product };