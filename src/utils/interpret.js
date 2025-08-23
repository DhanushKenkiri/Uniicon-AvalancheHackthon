import {
  BedrockRuntimeClient,
  ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";
import logger from "../lib/logger";

const systemPrompt =
  "You are a visual content assistant helping an icon animation storyboard writer. When given an icon-style image, your task is to generate a short, clear, and animation-ready description of the visual content. Focus only on elements relevant for animation — such as characters, objects, environments, positions, and actions. Avoid stylistic details, colors (unless essential), or anything irrelevant to animation movement or staging. Keep your response one sentence. Be literal and descriptive, not interpretive. Imagine you&apos;re passing visual instructions to another AI for animating the scene. Example: A hot air balloon floats between three rounded hills. A small figure is seated inside the balloon&apos;s basket.";

const modelId = process.env.BEDROCK_VISION_MODEL_ID || "anthropic.claude-3-haiku-20240307-v1:0";

const client = new BedrockRuntimeClient({ 
  region: process.env.AWS_REGION ,
});

export default async function interpret(imageBuffer) {
  try {
    const message = [
      {
        role: "user",
        content: [
          {
            image: {
              format: "png",
              source: { bytes: imageBuffer },
            },
          },
        ],
      },
    ];

    const system = [
      {
        text: systemPrompt,
      },
    ];

    const response = await client.send(
      new ConverseCommand({ modelId, messages: message, system: system })
    );

    const output = response.output?.message?.content?.[0]?.text;
    return output || "No output returned from model.";
  } catch (error) {
    logger.warn("AWS Bedrock interpretation failed, using default description:", error.message);
    // Fallback: return a generic description
    return "An animated icon with smooth motion and subtle effects.";
  }
}
