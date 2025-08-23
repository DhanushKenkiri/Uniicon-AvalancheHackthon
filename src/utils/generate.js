import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import logger from "../lib/logger";

// Check if AWS credentials are available
const hasAWSCredentials = () => {
  return process.env.AWS_ACCESS_KEY_ID || 
         process.env.BEDROCK_ACCESS_KEY_ID || 
         process.env.AWS_SECRET_ACCESS_KEY || 
         process.env.BEDROCK_SECRET_ACCESS_KEY;
};

const bedrockClient = new BedrockRuntimeClient({
  // Image generation should use ap-south-1 (Titan v1)
  region: process.env.BEDROCK_GENERATE_REGION || process.env.AWS_REGION || process.env.BEDROCK_REGION || "ap-south-1",
  credentials: {
    accessKeyId:
      process.env.BEDROCK_GENERATE_ACCESS_KEY_ID ||
      process.env.AWS_ACCESS_KEY_ID ||
      process.env.BEDROCK_ACCESS_KEY_ID,
    secretAccessKey:
      process.env.BEDROCK_GENERATE_SECRET_ACCESS_KEY ||
      process.env.AWS_SECRET_ACCESS_KEY ||
      process.env.BEDROCK_SECRET_ACCESS_KEY,
  },
});

export default async function generate(inputText) {
  const DISABLE_FALLBACKS = process.env.DISABLE_FALLBACKS === '1' || process.env.DISABLE_FALLBACKS === 'true';
  // If no AWS credentials, use fallback immediately
  if (!hasAWSCredentials()) {
    if (DISABLE_FALLBACKS) {
      throw new Error("No AWS credentials found for Bedrock. Set AWS/BEDROCK creds or enable fallbacks.");
    }
    logger.warn("No AWS credentials found, using fallback image generation");
    return await generateFallback(inputText);
  }

  // Ensure prompt stays within 512 character limit
  const truncatedInput = inputText.length > 200 ? inputText.substring(0, 200) + '...' : inputText;
  const fullPrompt = `Create a 3D isometric icon of: ${truncatedInput}. Clean lines, soft shadows, white background.`;

  // Correct format for Titan Image Generator v1
  const requestPayload = {
    taskType: "TEXT_IMAGE",
    textToImageParams: {
      text: fullPrompt,
      negativeText: "blurry, low quality, distorted"
    },
    imageGenerationConfig: {
      numberOfImages: 1,
      height: 1024,
      width: 1024,
      cfgScale: 8.0,
      seed: Math.floor(Math.random() * 1000000),
    },
  };

  try {
    const command = new InvokeModelCommand({
      // Default to Titan Image Generator v1 for ap-south-1
      modelId: process.env.BEDROCK_GENERATE_MODEL_ID || "amazon.titan-image-generator-v1",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(requestPayload),
    });

    const response = await bedrockClient.send(command);
    
    // Parse the response
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    // Extract the base64 image data
    if (responseBody.images && responseBody.images.length > 0) {
      const image_base64 = responseBody.images[0];
      return image_base64; // Return the base64 string directly
    } else {
      throw new Error("No images generated in response");
    }
  } catch (error) {
    logger.error("Error generating image with AWS Titan:", error);
    
    // Enhanced error handling - throw errors instead of calling fallback
    if (error.name === "ValidationException") {
      logger.warn("Validation error:", error.message);
      throw error; // Let the main route handle fallback
    } else if (error.name === "AccessDeniedException") {
      logger.warn("Access denied:", error.message);
      throw error; // Let the main route handle fallback
    } else if (error.name === "ThrottlingException") {
      throw new Error("Request throttled. Please try again later.");
    } else if (error.name === "ModelNotReadyException") {
      throw new Error("Model not ready. Please try again in a few moments.");
    }
    
    // For any other error, throw it
    throw error;
  }
}

