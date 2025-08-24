import logger from "../lib/logger";

// Simple function to return the generated image for display
export default async function animate(imageBuffer, description) {
  logger.log("🎨 Displaying generated icon (animation disabled)");
  
  try {
    // Convert the image buffer to base64 for display
    const base64String = imageBuffer.toString('base64');
    
    return {
      url: null,
      base64: base64String,
      format: 'png',
      message: 'Icon generated successfully. Animation feature is currently disabled.',
      isFallback: true
    };
    
  } catch (error) {
    logger.error("Error processing image for display:", error);
    
    // Return the original image as fallback
    return {
      url: null,
      base64: imageBuffer.toString('base64'),
      format: 'png',
      message: 'Icon generated successfully. Animation feature is currently disabled.',
      isFallback: true
    };
  }
}
