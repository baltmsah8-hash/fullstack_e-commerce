"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Home from "./_components/home";
import { getUserData, UserType } from "@/services/auth";
import Sidebar from "./_components/sidebar";
import AdminNavbar from "./_components/adminNav";
import AddProduct from "./_components/addProduct";
import ProductsList from "./_components/products";
import ManageUsers from "./_components/manage-users";
import ManageOrders from "./_components/manage-orders";
import Notifications from "./_components/notifications";

interface NotificationData {
    name?: string;
    phone?: string;
    orderId?: string;
    amount?: number;
}

interface NotificationType {
    _id: string;
    title: "contact" | "order" | "stock";
    message: string;
    isRead: boolean;
    data: NotificationData;
    createdAt?: string;
}

const AdminPage = () => {
    const router = useRouter();
    const [user, setUser] = useState<UserType | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [active, setActive] = useState<"home" | "addProduct" | "productsList" | "orders" | "users" | "notifications">('home');
    const [isOpen, setOpen] = useState<boolean>(false);
    const [notifications, setNotifications] = useState<NotificationType[]>([]);
    const [num, setNum] = useState<number>(0);

    const checkAdmin = async () => {
        setLoading(true);
        try {
            const data = await getUserData();
            if (data && data.admin) {
                setUser(data);
            } else {
                router.push('/login');
            }
        } catch (error) {
            console.error(error);
            router.push('/login');
        } finally {
            setLoading(false);
        };
    };

    const handleLogOut = async () => {
        setLoading(true)
        const api: string = process.env.NEXT_PUBLIC_LOGOUT_API || "";
        try {
            const res = await fetch(api, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: "include"
            });

            if (res.ok) {
                router.push("/login");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getNotification = async () => {
        setLoading(true);
        const api: string = process.env.NEXT_PUBLIC_GET_NOTIFICATION_API || "";
        try {
            const res = await fetch(api, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                credentials: "include"
            });
            
            const result = await res.json();
            if (res.ok) {
                setNotifications(result.data);
                const unread = result.data.filter((noti: NotificationType) => !noti.isRead).length;
                setNum(unread);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async () => {
        const api: string = process.env.NEXT_PUBLIC_UPDATE_NOTIFICATION_API || "";
        try {
            const res = await fetch(api, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                credentials: "include"
            });

            if (res.ok) {
                setNum(0);
                setNotifications((prev) =>
                    prev.map((noti) => noti && { ...noti, isRead: true })
                );
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (active === "notifications") {
            updateStatus();
        }
    }, [active]);


    useEffect(() => {
        checkAdmin();
        getNotification();
    }, []);

    if (loading) {
        return (
            <main className="w-full min-h-screen bg-gray-50/50 flex items-center justify-center p-4">
                <div className="flex flex-col items-center gap-3 text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-emerald-600 font-bold" />
                    <p className="text-sm text-gray-400 font-medium">Verifying admin authority, please wait...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="w-full h-screen flex flex-col md:flex-row relative bg-gray-50/50 overflow-x-hidden">
            <Sidebar 
                activeTab={active} 
                setActiveTab={setActive} 
                isOpen={isOpen} 
                onClose={() => setOpen(false)} 
                onLogout={handleLogOut} 
                num={num}
            />
            
            <div className="flex-1 flex flex-col min-h-screen">
                <AdminNavbar onMenuClick={() => setOpen(true)} />
                
                <div className="flex-1 p-4 md:p-10 w-full max-w-5xl mx-auto">
                    {active === "home" && <Home user={user} />}
                    {active === "addProduct" && <AddProduct />}
                    {active === "productsList" && <ProductsList />}
                    {active === "users" && <ManageUsers id={user?._id} />}
                    {active === "orders" && <ManageOrders />}
                    {active === "notifications" && <Notifications 
                    notifications={notifications} 
                    setNotifications={setNotifications} 
                    loading={loading} />}
                </div>
            </div>
        </main>
    );
};

export default AdminPage;
export type { NotificationType };