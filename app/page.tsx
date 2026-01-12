import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-background to-muted">
      <div className="max-w-4xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold tracking-tight">
            Plataforma de{" "}
            <span className="text-primary">Área de Membros</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Solução completa para infoprodutores gerenciarem cursos, alunos e vendas com integrações automáticas
          </p>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Link href="/dashboard">
            <Button size="lg" className="text-lg">
              Acessar Dashboard
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button size="lg" variant="outline" className="text-lg">
              Login
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">🚀 Integração Automática</h3>
            <p className="text-sm text-muted-foreground">
              Conecte com Hotmart, Eduzz, Monetizze e mais 20+ plataformas
            </p>
          </div>
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">🎨 Design Customizável</h3>
            <p className="text-sm text-muted-foreground">
              Interface estilo Netflix com personalização completa de cores e layout
            </p>
          </div>
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">📊 Multi-Tenant</h3>
            <p className="text-sm text-muted-foreground">
              Arquitetura SaaS com isolamento completo de dados
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
