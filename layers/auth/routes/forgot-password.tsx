import * as React from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { KeyRound, Mail, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/shared/components/ui/card';

export const Route = createFileRoute('/forgot-password')({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 800);
  };

  return (
    <Card className="border-border bg-card/95 backdrop-blur shadow-2xl">
      <CardHeader className="space-y-1 text-center pb-6">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
          <KeyRound className="h-6 w-6" />
        </div>
        <CardTitle className="text-xl font-bold tracking-tight text-foreground">
          Recuperar Senha
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Insira seu e-mail para receber o link de redefinição
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {sent ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                <span>Instruções enviadas!</span>
              </div>
              <p className="text-muted-foreground">
                Se o e-mail <strong>{email}</strong> existir na nossa base, você receberá um link seguro para redefinir sua senha.
              </p>
            </div>
          ) : (
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
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-2">
          {!sent && (
            <Button type="submit" disabled={loading} className="w-full gap-2">
              <span>{loading ? 'Enviando link...' : 'Enviar Link de Recuperação'}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}

          <Link
            to="/login"
            className="text-center text-xs text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Voltar para o login</span>
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
