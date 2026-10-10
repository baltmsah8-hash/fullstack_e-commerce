import Image from "next/image";
import { ShoppingBag, ShieldCheck, Truck } from "lucide-react"; 

function About() {
  return (
    <section id="about" className="w-full py-16 px-4 md:px-8 bg-gray-50/50">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">

        <div className="w-full md:w-1/2 relative h-[350px] md:h-[450px] rounded-2xl overflow-hidden shadow-xl shadow-emerald-100/50 group border border-gray-100 bg-white">
          <Image
            src="/about.webp" 
            alt="About Woo Store"
            fill
            className="h-full w-full transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        <div className="w-full md:w-1/2 flex flex-col gap-6 text-center md:text-left">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              Our Story
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 tracking-tight mt-3">
              About <span className="text-emerald-600">Woo Store</span>
            </h2>
          </div>

          <p className="text-gray-500 text-sm md:text-base leading-relaxed">
            Welcome to <strong className="text-gray-700 font-semibold">Woo Store</strong>, your premium destination for everything exceptional. We are dedicated to bringing you the finest collection of fashion, technology, and essentials. Our journey started with a simple mission: to provide high-quality products with a seamless, safe, and joyful shopping experience just for you.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">

            <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col items-center md:items-start gap-2 text-center md:text-left">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <ShoppingBag size={20} />
              </div>
              <h4 className="font-bold text-sm text-gray-800">Top Quality</h4>
              <p className="text-xs text-gray-400">Curated premium brands at Woo Store.</p>
            </div>

            <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col items-center md:items-start gap-2 text-center md:text-left">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <ShieldCheck size={20} />
              </div>
              <h4 className="font-bold text-sm text-gray-800">Secure Pay</h4>
              <p className="text-xs text-gray-400">100% protected and safe checkout.</p>
            </div>

            <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col items-center md:items-start gap-2 text-center md:text-left">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <Truck size={20} />
              </div>
              <h4 className="font-bold text-sm text-gray-800">Fast Delivery</h4>
              <p className="text-xs text-gray-400">Quick shipping straight to your door.</p>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}

export default About;