"use client";
import { useState, useEffect, useRef } from "react";

interface ListCategoryProps {
    onCategoryChange: (category: string) => void;
}

const ListCategory = ({ onCategoryChange }: ListCategoryProps) => {
    const menuWords: string[] = ["All", "Men", "Women", "Kids", "Technologies"];
    const [active, setActive] = useState(0);
    const [coords, setCoords] = useState<{ left: number; width: number }>({ left: 0, width: 0 });
    const itemsRef = useRef<(HTMLElement | null)[]>([]);

    const updatePosition = (index: number) => {
        const element = itemsRef.current[index];
        if (element) {
            setCoords({
                left: element.offsetLeft,
                width: element.offsetWidth,
            });
        }
    };

    useEffect(() => {
        updatePosition(active);

        const handleResize = () => updatePosition(active);
        window.addEventListener('resize', handleResize);

        return () => { 
            window.removeEventListener('resize', handleResize);
        };
    }, [active]);

    return (
        <nav className="w-full flex flex-col gap-5 items-center select-none bg-transparent">
            <h2 className="text-3xl font-bold text-gray-800 tracking-tight">
                Browse By <span className="text-emerald-600">Category</span>
            </h2>

            <ul className="relative z-0 flex flex-nowrap md:flex-wrap items-center gap-1 p-1.5 
            bg-white border border-emerald-100 rounded-lg shadow-sm 
            w-full max-w-[95vw] md:w-auto overflow-x-auto md:overflow-x-visible 
            scrollbar-none mx-auto select-none" >
                {menuWords.map((el: string, index: number) => {
                    const isActive = active === index;
                    return (
                        <li
                            key={index}
                            ref={(node) => { itemsRef.current[index] = node; }}
                            onMouseEnter={() => updatePosition(index)}
                            onMouseLeave={() => updatePosition(active)}
                            onClick={() => { 
                                setActive(index)
                                onCategoryChange(el);
                            }}
                            className={`relative z-10 px-4 md:px-6 py-2 text-lg md:text-xl 
                                font-medium cursor-pointer transition-colors duration-300 rounded-sm ${
                                isActive 
                                ? "text-white font-semibold" 
                                : "text-gray-500 hover:text-emerald-600"
                            }`}
                        >
                            {el}
                        </li>
                    );
                })}

                <span
                className="absolute top-1.5 bottom-1.5 rounded-sm -z-10 bg-emerald-500 transition-all 
                duration-300 ease-out shadow-md shadow-emerald-500/20"
                style={{
                    left: `${coords.left}px`,
                    width: `${coords.width}px`,
                }}
                />
            </ul>
        </nav>
    );    
};

export default ListCategory;