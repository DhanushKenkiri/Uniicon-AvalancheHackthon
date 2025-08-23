import animate from "../../../utils/animate.js";
import generate, { generateFallback } from "../../../utils/generate.js";
import clean from "../../../utils/cleaner.js";
import extract from "../../../utils/extract.js";
import interpret from "../../../utils/interpret.js";
import planner from "../../../utils/planner.js";
import uploadToS3, { isS3Configured } from "../../../utils/s3-upload.js";
import logger from "../../../lib/logger";

export async function POST(request) {
  try {
    const { input } = await request.json();
    const DISABLE_FALLBACKS = process.env.DISABLE_FALLBACKS === '1' || process.env.DISABLE_FALLBACKS === 'true';

    logger.log("🎯 Starting icon generation pipeline...");
    logger.log(`📝 Input: ${input}`);

    // Step 1: Extract icon requirements
    logger.log("🔍 Extracting client's required icon...");
    let extractedData;
    try {
      extractedData = await extract(input);
      logger.log("✅ Extraction successful");
    } catch (extractError) {
      if (DISABLE_FALLBACKS) {
        throw new Error(`Extraction failed: ${extractError.message}`);
      }
      logger.warn("AWS Agent extraction failed, using input text directly:", extractError.message);
      extractedData = input; // Use input directly as fallback
    }

    // Step 2: Generate icon illustration
    logger.log("🎨 Generating icon illustration...");
    let base64Image;
    let generationMethod = "aws";
    try {
      base64Image = await generate(extractedData);
      logger.log("✅ AWS image generation successful");
    } catch (generateError) {
      if (DISABLE_FALLBACKS) {
        throw new Error(`Image generation failed: ${generateError.message}`);
      }
      logger.warn("AWS image generation failed, using fallback:", generateError.message);
      base64Image = await generateFallback(extractedData);
      generationMethod = "fallback";
      logger.log("✅ Fallback image generated successfully");
    }

    const imageBuffer = Buffer.from(base64Image, "base64");

    // Step 3: Clean up icon background (optional)
    logger.log("🧹 Cleaning up icon background...");
    let cleanImageBuffer = imageBuffer;
    try {
      cleanImageBuffer = await clean(imageBuffer);
      logger.log("✅ Background cleaning successful");
    } catch (cleanError) {
      if (DISABLE_FALLBACKS) {
        throw new Error(`Background cleaning failed: ${cleanError.message}`);
      }
      logger.warn("Background cleaning failed, using original image:", cleanError.message);
      cleanImageBuffer = imageBuffer;
    }

    // Step 4: Upload to S3 (if configured)
    let s3Result = null;
    if (isS3Configured()) {
      try {
        logger.log("☁️ Uploading image to S3...");
        s3Result = await uploadToS3(cleanImageBuffer, input);
        logger.log("✅ S3 upload successful");
      } catch (s3Error) {
        logger.warn("S3 upload failed, continuing without upload:", s3Error.message);
      }
    } else {
      logger.log("⚠️ S3 not configured, skipping upload");
    }

    // Step 5: Process for display (simplified - no animation)
    logger.log("🖼️ Processing image for display...");
    const displayResult = await animate(cleanImageBuffer, input);

    // Step 6: Return result with S3 info and generation details
    const result = {
      ...displayResult,
      s3: s3Result ? {
        url: s3Result.url,
        key: s3Result.key,
        bucket: s3Result.bucket
      } : null,
      generationMethod: generationMethod,
      awsAccess: generationMethod === "aws" ? "success" : "denied"
    };

    logger.log("🎉 Icon generation pipeline completed successfully!");
    return Response.json({ result });

  } catch (error) {
    logger.error("❌ Error in icon generation workflow:", error);
    
    // Provide specific guidance for AWS access issues
    let errorMessage = error.message;
    let hint = 'Set DISABLE_FALLBACKS=0 to enable graceful fallbacks.';
    
    if (error.message.includes('AccessDeniedException') || error.message.includes('not authorized')) {
      errorMessage = "AWS Access Denied: Your IAM user doesn't have permission to use Bedrock services.";
      hint = "To fix this, update your IAM policy to allow bedrock:InvokeModel and bedrock:InvokeAgent permissions, or remove any explicit DENY policies.";
    }
    
    return new Response(JSON.stringify({ 
      error: errorMessage, 
      hint: hint,
      details: error.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function GET() {
  return new Response("Method Not Allowed", { status: 405 });
}
