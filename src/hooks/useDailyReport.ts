import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface DailyReport {
  id: string;
  user_id: string;
  report_date: string;
  journey_summary: unknown;
  nutrition_summary: unknown;
  exercise_summary: unknown;
  routine_summary: unknown;
  risk_assessment: unknown;
  ai_recommendations: string[] | null;
  overall_score: number | null;
  is_viewed: boolean | null;
  viewed_at: string | null;
  created_at: string;
}

export function useDailyReport(date?: string) {
  const { user } = useAuth();
  const [report, setReport] = useState<DailyReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const selectedDate = date || new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (user) {
      fetchReport();
    }
  }, [user, selectedDate]);

  const fetchReport = async () => {
    if (!user) return;

    setIsLoading(true);
    const { data, error } = await supabase
      .from("daily_reports")
      .select("*")
      .eq("user_id", user.id)
      .eq("report_date", selectedDate)
      .maybeSingle();

    if (!error && data) {
      setReport(data);
    } else {
      setReport(null);
    }
    setIsLoading(false);
  };

  const markAsViewed = async () => {
    if (!report) return;

    await supabase
      .from("daily_reports")
      .update({
        is_viewed: true,
        viewed_at: new Date().toISOString(),
      })
      .eq("id", report.id);

    fetchReport();
  };

  return {
    report,
    isLoading,
    markAsViewed,
    refetch: fetchReport,
  };
}
