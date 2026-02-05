import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface WebhookResponse {
  success: boolean;
  status?: number;
  data?: unknown;
  error?: string;
}

export function useWebhook() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const sendToWebhook = async (
    webhookUrl: string,
    message: string,
    metadata?: Record<string, unknown>
  ): Promise<WebhookResponse> => {
    if (!webhookUrl || !message) {
      return { success: false, error: "URL e mensagem são obrigatórios" };
    }

    setIsLoading(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/webhook-forwarder`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            webhookUrl,
            message,
            metadata,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao enviar para webhook");
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      toast({
        title: "Erro no webhook",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendToWebhook,
    isLoading,
  };
}
