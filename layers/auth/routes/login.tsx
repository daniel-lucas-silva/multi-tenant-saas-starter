import * as React from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import {
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  Building,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/shared/components/ui/card';
import { useAuth } from '@/shared/stores';

export const Route = createFileRoute('/login')({
  component: LoginPage,
});

function LoginPage() {
  const { login, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [tenant, setTenant] = React.useState('default');
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor, preencha o e-mail e a senha.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (login) {
        await login({ email, password });
      }
      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/admin';
      }, 1000);
    } catch (err: any) {
      setError(err?.message || 'Falha ao autenticar. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('admin@payload.local');
    setPassword('admin123456');
    setError(null);
  };

  return (
    <Card className="border-border bg-card/95 backdrop-blur shadow-2xl">
      <CardHeader className="space-y-1 text-center pb-6">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20">
          <Lock className="h-6 w-6" />
        </div>
        <CardTitle className="text-xl font-bold tracking-tight text-foreground">
          Entrar na sua Conta
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Acesse o painel administrativo ou área do cliente
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Autenticado com sucesso! Redirecionando para o Admin...</span>
            </div>
          )}

          {/* Tenant Selector (SaaS Multi-tenant preparation) */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Building className="h-3.5 w-3.5" />
                Organização / Tenant
              </span>
              <span className="text-[10px] text-muted-foreground">Opcional</span>
            </label>
            <select
              value={tenant}
              onChange={(e) => setTenant(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
            >
              <option value="default">Workspace Padrão (Admin Principal)</option>
              <option value="tenant-alpha">Empresa Alpha (Tenant #1)</option>
              <option value="tenant-beta">Tech Labs (Tenant #2)</option>
            </select>
          </div>

          {/* Email input */}
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
                placeholder="seu.email@exemplo.com"
                className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none placeholder:text-muted-foreground"
              />
              <Mail className="h-4 w-4 text-muted-foreground absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Password input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-muted-foreground">Senha</label>
              <Link
                to="/forgot-password"
                className="text-[11px] text-primary hover:underline"
              >
                Esqueceu a senha?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-border bg-background pl-9 pr-9 py-2 text-sm text-foreground focus:border-primary focus:outline-none placeholder:text-muted-foreground"
              />
              <Lock className="h-4 w-4 text-muted-foreground absolute left-3 top-2.5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground absolute right-3 top-2.5"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Demo fill helper */}
          <button
            type="button"
            onClick={handleFillDemo}
            className="w-full py-2 px-3 rounded-lg border border-dashed border-primary/30 bg-primary/5 text-primary text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-primary/10 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Preencher Credenciais Admin Demo</span>
          </button>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-2">
          <Button type="submit" disabled={loading} className="w-full gap-2">
            <span>{loading ? 'Entrando...' : 'Entrar no Sistema'}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Não possui uma conta?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Criar conta
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
