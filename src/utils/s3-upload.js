import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import logger from "../lib/logger";

// S3 client configuration - uniicon-assets-dev bucket is in us-east-1
const s3Client = new S3Client({
  region: "us-east-1", // Fixed: Bucket is in us-east-1, not ap-south-1
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// S3 bucket configuration
const S3_BUCKET = "uniicon-assets-dev";
const S3_PREFIX = "images/";

/**
 * Upload image buffer to S3
 * @param {Buffer} imageBuffer - The image buffer to upload
 * @param {string} prompt - The prompt used to generate the image
 * @returns {Promise<{url: string, key: string}>}
 */
export default async function uploadToS3(imageBuffer, prompt) {
  try {
    // Generate unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sanitizedPrompt = prompt.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
    const filename = `${sanitizedPrompt}_${timestamp}.png`;
    const key = `${S3_PREFIX}${filename}`;

    logger.log(`📤 Uploading image to S3: ${key}`);
    logger.log(`   - Bucket: ${S3_BUCKET}`);
    logger.log(`   - Region: us-east-1`);
    logger.log(`   - Key: ${key}`);

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: imageBuffer,
      ContentType: "image/png",
      Metadata: {
        "prompt": prompt,
        "generated-at": new Date().toISOString(),
        "source": "uniicon-ai-generator"
      }
    });

    await s3Client.send(command);

    // Generate S3 URL (us-east-1 region)
    const s3Url = `https://${S3_BUCKET}.s3.us-east-1.amazonaws.com/${key}`;
    
    logger.log(`✅ Image uploaded successfully to S3: ${s3Url}`);

    return {
      url: s3Url,
      key: key,
      bucket: S3_BUCKET,
      region: "us-east-1"
    };

  } catch (error) {
    logger.error("❌ S3 upload failed:", error.message);
    logger.error(`   - Bucket: ${S3_BUCKET}`);
    logger.error(`   - Region: us-east-1`);
    throw new Error(`S3 upload failed: ${error.message}`);
  }
}

/**
 * Check if S3 upload is configured
 * @returns {boolean}
 */
export function isS3Configured() {
  return !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
}
