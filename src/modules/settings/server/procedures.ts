import { db } from "@/db";
import { user } from "@/db/schema";
import { encryptSecret } from "@/lib/encryption";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { eq } from "drizzle-orm";
import { removeOpenAiKeySchema, setOpenAiKeySchema } from "../schemas";

export const settingsRouter = createTRPCRouter({
  getOpenAiKeyStatus: protectedProcedure.query(async ({ ctx }) => {
    const [existingUser] = await db
      .select({
        openAiApiKeyEncrypted: user.openAiApiKeyEncrypted,
        openAiApiKeyUpdatedAt: user.openAiApiKeyUpdatedAt,
      })
      .from(user)
      .where(eq(user.id, ctx.auth.user.id));

    return {
      hasKey: !!existingUser?.openAiApiKeyEncrypted,
      updatedAt: existingUser?.openAiApiKeyUpdatedAt ?? null,
    };
  }),
  setOpenAiKey: protectedProcedure
    .input(setOpenAiKeySchema)
    .mutation(async ({ ctx, input }) => {
      const encryptedKey = encryptSecret(input.apiKey.trim());

      await db
        .update(user)
        .set({
          openAiApiKeyEncrypted: encryptedKey,
          openAiApiKeyUpdatedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(user.id, ctx.auth.user.id));

      return { success: true };
    }),
  removeOpenAiKey: protectedProcedure
    .input(removeOpenAiKeySchema)
    .mutation(async ({ ctx }) => {
      await db
        .update(user)
        .set({
          openAiApiKeyEncrypted: null,
          openAiApiKeyUpdatedAt: null,
          updatedAt: new Date(),
        })
        .where(eq(user.id, ctx.auth.user.id));

      return { success: true };
    }),
});
