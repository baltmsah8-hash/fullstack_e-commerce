"use client";
import React, { useState, useEffect, useContext } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, Eye, EyeOff, Loader2, ArrowLeft, ShieldAlert } from "lucide-react";
import { CartContext } from "@/context/cartContext";

interface UserLogin {
    email: string;
    password: string;
}

const LoginPage = () => {
    const [formData, setFormData] = useState<UserLogin>({
        email: '',
        password: ''
    });
    const apis: (string | undefined)[] = [
        process.env.NEXT_PUBLIC_ADMIN_LOGIN_API,
        process.env.NEXT_PUBLIC_LOGIN_API
    ];
    const router = useRouter();
    const cartContext = useContext(CartContext);
    const [admin, setAdmin] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<string>('');

    const handelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({...prev, [id]: value}));
    };

    const postData = async (data: UserLogin) => {
        setLoading(true);
        setMessage('');
        const api = admin ? apis[0] : apis[1];
        if (!api) {
            setMessage("Login API URL is not configured");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(api, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "Accept": "application/json",
                },
                body: JSON.stringify({
                    email: data.email,
                    password: data.password,
                }),
                credentials: "include"
            });

            const result = await res.json();

            if (res.ok) {
                await cartContext?.getData();
                router.push(admin ? '/admin' : '/profile');
                setMessage(result.message)
            } else {
                setMessage(result.message);
            }

        } catch (error) {
            console.error(error);
            setMessage("Network error, please try again later");
        } finally {
            setLoading(false);
        }
    };

        const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        postData(formData);

    };

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setMessage('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    return (
        <main className="w-full min-h-screen bg-gray-50/50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8 flex flex-col gap-6 animate-in zoom-in-95 duration-200">
                
                <Link href="/" className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-emerald-600 transition-colors group self-start">
                    <ArrowLeft size={14} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
                    <span>Back to Store</span>
                </Link>

                <div className="flex flex-col gap-1.5 text-center">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center self-center mb-1">
                        <LogIn size={22} />
                    </div>
                    <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">
                        Welcome <span className="text-emerald-600">Back</span>
                    </h1>
                    <p className="text-xs text-gray-400">Select your account type to access the Woo platform.</p>
                </div>

                <div className="w-full p-1 bg-gray-100 rounded-xl grid grid-cols-2 gap-1 border border-gray-200/40">
                    <button
                        type="button"
                        onClick={() => setAdmin(false)}
                        className={`py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                            !admin
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-400 hover:text-gray-700"
                        }`}
                    >
                        Regular User
                    </button>
                    <button
                        type="button"
                        onClick={() => setAdmin(true)}
                        className={`py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                            admin
                                ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/10"
                                : "text-gray-400 hover:text-gray-700"
                        }`}
                    >
                        {admin && <ShieldAlert size={12} className="animate-pulse" />}
                        <span>Admin Portal</span>
                    </button>
                </div>

                {message && (
                    <div className="p-3 text-xs font-semibold text-center rounded-xl border bg-red-50 border-red-100 text-red-700 animate-in fade-in duration-150">
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="relative w-full">
                        <input
                            type="email"
                            id="email"
                            placeholder=" "
                            required
                            onChange={handelChange}
                            className="peer w-full px-4 pb-2.5 pt-6 text-sm text-gray-800 border border-gray-200 rounded-xl bg-gray-50/40 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all duration-200"
                        />
                        <label
                            htmlFor="email"
                            className="absolute left-4 top-4 text-sm text-gray-400 bg-transparent transition-all duration-200 origin-left pointer-events-none peer-focus:text-emerald-600 peer-focus:-translate-y-3 peer-focus:scale-75 peer-not-placeholder-shown:-translate-y-3 peer-not-placeholder-shown:scale-75"
                        >
                            Email Address
                        </label>
                    </div>

                    <div className="relative w-full">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            placeholder=" "
                            required
                            onChange={handelChange}
                            className="peer w-full pl-4 pr-11 pb-2.5 pt-6 text-sm text-gray-800 border border-gray-200 rounded-xl bg-gray-50/40 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all duration-200"
                        />
                        <label
                            htmlFor="password"
                            className="absolute left-4 top-4 text-sm text-gray-400 bg-transparent transition-all duration-200 origin-left pointer-events-none peer-focus:text-emerald-600 peer-focus:-translate-y-3 peer-focus:scale-75 peer-not-placeholder-shown:-translate-y-3 peer-not-placeholder-shown:scale-75"
                        >
                            Password
                        </label>
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors p-1 cursor-pointer flex items-center justify-center"
                        >
                            {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 mt-2 rounded-xl text-white font-semibold text-sm transition-all duration-300 shadow-md transform active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 ${
                            admin
                                ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/10"
                                : "bg-gray-900 hover:bg-emerald-600 shadow-gray-900/10"
                        }`}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                <span>Authenticating...</span>
                            </>
                        ) : (
                            <span>{admin ? "Verify Admin Session" : "Log In"}</span>
                        )}
                    </button>
                </form>

                <div className="text-center text-xs text-gray-400 border-t border-gray-100 pt-4 font-medium">
                    Don&apos;t have an account?{" "}
                    <Link href="/register" className="text-emerald-600 hover:underline font-semibold transition-all">
                        Sign Up
                    </Link>
                </div>

            </div>
        </main>
    );
};

export default LoginPage;
