import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  TrendingUp,
  TrendingDown,
  Plus,
  BarChart3,
  Wallet,
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
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
import { useToast } from "@/hooks/use-toast";

interface Transaction {
  id: string;
  type: "income" | "expense" | "debt" | "payment";
  category: string;
  amount: number;
  description: string;
  date: Date;
}

const categories = [
  { id: "food",          label: "Alimentação" },
  { id: "transport",     label: "Transporte" },
  { id: "health",        label: "Saúde" },
  { id: "entertainment", label: "Lazer" },
  { id: "bills",         label: "Contas" },
  { id: "debt",          label: "Dívida" },
  { id: "other",         label: "Outros" },
];

const typeConfig = {
  income:  { label: "Entrada",    icon: ArrowDownLeft,  color: "text-primary",     bg: "bg-primary/10" },
  expense: { label: "Saída",      icon: ArrowUpRight,   color: "text-destructive", bg: "bg-destructive/10" },
  debt:    { label: "Dívida",     icon: CreditCard,     color: "text-warning",     bg: "bg-warning/10" },
  payment: { label: "Pagamento",  icon: TrendingDown,   color: "text-primary",     bg: "bg-primary/10" },
};

const QUICK_ACTIONS: { type: Transaction["type"]; label: string }[] = [
  { type: "income",  label: "+ Entrada" },
  { type: "expense", label: "+ Saída" },
  { type: "debt",    label: "+ Dívida" },
  { type: "payment", label: "+ Pagamento" },
];

