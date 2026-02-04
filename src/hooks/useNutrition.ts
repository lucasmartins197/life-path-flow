import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface NutritionFood {
  id: string;
  name: string;
  brand: string | null;
  serving_size: number;
  serving_unit: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
  is_verified: boolean;
}

export interface NutritionLog {
  id: string;
  user_id: string;
  food_id: string | null;
  custom_food_name: string | null;
  meal_type: string;
  quantity: number;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
  logged_at: string;
  notes: string | null;
  created_at: string;
  food?: NutritionFood;
}

export interface DailySummary {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
}

export function useNutrition(date?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [foods, setFoods] = useState<NutritionFood[]>([]);
  const [logs, setLogs] = useState<NutritionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedDate = date || new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (user) {
      fetchLogs();
    }
  }, [user, selectedDate]);

  const searchFoods = async (query: string) => {
    if (query.length < 2) {
      setFoods([]);
      return;
    }

    const { data, error } = await supabase
      .from("nutrition_foods")
      .select("*")
      .ilike("name", `%${query}%`)
      .limit(20);

    if (error) {
      console.error("Error searching foods:", error);
      return;
    }

    setFoods(data || []);
  };

  const fetchLogs = async () => {
    if (!user) return;

    setIsLoading(true);
    const { data, error } = await supabase
      .from("nutrition_logs")
      .select(`
        *,
        food:nutrition_foods(*)
      `)
      .eq("user_id", user.id)
      .eq("logged_at", selectedDate)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching logs:", error);
      toast({
        title: "Erro ao carregar",
        description: "Não foi possível carregar seus registros.",
        variant: "destructive",
      });
    } else {
      setLogs(data || []);
    }
    setIsLoading(false);
  };

  const addLog = async (
    food: NutritionFood | null,
    customName: string | null,
    mealType: string,
    quantity: number,
    notes?: string
  ) => {
    if (!user) return;

    const multiplier = quantity;
    const baseFood = food || {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      fiber: 0,
    };

    const { error } = await supabase.from("nutrition_logs").insert({
      user_id: user.id,
      food_id: food?.id || null,
      custom_food_name: customName,
      meal_type: mealType,
      quantity,
      calories: baseFood.calories * multiplier,
      protein: baseFood.protein * multiplier,
      carbohydrates: baseFood.carbohydrates * multiplier,
      fat: baseFood.fat * multiplier,
      fiber: baseFood.fiber * multiplier,
      logged_at: selectedDate,
      notes,
    });

    if (error) {
      toast({
        title: "Erro ao adicionar",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Refeição registrada!",
      description: `${food?.name || customName} adicionado ao seu diário.`,
    });
    fetchLogs();
    return true;
  };

  const deleteLog = async (logId: string) => {
    const { error } = await supabase
      .from("nutrition_logs")
      .delete()
      .eq("id", logId);

    if (error) {
      toast({
        title: "Erro ao remover",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Registro removido",
    });
    fetchLogs();
    return true;
  };

  const dailySummary: DailySummary = logs.reduce(
    (acc, log) => ({
      calories: acc.calories + Number(log.calories),
      protein: acc.protein + Number(log.protein),
      carbohydrates: acc.carbohydrates + Number(log.carbohydrates),
      fat: acc.fat + Number(log.fat),
      fiber: acc.fiber + Number(log.fiber),
    }),
    { calories: 0, protein: 0, carbohydrates: 0, fat: 0, fiber: 0 }
  );

  const logsByMeal = {
    breakfast: logs.filter((l) => l.meal_type === "breakfast"),
    lunch: logs.filter((l) => l.meal_type === "lunch"),
    dinner: logs.filter((l) => l.meal_type === "dinner"),
    snack: logs.filter((l) => l.meal_type === "snack"),
  };

  return {
    foods,
    logs,
    logsByMeal,
    isLoading,
    searchQuery,
    setSearchQuery,
    searchFoods,
    addLog,
    deleteLog,
    dailySummary,
    refetch: fetchLogs,
  };
}
