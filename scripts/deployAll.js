// Complete deployment script for Uniicon platform on Avalanche Fuji Testnet
// Deploys both UniIconNFT and AVAXPayments contracts in correct order
// Run with: npx hardhat run scripts/deployAll.js --network fuji

import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  console.log("🚀 Starting complete Uniicon platform deployment on Avalanche Fuji Testnet...\n");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "AVAX\n");

  // Wallet configuration
  const PLATFORM_WALLET = process.env.PLATFORM_WALLET_ADDRESS || deployer.address;
  const CREATOR_WALLET = process.env.CREATOR_WALLET_ADDRESS || deployer.address;

  console.log("📄 Platform Configuration:");
  console.log("Deployer:", deployer.address);
  console.log("Platform Wallet:", PLATFORM_WALLET);
  console.log("Creator Wallet:", CREATOR_WALLET);
  console.log("");

  // Deploy UniIconNFT first
  console.log("📄 Step 1: Deploying UniIconNFT contract...");
  const UniIconNFT = await ethers.getContractFactory("UniIconNFT");
  
  const uniIconNFT = await UniIconNFT.deploy(deployer.address);
  await uniIconNFT.waitForDeployment();

  const nftContractAddress = await uniIconNFT.getAddress();
  console.log("✅ UniIconNFT deployed to:", nftContractAddress);

  // Verify NFT contract deployment
  console.log("\n🔍 Verifying UniIconNFT deployment...");
  const nftName = await uniIconNFT.name();
  const nftSymbol = await uniIconNFT.symbol();
  const nftOwner = await uniIconNFT.owner();
  const nftTotalSupply = await uniIconNFT.totalSupply();

  console.log("NFT Name:", nftName);
  console.log("NFT Symbol:", nftSymbol);
  console.log("NFT Owner:", nftOwner);
  console.log("NFT Total Supply:", nftTotalSupply.toString());

  // Deploy AVAXPayments contract
  console.log("\n📄 Step 2: Deploying AVAXPayments contract...");
  const AVAXPayments = await ethers.getContractFactory("AVAXPayments");
  
  const avaxPayments = await AVAXPayments.deploy(
    nftContractAddress,
    PLATFORM_WALLET,
    CREATOR_WALLET,
    deployer.address
  );
  await avaxPayments.waitForDeployment();

  const paymentsContractAddress = await avaxPayments.getAddress();
  console.log("✅ AVAXPayments deployed to:", paymentsContractAddress);

  // Verify payments contract deployment
  console.log("\n🔍 Verifying AVAXPayments deployment...");
  const paymentsNftContract = await avaxPayments.nftContract();
  const paymentsPlatformWallet = await avaxPayments.platformWallet();
  const paymentsCreatorWallet = await avaxPayments.creatorWallet();
  const paymentsOwner = await avaxPayments.owner();
  const totalPrice = await avaxPayments.TOTAL_PRICE();
  const basePrice = await avaxPayments.BASE_PRICE();

  console.log("Linked NFT Contract:", paymentsNftContract);
  console.log("Platform Wallet:", paymentsPlatformWallet);
  console.log("Creator Wallet:", paymentsCreatorWallet);
  console.log("Payments Owner:", paymentsOwner);
  console.log("Base Price:", ethers.formatEther(basePrice), "AVAX");
  console.log("Total Price (with privacy):", ethers.formatEther(totalPrice), "AVAX");

  // Calculate revenue distribution
  const platformShare = await avaxPayments.platformShare();
  const creatorShare = await avaxPayments.creatorShare();
  const platformAmount = totalPrice * platformShare / 100n;
  const creatorAmount = totalPrice * creatorShare / 100n;

  console.log("\n💰 Revenue Distribution per Icon:");
  console.log("Platform Share:", platformShare.toString() + "% =", ethers.formatEther(platformAmount), "AVAX");
  console.log("Creator Share:", creatorShare.toString() + "% =", ethers.formatEther(creatorAmount), "AVAX");

  // Complete deployment summary
  const deploymentInfo = {
    network: "Avalanche Fuji Testnet",
    chainId: 43113,
    deployer: deployer.address,
    deploymentTimestamp: new Date().toISOString(),
    contracts: {
      UniIconNFT: {
        address: nftContractAddress,
        name: nftName,
        symbol: nftSymbol,
        owner: nftOwner,
        blockExplorer: `https://testnet.snowtrace.io/address/${nftContractAddress}`
      },
      AVAXPayments: {
        address: paymentsContractAddress,
        nftContract: paymentsNftContract,
        platformWallet: paymentsPlatformWallet,
        creatorWallet: paymentsCreatorWallet,
        basePrice: ethers.formatEther(basePrice),
        totalPrice: ethers.formatEther(totalPrice),
        platformShare: platformShare.toString(),
        creatorShare: creatorShare.toString(),
        blockExplorer: `https://testnet.snowtrace.io/address/${paymentsContractAddress}`
      }
    }
  };

  console.log("\n📋 Complete Deployment Summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Environment variables to set
  console.log("\n🔧 Environment Variables to Update:");
  console.log("Add these to your .env file:");
  console.log(`UNIICON_NFT_CONTRACT_ADDRESS=${nftContractAddress}`);
  console.log(`AVAX_PAYMENTS_CONTRACT_ADDRESS=${paymentsContractAddress}`);
  if (PLATFORM_WALLET === deployer.address) {
    console.log(`PLATFORM_WALLET_ADDRESS=${PLATFORM_WALLET} # Currently using deployer`);
  }
  if (CREATOR_WALLET === deployer.address) {
    console.log(`CREATOR_WALLET_ADDRESS=${CREATOR_WALLET} # Currently using deployer`);
  }

  console.log("\n🔗 Next Steps:");
  console.log("1. Verify contracts on Snowtrace:");
  console.log(`   - UniIconNFT: https://testnet.snowtrace.io/address/${nftContractAddress}`);
  console.log(`   - AVAXPayments: https://testnet.snowtrace.io/address/${paymentsContractAddress}`);
  console.log("2. Update your React app with the deployed contract addresses");
  console.log("3. Test the complete payment and minting flow");
  console.log("4. Consider updating platform and creator wallets if needed");

  console.log("\n🎉 Complete Uniicon platform deployment successful!");
  console.log("Your privacy-first AI icon generator is ready for testnet use! 🎨🔐");
}

// Handle errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
