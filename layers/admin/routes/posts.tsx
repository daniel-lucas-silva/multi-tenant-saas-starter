import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import {
  FileText,
  Plus,
  Search,
  Filter,
  ArrowLeft,
  Calendar,
  Save,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
} from 'lucide-react';

import {
  Board,
  BoardHeader,
  BoardInput,
  BoardContent,
  BoardFooter,
} from '@/shared/components/layout/board';
import {
  Stage,
  StageHeader,
  StageContent,
  StageFooter,
} from '@/shared/components/layout/stage';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { useCollection } from '@/shared/stores';
import { useBreakpoint } from '@/shared/hooks/use-breakpoint';
import { cn } from '@/shared/lib/utils';

export const Route = createFileRoute('/posts')({
  component: AdminPostsPage,
});

interface PostItem {
  id: string;
  title: string;
  slug?: string;
  status: 'published' | 'draft' | 'archived';
  author?: string;
  updatedAt: string;
  content?: string;
}

const mockPosts: PostItem[] = [
  {
    id: '1',
    title: 'Guia Completo do Payload 3.88 com Bun',
    slug: 'guia-completo-payload-bun',
    status: 'published',
    author: 'Admin Team',
    updatedAt: '2026-08-19',
    content: 'Payload 3.88 traz suporte de ponta para arquitetura API-only, com SDK nativo tipado e performance excepcional no Bun runtime.',
  },
  {
    id: '2',
    title: 'Padrão Adaptativo de 4 Zonas: Dock, Board, Stage e Spot',
    slug: 'padrao-adaptativo-4-zonas',
    status: 'published',
    author: 'UX Architect',
    updatedAt: '2026-08-18',
    content: 'Como estruturar aplicações web modernas que funcionam como apps nativos em mobile e dashboards robustos em desktop.',
  },
  {
    id: '3',
    title: 'Sincronização Offline-First com IndexedDB e Workbox',
    slug: 'offline-first-sync-indexeddb',
    status: 'draft',
    author: 'Engineering',
    updatedAt: '2026-08-17',
    content: 'Estratégia de enfileiramento de mutações com reconciliação no background.',
  },
];

function AdminPostsPage() {
  const { data: serverPosts } = useCollection('posts');
  const { isMobile, device } = useBreakpoint();
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'published' | 'draft'>('all');
  const [selectedId, setSelectedId] = React.useState<string>('1');
  const [mobileView, setMobileView] = React.useState<'list' | 'detail'>('list');

  // Active items: server or mock fallback
  const items: PostItem[] = React.useMemo(() => {
    if (serverPosts?.docs && serverPosts.docs.length > 0) {
      return serverPosts.docs.map((doc: any) => ({
        id: String(doc.id),
        title: doc.title || 'Sem título',
        slug: doc.slug,
        status: (doc.status || 'draft') as any,
        author: doc.author?.email || 'Autor',
        updatedAt: doc.updatedAt?.slice(0, 10) || '2026-08-20',
        content: doc.content || '',
      }));
    }
    return mockPosts;
  }, [serverPosts]);

  const filtered = items.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const selectedPost = items.find((p) => p.id === selectedId) || items[0];

  const handleSelect = (id: string) => {
    setSelectedId(id);
    if (isMobile) {
      setMobileView('detail');
    }
  };

  const showBoard = !isMobile || mobileView === 'list';
  const showStage = !isMobile || mobileView === 'detail';

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Board Zone (Master list) */}
      {showBoard && (
        <Board fullWidth={isMobile}>
          <BoardHeader>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-foreground truncate">Artigos & Posts</h2>
              <p className="text-[11px] text-muted-foreground">{filtered.length} publicações encontradas</p>
            </div>
            <Button size="sm" className="h-8 gap-1 text-xs">
              <Plus className="h-3.5 w-3.5" />
              <span>Novo</span>
            </Button>
          </BoardHeader>

          <BoardInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar por título ou slug..."
          />

          <div className="flex items-center gap-1 border-b border-border p-2">
            {(['all', 'published', 'draft'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={cn(
                  'rounded-md px-2 py-1 text-[11px] font-medium transition-colors',
                  statusFilter === st
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-muted-foreground hover:bg-muted',
                )}
              >
                {st === 'all' ? 'Todos' : st === 'published' ? 'Publicados' : 'Rascunhos'}
              </button>
            ))}
          </div>

          <BoardContent>
            <div className="divide-y divide-border">
              {filtered.map((post) => {
                const isActive = post.id === selectedId;
                return (
                  <button
                    key={post.id}
                    onClick={() => handleSelect(post.id)}
                    className={cn(
                      'w-full p-3.5 text-left transition-colors flex flex-col gap-1.5',
                      isActive
                        ? 'bg-primary/5 border-l-2 border-l-primary'
                        : 'hover:bg-muted/50',
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Badge
                        variant={post.status === 'published' ? 'default' : 'secondary'}
                        className="text-[10px] uppercase font-mono px-1.5 py-0"
                      >
                        {post.status}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {post.updatedAt}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-foreground line-clamp-2 leading-relaxed">
                      {post.title}
                    </p>
                  </button>
                );
              })}
            </div>
          </BoardContent>

          <BoardFooter>
            <p className="text-[11px] text-muted-foreground text-center w-full">
              Sincronizado via SDK REST
            </p>
          </BoardFooter>
        </Board>
      )}

      {/* Stage Zone (Detail & Editor) */}
      {showStage && selectedPost && (
        <Stage className="flex-1">
          <StageHeader>
            <div className="flex items-center gap-3 min-w-0">
              {isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileView('list')}
                  className="h-8 w-8 p-0 shrink-0"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <div className="min-w-0">
                <h1 className="text-base font-semibold text-foreground truncate">
                  {selectedPost.title}
                </h1>
                <p className="text-xs text-muted-foreground font-mono truncate">
                  slug: /{selectedPost.slug || selectedPost.id}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                <Eye className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Visualizar</span>
              </Button>
              <Button size="sm" className="h-8 gap-1.5 text-xs">
                <Save className="h-3.5 w-3.5" />
                <span>Salvar</span>
              </Button>
            </div>
          </StageHeader>

          <StageContent className="space-y-6 max-w-4xl">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Título do Artigo
                </label>
                <input
                  type="text"
                  defaultValue={selectedPost.title}
                  className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                    Slug
                  </label>
                  <input
                    type="text"
                    defaultValue={selectedPost.slug || ''}
                    className="w-full rounded-lg border border-border bg-card px-3.5 py-2 text-sm text-foreground font-mono focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                    Status da Publicação
                  </label>
                  <select
                    defaultValue={selectedPost.status}
                    className="w-full rounded-lg border border-border bg-card px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  >
                    <option value="published">Publicado (Published)</option>
                    <option value="draft">Rascunho (Draft)</option>
                    <option value="archived">Arquivado (Archived)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Conteúdo Principal
                </label>
                <textarea
                  rows={10}
                  defaultValue={selectedPost.content || ''}
                  placeholder="Escreva o conteúdo em Markdown ou Rich Text..."
                  className="w-full rounded-lg border border-border bg-card p-3.5 text-sm text-foreground focus:border-primary focus:outline-none leading-relaxed"
                />
              </div>
            </div>
          </StageContent>

          <StageFooter>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive gap-1.5 mr-auto text-xs"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Excluir</span>
            </Button>
            <span className="text-[11px] text-muted-foreground">
              ID: {selectedPost.id} · Payload 3.88
            </span>
          </StageFooter>
        </Stage>
      )}
    </div>
  );
}
