import {
  BedrockAgentRuntimeClient,
  InvokeAgentCommand,
} from "@aws-sdk/client-bedrock-agent-runtime";
import { v4 as uuidv4 } from "uuid";

const client = new BedrockAgentRuntimeClient({
  region: process.env.AWS_REGION,
});

const agentId = "AIN8HDRSBV";
const agentAliasId = "6QBYKHARVB";

export default async function extract(inputText) {
  // Check if AWS Bedrock agent credentials are available
  if (!process.env.AWS_ACCESS_KEY_ID && !process.env.BEDROCK_ACCESS_KEY_ID) {
    console.warn("No AWS credentials found, using input text directly");
    return cleanInputText(inputText);
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

    return result || cleanInputText(inputText);
  } catch (error) {
    console.warn("AWS Agent extraction failed, using input text directly:", error.message);
    // Fallback: return the input text cleaned up
    return cleanInputText(inputText);
  }
}

// Helper function to clean and improve input text
function cleanInputText(input) {
  // Basic text cleaning and enhancement
  return input
    .trim()
    .replace(/[^\w\s\-.,!?]/g, '') // Remove special chars except basic punctuation
    .slice(0, 200) // Limit length
    + (input.length > 200 ? '...' : '');
}
