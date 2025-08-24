// Deployment script for UniIconNFT contract on Avalanche Fuji Testnet
// Run with: npx hardhat run scripts/deployUniIconNFT.js --network fuji

import pkg from "hardhat";
const { ethers } = pkg;
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Avalanche Fuji configuration
const avalancheFuji = {
  id: 43113,
  blockExplorers: {
    default: {
      url: "https://testnet.snowtrace.io"
    }
  }
};

async function main() {
  console.log("🚀 Deploying UniIconNFT contract to Avalanche Fuji Testnet...\n");

  // Debug environment variables
  console.log("🔍 Checking environment variables...");
  console.log("DEPLOY_PRIVATE_KEY present:", !!process.env.DEPLOY_PRIVATE_KEY);
  console.log("AVALANCHE_RPC_URL:", process.env.AVALANCHE_RPC_URL || "Using default");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  
  if (!deployer) {
    throw new Error("❌ No deployer account found. Make sure DEPLOY_PRIVATE_KEY is set in .env");
  }

  const deployerAddress = await deployer.getAddress();
  console.log("Deploying contracts with account:", deployerAddress);
  
  try {
    const balance = await deployer.provider.getBalance(deployerAddress);
    console.log("Account balance:", ethers.formatEther(balance), "AVAX\n");
  } catch (error) {
    console.log("Could not fetch balance:", error.message);
  }

  // Deploy the contract
  console.log("📄 Deploying UniIconNFT contract...");
  const UniIconNFT = await ethers.getContractFactory("UniIconNFT");
  
  // Deploy with the deployer as the initial owner
  const uniIconNFT = await UniIconNFT.deploy(deployerAddress);
  await uniIconNFT.waitForDeployment();

  const contractAddress = await uniIconNFT.getAddress();
  console.log("✅ UniIconNFT deployed to:", contractAddress);

  // Verify contract deployment
  console.log("\n🔍 Verifying deployment...");
  const name = await uniIconNFT.name();
  const symbol = await uniIconNFT.symbol();
  const owner = await uniIconNFT.owner();
  const totalSupply = await uniIconNFT.totalSupply();

  console.log("Contract Name:", name);
  console.log("Contract Symbol:", symbol);
  console.log("Contract Owner:", owner);
  console.log("Total Supply:", totalSupply.toString());

  // Save deployment info
  const deploymentInfo = {
    contractAddress: contractAddress,
    contractName: "UniIconNFT",
    network: "fuji",
    chainId: avalancheFuji.id,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    transactionHash: uniIconNFT.deploymentTransaction()?.hash,
    blockNumber: uniIconNFT.deploymentTransaction()?.blockNumber
  };

  console.log("\n📋 Deployment Summary:");
  console.log("================================");
  console.log(`Contract Address: ${contractAddress}`);
  console.log(`Network: Avalanche Fuji Testnet (${avalancheFuji.id})`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Explorer: ${avalancheFuji.blockExplorers.default.url}/address/${contractAddress}`);
  console.log("================================");

  console.log("\n🔧 Environment Variables to Update:");
  console.log("Add this to your .env file:");
  console.log(`UNIICON_NFT_CONTRACT_ADDRESS=${contractAddress}`);

  console.log("\n🎉 Deployment completed successfully!");
  console.log("Next steps:");
  console.log("1. Update your .env file with the contract address");
  console.log("2. Verify the contract on SnowTrace (optional)");
  console.log("3. Test minting functionality");

  return deploymentInfo;
}

// Handle deployment errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
