"use client";
import {
    Bell,
    MessageSquare,
    CreditCard,
    AlertTriangle,
    Loader2,
    Trash2,
} from "lucide-react";
import { NotificationType } from "../page";

interface NotificationProps {
    notifications: NotificationType[];
    setNotifications: React.Dispatch<React.SetStateAction<NotificationType[]>>;
    loading: boolean;
}

const Notifications = ({ notifications, setNotifications, loading }: NotificationProps) => {

    const handleClearAll = async () => {
        if (!confirm("Are you sure you want to permanently clear the notification vault?")) return;

        const api: string = process.env.NEXT_PUBLIC_CLEAR_NOTIFICATION_API || "";
        if (!api) return;

        try {
            const res = await fetch(api, {
                method: "DELETE",
                credentials: "include",
            });

            if (res.ok) {
                setNotifications([]);
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="w-full min-h-[80vh] flex flex-col items-center gap-6 py-6 animate-in fade-in duration-200">
            <div className="w-full max-w-xl w-[80%] flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex flex-col gap-0.5">
                    <h2 className="text-xl font-black text-gray-800 tracking-tight flex items-center gap-2">
                        <Bell size={20} className="text-emerald-600" />
                        <span>Secure System Logs</span>
                    </h2>
                    <p className="text-[10px] text-gray-400 font-medium">
                        Review live telemetry logs and physical customer tickets.
                    </p>
                </div>

                {notifications.length > 0 && (
                    <button
                        onClick={handleClearAll}
                        className="p-2 border border-gray-100 text-gray-400 hover:text-red-500 rounded-xl hover:bg-red-50 hover:border-red-100 transition-all duration-200 cursor-pointer active:scale-95"
                        title="Clear Notification Ledger"
                    >
                        <Trash2 size={14} />
                    </button>
                )}
            </div>

            {loading ? (
                <div className="w-full py-20 flex flex-col items-center justify-center gap-2 bg-white">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-600 font-bold" />
                    <p className="text-xs text-gray-400 font-medium">
                        Syncing commercial telemetry streams...
                    </p>
                </div>
            ) : notifications.length === 0 ? (
                <div className="w-full max-w-xl w-[80%] bg-white border border-gray-100 p-12 rounded-2xl text-center shadow-xs flex flex-col items-center justify-center gap-2">
                    <Bell size={28} className="text-gray-300 animate-pulse" />
                    <h4 className="text-sm font-bold text-gray-700">
                        Ledger Buffer Empty
                    </h4>
                    <p className="text-[11px] text-gray-400 max-w-xs mx-auto">
                        No telemetry signals, stock alarms, or contact forms currently held
                        in active buffer.
                    </p>
                </div>
            ) : (
                <div className="w-full max-w-xl w-[80%] flex flex-col gap-4 bg-white">
                    {notifications.map((notif) => {
                        const isContact = notif.title === "contact";
                        const isOrder = notif.title === "order";

                        return (
                            <div
                                key={notif._id}
                                className={`w-full bg-white border border-gray-100 rounded-2xl p-4 shadow-xs flex flex-col gap-3 transition-all duration-200 relative overflow-hidden ${!notif.isRead
                                    ? "border-l-4 border-l-emerald-500 bg-emerald-50/5"
                                    : ""
                                    }`}
                            >
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`p-2 rounded-full shrink-0 ${isContact
                                                ? "bg-blue-50 text-blue-600"
                                                : isOrder
                                                    ? "bg-emerald-50 text-emerald-600"
                                                    : "bg-amber-50 text-amber-600"
                                                }`}
                                        >
                                            {isContact ? (
                                                <MessageSquare size={14} />
                                            ) : isOrder ? (
                                                <CreditCard size={14} />
                                            ) : (
                                                <AlertTriangle size={14} />
                                            )}
                                        </div>

                                        <span className="text-xs font-black uppercase tracking-wider text-gray-800">
                                            {notif.title}
                                        </span>
                                    </div>

                                    {!notif.isRead && (
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-ping" />
                                    )}
                                </div>

                                <div className="w-full text-xs font-medium text-gray-600 leading-relaxed px-1 line-clamp-2 break-words text-wrap">
                                    {notif.message}
                                </div>


                                {isContact && notif.data && (
                                    <div className="w-full flex items-center justify-between pt-2 border-t border-gray-50/60 mt-1 text-[11px]">
                                        <span className="font-black text-gray-800 truncate max-w-[150px]">
                                            {notif.data.name || "Anonymous Guest"}
                                        </span>

                                        <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md shrink-0 select-all">
                                            {notif.data.phone || "No Contact"}
                                        </span>
                                    </div>
                                )}

                                {isOrder && notif.data && (
                                    <div className="w-full flex items-center justify-between pt-2 border-t border-gray-50/60 mt-1 text-[11px]">
                                        <span className="font-medium text-gray-400 truncate max-w-[150px]">
                                            Ref: #{notif.data.orderId?.slice(-8)}
                                        </span>

                                        <span className="font-black text-emerald-600 shrink-0">
                                            {notif.data.amount}.00 EGP
                                        </span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Notifications;
