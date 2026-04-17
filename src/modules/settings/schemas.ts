import { z } from "zod";

export const setOpenAiKeySchema = z.object({
  apiKey: z
    .string()
    .min(20, "API key is too short")
    .startsWith("sk-", "OpenAI API key must start with sk-"),
});

export const removeOpenAiKeySchema = z.object({
  confirm: z.literal(true),
});
