// Deployment script for AVAXPayments contract on Avalanche Fuji Testnet
// Run with: npx hardhat run scripts/deployAVAXPayments.js --network fuji

import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  console.log("🚀 Deploying AVAXPayments contract to Avalanche Fuji Testnet...\n");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "AVAX\n");

  // Contract addresses - these need to be set after UniIconNFT deployment
  const UNIICON_NFT_CONTRACT = process.env.UNIICON_NFT_CONTRACT_ADDRESS;
  const PLATFORM_WALLET = process.env.PLATFORM_WALLET_ADDRESS || deployer.address;
  const CREATOR_WALLET = process.env.CREATOR_WALLET_ADDRESS || deployer.address;

  if (!UNIICON_NFT_CONTRACT) {
    console.error("❌ Error: UNIICON_NFT_CONTRACT_ADDRESS not set in environment variables");
    console.log("Please deploy UniIconNFT first and set the contract address in your .env file");
    process.exit(1);
  }

  console.log("📄 Configuration:");
  console.log("UniIconNFT Contract:", UNIICON_NFT_CONTRACT);
  console.log("Platform Wallet:", PLATFORM_WALLET);
  console.log("Creator Wallet:", CREATOR_WALLET);
  console.log("");

  // Deploy the contract
  console.log("📄 Deploying AVAXPayments contract...");
  const AVAXPayments = await ethers.getContractFactory("AVAXPayments");
  
  const avaxPayments = await AVAXPayments.deploy(
    UNIICON_NFT_CONTRACT,
    PLATFORM_WALLET,
    CREATOR_WALLET,
    deployer.address
  );
  await avaxPayments.waitForDeployment();

  const contractAddress = await avaxPayments.getAddress();
  console.log("✅ AVAXPayments deployed to:", contractAddress);

  // Verify contract deployment
  console.log("\n🔍 Verifying deployment...");
  const nftContract = await avaxPayments.nftContract();
  const platformWallet = await avaxPayments.platformWallet();
  const creatorWallet = await avaxPayments.creatorWallet();
  const owner = await avaxPayments.owner();
  const totalPrice = await avaxPayments.TOTAL_PRICE();
  const basePrice = await avaxPayments.BASE_PRICE();
  const privacyMultiplier = await avaxPayments.PRIVACY_MULTIPLIER();

  console.log("NFT Contract:", nftContract);
  console.log("Platform Wallet:", platformWallet);
  console.log("Creator Wallet:", creatorWallet);
  console.log("Contract Owner:", owner);
  console.log("Base Price:", ethers.formatEther(basePrice), "AVAX");
  console.log("Privacy Multiplier:", privacyMultiplier.toString() + "%");
  console.log("Total Price:", ethers.formatEther(totalPrice), "AVAX");

  // Calculate revenue distribution
  const platformShare = await avaxPayments.platformShare();
  const creatorShare = await avaxPayments.creatorShare();
  const platformAmount = totalPrice * platformShare / 100n;
  const creatorAmount = totalPrice * creatorShare / 100n;

  console.log("\n💰 Revenue Distribution:");
  console.log("Platform Share:", platformShare.toString() + "% -", ethers.formatEther(platformAmount), "AVAX");
  console.log("Creator Share:", creatorShare.toString() + "% -", ethers.formatEther(creatorAmount), "AVAX");

  // Save deployment info
  const deploymentInfo = {
    contractAddress: contractAddress,
    networkName: "Avalanche Fuji Testnet",
    chainId: 43113,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    configuration: {
      nftContract: nftContract,
      platformWallet: platformWallet,
      creatorWallet: creatorWallet,
      basePrice: ethers.formatEther(basePrice),
      totalPrice: ethers.formatEther(totalPrice),
      privacyMultiplier: privacyMultiplier.toString(),
      platformShare: platformShare.toString(),
      creatorShare: creatorShare.toString()
    },
    blockExplorer: `https://testnet.snowtrace.io/address/${contractAddress}`
  };

  console.log("\n📋 Deployment Summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  console.log("\n🔗 Next Steps:");
  console.log("1. Update your .env file with:");
  console.log(`   AVAX_PAYMENTS_CONTRACT_ADDRESS=${contractAddress}`);
  console.log("2. Verify the contract on Snowtrace:");
  console.log(`   ${deploymentInfo.blockExplorer}`);
  console.log("3. Test the payment functionality with the UI");
  console.log("\n🎉 AVAXPayments contract deployment completed successfully!");
}

// Handle errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
