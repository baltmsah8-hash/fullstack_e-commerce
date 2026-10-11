"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";

interface User {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

const Register = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [showOne, setShowOne] = useState(false);
    const [showTwo, setShowTwo] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const postData = async (data: User) => {
        setLoading(true);
        setMessage('');
        const api = process.env.NEXT_PUBLIC_REGISTER_API as string;

        try {
            const req = await fetch( `${api}` , {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify({
                    name: data.name,
                    email: data.email,
                    password: data.password,
                }),
                credentials: "include",
            });

            const res = await req.json();
            console.log(res)

            if (req.ok) {
                setMessage(`${res.message}` || `User Registered`);
                setFormData({
                    name: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                });
                router.push("/profile");
            } else {
                setMessage(res.message || 'Error during register');
            }

            
        } catch (error) {
            setMessage('Internal server error try agin later');
            console.error("Registration Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password.trim() === formData.confirmPassword.trim()) {
            postData(formData);
        } else {
            setMessage('Passwords do not match');
        }
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
    <main className="w-full min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8 flex flex-col gap-6 animate-in zoom-in-95 duration-200">
            
            <Link href="/" className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-emerald-600 transition-colors group self-start">
                <ArrowLeft size={14} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
                <span>Back to Store</span>
            </Link>

            <div className="flex flex-col gap-1.5 text-center">
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 tracking-tight">
                    Create <span className="text-emerald-600">Account</span>
                </h1>
                <p className="text-xs text-gray-400">Join Woo Store today for a premium shopping experience.</p>
            </div>

            {message && (
                <div className={`p-3 text-xs font-semibold text-center rounded-xl border animate-in fade-in duration-150 ${
                    message.includes('successfully') || message.includes('Registered')
                        ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
                        : "bg-red-50 border-red-100 text-red-700"
                }`}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                
                <div className="relative flex gap-3 flex-row items-center w-full">
                    <span className="h-7 w-7 rounded-full flex justify-center items-center text-xs font-bold bg-emerald-600 text-white z-10 shrink-0 shadow-sm shadow-emerald-500/20">1</span>
                    <div className="relative w-full">
                        <input
                            type="text"
                            id="name"
                            placeholder=" "
                            value={formData.name}
                            onChange={handleChange}
                            className="peer w-full px-4 pb-2.5 pt-6 text-sm text-gray-800 border border-gray-200 rounded-xl bg-gray-50/40 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all duration-200"
                            required
                        />
                        <label
                            htmlFor="name"
                            className="absolute left-4 top-4 text-sm text-gray-400 bg-transparent transition-all duration-200 origin-left pointer-events-none
                            peer-focus:text-emerald-600 peer-focus:-translate-y-3 peer-focus:scale-75
                            peer-not-placeholder-shown:-translate-y-3 peer-not-placeholder-shown:scale-75"
                        >
                            Enter your name
                        </label>
                    </div>
                </div>

                <div className="relative flex gap-3 flex-row items-center w-full">
                    <span className="h-7 w-7 rounded-full flex justify-center items-center text-xs font-bold bg-emerald-600 text-white z-10 shrink-0 shadow-sm shadow-emerald-500/20">2</span>
                    <div className="relative w-full">
                        <input
                            type="email"
                            id="email"
                            placeholder=" "
                            value={formData.email}
                            onChange={handleChange}
                            className="peer w-full px-4 pb-2.5 pt-6 text-sm text-gray-800 border border-gray-200 rounded-xl bg-gray-50/40 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all duration-200"
                            required
                        />
                        <label
                            htmlFor="email"
                            className="absolute left-4 top-4 text-sm text-gray-400 bg-transparent transition-all duration-200 origin-left pointer-events-none
                            peer-focus:text-emerald-600 peer-focus:-translate-y-3 peer-focus:scale-75
                            peer-not-placeholder-shown:-translate-y-3 peer-not-placeholder-shown:scale-75"
                        >
                            Enter your email
                        </label>
                    </div>
                </div>

                <div className="relative flex gap-3 flex-row items-center w-full">
                    <span className="h-7 w-7 rounded-full flex justify-center items-center text-xs font-bold bg-emerald-600 text-white z-10 shrink-0 shadow-sm shadow-emerald-500/20">3</span>
                    <div className="relative w-full">
                        <input
                            type={showOne ? "text" : "password"}
                            id="password"
                            placeholder=" "
                            value={formData.password}
                            onChange={handleChange}
                            className="peer w-full pl-4 pr-11 pb-2.5 pt-6 text-sm text-gray-800 border border-gray-200 rounded-xl bg-gray-50/40 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all duration-200"
                            required
                        />
                        <label
                            htmlFor="password"
                            className="absolute left-4 top-4 text-sm text-gray-400 bg-transparent transition-all duration-200 origin-left pointer-events-none
                            peer-focus:text-emerald-600 peer-focus:-translate-y-3 peer-focus:scale-75
                            peer-not-placeholder-shown:-translate-y-3 peer-not-placeholder-shown:scale-75"
                        >
                            Enter your password
                        </label>
                        <button
                            type="button"
                            onClick={() => setShowOne(!showOne)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors p-1 cursor-pointer flex items-center justify-center"
                        >
                            {showOne ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                    </div>
                </div>

                <div className="relative flex gap-3 flex-row items-center w-full">
                    <span className="h-7 w-7 rounded-full flex justify-center items-center text-xs font-bold bg-emerald-600 text-white z-10 shrink-0 shadow-sm shadow-emerald-500/20">4</span>
                    <div className="relative w-full">
                        <input
                            type={showTwo ? "text" : "password"}
                            id="confirmPassword"
                            placeholder=" "
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="peer w-full pl-4 pr-11 pb-2.5 pt-6 text-sm text-gray-800 border border-gray-200 rounded-xl bg-gray-50/40 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all duration-200"
                            required
                        />
                        <label
                            htmlFor="confirmPassword"
                            className="absolute left-4 top-4 text-sm text-gray-400 bg-transparent transition-all duration-200 origin-left pointer-events-none
                            peer-focus:text-emerald-600 peer-focus:-translate-y-3 peer-focus:scale-75
                            peer-not-placeholder-shown:-translate-y-3 peer-not-placeholder-shown:scale-75"
                        >
                            Confirm your password
                        </label>
                        <button
                            type="button"
                            onClick={() => setShowTwo(!showTwo)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors p-1 cursor-pointer flex items-center justify-center"
                        >
                            {showTwo ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 mt-2 rounded-xl bg-gray-900 text-white font-semibold text-sm transition-all duration-300 hover:bg-emerald-600 shadow-md shadow-gray-900/10 active:scale-[0.98] transform cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {
                        loading ? (<><Loader2 className="animate-spin" /> <span>Creating Account</span></>) : "Create Account"
                    }
                    
                </button>
            </form>

            <div className="text-center text-xs text-gray-400 border-t border-gray-100 pt-4 font-medium">
                Already have an account?{" "}
                <Link href="/login" className="text-emerald-600 hover:underline font-semibold transition-all">
                    Log In
                </Link>
            </div>
        </div>
    </main>
);

};

export default Register;