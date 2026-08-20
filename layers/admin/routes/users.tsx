import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import {
  Users,
  Plus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Mail,
  Calendar,
  Save,
  Trash2,
  ArrowLeft,
  Key,
} from 'lucide-react';

import {
  Board,
  BoardHeader,
  BoardInput,
  BoardContent,
  BoardFooter,
} from '@/components/layout/board';
import {
  Stage,
  StageHeader,
  StageContent,
  StageFooter,
} from '@/components/layout/stage';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBreakpoint } from '@/hooks/use-breakpoint';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/users')({
  component: AdminUsersPage,
});

interface UserItem {
  id: string;
  name: string;
  email: string;
  roles: string[];
  status: 'active' | 'pending' | 'suspended';
  lastActive: string;
}

const mockUsers: UserItem[] = [
  {
    id: '1',
    name: 'Super Administrador',
    email: 'admin@payload.local',
    roles: ['admin'],
    status: 'active',
    lastActive: 'Agora mesmo',
  },
  {
    id: '2',
    name: 'Editor Chefe',
    email: 'editor@empresa.com',
    roles: ['editor'],
    status: 'active',
    lastActive: 'Há 2 horas',
  },
  {
    id: '3',
    name: 'Desenvolvedor API',
    email: 'dev@tech.io',
    roles: ['developer', 'admin'],
    status: 'active',
    lastActive: 'Ontem',
  },
];

function AdminUsersPage() {
  const { isMobile } = useBreakpoint();
  const [search, setSearch] = React.useState('');
  const [selectedId, setSelectedId] = React.useState<string>('1');
  const [mobileView, setMobileView] = React.useState<'list' | 'detail'>('list');

  const filtered = mockUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  const selectedUser = mockUsers.find((u) => u.id === selectedId) || mockUsers[0];

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
      {/* Board Zone (Users List) */}
      {showBoard && (
        <Board fullWidth={isMobile}>
          <BoardHeader>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-foreground truncate">Usuários & Acesso</h2>
              <p className="text-[11px] text-muted-foreground">{filtered.length} contas cadastradas</p>
            </div>
            <Button size="sm" className="h-8 gap-1 text-xs">
              <Plus className="h-3.5 w-3.5" />
              <span>Convidar</span>
            </Button>
          </BoardHeader>

          <BoardInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar por nome ou e-mail..."
          />

          <BoardContent>
            <div className="divide-y divide-border">
              {filtered.map((user) => {
                const isActive = user.id === selectedId;
                return (
                  <button
                    key={user.id}
                    onClick={() => handleSelect(user.id)}
                    className={cn(
                      'w-full p-3.5 text-left transition-colors flex flex-col gap-1.5',
                      isActive
                        ? 'bg-primary/5 border-l-2 border-l-primary'
                        : 'hover:bg-muted/50',
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-foreground truncate">
                        {user.name}
                      </span>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {user.roles.join(', ')}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                  </button>
                );
              })}
            </div>
          </BoardContent>

          <BoardFooter>
            <p className="text-[11px] text-muted-foreground text-center w-full">
              Autenticação segura via Payload Auth
            </p>
          </BoardFooter>
        </Board>
      )}

      {/* Stage Zone (User Profile & Permissions) */}
      {showStage && selectedUser && (
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
                  {selectedUser.name}
                </h1>
                <p className="text-xs text-muted-foreground truncate">{selectedUser.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" className="h-8 gap-1.5 text-xs">
                <Save className="h-3.5 w-3.5" />
                <span>Salvar Alterações</span>
              </Button>
            </div>
          </StageHeader>

          <StageContent className="space-y-6 max-w-3xl">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    defaultValue={selectedUser.name}
                    className="w-full rounded-lg border border-border bg-card px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                    Endereço de E-mail
                  </label>
                  <input
                    type="email"
                    defaultValue={selectedUser.email}
                    className="w-full rounded-lg border border-border bg-card px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Permissões & Funções (RBAC)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl border border-border bg-card">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs">
                    <input type="checkbox" defaultChecked className="rounded border-border mt-0.5" />
                    <div>
                      <span className="font-semibold text-foreground block">Admin</span>
                      <span className="text-muted-foreground text-[11px]">Acesso total a todas as coleções</span>
                    </div>
                  </label>
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs">
                    <input type="checkbox" defaultChecked={selectedUser.roles.includes('editor')} className="rounded border-border mt-0.5" />
                    <div>
                      <span className="font-semibold text-foreground block">Editor</span>
                      <span className="text-muted-foreground text-[11px]">Criar e publicar conteúdos</span>
                    </div>
                  </label>
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs">
                    <input type="checkbox" className="rounded border-border mt-0.5" />
                    <div>
                      <span className="font-semibold text-foreground block">Membro</span>
                      <span className="text-muted-foreground text-[11px]">Leitura e comentários</span>
                    </div>
                  </label>
                </div>
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
              <span>Desativar Conta</span>
            </Button>
            <span className="text-[11px] text-muted-foreground">
              Última atividade: {selectedUser.lastActive}
            </span>
          </StageFooter>
        </Stage>
      )}
    </div>
  );
}
