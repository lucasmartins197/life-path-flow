import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format, startOfMonth, endOfMonth, parseISO } from "date-fns";

export interface CalendarEvent {
  id: string;
  user_id: string | null;
  title: string;
  description: string | null;
  event_type: string;
  start_time: string;
  end_time: string | null;
  is_all_day: boolean;
  location: string | null;
  meeting_url: string | null;
  reminder_minutes: number;
  is_recurring: boolean;
  recurrence_rule: string | null;
  session_id: string | null;
  is_global: boolean;
  created_at: string;
}

export function useCalendar(currentMonth?: Date) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const month = currentMonth || new Date();

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user, month]);

  const fetchEvents = async () => {
    if (!user) return;

    setIsLoading(true);
    const start = startOfMonth(month);
    const end = endOfMonth(month);

    const { data, error } = await supabase
      .from("calendar_events")
      .select("*")
      .or(`user_id.eq.${user.id},is_global.eq.true`)
      .gte("start_time", start.toISOString())
      .lte("start_time", end.toISOString())
      .order("start_time", { ascending: true });

    if (error) {
      console.error("Error fetching events:", error);
    } else {
      setEvents(data || []);
    }
    setIsLoading(false);
  };

  const addEvent = async (event: {
    title: string;
    description?: string;
    event_type: string;
    start_time: Date;
    end_time?: Date;
    is_all_day?: boolean;
    location?: string;
    meeting_url?: string;
    reminder_minutes?: number;
  }) => {
    if (!user) return false;

    const { error } = await supabase.from("calendar_events").insert({
      user_id: user.id,
      title: event.title,
      description: event.description || null,
      event_type: event.event_type,
      start_time: event.start_time.toISOString(),
      end_time: event.end_time?.toISOString() || null,
      is_all_day: event.is_all_day || false,
      location: event.location || null,
      meeting_url: event.meeting_url || null,
      reminder_minutes: event.reminder_minutes || 30,
      is_global: false,
    });

    if (error) {
      toast({
        title: "Erro ao criar evento",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Evento criado!",
      description: event.title,
    });
    fetchEvents();
    return true;
  };

  const updateEvent = async (eventId: string, updates: Partial<CalendarEvent>) => {
    const { error } = await supabase
      .from("calendar_events")
      .update(updates)
      .eq("id", eventId);

    if (error) {
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }

    fetchEvents();
    return true;
  };

  const deleteEvent = async (eventId: string) => {
    const { error } = await supabase
      .from("calendar_events")
      .delete()
      .eq("id", eventId);

    if (error) {
      toast({
        title: "Erro ao remover",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Evento removido",
    });
    fetchEvents();
    return true;
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return events.filter((event) => {
      const eventDate = format(parseISO(event.start_time), "yyyy-MM-dd");
      return eventDate === dateStr;
    });
  };

  const todayEvents = getEventsForDate(new Date());
  const upcomingEvents = events
    .filter((e) => new Date(e.start_time) >= new Date())
    .slice(0, 5);

  return {
    events,
    isLoading,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventsForDate,
    todayEvents,
    upcomingEvents,
    refetch: fetchEvents,
  };
}
