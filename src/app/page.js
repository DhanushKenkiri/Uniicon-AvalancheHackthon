"use client";

import { useState, useEffect } from "react";
import { useAccount, useWalletClient } from 'wagmi';
import { parseEther } from 'viem';

import Header from "@/components/header";
import Input from "@/components/input";
import SubmitButton from "@/components/submit-button";
import Showcase from "@/components/showcase";
import ErrorToast from "@/components/error";
import ResultModal from "@/components/result";

import Image from "next/image";
import glow from "../../public/glow.png";

// Avalanche payment contract address
const PAYMENT_CONTRACT_ADDRESS = "0xe51Cd82e6D44E84049ffD7C954ea62484dCc99e9";
const PAYMENT_AMOUNT = "0.02"; // 0.02 AVAX

export default function HomePage() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [transactionPending, setTransactionPending] = useState(false);

  // Automatically show modal when result is set
  useEffect(() => {
    if (result) {
      setShowModal(true);
    }
  }, [result]);

  const handleSubmit = async (e) => {
    if (!isConnected || !address) {
      setError({
        message: "Please connect your wallet first",
        hint: "Connect your wallet using the generate button",
        details: "Wallet connection required for payment"
      });
      return;
    }

    if (!walletClient) {
      setError({
        message: "Wallet client not ready",
        hint: "Please try again in a moment",
        details: "Wallet client is still initializing"
      });
      return;
    }

    if (!input.trim()) {
      setError({
        message: "Please enter a description for your icon",
        hint: "Describe what kind of icon you want to generate",
        details: "Input cannot be empty"
      });
      return;
    }

    // Clear previous states
    setError(null);
    setResult(null);
    setShowModal(false);

    try {
      // Step 1: Send payment transaction to the contract
      console.log(`Sending ${PAYMENT_AMOUNT} AVAX to contract: ${PAYMENT_CONTRACT_ADDRESS}`);
      setTransactionPending(true);
      
      const paymentTx = await walletClient.sendTransaction({
        to: PAYMENT_CONTRACT_ADDRESS,
        value: parseEther(PAYMENT_AMOUNT),
        data: '0x', // Empty data for simple transfer
      });

      console.log("Payment transaction sent:", paymentTx);
      setTransactionPending(false);
      
      // Step 2: Now start the loading state for icon generation
      setLoading(true);
      
      // Wait for a moment to ensure transaction is processed
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 3: Call our API to generate the icon
      console.log("Generating icon...");
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          input,
          userAddress: address,
          paymentTxHash: paymentTx,
          paymentAmount: PAYMENT_AMOUNT
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data.result); // This triggers modal via useEffect
      } else {
        const err = await res.json();
        setError({
          message: err.error || "Generation failed",
          hint: err.hint || "Please try again",
          details: err.details
        });
      }
    } catch (err) {
      console.error("Transaction failed:", err);
      setTransactionPending(false);
      
      if (err.message.includes("User rejected") || err.message.includes("denied")) {
        setError({
          message: "Transaction was cancelled",
          hint: "You need to approve the payment to generate an icon",
          details: "User cancelled the transaction"
        });
      } else if (err.message.includes("insufficient funds")) {
        setError({
          message: "Insufficient AVAX balance",
          hint: `You need at least ${PAYMENT_AMOUNT} AVAX to generate an icon`,
          details: err.message
        });
      } else if (err.message.includes("network")) {
        setError({
          message: "Network error",
          hint: "Please check your connection and try again",
          details: err.message
        });
      } else {
        setError({
          message: err.message || "Transaction failed",
          hint: "Please try again or check your wallet",
          details: err.stack
        });
      }
    } finally {
      setLoading(false);
      setTransactionPending(false);
    }
  };

  return (
    <main>
      <Header />
      <div className="p-4 mt-33 mb-10 mx-auto rounded-4xl bg-[#FBFAFA]">
        <div className="relative flex justify-center items-center mt-24 mb-4">
          {/* Glow background */}
          <Image
            src={glow}
            alt="glow"
            width={600}
            height={600}
            className="opacity-20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none"
          />

          {/* Title Text */}
          <h1 className="text-[2.5rem] lg:text-[4.2rem] text-center text-[#36322F] font-semibold tracking-tight leading-[0.9] relative z-10">
            The animated icon generator
            <br />
            <span className="block leading-[1.3]">
              <span className="relative px-1 text-orange-600 inline-flex justify-center items-center">
                powered by AI agents on Avalanche
              </span>
            </span>
          </h1>
        </div>

        <p className="text-center text-[#71717a] text-lg mt-8 max-w-2xl mx-82">
          Let a team of AI agents to plan, draw, script, and animate any icon
          you want. Avalanche-powered, pay-per-use.
        </p>

        <div className="w-full flex flex-col items-center gap-4 mt-12">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            loading={loading}
          />

          <SubmitButton 
            loading={loading} 
            transactionPending={transactionPending}
            onSubmit={handleSubmit} 
          />
        </div>

        <Showcase />

        {error && <ErrorToast message={error} />}
      </div>

      {showModal && result && (
        <ResultModal url={result} onClose={() => setShowModal(false)} />
      )}
    </main>
  );
}
