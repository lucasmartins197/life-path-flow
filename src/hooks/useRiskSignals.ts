import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface RiskSignal {
  id: string;
  user_id: string;
  signal_type: string;
  severity: "baixo" | "moderado" | "alto" | "critico";
  description: string | null;
  detected_at: string;
  is_resolved: boolean;
  resolved_at: string | null;
  alert_sent: boolean;
  created_at: string;
}

export function useRiskSignals() {
  const { user } = useAuth();
  const [signals, setSignals] = useState<RiskSignal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSignals();
    }
  }, [user]);

  const fetchSignals = async () => {
    if (!user) return;

    setIsLoading(true);
    const { data, error } = await supabase
      .from("risk_signals")
      .select("*")
      .eq("user_id", user.id)
      .order("detected_at", { ascending: false })
      .limit(20);

    if (!error) {
      setSignals((data || []) as RiskSignal[]);
    }
    setIsLoading(false);
  };

  const activeSignals = signals.filter((s) => !s.is_resolved);
  const criticalSignals = activeSignals.filter(
    (s) => s.severity === "critico" || s.severity === "alto"
  );

  const riskLevel = criticalSignals.length > 0
    ? "alto"
    : activeSignals.length > 3
    ? "moderado"
    : "baixo";

  return {
    signals,
    activeSignals,
    criticalSignals,
    riskLevel,
    isLoading,
    refetch: fetchSignals,
  };
}
