import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft,
  Plus,
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  CreditCard,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { AIChatPanel } from "@/components/chat/AIChatPanel";
import { useToast } from "@/hooks/use-toast";

interface Transaction {
  id: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  description: string;
  date: Date;
}

const categories = [
  { id: "food", label: "Alimentação", icon: "🍔" },
  { id: "transport", label: "Transporte", icon: "🚗" },
  { id: "health", label: "Saúde", icon: "💊" },
  { id: "entertainment", label: "Lazer", icon: "🎮" },
  { id: "bills", label: "Contas", icon: "📄" },
  { id: "other", label: "Outros", icon: "📦" },
];

export default function FinanceHome() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: "1", type: "income", category: "other", amount: 3500, description: "Salário", date: new Date() },
    { id: "2", type: "expense", category: "food", amount: 150, description: "Mercado", date: new Date() },
    { id: "3", type: "expense", category: "transport", amount: 80, description: "Combustível", date: new Date() },
  ]);
  const [newTransaction, setNewTransaction] = useState({
    type: "expense" as "income" | "expense",
    category: "food",
    amount: "",
    description: "",
  });

  const totalIncome = transactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpenses;

  const handleAddTransaction = async () => {
    if (!newTransaction.amount || !newTransaction.description) {
      toast({
        title: "Preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    const transaction: Transaction = {
      id: Date.now().toString(),
      type: newTransaction.type,
      category: newTransaction.category,
      amount: parseFloat(newTransaction.amount),
      description: newTransaction.description,
      date: new Date(),
    };

    // Send to n8n webhook
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/webhook-forwarder`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: `Registro financeiro: ${newTransaction.type === "expense" ? "Gasto" : "Entrada"} de R$ ${newTransaction.amount} - ${newTransaction.description} (${newTransaction.category})`,
          }),
        }
      );
      console.log("Webhook response:", response.status);
    } catch (error) {
      console.error("Webhook error:", error);
    }

    setTransactions([transaction, ...transactions]);
    setIsDialogOpen(false);
    setNewTransaction({ type: "expense", category: "food", amount: "", description: "" });
    
    toast({
      title: "Transação registrada!",
      description: `${newTransaction.type === "expense" ? "Gasto" : "Entrada"} de R$ ${newTransaction.amount}`,
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-finance text-finance-foreground">
        <div className="container px-4 py-6">
          <div className="flex items-center gap-3 mb-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate("/app")}
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-display font-bold">Finanças</h1>
              <p className="text-finance-foreground/70 text-sm">
                Controle seus gastos
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container px-4 -mt-4">
        {/* Balance Card */}
        <Card className="card-premium mb-6">
          <CardContent className="p-5">
            <div className="text-center mb-4">
              <p className="text-sm text-muted-foreground">Saldo do Mês</p>
              <p className={`text-3xl font-bold ${balance >= 0 ? "text-success" : "text-destructive"}`}>
                R$ {balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-success/10">
                <TrendingUp className="h-5 w-5 text-success" />
                <div>
                  <p className="text-xs text-muted-foreground">Entradas</p>
                  <p className="font-semibold text-success">
                    R$ {totalIncome.toLocaleString("pt-BR")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-destructive/10">
                <TrendingDown className="h-5 w-5 text-destructive" />
                <div>
                  <p className="text-xs text-muted-foreground">Saídas</p>
                  <p className="font-semibold text-destructive">
                    R$ {totalExpenses.toLocaleString("pt-BR")}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="flex gap-3 mb-6">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex-1 btn-premium-primary">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Transação</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={newTransaction.type === "expense" ? "default" : "outline"}
                    onClick={() => setNewTransaction({ ...newTransaction, type: "expense" })}
                    className="w-full"
                  >
                    <TrendingDown className="h-4 w-4 mr-2" />
                    Gasto
                  </Button>
                  <Button
                    variant={newTransaction.type === "income" ? "default" : "outline"}
                    onClick={() => setNewTransaction({ ...newTransaction, type: "income" })}
                    className="w-full"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Entrada
                  </Button>
                </div>

                <Input
                  placeholder="Valor (R$)"
                  type="number"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                  className="input-premium"
                />

                <Input
                  placeholder="Descrição"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                  className="input-premium"
                />

                <Select
                  value={newTransaction.category}
                  onValueChange={(value) => setNewTransaction({ ...newTransaction, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.icon} {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button className="w-full" onClick={handleAddTransaction}>
                  Registrar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Transactions */}
        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Últimas Transações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {transactions.map((transaction) => {
              const category = categories.find(c => c.id === transaction.category);
              return (
                <div
                  key={transaction.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/50"
                >
                  <span className="text-xl">{category?.icon || "📦"}</span>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground">{category?.label}</p>
                  </div>
                  <p className={`font-semibold ${transaction.type === "expense" ? "text-destructive" : "text-success"}`}>
                    {transaction.type === "expense" ? "-" : "+"}R$ {transaction.amount.toLocaleString("pt-BR")}
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </main>

      <BottomNavigation />
      <AIChatPanel />
    </div>
  );
}
