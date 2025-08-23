"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import closeIcon from "../../public/close.png";

export default function ResultModal({ url, onClose }) {
  const overlayRef = useRef();
  const [showFireworks, setShowFireworks] = useState(false);

  // Result modal for displaying generated icons

  useEffect(() => {
    // Safely trigger fireworks with error handling
    try {
      const { triggerFireworks } = require("@/lib/triggerFirework");
      triggerFireworks(2000);
      setShowFireworks(true);
    } catch (error) {
      console.warn("Fireworks not available:", error.message);
      // Continue without fireworks
    }
  }, []);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      onClose?.();
    }
  };

  const handleDownload = () => {
    try {
      const link = document.createElement("a");
      
      // Handle the current data structure
      if (url && url.base64) {
        const mimeType = url.format === 'svg' ? 'image/svg+xml' : (url.format === 'mp4' ? 'video/mp4' : 'image/png');
        const extension = url.format === 'svg' ? 'svg' : (url.format === 'mp4' ? 'mp4' : 'png');
        link.href = `data:${mimeType};base64,${url.base64}`;
        link.download = `icon.${extension}`;
      } else if (url && url.url) {
        link.href = url.url;
        const extension = url.format === 'svg' ? 'svg' : (url.format === 'mp4' ? 'mp4' : 'png');
        link.download = `icon.${extension}`;
      } else if (typeof url === 'string') {
        link.href = url;
        link.download = url.includes('.mp4') ? "animated-icon.mp4" : "icon.png";
      }
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Download failed. Please try again.");
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Check if this is a fallback result
  const isFallback = url && typeof url === 'object' && url.isFallback;
  
  // Get the display URL - prioritize the url property, then handle base64 data
  const displayUrl = (url && typeof url === 'object') 
    ? (url.url || (url.base64 ? `data:${url.format === 'svg' ? 'image/svg+xml' : 'image/png'};base64,${url.base64}` : null))
    : url;

  // Validate that we have a valid URL to display
  if (!displayUrl) {
    return (
      <div className="fixed inset-0 z-50 bg-orange-50 bg-opacity-50 flex items-center justify-center">
        <div className="bg-white rounded-4xl p-6 relative w-full max-w-lg mx-auto shadow-lg">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Error</h2>
            <p className="text-gray-600 mb-4">No valid result to display.</p>
            <button
              onClick={onClose}
              className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 bg-orange-50 bg-opacity-50 flex items-center justify-center"
    >
      <div className="bg-white rounded-4xl p-6 relative w-full max-w-lg mx-auto shadow-lg">
        {/* Close icon */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transform transition-transform duration-200 hover:scale-110"
        >
          <Image src={closeIcon} alt="Close" width={35} height={35} />
        </button>

        {/* Title */}
        <h2 className="text-3xl font-semibold text-center mb-4 mt-15">
          Here's your icon!
        </h2>

        {/* Description */}
        <p className="text-sm text-gray-500 text-center mb-6 px-6">
          Your icon has been generated successfully! You can download it and use it anywhere you need an icon.
        </p>

        {/* S3 Upload Info */}
        {url && typeof url === 'object' && url.s3 && (
          <div className="text-green-600 text-center font-medium mb-4 p-3 bg-green-50 rounded-lg">
            ☁️ Icon uploaded to S3: {url.s3.bucket}/{url.s3.key}
            <br />
            <a 
              href={url.s3.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline text-xs"
            >
              View in S3
            </a>
          </div>
        )}

        {/* Generation Method Status */}
        {url && typeof url === 'object' && url.generationMethod && (
          <div className={`text-center font-medium mb-4 p-3 rounded-lg ${
            url.generationMethod === 'aws' 
              ? 'text-green-600 bg-green-50' 
              : 'text-orange-600 bg-orange-50'
          }`}>
            {url.generationMethod === 'aws' ? '✅' : '⚠️'} 
            Generated using {url.generationMethod === 'aws' ? 'AWS Bedrock' : 'Fallback System'}
            {url.generationMethod === 'fallback' && (
              <div className="text-xs mt-1 text-orange-700">
                AWS access denied - check your IAM permissions
              </div>
            )}
          </div>
        )}

        {/* Status Message */}
        {url && typeof url === 'object' && url.message && (
          <div className={`text-center font-medium mb-4 p-3 rounded-lg ${
            isFallback ? 'text-orange-600 bg-orange-50' : 'text-blue-600 bg-blue-50'
          }`}>
            ℹ️ {url.message}
          </div>
        )}

        {/* Image Display */}
        <div className="w-full aspect-square rounded-4xl shadow-sm bg-gray-200 overflow-hidden mb-5">
          <Image
            src={displayUrl}
            alt="Generated Icon"
            width={400}
            height={400}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error("Image failed to load:", displayUrl);
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
            unoptimized={true}
          />
          
          {/* Fallback display if image fails */}
          <div className="hidden w-full h-full items-center justify-center bg-gray-100">
            <div className="text-center text-gray-500">
              <div className="text-6xl mb-4">🎨</div>
              <p>Icon Generated Successfully!</p>
              <p className="text-sm">Download to view</p>
            </div>
          </div>
        </div>

        {/* Download Button */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleDownload}
            className="mt-3 rounded-[10px] text-lg font-semibold flex items-center justify-center
              transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50
              bg-orange-500 text-white hover:bg-orange-400 disabled:bg-orange-200
              [box-shadow:0_0_0_1px_hsl(24,100%,91%),_0_1px_2px_hsl(24,90%,60%),_0_3px_3px_hsl(24,95%,70%),_0_-2px_hsl(24,90%,88%)_inset]
              hover:translate-y-[1px] hover:scale-[0.98]
              active:translate-y-[2px] active:scale-[0.97]
              h-15 px-10 mb-2 w-full min-w-72"
          >
            Download Icon
          </button>
        </div>
      </div>
    </div>
  );
}
