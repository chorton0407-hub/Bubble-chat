
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function streamOpenAIResponse(messages) {

  const stream = await client.chat.completions.create({
    model: "gpt-4o", 
    messages,
    stream: true,
  });

  return stream; 
}
