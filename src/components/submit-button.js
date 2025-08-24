"use client";

import { useEffect, useRef, useState } from "react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount, useSwitchChain } from "wagmi";
import { config } from "@/config/wagmi";
import Image from "next/image";

import icon from "../../public/spark.png";
import wallet from "../../public/wallet.png";
import swap from "../../public/switch.png";
import ProgressLoader from "./progress";

const TARGET_CHAIN = config.chains[0]; // Avalanche Fuji
const PAYMENT_AMOUNT = "0.02"; // 0.02 AVAX

export default function SubmitButton({ loading, transactionPending, onSubmit }) {
  const { openConnectModal } = useConnectModal();
  const { isConnected, chainId, address } = useAccount();
  const { switchChain, isPending: isSwitching } = useSwitchChain({ config });

  const needsSwitch = isConnected && chainId !== TARGET_CHAIN.id;
  const isDisabled = loading || isSwitching || transactionPending;
  const showPricing = isConnected && !needsSwitch && !loading && !transactionPending;

  const [percentage, setPercentage] = useState(0);
  const intervalRef = useRef(null);

  // Simulate progress increase
  useEffect(() => {
    if (loading) {
      setPercentage(0);
      const startTime = Date.now();
      const duration = 2 * 60 * 1000; // 2 minutes

      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / duration) * 100, 99);
        setPercentage(progress);
      }, 200);
    } else {
      clearInterval(intervalRef.current);
      setPercentage(100);
      setTimeout(() => setPercentage(0), 1000);
    }

    return () => clearInterval(intervalRef.current);
  }, [loading]);

  const handleClick = async () => {
    try {
      if (!isConnected) {
        console.log('Opening connect modal...');
        if (openConnectModal) {
          openConnectModal();
        } else {
          console.error('Connect modal not available');
        }
      } else if (needsSwitch) {
        console.log('Switching chain to:', TARGET_CHAIN.name);
        switchChain?.({ chainId: TARGET_CHAIN.id });
      } else {
        console.log('Starting generation process...');
        // For Avalanche implementation, we'll call onSubmit directly
        // The payment logic is handled in the onSubmit function
        onSubmit?.();
      }
    } catch (error) {
      console.error('Button click error:', error);
    }
  };

  let buttonText = "Generate";
  let buttonIcon = icon;

  if (!isConnected) {
    buttonText = "Connect Wallet To Generate";
    buttonIcon = wallet;
  } else if (needsSwitch) {
    buttonText = `Switch to ${TARGET_CHAIN.name}`;
    buttonIcon = swap;
  } else if (transactionPending) {
    buttonText = "Confirm Transaction";
    buttonIcon = wallet;
  }

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        disabled={isDisabled}
        onClick={handleClick}
        className="
          mt-5 rounded-[10px] text-lg font-semibold flex items-center justify-center
          transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50
          bg-orange-500 text-white hover:bg-orange-400 disabled:bg-orange-200
          [box-shadow:0_0_0_1px_hsl(24,100%,91%),_0_1px_2px_hsl(24,90%,60%),_0_3px_3px_hsl(24,95%,70%),_0_-2px_hsl(24,90%,88%)_inset]
          hover:translate-y-[1px] hover:scale-[0.98]
          active:translate-y-[2px] active:scale-[0.97]
          h-15 px-10 mb-2 w-auto min-w-72
        "
      >
        <Image
          src={buttonIcon}
          alt="icon"
          width={25}
          height={25}
          className="mr-2 -ml-1.5"
        />
        <span className="whitespace-nowrap">
          {loading 
            ? "Processing..." 
            : transactionPending 
            ? "Confirm in Wallet..." 
            : buttonText
          }
        </span>
      </button>

      {/* Loader or Pricing Info */}
      {loading ? (
        <div className="pt-4 w-full">
          <ProgressLoader percentage={Math.floor(percentage)} />
        </div>
      ) : transactionPending ? (
        <p className="text-sm text-gray-400 pt-3 text-center">
          Please confirm the transaction in your wallet...
        </p>
      ) : showPricing ? (
        <p className="text-sm text-gray-400 flex items-center justify-center gap-1 pt-3">
          Fixed pricing: {PAYMENT_AMOUNT} AVAX per generation
        </p>
      ) : (
        <p className="text-sm text-gray-400 pt-3 text-center">
          {!isConnected 
            ? "Connect your wallet to generate animated icons" 
            : needsSwitch 
            ? `Switch to ${TARGET_CHAIN.name} network`
            : "Click to generate your animated icon"
          }
        </p>
      )}
    </div>
  );
}
