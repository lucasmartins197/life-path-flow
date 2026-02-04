import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface AnchorContact {
  id: string;
  user_id: string;
  name: string;
  relationship: string;
  phone: string;
  email: string | null;
  is_primary: boolean;
  receive_reports: boolean;
  receive_alerts: boolean;
  last_alert_sent_at: string | null;
  created_at: string;
}

export function useAnchorContacts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [contacts, setContacts] = useState<AnchorContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchContacts();
    }
  }, [user]);

  const fetchContacts = async () => {
    if (!user) return;

    setIsLoading(true);
    const { data, error } = await supabase
      .from("anchor_contacts")
      .select("*")
      .eq("user_id", user.id)
      .order("is_primary", { ascending: false });

    if (error) {
      console.error("Error fetching contacts:", error);
    } else {
      setContacts(data || []);
    }
    setIsLoading(false);
  };

  const addContact = async (contact: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
    is_primary?: boolean;
    receive_reports?: boolean;
    receive_alerts?: boolean;
  }) => {
    if (!user) return false;

    // If setting as primary, unset others first
    if (contact.is_primary) {
      await supabase
        .from("anchor_contacts")
        .update({ is_primary: false })
        .eq("user_id", user.id);
    }

    const { error } = await supabase.from("anchor_contacts").insert({
      user_id: user.id,
      name: contact.name,
      relationship: contact.relationship,
      phone: contact.phone,
      email: contact.email || null,
      is_primary: contact.is_primary || false,
      receive_reports: contact.receive_reports ?? true,
      receive_alerts: contact.receive_alerts ?? true,
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
      title: "Contato adicionado!",
      description: `${contact.name} foi salvo como contato âncora.`,
    });
    fetchContacts();
    return true;
  };

  const updateContact = async (contactId: string, updates: Partial<AnchorContact>) => {
    if (!user) return false;

    // If setting as primary, unset others first
    if (updates.is_primary) {
      await supabase
        .from("anchor_contacts")
        .update({ is_primary: false })
        .eq("user_id", user.id)
        .neq("id", contactId);
    }

    const { error } = await supabase
      .from("anchor_contacts")
      .update(updates)
      .eq("id", contactId);

    if (error) {
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }

    fetchContacts();
    return true;
  };

  const deleteContact = async (contactId: string) => {
    const { error } = await supabase
      .from("anchor_contacts")
      .delete()
      .eq("id", contactId);

    if (error) {
      toast({
        title: "Erro ao remover",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Contato removido",
    });
    fetchContacts();
    return true;
  };

  const primaryContact = contacts.find((c) => c.is_primary);

  return {
    contacts,
    primaryContact,
    isLoading,
    addContact,
    updateContact,
    deleteContact,
    refetch: fetchContacts,
  };
}