export default function FinanceHome() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dialogType, setDialogType] = useState<Transaction["type"] | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: "1", type: "income",  category: "other",    amount: 3500, description: "Salário",     date: new Date() },
    { id: "2", type: "expense", category: "food",     amount: 150,  description: "Mercado",     date: new Date() },
    { id: "3", type: "debt",    category: "bills",    amount: 800,  description: "Cartão Nubank", date: new Date() },
    { id: "4", type: "expense", category: "transport", amount: 80,  description: "Combustível",  date: new Date() },
  ]);
  const [newTx, setNewTx] = useState({ category: "other", amount: "", description: "" });

  const totalIncome  = transactions.filter((t) => t.type === "income"  || t.type === "payment").reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const totalDebt    = transactions.filter((t) => t.type === "debt").reduce((s, t) => s + t.amount, 0);
  const balance      = totalIncome - totalExpense - totalDebt;

  const addTransaction = () => {
    if (!newTx.amount || !newTx.description || !dialogType) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    setTransactions([{
      id: Date.now().toString(),
      type: dialogType,
      category: newTx.category,
      amount: parseFloat(newTx.amount),
      description: newTx.description,
      date: new Date(),
    }, ...transactions]);
    setDialogType(null);
    setNewTx({ category: "other", amount: "", description: "" });
    toast({ title: "Registrado!", description: newTx.description });
  };

  const fmtBRL = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="min-h-screen bg-background safe-top pb-28">

      {/* ── Header ──────────────────────────────── */}
      <header className="bg-card border-b border-border/60 px-5 pt-8 pb-5">
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => navigate("/app")}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors mb-5 text-sm"
          >
            <ChevronLeft className="h-4 w-4" />
            Home
          </button>
          <h1 className="text-2xl font-bold text-foreground">Controle de Caixa</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Finanças pessoais</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-5 pt-6 space-y-6">

        {/* ── Saldo estimado ────────────────────── */}
        <div className="card-premium p-5">
          <p className="section-title mb-1">Saldo estimado</p>
          <p className={`text-3xl font-bold tracking-tight ${balance >= 0 ? "text-foreground" : "text-destructive"}`}>
            {fmtBRL(balance)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {balance >= 0 ? "Situação positiva este mês" : "Atenção: despesas superam entradas"}
          </p>

          <div className="grid grid-cols-3 gap-3 mt-5">
            {/* Entradas */}
            <div className="rounded-xl bg-accent p-3">
              <TrendingUp className="h-4 w-4 text-primary mb-2" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Entradas</p>
              <p className="text-sm font-bold text-primary mt-0.5">{fmtBRL(totalIncome)}</p>
            </div>
            {/* Saídas */}
            <div className="rounded-xl bg-destructive/10 p-3">
              <TrendingDown className="h-4 w-4 text-destructive mb-2" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Saídas</p>
              <p className="text-sm font-bold text-destructive mt-0.5">{fmtBRL(totalExpense)}</p>
            </div>
            {/* Dívidas */}
            <div className="rounded-xl bg-warning/10 p-3">
              <CreditCard className="h-4 w-4 text-warning mb-2" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Dívidas</p>
              <p className="text-sm font-bold text-warning mt-0.5">{fmtBRL(totalDebt)}</p>
            </div>
          </div>
        </div>

        {/* ── Quick actions ─────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          {QUICK_ACTIONS.map((qa) => {
            const cfg = typeConfig[qa.type];
            const Icon = cfg.icon;
            return (
              <Dialog key={qa.type} open={dialogType === qa.type} onOpenChange={(open) => !open && setDialogType(null)}>
                <DialogTrigger asChild>
                  <button
                    onClick={() => setDialogType(qa.type)}
                    className="card-premium p-3.5 flex items-center gap-3 text-left hover:scale-[1.01] active:scale-[0.99] transition-transform"
                  >
                    <div className={`w-9 h-9 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0`}>
                      <Icon className={`h-4 w-4 ${cfg.color}`} />
                    </div>
                    <span className="text-sm font-semibold text-foreground">{qa.label}</span>
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-sm mx-auto rounded-2xl">
                  <DialogHeader>
                    <DialogTitle>Nova {cfg.label}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-2">
                    <Input
                      placeholder="Valor (R$)"
                      type="number"
                      value={newTx.amount}
                      onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })}
                      className="input-premium"
                    />
                    <Input
                      placeholder="Descrição"
                      value={newTx.description}
                      onChange={(e) => setNewTx({ ...newTx, description: e.target.value })}
                      className="input-premium"
                    />
                    <Select value={newTx.category} onValueChange={(v) => setNewTx({ ...newTx, category: v })}>
                      <SelectTrigger className="input-premium border-border">
                        <SelectValue placeholder="Categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <button onClick={addTransaction} className="btn-cta w-full py-3.5">
                      Registrar
                    </button>
                  </div>
                </DialogContent>
              </Dialog>
            );
          })}
        </div>

        {/* ── Transactions table ────────────────── */}
        <section>
          <p className="section-title flex items-center gap-2">
            <BarChart3 className="h-3.5 w-3.5" />
            Últimas transações
          </p>
          <div className="card-premium divide-y divide-border/50">
            {transactions.length === 0 && (
              <div className="p-10 text-center">
                <Wallet className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">Nenhuma transação registrada.</p>
              </div>
            )}
            {transactions.map((t) => {
              const cfg = typeConfig[t.type];
              const Icon = cfg.icon;
              const cat = categories.find((c) => c.id === t.category);
              const isPositive = t.type === "income" || t.type === "payment";
              return (
                <div key={t.id} className="flex items-center gap-4 px-4 py-3.5">
                  <div className={`w-9 h-9 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`h-4 w-4 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{t.description}</p>
                    <p className="text-xs text-muted-foreground">{cat?.label} · {cfg.label}</p>
                  </div>
                  <p className={`text-sm font-bold shrink-0 ${isPositive ? "text-primary" : t.type === "debt" ? "text-warning" : "text-destructive"}`}>
                    {isPositive ? "+" : "-"}{fmtBRL(t.amount)}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

      </main>

      <BottomNavigation />
      <PortoSeguroButton />
      <AIChatPanel />
    </div>
  );
}
