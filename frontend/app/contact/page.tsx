"use client";
import Image from "next/image";
import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";

const Contact = () => {
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        message: "",
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);

    const maxLength = 200;

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;
        if (name === "message" && value.length > maxLength) return;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const currentLength = formData.message.length;
    const remaining = maxLength - currentLength;

    const counterColor =
        remaining === 0
            ? "text-red-500 font-black animate-pulse"
            : remaining <= 30
                ? "text-amber-500 font-bold"
                : "text-emerald-500";

    const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const api: string = process.env.NEXT_PUBLIC_CONTACT_API || "";
        if (!api) {
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(api, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    name: formData.name,
                    phone: formData.phone,
                    message: formData.message,
                }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setSuccess(true);
                setFormData({ name: "", phone: "", message: "" });
                setTimeout(() => setSuccess(false), 4000);
            } else {
                alert(data.message || "Transmission failure");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    return (
        <section
            id="contact"
            className="w-full min-h-96 py-6 px-2.5 flex gap-6 flex-col items-center select-none animate-in fade-in duration-200 bg-white"
        >
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 tracking-tight mt-3">
                Contact <span className="text-emerald-600">Us</span>
            </h2>
            <div className="w-full max-w-6xl flex flex-col md:flex-row gap-6 items-center justify-center">
                <div className="w-full md:w-1/2 relative h-[350px] md:h-[450px] rounded-2xl overflow-hidden shadow-xl shadow-emerald-100/50 group border border-gray-100 bg-white">
                    <Image
                        src="/contact.webp"
                        alt="Contact Us"
                        fill
                        className="h-full w-full transition-transform duration-300 group-hover:scale-105 object-cover"
                    />
                </div>

                <div className="w-full max-w-md flex flex-col gap-4 mt-6">
                    {success ? (
                        <div className="w-full p-6 border border-emerald-500/10 bg-emerald-500/5 rounded-2xl text-center flex flex-col items-center gap-2 animate-in zoom-in-95">
                            <CheckCircle2
                                size={36}
                                className="text-emerald-500 animate-bounce"
                            />
                            <h4 className="text-sm font-bold text-gray-800">
                                Secure Transmission Verified
                            </h4>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                Your telemetry data and ticket records have bypassed structural
                                latency and safely populated active admin logs.
                            </p>
                        </div>
                    ) : (
                        <form
                            onSubmit={handleContactSubmit}
                            className="flex flex-col gap-4 w-full"
                        >
                            <div className="relative w-full">
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    placeholder=" "
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className="peer w-full px-3.5 pb-2.5 pt-6 text-sm text-gray-800 border border-gray-200 rounded-xl bg-gray-50/50 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all duration-200"
                                />
                                <label
                                    htmlFor="name"
                                    className="absolute left-3.5 top-4 text-sm text-gray-400 bg-transparent transition-all duration-200 origin-left pointer-events-none peer-focus:text-emerald-600 peer-focus:-translate-y-2.5 peer-focus:scale-75 peer-not-placeholder-shown:-translate-y-2.5 peer-not-placeholder-shown:scale-75"
                                >
                                    Your Name
                                </label>
                            </div>

                            <div className="relative w-full">
                                <input
                                    type="tel"
                                    name="phone"
                                    id="phone"
                                    placeholder=" "
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    required
                                    className="peer w-full px-3.5 pb-2.5 pt-6 text-sm text-gray-800 border border-gray-200 rounded-xl bg-gray-50/50 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all duration-200"
                                />
                                <label
                                    htmlFor="phone"
                                    className="absolute left-3.5 top-4 text-sm text-gray-400 bg-transparent transition-all duration-200 origin-left pointer-events-none peer-focus:text-emerald-600 peer-focus:-translate-y-2.5 peer-focus:scale-75 peer-not-placeholder-shown:-translate-y-2.5 peer-not-placeholder-shown:scale-75"
                                >
                                    Your Mobile Phone
                                </label>
                            </div>

                            <div className="relative w-full">
                                <textarea
                                    name="message"
                                    id="message"
                                    placeholder=" "
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    required
                                    className="h-44 peer w-full px-3.5 pb-2.5 pt-6 text-sm text-gray-800 border border-gray-200 rounded-xl bg-gray-50/50 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all duration-200 resize-none"
                                />
                                <label
                                    htmlFor="message"
                                    className="absolute left-3.5 top-4 text-sm text-gray-400 bg-transparent transition-all duration-200 origin-left pointer-events-none peer-focus:text-emerald-600 peer-focus:-translate-y-2.5 peer-focus:scale-75 peer-not-placeholder-shown:-translate-y-2.5 peer-not-placeholder-shown:scale-75"
                                >
                                    Your Message
                                </label>

                                <div
                                    className={`absolute bottom-2.5 right-3.5 text-[10px] font-black tracking-wider transition-all duration-300 ${counterColor}`}
                                >
                                    {remaining} chars left
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-emerald-600 text-white py-3 rounded-xl hover:bg-emerald-700 cursor-pointer transition-colors duration-300 transform active:scale-[0.99] font-bold text-sm shadow-md shadow-emerald-600/10 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Encrypting logs...</span>
                                    </>
                                ) : (
                                    <span>Send Message</span>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Contact;
