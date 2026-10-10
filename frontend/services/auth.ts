interface UserType {
    _id: string;
    name: string;
    email: string;
    admin: boolean;
    cartData: object;
    createdAt?: number;
    updatedAt?: number;
}

const getUserData = async (): Promise<UserType | undefined> => {
    const api: string = process.env.NEXT_PUBLIC_PROFILE_API || "";
    if (!api) {
        console.error("Products API URL is not configured");
        return;
    }

    try {
        const res: Response = await fetch(api, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            credentials: "include"
        });

        const data = await res.json();

        if (res.ok) {
            const mainData: UserType = data.user || data.data || data;
            return mainData;
        } else {
            console.error(data.message || "Unauthorized session or expired token");
        }

    } catch (error) {
        console.error("getUserData Error:", error); 
    }
};

const getUsers = async () => {
        const api: string = process.env.NEXT_PUBLIC_ALL_USERS_API || "";
    if (!api) {
        console.error("Users API URL is not configured");
        return;
    }

    try {
        const res: Response = await fetch(api, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            credentials: "include"
        });

        const data = await res.json();

        if (res.ok) {
            const mainData: UserType = data.users || data.data;
            return mainData;
        } else {
            console.error(data.message || "Unauthorized session or expired token");
        }

    } catch (error) {
        console.error("getUserData Error:", error); 
    }
};

export { getUserData, getUsers };
export type { UserType };
