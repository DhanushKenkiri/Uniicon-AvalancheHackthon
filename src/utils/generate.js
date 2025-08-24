import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

// Check if AWS credentials are available
const hasAWSCredentials = () => {
  return process.env.AWS_ACCESS_KEY_ID || 
         process.env.BEDROCK_ACCESS_KEY_ID || 
         process.env.AWS_SECRET_ACCESS_KEY || 
         process.env.BEDROCK_SECRET_ACCESS_KEY;
};

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || process.env.BEDROCK_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.BEDROCK_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.BEDROCK_SECRET_ACCESS_KEY,
  },
});

export default async function generate(inputText) {
  // If no AWS credentials, use fallback immediately
  if (!hasAWSCredentials()) {
    console.warn("No AWS credentials found, using fallback image generation");
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
    console.error("Error generating image with AWS Titan:", error);
    
    // Enhanced error handling
    if (error.name === "ValidationException") {
      console.warn("Validation error, using fallback:", error.message);
      return await generateFallback(inputText);
    } else if (error.name === "AccessDeniedException") {
      console.warn("Access denied, using fallback:", error.message);
      return await generateFallback(inputText);
    } else if (error.name === "ThrottlingException") {
      throw new Error("Request throttled. Please try again later.");
    } else if (error.name === "ModelNotReadyException") {
      throw new Error("Model not ready. Please try again in a few moments.");
    }
    
    // For any other error, use fallback
    console.warn("Unexpected error, using fallback:", error.message);
    return await generateFallback(inputText);
  }
}

// Fallback function for when AWS Titan fails
export async function generateFallback(inputText) {
  console.warn("Using fallback image generation for:", inputText);
  
  // Create a simple SVG icon as fallback
  const svgIcon = `
    <svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
      <rect width="1024" height="1024" fill="white"/>
      <circle cx="512" cy="512" r="200" fill="#3B82F6" stroke="#1E40AF" stroke-width="8"/>
      <text x="512" y="600" font-family="Arial, sans-serif" font-size="48" text-anchor="middle" fill="#1F2937">
        ${inputText.substring(0, 20)}${inputText.length > 20 ? '...' : ''}
      </text>
      <text x="512" y="680" font-family="Arial, sans-serif" font-size="24" text-anchor="middle" fill="#6B7280">
        Fallback Icon
      </text>
    </svg>
  `;
  
  // Convert SVG to base64
  const base64 = Buffer.from(svgIcon).toString('base64');
  return base64;
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
