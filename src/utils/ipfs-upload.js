// IPFS Upload utility using Pinata
import { PinataSDK } from "pinata-web3";

/**
 * Get Pinata client instance
 */
function getPinataClient() {
  // Check if we're in the browser and have the JWT token
  const jwt = process.env.NEXT_PUBLIC_PINATA_JWT || process.env.PINATA_JWT;
  const gateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY || process.env.PINATA_GATEWAY || "gateway.pinata.cloud";
  
  if (!jwt) {
    throw new Error('Pinata JWT token not found. Make sure NEXT_PUBLIC_PINATA_JWT is set in your environment variables.');
  }

  return new PinataSDK({
    pinataJwt: jwt,
    pinataGateway: gateway
  });
}

/**
 * Convert base64 data URL to File object
 */
function dataURLtoFile(dataurl, filename) {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

/**
 * Upload image to IPFS via Pinata
 */
export async function uploadImageToIPFS(imageData, filename = 'uniicon-generated.png') {
  try {
    console.log('📤 Uploading image to IPFS...');
    
    // Get Pinata client
    const pinata = getPinataClient();
    
    // Convert base64 data URL to File if needed
    let file;
    if (typeof imageData === 'string' && imageData.startsWith('data:')) {
      file = dataURLtoFile(imageData, filename);
    } else if (imageData instanceof File) {
      file = imageData;
    } else {
      throw new Error('Invalid image data format');
    }

    // Upload to Pinata
    const upload = await pinata.upload.file(file, {
      metadata: {
        name: `Uniicon Generated Icon - ${Date.now()}`,
        description: 'AI-generated icon created with Uniicon'
      },
      pinataOptions: {
        cidVersion: 1
      }
    });

    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${upload.IpfsHash}`;
    
    console.log('✅ Image uploaded to IPFS:', ipfsUrl);
    return {
      success: true,
      ipfsHash: upload.IpfsHash,
      ipfsUrl: ipfsUrl,
      gatewayUrl: `https://${process.env.PINATA_GATEWAY || 'gateway.pinata.cloud'}/ipfs/${upload.IpfsHash}`
    };
    
  } catch (error) {
    console.error('❌ IPFS upload failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Upload metadata JSON to IPFS
 */
export async function uploadMetadataToIPFS(metadata) {
  try {
    console.log('📤 Uploading metadata to IPFS...');
    
    // Get Pinata client
    const pinata = getPinataClient();
    
    // Create metadata file
    const metadataBlob = new Blob([JSON.stringify(metadata, null, 2)], {
      type: 'application/json'
    });
    const metadataFile = new File([metadataBlob], 'metadata.json', {
      type: 'application/json'
    });

    // Upload to Pinata
    const upload = await pinata.upload.file(metadataFile, {
      metadata: {
        name: `Uniicon NFT Metadata - ${Date.now()}`,
        description: 'NFT metadata for Uniicon generated icon'
      },
      pinataOptions: {
        cidVersion: 1
      }
    });

    const metadataUrl = `https://gateway.pinata.cloud/ipfs/${upload.IpfsHash}`;
    
    console.log('✅ Metadata uploaded to IPFS:', metadataUrl);
    return {
      success: true,
      ipfsHash: upload.IpfsHash,
      metadataUrl: metadataUrl,
      gatewayUrl: `https://${process.env.NEXT_PUBLIC_PINATA_GATEWAY || process.env.PINATA_GATEWAY || 'gateway.pinata.cloud'}/ipfs/${upload.IpfsHash}`
    };
    
  } catch (error) {
    console.error('❌ Metadata upload failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Complete NFT upload process: image + metadata
 */
export async function uploadNFTToIPFS(imageData, nftName, nftDescription, attributes = []) {
  try {
    console.log('🚀 Starting complete NFT upload to IPFS...');
    
    // Step 1: Upload image
    const imageUpload = await uploadImageToIPFS(imageData);
    if (!imageUpload.success) {
      throw new Error(`Image upload failed: ${imageUpload.error}`);
    }

    // Step 2: Create metadata with IPFS image URL
    const metadata = {
      name: nftName || "Uniicon Generated Icon",
      description: nftDescription || "AI-generated animated icon created with Uniicon on Avalanche",
      image: imageUpload.ipfsUrl,
      external_url: "https://uniicon.com",
      attributes: [
        {
          trait_type: "Generator",
          value: "Uniicon AI"
        },
        {
          trait_type: "Blockchain",
          value: "Avalanche"
        },
        {
          trait_type: "Created",
          value: new Date().toISOString()
        },
        ...attributes
      ]
    };

    // Step 3: Upload metadata
    const metadataUpload = await uploadMetadataToIPFS(metadata);
    if (!metadataUpload.success) {
      throw new Error(`Metadata upload failed: ${metadataUpload.error}`);
    }

    console.log('🎉 Complete NFT upload successful!');
    return {
      success: true,
      imageUrl: imageUpload.ipfsUrl,
      metadataUrl: metadataUpload.metadataUrl,
      tokenURI: metadataUpload.metadataUrl, // This is what we pass to the contract
      metadata: metadata
    };

  } catch (error) {
    console.error('❌ Complete NFT upload failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
