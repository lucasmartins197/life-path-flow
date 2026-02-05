import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAnchorContacts } from "@/hooks/useAnchorContacts";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Anchor, Phone, AlertTriangle, Heart, Settings } from "lucide-react";

export function PortoSeguroButton() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { primaryContact, contacts } = useAnchorContacts();

  const handleEmergencyCall = () => {
    if (primaryContact) {
      window.location.href = `tel:${primaryContact.phone}`;
    }
  };

  const handleCallContact = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="porto-seguro-btn"
        aria-label="Porto Seguro - Ajuda de Emergência"
      >
        <Anchor className="h-6 w-6" />
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <Anchor className="h-8 w-8 text-destructive" />
            </div>
            <DialogTitle className="text-xl">Porto Seguro</DialogTitle>
            <DialogDescription>
              Sua rede de apoio está a um toque de distância
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            {/* Emergency Primary Contact */}
            {primaryContact ? (
              <Button
                size="lg"
                variant="destructive"
                className="w-full h-16 text-lg"
                onClick={handleEmergencyCall}
              >
                <Phone className="h-6 w-6 mr-3" />
                Ligar para {primaryContact.name}
              </Button>
            ) : (
              <div className="p-4 bg-muted rounded-lg text-center">
                <AlertTriangle className="h-8 w-8 mx-auto text-warning mb-2" />
                <p className="text-sm text-muted-foreground mb-3">
                  Você ainda não cadastrou um contato âncora
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsOpen(false);
                    navigate("/app/ancora");
                  }}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Configurar Contatos
                </Button>
              </div>
            )}

            {/* Other Contacts */}
            {contacts.length > 1 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground text-center">
                  Outros contatos de apoio
                </p>
                {contacts
                  .filter((c) => !c.is_primary)
                  .slice(0, 3)
                  .map((contact) => (
                    <Button
                      key={contact.id}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => handleCallContact(contact.phone)}
                    >
                      <Heart className="h-4 w-4 mr-2 text-primary" />
                      {contact.name}
                      <Phone className="h-4 w-4 ml-auto" />
                    </Button>
                  ))}
              </div>
            )}

            {/* Manage Contacts Link */}
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                setIsOpen(false);
                navigate("/app/ancora");
              }}
            >
              <Settings className="h-4 w-4 mr-2" />
              Gerenciar Rede de Apoio
            </Button>

            {/* Emergency Services */}
            <div className="pt-4 border-t">
              <p className="text-xs text-center text-muted-foreground mb-3">
                Serviços de emergência
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => (window.location.href = "tel:188")}
                >
                  CVV - 188
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => (window.location.href = "tel:192")}
                >
                  SAMU - 192
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
