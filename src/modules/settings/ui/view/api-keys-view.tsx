"use client";

import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { setOpenAiKeySchema } from "../../schemas";

const apiKeyFormSchema = setOpenAiKeySchema;

export const ApiKeysView = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: keyStatus } = useSuspenseQuery(
    trpc.settings.getOpenAiKeyStatus.queryOptions(),
  );

  const form = useForm<z.infer<typeof apiKeyFormSchema>>({
    resolver: zodResolver(apiKeyFormSchema),
    defaultValues: {
      apiKey: "",
    },
  });

  const setOpenAiKey = useMutation(
    trpc.settings.setOpenAiKey.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.settings.getOpenAiKeyStatus.queryOptions(),
        );
        toast.success("OpenAI API key saved");
        form.reset({ apiKey: "" });
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const removeOpenAiKey = useMutation(
    trpc.settings.removeOpenAiKey.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.settings.getOpenAiKeyStatus.queryOptions(),
        );
        toast.success("OpenAI API key removed");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const onSubmit = (values: z.infer<typeof apiKeyFormSchema>) => {
    setOpenAiKey.mutate(values);
  };

  const isPending = setOpenAiKey.isPending || removeOpenAiKey.isPending;

  return (
    <div className="flex-1 pb-4 px-4 md:px-8">
      <Card className="max-w-2xl mt-4">
        <CardHeader>
          <CardTitle>OpenAI API Key</CardTitle>
          <p className="text-sm text-muted-foreground">
            Voice calls are only enabled when your key is saved.
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-md border bg-muted/20 p-3 text-sm">
            <p>Status: {keyStatus.hasKey ? "Configured" : "Missing"}</p>
            <p className="text-muted-foreground mt-1">
              {keyStatus.updatedAt
                ? `Last updated: ${new Date(keyStatus.updatedAt).toLocaleString()}`
                : "No key saved yet"}
            </p>
          </div>

          <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API key</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="off"
                        placeholder="sk-..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This key is encrypted before storage and used only for
                      your calls.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-wrap gap-2">
                <Button disabled={isPending} type="submit">
                  {keyStatus.hasKey ? "Update key" : "Save key"}
                </Button>
                {keyStatus.hasKey && (
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={isPending}
                    onClick={() => removeOpenAiKey.mutate({ confirm: true })}
                  >
                    Remove key
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export const ApiKeysViewLoading = () => {
  return (
    <LoadingState
      title="Loading API keys"
      description="This might take a few seconds"
    />
  );
};

export const ApiKeysViewError = () => {
  return (
    <ErrorState
      title="Error loading API keys"
      description="Please try again later"
    />
  );
};
