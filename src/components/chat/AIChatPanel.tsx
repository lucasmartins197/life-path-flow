import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { 
  MessageCircle, 
  Send, 
  Loader2, 
  Stethoscope,
  DollarSign,
  Dumbbell,
  TrendingUp,
  Scale,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ElementType;
  prompt: string;
}

const quickActions: QuickAction[] = [
  { 
    id: "expense", 
    label: "Registrar Gasto", 
    icon: DollarSign, 
    prompt: "Quero registrar um gasto" 
  },
  { 
    id: "workout", 
    label: "Plano de Treino", 
    icon: Dumbbell, 
    prompt: "Me mostre meu plano de treino para hoje" 
  },
  { 
    id: "nutrition", 
    label: "Dica Nutricional", 
    icon: Stethoscope, 
    prompt: "Quero uma sugestão de refeição saudável" 
  },
  { 
    id: "progress", 
    label: "Meu Progresso", 
    icon: TrendingUp, 
    prompt: "Como está meu progresso na jornada?" 
  },
  { 
    id: "legal", 
    label: "Apoio Jurídico", 
    icon: Scale, 
    prompt: "Preciso de ajuda com uma dívida" 
  },
];

export function AIChatPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && user && messages.length === 0) {
      loadHistory();
    }
  }, [isOpen, user]);

  const loadHistory = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("agent_messages")
      .select("role, content, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(20);

    if (data && data.length > 0) {
      setMessages(
        data.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
          timestamp: new Date(m.created_at),
        }))
      );
    } else {
      setMessages([
        {
          role: "assistant",
          content:
            "Olá! Sou a Lia, sua assistente terapêutica. Posso ajudar com nutrição, exercícios, finanças e seu progresso na jornada. Como posso ajudar você hoje?",
          timestamp: new Date(),
        },
      ]);
    }
  };

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || !user || isLoading) return;

    if (!messageText) setInput("");
    
    setMessages((prev) => [
      ...prev, 
      { role: "user", content: text, timestamp: new Date() }
    ]);
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
          body: JSON.stringify({ message: text }),
        }
      );

      if (!response.ok) {
        throw new Error("Erro na resposta do agente");
      }

      const data = await response.json();

      let assistantMessage = typeof data.data === 'string' 
        ? data.data 
        : data.data?.message || data.data?.response || "Entendi! Posso ajudar com mais alguma coisa?";

      // Extract navigate link if present
      const navigateMatch = assistantMessage.match(/navigate:(\/\S+)/);
      const navigatePath = data.data?.navigate || (navigateMatch ? navigateMatch[1] : null);
      
      // Clean navigate tag from displayed message
      if (navigateMatch) {
        assistantMessage = assistantMessage.replace(/navigate:\/\S+/g, '').trim();
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: assistantMessage,
          timestamp: new Date(),
        },
      ]);

      // Show navigate button if legal support was suggested
      if (navigatePath) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `__navigate__${navigatePath}`,
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Desculpe, tive um problema para processar sua mensagem. Pode tentar novamente?",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    sendMessage(action.prompt);
  };

  const formatTime = (date?: Date) => {
    if (!date) return "";
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button className="fab-ai" aria-label="Abrir assistente de IA">
          <MessageCircle className="h-6 w-6" />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="p-4 border-b bg-primary text-primary-foreground">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Stethoscope className="h-5 w-5" />
              </div>
              <div>
                <SheetTitle className="text-left text-primary-foreground">
                  Lia
                </SheetTitle>
                <p className="text-xs text-primary-foreground/80">
                  Assistente Clínica
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-primary-foreground/80">Online</span>
            </div>
          </div>
        </SheetHeader>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${
                  msg.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`chat-message ${
                    msg.role === "user"
                      ? "chat-message-user"
                      : "chat-message-assistant"
                  }`}
                >
                  {msg.content.startsWith("__navigate__") ? (
                    <button
                      onClick={() => {
                        const path = msg.content.replace("__navigate__", "");
                        setIsOpen(false);
                        navigate(path);
                      }}
                      className="quick-action-btn text-sm"
                    >
                      <Scale className="h-4 w-4" />
                      Ir para Apoio Jurídico →
                    </button>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground mt-1 px-2">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start">
                <div className="chat-message chat-message-assistant">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Digitando...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Quick Actions */}
        <div className="px-4 py-3 border-t bg-muted/30">
          <p className="text-xs text-muted-foreground mb-2">Ações rápidas</p>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action)}
                disabled={isLoading}
                className="quick-action-btn"
              >
                <action.icon className="h-3.5 w-3.5" />
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t bg-card">
          <div className="flex gap-2">
            <Input
              placeholder="Digite sua mensagem..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="flex-1 input-premium"
            />
            <Button
              size="icon"
              onClick={() => sendMessage()}
              disabled={isLoading || !input.trim()}
              className="shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
