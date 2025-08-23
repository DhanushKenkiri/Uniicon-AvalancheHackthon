import {
  BedrockAgentRuntimeClient,
  InvokeAgentCommand,
} from "@aws-sdk/client-bedrock-agent-runtime";
import { v4 as uuidv4 } from "uuid";
import logger from "../lib/logger";

const client = new BedrockAgentRuntimeClient({
  region: process.env.AWS_REGION,
});

const agentId = "BR6FLJOHTV";
const agentAliasId = "ERJBOK40FB";

export default async function plan(inputText) {
  const DISABLE_FALLBACKS = process.env.DISABLE_FALLBACKS === '1' || process.env.DISABLE_FALLBACKS === 'true';
  // Check if AWS Bedrock agent credentials are available
  if (!process.env.AWS_ACCESS_KEY_ID && !process.env.BEDROCK_ACCESS_KEY_ID) {
    if (DISABLE_FALLBACKS) {
      throw new Error("Missing AWS credentials for Bedrock Agent planning.");
    }
    logger.warn("No AWS credentials found, using default animation plan");
    return generateFallbackPlan(inputText);
  }

  try {
    const sessionId = uuidv4();

    const command = new InvokeAgentCommand({
      agentId,
      agentAliasId,
      sessionId,
      inputText: inputText,
    });

    const response = await client.send(command);

    let result = "";

    for await (const event of response.completion) {
      if (event.chunk?.bytes) {
        result += Buffer.from(event.chunk.bytes).toString();
      }
    }

    return result || generateFallbackPlan(inputText);
  } catch (error) {
    if (DISABLE_FALLBACKS) throw error;
    logger.warn("AWS Agent planning failed, using default animation plan:", error.message);
    // Fallback: return a contextual animation plan
    return generateFallbackPlan(inputText);
  }
}

// Generate a contextual fallback animation plan
function generateFallbackPlan(inputText) {
  const plans = [
    "Create a smooth, gentle animation with subtle movement and professional quality",
    "Animate with soft floating motion and elegant transitions",
    "Add gentle rotation and breathing effects for visual appeal",
    "Create subtle scale pulsing with smooth easing transitions",
    "Implement gentle swaying motion with natural physics"
  ];
  
  // Simple selection based on input characteristics
  const index = (inputText.length + inputText.charCodeAt(0)) % plans.length;
  return plans[index] + ".";
}
