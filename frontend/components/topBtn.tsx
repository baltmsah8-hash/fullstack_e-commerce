"use client";
import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

const ToTopButton = () => {
    const [display, setDisplay] = useState<boolean>(false);
    const toTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        })
    };

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) {
                setDisplay(true);
            } else {
                setDisplay(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        }

    }, []);

    return (
        <button
            onClick={toTop}
            className={`fixed bottom-6 right-6 z-50 p-3 rounded-xl bg-gray-905 bg-emerald-400 text-white shadow-xl
            flex items-center justify-center cursor-pointer transition-all duration-150 transform active:scale-90
            hover:bg-emerald-600 hover:border-emerald-500 hover:shadow-emerald-500/20
            ${display ? "opacity-100 translate-y-0 visible" : "opacity-0 translate-y-4 invisible"}`}
            aria-label="Scroll to top"
        >
            <ArrowUp size={25} />
        </button>
    );
};

export default ToTopButton;