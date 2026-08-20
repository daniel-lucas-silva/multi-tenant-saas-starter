import * as React from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import {
  UserPlus,
  Mail,
  Lock,
  Building,
  ArrowRight,
  User,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

export const Route = createFileRoute('/register')({
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [org, setOrg] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        navigate({ to: '/login' });
      }, 1500);
    }, 800);
  };

  return (
    <Card className="border-border bg-card/95 backdrop-blur shadow-2xl">
      <CardHeader className="space-y-1 text-center pb-6">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20">
          <UserPlus className="h-6 w-6" />
        </div>
        <CardTitle className="text-xl font-bold tracking-tight text-foreground">
          Criar Nova Conta
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Cadastre seu usuário e inicie seu workspace multi-tenant
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {success && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Conta criada! Redirecionando para o login...</span>
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">
              Nome Completo
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              />
              <User className="h-4 w-4 text-muted-foreground absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">
              Nome da Empresa / Tenant
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={org}
                onChange={(e) => setOrg(e.target.value)}
                placeholder="Ex.: Acme Corp"
                className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              />
              <Building className="h-4 w-4 text-muted-foreground absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">
              Endereço de E-mail
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@empresa.com"
                className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              />
              <Mail className="h-4 w-4 text-muted-foreground absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">
              Criar Senha
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              />
              <Lock className="h-4 w-4 text-muted-foreground absolute left-3 top-2.5" />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-2">
          <Button type="submit" disabled={loading} className="w-full gap-2">
            <span>{loading ? 'Criando conta...' : 'Cadastrar e Começar'}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Fazer login
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
