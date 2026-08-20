import * as React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Spot, SpotHeader, SpotContent, SpotFooter } from '@/shared/components/layout/spot';
import { useBreakpoint } from '@/shared/hooks/use-breakpoint';
import { Button } from '@/shared/components/ui/button';

export function AdminSpot({ spot }: { spot?: 'action' | 'drawer' | 'create-post' }) {
  const { isMobile } = useBreakpoint();
  const navigate = useNavigate();

  const close = () => {
    navigate({
      to: '.',
      search: (prev: Record<string, unknown>) => {
        const next = { ...prev };
        delete next.spot;
        return next;
      },
    });
  };

  const variant = isMobile
    ? spot === 'drawer'
      ? 'fullscreen'
      : 'sheet'
    : spot === 'drawer'
      ? 'drawer'
      : 'modal';

  return (
    <Spot open={Boolean(spot)} onClose={close} variant={variant}>
      <SpotHeader
        title={
          spot === 'create-post'
            ? 'Novo Post Rápido'
            : spot === 'drawer'
              ? 'Painel Lateral de Detalhes'
              : 'Ação Rápida no Admin'
        }
        subtitle={
          spot === 'create-post'
            ? 'Publicação direta no Payload CMS'
            : `Variante contextual: ${variant}`
        }
        onClose={close}
      />
      <SpotContent>
        {spot === 'create-post' ? (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                Título do Artigo
              </label>
              <input
                type="text"
                placeholder="Ex.: Novidades da Versão 3.88"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                Resumo / Subtítulo
              </label>
              <textarea
                rows={3}
                placeholder="Breve descrição para indexação e feeds..."
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none resize-none"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              O <strong>Spot</strong> é a 4ª zona da arquitetura adaptativa: um overlay controlado de forma segura pelo estado da rota (`?spot=...`), garantindo que o contexto do Stage e do Board permaneçam preservados.
            </p>
            <div className="p-3 bg-muted/50 rounded-lg border border-border text-xs space-y-1">
              <p className="font-semibold text-foreground">Estado Atual da Rota:</p>
              <p className="text-muted-foreground font-mono">search.spot = &quot;{spot}&quot;</p>
              <p className="text-muted-foreground font-mono">layout.variant = &quot;{variant}&quot;</p>
            </div>
          </div>
        )}
      </SpotContent>
      <SpotFooter>
        <Button variant="outline" size="sm" onClick={close}>
          Cancelar
        </Button>
        <Button size="sm" onClick={close}>
          {spot === 'create-post' ? 'Criar Rascunho' : 'Confirmar'}
        </Button>
      </SpotFooter>
    </Spot>
  );
}