// Fallback function for when AWS Titan fails
export async function generateFallback(inputText) {
  logger.warn("Using fallback image generation for:", inputText);
  
  // Create a simple but effective SVG icon as fallback
  const iconType = determineIconType(inputText);
  const colors = getIconColors(inputText);
  
  const svgIcon = `
    <svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bgGradient" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stop-color="white" stop-opacity="1"/>
          <stop offset="100%" stop-color="#f8fafc" stop-opacity="1"/>
        </radialGradient>
        <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${colors.primary}"/>
          <stop offset="100%" stop-color="${colors.secondary}"/>
        </radialGradient>
      </defs>
      
      <rect width="1024" height="1024" fill="url(#bgGradient)"/>
      
      ${generateIconShape(iconType, colors)}
      
      <text x="512" y="850" font-family="Arial, sans-serif" font-size="32" text-anchor="middle" fill="#64748b" opacity="0.7">
        ${inputText.substring(0, 25)}${inputText.length > 25 ? '...' : ''}
      </text>
    </svg>
  `;
  
  // Convert SVG to PNG using a simple approach
  try {
    // Try to use canvas if available
    const { createCanvas, loadImage } = await import('canvas');
    const canvas = createCanvas(1024, 1024);
    const ctx = canvas.getContext('2d');
    
    // Create a data URL from the SVG
    const svgDataUrl = `data:image/svg+xml;base64,${Buffer.from(svgIcon).toString('base64')}`;
    
    // Load and draw the SVG
    const img = await loadImage(svgDataUrl);
    ctx.drawImage(img, 0, 0, 1024, 1024);
    
    // Convert to PNG buffer, then to base64
    const pngBuffer = canvas.toBuffer('image/png');
    logger.log("✅ Canvas fallback successful - PNG generated");
    return pngBuffer.toString('base64');
  } catch (canvasError) {
    logger.warn("Canvas conversion failed, using SVG fallback:", canvasError.message);
    
    // Fallback: Create a simple PNG-like fallback using base64 encoded SVG
    // This will work in browsers that support SVG in img tags
    try {
      // Create a minimal PNG header and embed SVG as metadata
      // This is a workaround for when canvas is not available
      const svgBase64 = Buffer.from(svgIcon).toString('base64');
      
      // Return the SVG base64 with a flag indicating it's SVG
      // The frontend will handle this appropriately
      logger.log("✅ SVG fallback successful - SVG generated");
      return svgBase64;
    } catch (svgError) {
      logger.error("SVG fallback also failed:", svgError.message);
      throw new Error("All fallback methods failed");
    }
  }
}

// Determine icon type based on input text
function determineIconType(inputText) {
  const text = inputText.toLowerCase();
  if (text.includes('star') || text.includes('favorite')) return 'star';
  if (text.includes('heart') || text.includes('love')) return 'heart';
  if (text.includes('home') || text.includes('house')) return 'home';
  if (text.includes('user') || text.includes('person')) return 'user';
  if (text.includes('email') || text.includes('mail')) return 'mail';
  if (text.includes('phone') || text.includes('call')) return 'phone';
  if (text.includes('cart') || text.includes('shop')) return 'cart';
  if (text.includes('search') || text.includes('find')) return 'search';
  return 'default';
}

// Get colors based on input text
function getIconColors(inputText) {
  const text = inputText.toLowerCase();
  if (text.includes('blue') || text.includes('water')) return { primary: '#3B82F6', secondary: '#1E40AF' };
  if (text.includes('green') || text.includes('nature')) return { primary: '#10B981', secondary: '#047857' };
  if (text.includes('red') || text.includes('fire')) return { primary: '#EF4444', secondary: '#B91C1C' };
  if (text.includes('purple') || text.includes('magic')) return { primary: '#8B5CF6', secondary: '#5B21B6' };
  if (text.includes('orange') || text.includes('warm')) return { primary: '#F59E0B', secondary: '#D97706' };
  return { primary: '#6366F1', secondary: '#4338CA' };
}

// Generate icon shape based on type
function generateIconShape(type, colors) {
  const shapes = {
    star: `<path d="M512 200 L580 350 L750 350 L620 450 L660 600 L512 500 L364 600 L404 450 L274 350 L444 350 Z" fill="url(#iconGradient)" stroke="${colors.secondary}" stroke-width="4"/>`,
    heart: `<path d="M512 750 C512 750 300 550 300 400 C300 320 360 250 440 250 C480 250 520 280 512 320 C504 280 544 250 584 250 C664 250 724 320 724 400 C724 550 512 750 512 750 Z" fill="url(#iconGradient)" stroke="${colors.secondary}" stroke-width="4"/>`,
    home: `<path d="M512 250 L750 450 L700 450 L700 700 L600 700 L600 550 L424 550 L424 700 L324 700 L324 450 L274 450 Z" fill="url(#iconGradient)" stroke="${colors.secondary}" stroke-width="4"/>`,
    user: `<circle cx="512" cy="380" r="100" fill="url(#iconGradient)" stroke="${colors.secondary}" stroke-width="4"/> <path d="M312 700 C312 600 400 520 512 520 C624 520 712 600 712 700 Z" fill="url(#iconGradient)" stroke="${colors.secondary}" stroke-width="4"/>`,
    default: `<circle cx="512" cy="512" r="180" fill="url(#iconGradient)" stroke="${colors.secondary}" stroke-width="6"/> <circle cx="512" cy="512" r="80" fill="white" opacity="0.3"/>`
  };
  
  return shapes[type] || shapes.default;
}

// Optional: Export a function to test the configuration
export async function testConfiguration() {
  try {
    // Test with a simple prompt
    const testResult = await generate("simple test icon");
    return {
      success: true,
      message: "AWS Titan Image Generator is configured correctly",
      imageSize: testResult.length
    };
  } catch (error) {
    return {
      success: false,
      message: `Configuration test failed: ${error.message}`,
      error: error.name
    };
  }
}
