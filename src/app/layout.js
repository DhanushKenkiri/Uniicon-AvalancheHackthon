import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import WalletProvider from "@/context/WalletProvider";
import Banner from "@/components/banner";

// Import RainbowKit styles
import '@rainbow-me/rainbowkit/styles.css';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Uniicon - Private AI Icon Generation",
  description: "Generate beautiful, private icons with AI on Avalanche blockchain",
  keywords: "AI, icons, blockchain, Avalanche, privacy, NFT"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-[#36322f]`}
      >
        <WalletProvider>
          <Banner />
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
