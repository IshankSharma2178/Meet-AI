import { auth } from "@/lib/auth";
import {
  ApiKeysView,
  ApiKeysViewError,
  ApiKeysViewLoading,
} from "@/modules/settings/ui/view/api-keys-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

const Page = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.settings.getOpenAiKeyStatus.queryOptions(),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<ApiKeysViewLoading />}>
        <ErrorBoundary fallback={<ApiKeysViewError />}>
          <ApiKeysView />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  );
};

export default Page;
