import type { Metadata } from "next";
import "./globals.css";
import Navbar from "../components/navbar";
import { Rubik } from 'next/font/google';
import Footer from "@/components/footer";
import { CartProvider } from "@/context/cartContext";
import ToTopButton from "@/components/topBtn";

const rubik = Rubik({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '700'],
  style: ['normal'],
});

export const metadata: Metadata = {
  title: "Woo_Store",
  description: "it's a main store for any client",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${rubik.className} h-full antialiased 
        overflow-x-hidden scroll-smooth`}
    >
      <body className="min-h-full flex flex-col overflow-x-hidden scroll-smooth">
        <CartProvider>
          <Navbar />
          {children}
          <Footer />
          <ToTopButton />
        </CartProvider>
      </body>
    </html>
  );
}
