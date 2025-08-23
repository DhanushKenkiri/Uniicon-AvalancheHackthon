import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppProvider from "@/context/AppProvider";
import Banner from "@/components/banner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "AI-Powered Animated Icons Generator",
  description: "Generate beautiful animated icons using AI agents.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-[#36322f]`}
      >
        <Banner/>
        <div className="flex justify-center w-full">
          <div className="w-full max-w-[100vw] px-[15vw]">
            <AppProvider>{children}</AppProvider>
          </div>
        </div>
      </body>
    </html>
  );
}
