"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import icon from "../../public/spark.png";
import ProgressLoader from "./progress";

export default function SubmitButton({ loading, onSubmit }) {
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
      // If process finishes
      clearInterval(intervalRef.current);
      setPercentage(100);

      // Optional: auto-reset to 0 after short delay
      setTimeout(() => setPercentage(0), 1000);
    }

    return () => clearInterval(intervalRef.current);
  }, [loading]);

  const handleClick = async () => {
    if (onSubmit) {
      onSubmit();
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        disabled={loading}
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
          src={icon}
          alt="Generate icon"
          width={25}
          height={25}
          className="mr-2 -ml-1.5"
        />
        <span className="whitespace-nowrap">
          {loading ? "Processing..." : "Generate Icon"}
        </span>
      </button>

      {/* Loader */}
      {loading && (
        <div className="pt-4 w-full">
          <ProgressLoader percentage={Math.floor(percentage)} />
        </div>
      )}

      {!loading && (
        <p className="text-sm text-gray-400 pt-3 text-center">
          Click to generate your animated icon
        </p>
      )}
    </div>
  );
}
