"use client";
import React, { useState, useEffect } from "react";
import {
    CreditCard,
    Loader2,
    Package,
    MapPin
} from "lucide-react";

interface OrderAddress {
    city: string;
    full_address: string;
}

interface OrderProduct {
    _id: string;
    name: string;
    price: string;
    quantity: number;
}

interface OrderType {
    _id: string;
    userId: string;
    products: string;
    amount: number;
    address: OrderAddress;
    status: "pending" | "on the way" | "delivered";
    payment: boolean;
    createdAt?: string;
}

const ManageOrders = () => {
    const [orders, setOrders] = useState<OrderType[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const getData = async () => {
        const api: string = process.env.NEXT_PUBLIC_LIST_ORDER_API || '';
        try {
            const res = await fetch(api, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include'
            });

            const result = await res.json();
            if (res.ok) {
                setOrders(result.data || []);
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId: string, newStatus: string) => {
        setUpdatingId(orderId);
        const api: string = process.env.NEXT_PUBLIC_STATUS_ORDER_API || "";
        try {
            const res = await fetch(api, {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    orderId: orderId,
                    status: newStatus
                }),
                credentials: 'include'
            });

            const result = await res.json();
            if (res.ok && result.success) {
                setOrders((prev) =>
                    prev.map((order) => order._id === orderId ? { ...order, status: newStatus as any } : order)
                );
            } else {
                alert(result.message || "Failed to shift logistics trajectory");
            }
        } catch (error) {
            console.log(error);
        } finally {
            setUpdatingId('');
        }
    };

    useEffect(() => {
        getData();
    }, [])

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-200">
      <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight flex items-center gap-2">
            <Package size={24} className="text-emerald-600" />
            <span>Live Order Logistics</span>
          </h2>
          <p className="text-xs text-gray-400">Review invoice receipts, dispatch status trajectories and update transaction clearance.</p>
        </div>
      </div>

      {loading ? (
        <div className="w-full py-20 flex flex-col items-center justify-center gap-3 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-600 font-bold" />
          <p className="text-xs text-gray-400 font-medium">Fetching secure orders database records...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="w-full bg-white border border-gray-100 p-12 rounded-2xl text-center shadow-xs flex flex-col items-center justify-center gap-2">
          <Package size={32} className="text-gray-300 animate-pulse" />
          <h4 className="text-sm font-bold text-gray-700">No Orders Registered</h4>
          <p className="text-xs text-gray-400 max-w-xs">No transaction records or invoice payloads detected in the active collection.</p>
        </div>
      ) : (
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => {
            let parsedProducts: OrderProduct[] = [];
            try {
              parsedProducts = JSON.parse(order.products);
            } catch (e) {
              console.error(e);
            }

            const orderDate = order.createdAt 
              ? new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
              : "Oct 9, 2026";
            
            const orderTime = order.createdAt
              ? new Date(order.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
              : "05:00 PM";

            const isCurrentAction = updatingId === order._id;

            return (
              <div 
                key={order._id} 
                className="w-full bg-white border border-gray-100 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-gray-200/80 transition-all duration-200 flex flex-col gap-4"
              >
                <div className="w-full flex items-center justify-between gap-3 border-b border-gray-50 pb-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest font-black">ID: #{order._id.slice(-8)}</span>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-semibold mt-0.5">
                      <span>{orderDate}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <span>{orderTime}</span>
                    </div>
                  </div>

                  <span className={`text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider border flex items-center gap-1 ${
                    order.payment
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                  }`}>
                    <CreditCard size={10} />
                    <span>{order.payment ? "Paid Secure" : "Unpaid"}</span>
                  </span>
                </div>

                <div className="flex flex-col gap-1 border-b border-gray-50 pb-3">
                  <span className="text-[10px] uppercase font-black tracking-wider text-gray-400 mb-0.5">Shipping Target</span>
                  <div className="flex items-start gap-2">
                    <div className="p-1.5 bg-gray-50 rounded-lg text-gray-500 mt-0.5 shrink-0">
                      <MapPin size={14} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-black text-gray-700 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md w-fit">
                        {order.address?.city || "Cairo"}
                      </span>
                      <p className="text-xs font-black text-gray-800 leading-relaxed mt-0.5">
                        {order.address?.full_address || "No complete destination string saved."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 flex flex-col gap-2">
                  <span className="text-[10px] uppercase font-black tracking-wider text-gray-400 mb-0.5">Items Purchased</span>
                  <div className="flex flex-col gap-2 max-h-32 overflow-y-auto pr-1 divide-y divide-gray-50">
                    {parsedProducts.map((p, idx) => (
                      <div key={p._id || idx} className="flex justify-between items-center text-xs font-bold text-gray-700 pt-2 first:pt-0">
                        <span className="text-gray-800 font-black line-clamp-1">
                          {p.name} <span className="text-gray-400 font-bold text-[10px] ml-1">x{p.quantity}</span>
                        </span>
                        <span className="text-gray-500 shrink-0">{Number(p.price || 0) * p.quantity || p.price} EGP</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="w-full flex items-center justify-between border-t border-gray-50 pt-3.5 mt-auto">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Invoice Sum</span>
                    <span className="text-gray-900 text-base font-black">{order.amount}.00 <span className="text-[10px] font-bold text-gray-500">EGP</span></span>
                  </div>

                  <select
                    value={order.status}
                    disabled={isCurrentAction}
                    onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                    className={`text-[11px] px-4 py-2.5 rounded-xl font-black border transition-all cursor-pointer outline-none shadow-xs active:scale-[0.98] ${
                      order.status === "delivered"
                        ? "bg-emerald-50 border-emerald-200 text-emerald-600 focus:border-emerald-500"
                        : order.status === "on the way"
                        ? "bg-blue-50 border-blue-200 text-blue-600 focus:border-blue-500"
                        : "bg-amber-50 border-amber-200 text-amber-600 focus:border-amber-500"
                    }`}
                  >
                    <option value="pending">Pending Review</option>
                    <option value="on the way">On The Way</option>
                    <option value="delivered">Delivered Safe</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );


};

export default ManageOrders;
