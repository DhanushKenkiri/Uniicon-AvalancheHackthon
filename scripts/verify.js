// Contract verification script for SnowTrace
// Run after deployment: npx hardhat run scripts/verify.js --network fuji

import pkg from "hardhat";
const { run } = pkg;
import fs from 'fs';

async function main() {
    console.log("🔍 Starting contract verification on SnowTrace...\n");

    // Read deployment info
    let deploymentInfo;
    try {
        const deploymentData = fs.readFileSync('deployment-info.json', 'utf8');
        deploymentInfo = JSON.parse(deploymentData);
    } catch (error) {
        console.error("❌ Could not read deployment-info.json");
        console.log("Please run the deployment script first!");
        process.exit(1);
    }

    const nftAddress = deploymentInfo.contracts.UniIconNFT.address;
    const paymentAddress = deploymentInfo.contracts.AVAXPayments.address;
    const deployer = deploymentInfo.deployer;

    try {
        // Verify UniIconNFT Contract
        console.log("🎨 Verifying UniIconNFT contract...");
        await run("verify:verify", {
            address: nftAddress,
            constructorArguments: [deployer], // Initial owner
        });
        console.log("✅ UniIconNFT contract verified successfully!");

    } catch (error) {
        if (error.message.includes("Already Verified")) {
            console.log("✅ UniIconNFT contract already verified!");
        } else {
            console.error("❌ UniIconNFT verification failed:", error.message);
        }
    }

    try {
        // Verify AVAXPayments Contract
        console.log("\n💰 Verifying AVAXPayments contract...");
        await run("verify:verify", {
            address: paymentAddress,
            constructorArguments: [
                nftAddress,                    // NFT contract address
                process.env.PLATFORM_WALLET || deployer, // Platform wallet
                process.env.CREATOR_WALLET || deployer,  // Creator wallet
                deployer                       // Initial owner
            ],
        });
        console.log("✅ AVAXPayments contract verified successfully!");

    } catch (error) {
        if (error.message.includes("Already Verified")) {
            console.log("✅ AVAXPayments contract already verified!");
        } else {
            console.error("❌ AVAXPayments verification failed:", error.message);
        }
    }

    console.log("\n🎉 Contract verification completed!");
    console.log("\n🔗 View verified contracts on SnowTrace:");
    console.log(`NFT Contract: ${deploymentInfo.contracts.UniIconNFT.blockExplorer}`);
    console.log(`Payment Contract: ${deploymentInfo.contracts.AVAXPayments.blockExplorer}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Verification failed:", error);
        process.exit(1);
    });
