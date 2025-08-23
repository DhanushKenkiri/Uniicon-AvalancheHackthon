import Replicate from "replicate";
import { createCanvas, loadImage } from "canvas";
import logger from "../lib/logger";

export default async function clean(imageBuffer) {
  // DISABLED: Background cleaning service temporarily disabled
  // to focus on core video generation pipeline
  logger.log("Background cleaning service disabled - returning original image");
  return imageBuffer;

  // Original code commented out below
  /*
  const DISABLE_FALLBACKS = process.env.DISABLE_FALLBACKS === '1' || process.env.DISABLE_FALLBACKS === 'true';
  // Check if Replicate API token is available
  if (!process.env.REPLICATE_API_TOKEN) {
    if (DISABLE_FALLBACKS) {
      throw new Error("Missing REPLICATE_API_TOKEN for background cleaning.");
    }
    logger.warn("No Replicate API token found, skipping background cleaning");
    return imageBuffer;
  }

  try {
    const base64 = imageBuffer.toString("base64");
    const dataUrl = `data:image/png;base64,${base64}`;

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    const outputUrl = await replicate.run(
      "smoretalk/rembg-enhance:4067ee2a58f6c161d434a9c077cfa012820b8e076efa2772aa171e26557da919",
      { input: { image: dataUrl } }
    );

    // Use global fetch (no import needed)
    const response = await fetch(outputUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const transparentBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(transparentBuffer);

    const img = await loadImage(buffer);

    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    logger.log("Background cleaning successful");
    return canvas.toBuffer("image/png");
  } catch (error) {
    if (DISABLE_FALLBACKS) throw error;
    logger.warn("Background cleaning failed, returning original image:", error.message);
    // Return the original image if cleaning fails
    return imageBuffer;
  }
  */
}
