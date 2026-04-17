import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { decryptSecret } from "./encryption";

export const getUserOpenAiKey = async (userId: string) => {
  const [existingUser] = await db
    .select({
      openAiApiKeyEncrypted: user.openAiApiKeyEncrypted,
    })
    .from(user)
    .where(eq(user.id, userId));

  const encryptedKey = existingUser?.openAiApiKeyEncrypted;

  if (!encryptedKey) {
    throw new Error("OPENAI_KEY_MISSING");
  }

  return decryptSecret(encryptedKey);
};
