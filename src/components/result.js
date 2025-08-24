"use client";

import { useEffect, useRef, useState } from "react";
import { useAccount, useWalletClient } from 'wagmi';
import { writeContract } from '@wagmi/core';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { config } from '@/config/wagmi';
import { uploadNFTToIPFS } from '@/utils/ipfs-upload';
import Image from "next/image";
import closeIcon from "../../public/close.png";

// NFT Contract ABI (simplified)
const NFT_CONTRACT_ABI = [
  {
    "inputs": [
      {"name": "uri", "type": "string"}
    ],
    "name": "mintIcon",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// NFT Contract Address (deployed on Avalanche Fuji)
const NFT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS;

export default function ResultModal({ url, onClose }) {
  // Debug logging
  console.log('🔍 NFT Contract Debug:', {
    NFT_CONTRACT_ADDRESS,
    env_var: process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS,
    all_env: Object.keys(process.env).filter(key => key.includes('NFT'))
  });
  
  const overlayRef = useRef();
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [mintingStatus, setMintingStatus] = useState('preparing'); // preparing, uploading, minting, success, error
  const [mintedTokenId, setMintedTokenId] = useState(null);
  const [showFireworks, setShowFireworks] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [ipfsUrl, setIpfsUrl] = useState('');
  const [explorerUrl, setExplorerUrl] = useState('');
  const [uploadResult, setUploadResult] = useState(null); // Store upload result for retry

  // Get the display URL - prioritize the url property, then handle base64 data
  const displayUrl = (url && typeof url === 'object') 
    ? (url.url || (url.base64 ? `data:${url.format === 'svg' ? 'image/svg+xml' : 'image/png'};base64,${url.base64}` : null))
    : url;

    // Auto-mint NFT when modal opens
  useEffect(() => {
    if (displayUrl && address && !NFT_CONTRACT_ADDRESS) {
      // Show message that contract is not deployed yet
      setMintingStatus('contract_not_deployed');
    } else if (displayUrl && address && NFT_CONTRACT_ADDRESS) {
      // Only attempt minting if contract is properly deployed
      autoMintNFT();
    }
  }, [displayUrl, address]);

  // Trigger fireworks effect
  useEffect(() => {
    try {
      const { triggerFireworks } = require("@/lib/triggerFirework");
      triggerFireworks(2000);
      setShowFireworks(true);
    } catch (error) {
      console.warn("Fireworks not available:", error.message);
    }
  }, []);

  // Auto-mint NFT when modal opens
  async function autoMintNFT() {
    // Check if contract is deployed and address is available
    if (!NFT_CONTRACT_ADDRESS || NFT_CONTRACT_ADDRESS === "0x1234567890123456789012345678901234567890") {
      setMintingStatus('contract_not_deployed');
      return;
    }

    if (!isConnected || !address) {
      console.log('⚠️ Wallet not connected. User needs to connect wallet to mint NFT.');
      setMintingStatus('wallet_not_connected');
      return;
    }

    if (!displayUrl) {
      console.log('⚠️ No image data available for minting');
      return;
    }

    try {
      // Step 1: Upload to IPFS
      setMintingStatus('uploading');
      setUploadProgress('🔄 Uploading image to IPFS...');
      
      const uploadData = await uploadNFTToIPFS(
        displayUrl,
        "Uniicon Generated Icon",
        "AI-generated animated icon created with Uniicon on Avalanche",
        [
          {
            trait_type: "Generation Method",
            value: "AI Generated"
          },
          {
            trait_type: "Platform",
            value: "Uniicon"
          }
        ]
      );

      if (!uploadData.success) {
        throw new Error(`IPFS upload failed: ${uploadData.error}`);
      }

      setIpfsUrl(uploadData.imageUrl);
      setUploadResult(uploadData); // Store for retry
      setUploadProgress('✅ IPFS upload complete! Preparing transaction...');

      // Step 2: Mint NFT
      await mintNFTWithMetadata(uploadData);
      
    } catch (error) {
      console.error('NFT process failed:', error);
      setMintingStatus('error');
      setUploadProgress('❌ Process failed. Please try again.');
    }
  }

  // Mint NFT with existing upload data (for retry)
  async function mintNFTWithMetadata(uploadData) {
    try {
      setMintingStatus('minting');
      setUploadProgress('⛏️ Minting NFT on Avalanche Fuji...');
      
      console.log('🎯 Minting NFT with metadata URL:', uploadData.tokenURI);
      console.log('🎯 Minting from address:', address);
      console.log('🎯 Contract address:', NFT_CONTRACT_ADDRESS);

      // Call the mint function on the contract
      const hash = await writeContract(config, {
        address: NFT_CONTRACT_ADDRESS,
        abi: NFT_CONTRACT_ABI,
        functionName: 'mintIcon',
        args: [uploadData.tokenURI], // Use IPFS metadata URL
      });

      // Generate explorer URL
      const explorerLink = `https://testnet.snowtrace.io/tx/${hash}`;
      setExplorerUrl(explorerLink);
      
      setMintingStatus('success');
      setMintedTokenId(hash);
      setUploadProgress('🎉 NFT minted successfully!');
      
      console.log('🎉 NFT minted successfully! Transaction hash:', hash);
      console.log('🔍 View on SnowTrace:', explorerLink);
      
    } catch (error) {
      console.error('NFT minting failed:', error);
      setMintingStatus('error');
      setUploadProgress('❌ Minting failed. Please try again.');
      throw error;
    }
  }

  // Retry only the minting part
  async function retryMinting() {
    if (!uploadResult) {
      console.log('⚠️ No upload data available for retry. Starting full process...');
      await autoMintNFT();
      return;
    }

    try {
      await mintNFTWithMetadata(uploadResult);
    } catch (error) {
      console.error('Retry minting failed:', error);
    }
  }

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

  const getMintingStatusMessage = () => {
    switch (mintingStatus) {
      case 'preparing':
        return { text: "Preparing to mint NFT...", color: "text-blue-600", bg: "bg-blue-50" };
      case 'uploading':
        return { text: uploadProgress || "Uploading to IPFS...", color: "text-purple-600", bg: "bg-purple-50" };
      case 'minting':
        return { text: uploadProgress || "Minting your icon as NFT...", color: "text-orange-600", bg: "bg-orange-50" };
      case 'success':
        return { text: uploadProgress || "✅ Icon minted as NFT!", color: "text-green-600", bg: "bg-green-50" };
      case 'error':
        return { text: uploadProgress || "❌ NFT minting failed", color: "text-red-600", bg: "bg-red-50" };
      case 'wallet_not_connected':
        return { text: "🔗 Connect wallet to mint NFT", color: "text-blue-600", bg: "bg-blue-50" };
      case 'contract_not_deployed':
        return { text: "📋 NFT contract not deployed yet", color: "text-yellow-600", bg: "bg-yellow-50" };
      default:
        return null;
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Validate that we have a valid URL to display
  if (!displayUrl) {
    return (
      <div className="fixed inset-0 z-50 bg-white bg-opacity-90 flex items-center justify-center">
        <div className="bg-white rounded-[32px] p-8 relative w-full max-w-md mx-auto shadow-2xl border">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Error</h2>
            <p className="text-gray-600 mb-4">No valid result to display.</p>
            <button
              onClick={onClose}
              className="bg-orange-500 text-white px-6 py-2 rounded-xl hover:bg-orange-600"
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
      className="fixed inset-0 z-50 bg-white bg-opacity-90 flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-[32px] p-8 relative w-full max-w-md mx-auto shadow-2xl border border-gray-100">
        {/* Close icon */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Image src={closeIcon} alt="Close" width={24} height={24} />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-center mb-3 text-gray-800">
          Here's your 3D animated icon!
        </h2>

        {/* Description */}
        <p className="text-sm text-gray-500 text-center mb-6">
          Your icon has been generated successfully and is being minted as an NFT to your wallet.
        </p>

        {/* Image Display */}
        <div className="w-full aspect-square rounded-[24px] overflow-hidden mb-6 bg-gray-100 flex items-center justify-center">
          <Image
            src={displayUrl}
            alt="Generated Icon"
            width={300}
            height={300}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error("Image failed to load:", displayUrl);
            }}
            unoptimized={true}
          />
        </div>

        {/* Minting Status */}
        {mintingStatus && (
          <div className="text-center mb-6 p-3 rounded-xl">
            {mintingStatus === 'contract_not_deployed' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                <div className="flex items-center justify-center gap-2 text-yellow-600">
                  <span>⚠️</span>
                  <span className="text-sm font-medium">NFT Feature Coming Soon</span>
                </div>
                <div className="text-yellow-700 text-xs mt-1">Smart contract will be deployed soon</div>
              </div>
            )}
            
            {(mintingStatus === 'uploading' || mintingStatus === 'minting') && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <div className="flex items-center justify-center gap-2 text-blue-600">
                  <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  <span className="text-sm font-medium">
                    {mintingStatus === 'uploading' ? 'Preparing NFT...' : 'Minting NFT...'}
                  </span>
                </div>
                <div className="text-blue-700 text-xs mt-1">{uploadProgress}</div>
              </div>
            )}
            
            {mintingStatus === 'success' && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <span>🎉</span>
                  <span className="text-sm font-medium">NFT Minted Successfully!</span>
                </div>
                <div className="text-green-700 text-xs mt-1">Your icon is now an NFT on Avalanche Fuji!</div>
                {explorerUrl && (
                  <a 
                    href={explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium mt-2 transition-colors"
                  >
                    🔍 View on SnowTrace
                  </a>
                )}
                {ipfsUrl && (
                  <a 
                    href={ipfsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-800 underline text-xs block mt-2"
                  >
                    View metadata on IPFS
                  </a>
                )}
              </div>
            )}
            
            {mintingStatus === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <div className="flex items-center justify-center gap-2 text-red-600">
                  <span>❌</span>
                  <span className="text-sm font-medium">Minting Failed</span>
                </div>
                <div className="text-red-700 text-xs mt-1">{uploadProgress}</div>
                <button
                  onClick={() => {
                    setMintingStatus('preparing');
                    setUploadProgress('');
                    setTimeout(() => retryMinting(), 100);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium mt-2 transition-colors"
                >
                  🔄 Retry Minting
                </button>
              </div>
            )}

            {mintingStatus === 'wallet_not_connected' && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <div className="flex items-center justify-center gap-2 text-blue-600">
                  <span>🔗</span>
                  <span className="text-sm font-medium">Connect Wallet to Mint NFT</span>
                </div>
                <div className="text-blue-700 text-xs mt-1 mb-3">Connect your wallet to mint this icon as an NFT on Avalanche</div>
                <div className="flex justify-center">
                  <ConnectButton />
                </div>
              </div>
            )}

            {mintingStatus === 'contract_not_deployed' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                <div className="flex items-center justify-center gap-2 text-yellow-600">
                  <span>⚠️</span>
                  <span className="text-sm font-medium">NFT Feature Coming Soon</span>
                </div>
                <div className="text-yellow-700 text-xs mt-1">Smart contract will be deployed soon</div>
              </div>
            )}
          </div>
        )}

        {/* Download Button */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleDownload}
            className="w-full bg-orange-500 text-white py-4 rounded-xl text-lg font-semibold
              hover:bg-orange-600 transition-colors"
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
}
