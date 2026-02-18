import { Injectable } from "@nestjs/common";
import OpenAI from "openai";
import {
  AI_INSTRUCTIONS,
  DEFAULT_AI_MODEL,
  MAX_QUERY_LENGTH,
} from "@/common";

@Injectable()
export class AIService {
  async getResponse(data: string, prompt: string): Promise<string> {
    if (process.env.NODE_ENV !== "production") {
      return "Ova funkcionalnost nije dostupna u razvoju!";
    }
    if (!prompt) {
      return "Nepostojeći upit!";
    }
    if (prompt.length > MAX_QUERY_LENGTH) {
      return "Upit je predugačak!";
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_KEY,
    });
    const response = await client.responses.create({
      model: DEFAULT_AI_MODEL,
      instructions: `${AI_INSTRUCTIONS}\n\nPODACI:\n${data}`,
      input: prompt,
    });
    return response.output_text;
  }
}
