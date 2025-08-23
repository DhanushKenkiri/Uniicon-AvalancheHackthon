import logger from "../lib/logger";

// Function to return the generated image for display
export default async function animate(imageBuffer, description) {
  logger.log("🎨 Displaying generated icon (animation disabled)");
  
  try {
    // Convert the image buffer to base64 for display
    const base64String = imageBuffer.toString('base64');
    
    // Check if this is likely SVG data (starts with <svg)
    const isSVG = imageBuffer.toString('utf8').trim().startsWith('<svg');
    
    if (isSVG) {
      logger.log("📐 Detected SVG data, converting to displayable format");
      
      // For SVG data, we need to create a data URL that browsers can display
      const svgDataUrl = `data:image/svg+xml;base64,${base64String}`;
      
      return {
        url: svgDataUrl,
        base64: base64String,
        format: 'svg',
        message: 'Icon generated successfully using fallback system.',
        isFallback: true,
        isSVG: true
      };
    } else {
      logger.log("🖼️ Detected binary image data (PNG)");
      
      // For binary data (PNG), create a data URL
      const pngDataUrl = `data:image/png;base64,${base64String}`;
      
      return {
        url: pngDataUrl,
        base64: base64String,
        format: 'png',
        message: 'Icon generated successfully using AWS Bedrock.',
        isFallback: false,
        isSVG: false
      };
    }
    
  } catch (error) {
    logger.error("Error processing image for display:", error);
    
    // Return the original image as fallback
    const base64String = imageBuffer.toString('base64');
    const pngDataUrl = `data:image/png;base64,${base64String}`;
    
    return {
      url: pngDataUrl,
      base64: base64String,
      format: 'png',
      message: 'Icon generated successfully. Animation feature is currently disabled.',
      isFallback: true,
      isSVG: false
    };
  }
}
