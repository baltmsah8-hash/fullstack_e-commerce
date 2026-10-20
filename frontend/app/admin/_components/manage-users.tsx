"use client";
import React, { useEffect, useState } from "react";
import {
    Users,
    Loader2,
    ShieldCheck,
    Trash2,
    UserMinus,
} from "lucide-react";
import { getUsers, UserType } from "@/services/auth";

const ManageUsers = ({ id }: { id?: string }) => {
    const [users, setUsers] = useState<UserType[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [actionId, setActionId] = useState<string | null>(null);

    const getData = async () => {
        setLoading(true);
        try {
            const mainData: UserType[] = (await getUsers()) ?? [];
            setUsers(mainData.filter(user => user._id !== id));
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id: string) => {
        setActionId(id);
        const api: string =
            process.env.NEXT_PUBLIC_REMOVE_USER_API ||
            "http://localhost:5000/api/users/delete-user";

        try {
            const res = await fetch(api, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({ id: id }),
                credentials: "include",
            });

            if (res.ok) {
                setUsers((prev) => prev.filter((user) => user._id !== id));
                console.log("User account terminated successfully");
            } else {
                const errData = await res.json();
                alert(errData.message || "Failed to delete user");
            }
        } catch (error) {
            console.error("Delete user request failed:", error);
        } finally {
            setActionId(null);
        }
    };

    const handleToggleAdminRole = async (id: string, role: boolean) => {
        const api: string = process.env.NEXT_PUBLIC_CHANGE_ROLE_API || "";
        try {
            await fetch(api, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({ id: id, admin: role }),
                credentials: "include",
            });
        } catch (error) {
            console.error(error);
        } finally {
            setActionId(null);
        }
        setActionId(null);
    };

    useEffect(() => {
        getData();
    }, []);

    return (
        <div className="w-full flex flex-col gap-6 animate-in fade-in duration-200">
            <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight flex items-center gap-2">
                    <Users size={24} className="text-emerald-600" />
                    <span>Users Platform Management</span>
                </h2>
                <p className="text-xs text-gray-400">
                    Monitor client accounts, upgrade privileges to administrators, or
                    terminate accounts.
                </p>
            </div>

            {loading ? (
                <div className="w-full py-20 flex flex-col items-center justify-center gap-3 text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-emerald-600 font-bold" />
                    <p className="text-xs text-gray-400 font-medium">
                        Fetching registered users list...
                    </p>
                </div>
            ) : users.length === 0 ? (
                <div className="w-full border border-gray-100 p-12 rounded-2xl text-center shadow-xs flex flex-col items-center justify-center gap-2">
                    <Users size={32} className="text-gray-300 animate-pulse" />
                    <h4 className="text-sm font-bold text-gray-700">No Users Found</h4>
                    <p className="text-xs text-gray-400 max-w-xs">
                        No client accounts found registered in the active system database.
                    </p>
                </div>
            ) : (
                <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="w-full overflow-x-auto">
                        <table className="w-full text-left text-xs text-gray-500 font-medium border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50 text-gray-400 uppercase font-bold text-[10px] tracking-wider">
                                    <th className="px-6 py-4">Client Details</th>
                                    <th className="px-6 py-4">Security Level</th>
                                    <th className="px-6 py-4">Registration Date</th>
                                    <th className="px-6 py-4 text-right">Console Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 font-bold text-gray-700">
                                {users.map((item) => {
                                    const isCurrentAction = actionId === item._id;

                                    return (
                                        <tr
                                            key={item._id}
                                            className="transition-colors hover:bg-gray-50/30"
                                        >
                                            <td className="px-6 py-4 flex flex-col gap-0.5">
                                                <span className="text-sm font-black text-gray-800">
                                                    {item.name || "Woo User"}
                                                </span>
                                                <span className="text-[11px] font-medium text-gray-400 break-all">
                                                    {item.email}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 vertical-center">
                                                <span
                                                    className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider border ${item.admin
                                                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                                            : "bg-gray-100 text-gray-500 border-gray-200/50"
                                                        }`}
                                                >
                                                    {item.admin ? "Administrator" : "Standard User"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-400 font-medium">
                                                {item.createdAt
                                                    ? new Date(item.createdAt).toLocaleDateString(
                                                        "en-EG",
                                                        {
                                                            year: "numeric",
                                                            month: "short",
                                                            day: "numeric",
                                                        },
                                                    )
                                                    : "October 2026"}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() =>
                                                            handleToggleAdminRole(item._id, item.admin)
                                                        }
                                                        disabled={isCurrentAction}
                                                        className={`text-[10px] px-3 py-1.5 rounded-xl font-black transition-all duration-200 cursor-pointer flex items-center gap-1 border active:scale-95 disabled:opacity-50 ${item.admin
                                                                ? "bg-amber-50 border-amber-100 text-amber-600 hover:bg-amber-500 hover:text-white hover:border-amber-500 shadow-amber-500/5"
                                                                : "bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 shadow-emerald-500/5"
                                                            }`}
                                                    >
                                                        {item.admin ? (
                                                            <>
                                                                <ShieldCheck size={12} />
                                                                <span>Promote Admin</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <UserMinus size={12} />
                                                                <span>Demote Client</span>
                                                            </>
                                                        )}
                                                    </button>

                                                    <button
                                                        onClick={() => handleDeleteUser(item._id)}
                                                        disabled={isCurrentAction}
                                                        className="p-2 border border-gray-100 text-gray-400 hover:text-red-500 rounded-xl hover:bg-red-50 hover:border-red-100 transition-all duration-200 cursor-pointer active:scale-95 disabled:opacity-50"
                                                        title="Delete User Account"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageUsers;
