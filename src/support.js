// The support bot: answer() replies to one customer message with Claude.
import { readFileSync } from "node:fs";
import Anthropic from "@anthropic-ai/sdk";

const system = readFileSync(new URL("../prompts/support.md", import.meta.url), "utf8");
const client = new Anthropic(); // reads ANTHROPIC_API_KEY, once per process

export async function answer(message) {
  const response = await client.messages.create({
    model: "claude-opus-5-5",
    max_tokens: 1024,
    output_config: { effort: "low" }, // Opus 5.5 can't turn thinking off; low effort keeps a short reply quick.
    system,
    messages: [{ role: "user", content: message }],
  });
  return response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");
}
