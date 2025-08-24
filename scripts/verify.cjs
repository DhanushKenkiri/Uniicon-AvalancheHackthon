const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Verifying contract deployment...\n");

    // Contract addresses (these would come from deployment-info.json or environment variables)
    const nftAddress = process.env.UNIICON_NFT_CONTRACT_ADDRESS;
    const paymentAddress = process.env.PAYMENT_PROCESSOR_CONTRACT_ADDRESS;

    if (!nftAddress || !paymentAddress) {
        console.log("❌ Contract addresses not found in environment variables");
        console.log("Please set UNIICON_NFT_CONTRACT_ADDRESS and PAYMENT_PROCESSOR_CONTRACT_ADDRESS");
        return;
    }

    // Get contract instances
    const UniIconNFT = await ethers.getContractFactory("UniIconNFT");
    const nftContract = UniIconNFT.attach(nftAddress);

    const AVAXPayments = await ethers.getContractFactory("AVAXPayments");
    const paymentContract = AVAXPayments.attach(paymentAddress);

    // Verify NFT Contract
    console.log("🎨 NFT Contract Verification:");
    console.log("Address:", nftAddress);
    console.log("Name:", await nftContract.name());
    console.log("Symbol:", await nftContract.symbol());
    console.log("Total Supply:", (await nftContract.totalSupply()).toString());

    // Verify Payment Contract
    console.log("\n💰 Payment Contract Verification:");
    console.log("Address:", paymentAddress);
    console.log("Base Price:", ethers.formatEther(await paymentContract.BASE_PRICE()), "AVAX");
    console.log("Total Price:", ethers.formatEther(await paymentContract.TOTAL_PRICE()), "AVAX");
    console.log("Platform Share:", (await paymentContract.platformShare()).toString() + "%");
    console.log("Creator Share:", (await paymentContract.creatorShare()).toString() + "%");

    console.log("\n✅ Contract verification completed successfully!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Verification failed:", error);
        process.exit(1);
    });
