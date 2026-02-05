import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAnchorContacts } from "@/hooks/useAnchorContacts";
import { useRiskSignals } from "@/hooks/useRiskSignals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BottomNavigation } from "@/components/BottomNavigation";
import { PortoSeguroButton } from "@/components/PortoSeguroButton";
import { AIChatPanel } from "@/components/chat/AIChatPanel";
import {
  ArrowLeft,
  Plus,
  Phone,
  Mail,
  Shield,
  AlertTriangle,
  Heart,
  Star,
  Trash2,
  Edit,
} from "lucide-react";

const relationships = [
  { id: "pai", label: "Pai" },
  { id: "mae", label: "Mãe" },
  { id: "irmao", label: "Irmão(ã)" },
  { id: "conjuge", label: "Cônjuge" },
  { id: "filho", label: "Filho(a)" },
  { id: "amigo", label: "Amigo(a)" },
  { id: "outro", label: "Outro" },
];

const riskColors = {
  baixo: "bg-green-500",
  moderado: "bg-yellow-500",
  alto: "bg-orange-500",
  critico: "bg-red-500",
};

export default function AnchorHome() {
  const navigate = useNavigate();
  const {
    contacts,
    primaryContact,
    addContact,
    updateContact,
    deleteContact,
    isLoading,
  } = useAnchorContacts();
  const { activeSignals, riskLevel } = useRiskSignals();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newContact, setNewContact] = useState({
    name: "",
    relationship: "amigo",
    phone: "",
    email: "",
    is_primary: false,
    receive_reports: true,
    receive_alerts: true,
  });

  const handleAddContact = async () => {
    if (!newContact.name || !newContact.phone) return;

    const success = await addContact(newContact);

    if (success) {
      setIsDialogOpen(false);
      setNewContact({
        name: "",
        relationship: "amigo",
        phone: "",
        email: "",
        is_primary: false,
        receive_reports: true,
        receive_alerts: true,
      });
    }
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleSetPrimary = async (contactId: string) => {
    await updateContact(contactId, { is_primary: true });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/app")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-display font-semibold">
                Rede de Apoio
              </h1>
              <p className="text-sm text-muted-foreground">
                Contatos âncora e gestão de risco
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container px-4 py-6 space-y-6">
        {/* Risk Level */}
        <Card
          className={`card-premium border-2 ${
            riskLevel === "alto"
              ? "border-red-500/50 bg-red-500/5"
              : riskLevel === "moderado"
              ? "border-yellow-500/50 bg-yellow-500/5"
              : "border-green-500/50 bg-green-500/5"
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-full ${
                  riskLevel === "alto"
                    ? "bg-red-500/20"
                    : riskLevel === "moderado"
                    ? "bg-yellow-500/20"
                    : "bg-green-500/20"
                }`}
              >
                <Shield
                  className={`h-6 w-6 ${
                    riskLevel === "alto"
                      ? "text-red-500"
                      : riskLevel === "moderado"
                      ? "text-yellow-500"
                      : "text-green-500"
                  }`}
                />
              </div>
              <div>
                <p className="font-semibold">
                  Nível de Risco:{" "}
                  <span className="capitalize">{riskLevel}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  {activeSignals.length === 0
                    ? "Nenhum sinal de alerta ativo"
                    : `${activeSignals.length} sinal(is) de alerta ativo(s)`}
                </p>
              </div>
            </div>

            {activeSignals.length > 0 && (
              <div className="mt-4 space-y-2">
                {activeSignals.slice(0, 3).map((signal) => (
                  <div
                    key={signal.id}
                    className="flex items-center gap-2 p-2 bg-background/50 rounded-lg"
                  >
                    <AlertTriangle
                      className={`h-4 w-4 ${
                        signal.severity === "critico" || signal.severity === "alto"
                          ? "text-red-500"
                          : "text-yellow-500"
                      }`}
                    />
                    <span className="text-sm">{signal.description}</span>
                    <Badge
                      variant="outline"
                      className={`ml-auto ${riskColors[signal.severity]} text-white border-0`}
                    >
                      {signal.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Primary Contact - Quick Access */}
        {primaryContact && (
          <Card className="card-premium bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/20">
                    <Heart className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{primaryContact.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {relationships.find((r) => r.id === primaryContact.relationship)
                        ?.label || primaryContact.relationship}
                    </p>
                  </div>
                </div>
                <Button
                  size="lg"
                  className="rounded-full"
                  onClick={() => handleCall(primaryContact.phone)}
                >
                  <Phone className="h-5 w-5 mr-2" />
                  Ligar Agora
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Contacts */}
        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Contatos Âncora
              </span>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Novo Contato Âncora</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <Input
                      placeholder="Nome"
                      value={newContact.name}
                      onChange={(e) =>
                        setNewContact({ ...newContact, name: e.target.value })
                      }
                    />

                    <Select
                      value={newContact.relationship}
                      onValueChange={(value) =>
                        setNewContact({ ...newContact, relationship: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Relacionamento" />
                      </SelectTrigger>
                      <SelectContent>
                        {relationships.map((rel) => (
                          <SelectItem key={rel.id} value={rel.id}>
                            {rel.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Input
                      placeholder="Telefone"
                      type="tel"
                      value={newContact.phone}
                      onChange={(e) =>
                        setNewContact({ ...newContact, phone: e.target.value })
                      }
                    />

                    <Input
                      placeholder="Email (opcional)"
                      type="email"
                      value={newContact.email}
                      onChange={(e) =>
                        setNewContact({ ...newContact, email: e.target.value })
                      }
                    />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Contato principal</span>
                        <Switch
                          checked={newContact.is_primary}
                          onCheckedChange={(checked) =>
                            setNewContact({ ...newContact, is_primary: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Receber relatórios</span>
                        <Switch
                          checked={newContact.receive_reports}
                          onCheckedChange={(checked) =>
                            setNewContact({
                              ...newContact,
                              receive_reports: checked,
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Receber alertas de risco</span>
                        <Switch
                          checked={newContact.receive_alerts}
                          onCheckedChange={(checked) =>
                            setNewContact({
                              ...newContact,
                              receive_alerts: checked,
                            })
                          }
                        />
                      </div>
                    </div>

                    <Button className="w-full" onClick={handleAddContact}>
                      Adicionar Contato
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {contacts.length === 0 ? (
              <div className="text-center py-8">
                <Heart className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">
                  Adicione pessoas de confiança para apoiar você
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="p-3 rounded-lg border border-border bg-card"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{contact.name}</p>
                          {contact.is_primary && (
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {relationships.find((r) => r.id === contact.relationship)
                            ?.label || contact.relationship}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <a
                            href={`tel:${contact.phone}`}
                            className="flex items-center gap-1 text-xs text-primary"
                          >
                            <Phone className="h-3 w-3" />
                            {contact.phone}
                          </a>
                          {contact.email && (
                            <a
                              href={`mailto:${contact.email}`}
                              className="flex items-center gap-1 text-xs text-primary"
                            >
                              <Mail className="h-3 w-3" />
                              {contact.email}
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {!contact.is_primary && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-yellow-500"
                            onClick={() => handleSetPrimary(contact.id)}
                          >
                            <Star className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => deleteContact(contact.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <BottomNavigation />
      <PortoSeguroButton />
      <AIChatPanel />
    </div>
  );
}
