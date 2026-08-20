import React, { useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  Star,
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreVertical,
} from 'lucide-react';
import { SaasLayout } from '../../components/saas-layout';
import { useCollection, useTenant } from '@/shared/stores';
import { UpgradeGate } from '@/shared/components/upgrade-gate';
import { StatusBadge } from '../../components/primitives';

export const Route = createFileRoute('/projects/')({ component: ProjectsPage });

function ProjectsPage() {
  const { docs: projects, create, status } = useCollection('projects');
  const { currentTenant, planDefinition } = useTenant();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'in_progress',
  });

  const isLimitReached = projects.length >= planDefinition.limits.maxProjects;

  const filteredProjects = projects.filter((p: any) => {
    const matchesSearch = p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || p.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.title.trim() || !currentTenant?.id) return;

    setIsCreating(true);
    try {
      await create({
        title: newProject.title.trim(),
        description: newProject.description.trim(),
        priority: newProject.priority as any,
        status: newProject.status as any,
        tenant: currentTenant.id,
      });
      setNewProject({ title: '', description: '', priority: 'medium', status: 'in_progress' });
      setShowCreateModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <SaasLayout
      title="Projetos & Entregas"
      subtitle={`${projects.length} de ${planDefinition.limits.maxProjects >= 999999 ? 'ilimitados' : planDefinition.limits.maxProjects} projetos utilizados`}
      rightAction={
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-xs transition-transform hover:opacity-90 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Novo Projeto</span>
        </button>
      }
    >
      <div className="space-y-4">
        {/* Barra de Busca e Filtros */}
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar projetos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-border bg-card pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['all', 'in_progress', 'review', 'completed', 'backlog'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFilterStatus(s)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                  filterStatus === s
                    ? 'bg-primary text-primary-foreground font-semibold'
                    : 'bg-card border border-border text-muted-foreground hover:bg-accent'
                }`}
              >
                {s === 'all'
                  ? 'Todos'
                  : s === 'in_progress'
                    ? 'Em Andamento'
                    : s === 'review'
                      ? 'Revisão'
                      : s === 'completed'
                        ? 'Concluídos'
                        : 'Backlog'}
              </button>
            ))}
          </div>
        </div>

        {/* Alerta se atingir o limite do plano */}
        {isLimitReached && (
          <div className="rounded-2xl border border-amber-300 bg-amber-50/70 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                    Limite de Projetos Atingido no Plano {planDefinition.name}
                  </h4>
                  <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-400">
                    Você atingiu a quota máxima de {planDefinition.limits.maxProjects} projetos. Faça upgrade para criar mais.
                  </p>
                </div>
              </div>
              <Link
                to="/billing"
                className="shrink-0 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-700 active:scale-95"
              >
                Fazer Upgrade
              </Link>
            </div>
          </div>
        )}

        {/* Lista de Projetos */}
        {filteredProjects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center">
            <FolderKanban className="mx-auto h-10 w-10 text-muted-foreground" />
            <h3 className="mt-3 text-sm font-bold text-foreground">Nenhum projeto encontrado</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {searchTerm ? 'Tente ajustar sua busca ou filtros.' : 'Crie seu primeiro projeto para começar a organizar sua equipe.'}
            </p>
            {!searchTerm && (
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-xs hover:opacity-90 active:scale-95"
              >
                <Plus className="h-4 w-4" />
                Criar Projeto Agora
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project: any) => (
              <div
                key={project.id}
                className="flex flex-col justify-between rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      to={`/projects/${project.id}` as any}
                      className="font-bold text-foreground text-sm hover:text-primary transition-colors"
                    >
                      {project.title}
                    </Link>
                    <StatusBadge status={project.status || 'in_progress'} />
                  </div>

                  {project.description && (
                    <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-[11px] text-muted-foreground">
                  <span className="capitalize">
                    Prioridade: <span className="font-semibold text-foreground">{project.priority || 'média'}</span>
                  </span>
                  <Link
                    to={`/projects/${project.id}` as any}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Ver detalhes →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Criar Projeto */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h3 className="text-base font-bold text-foreground">Novo Projeto</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Cadastre um novo projeto para o workspace {currentTenant?.name}.
            </p>

            {isLimitReached ? (
              <div className="mt-4 space-y-4">
                <UpgradeGate
                  minTier="plus"
                  fallbackTitle="Limite de Projetos Atingido"
                  fallbackDescription={`O plano ${planDefinition.name} permite até ${planDefinition.limits.maxProjects} projetos. Desbloqueie mais capacidade fazendo upgrade agora.`}
                  inline
                >
                  <div />
                </UpgradeGate>
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="rounded-xl px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-accent"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreate} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-foreground">Título do Projeto</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Redesign da Landing Page"
                    value={newProject.title}
                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground">Descrição</label>
                  <textarea
                    rows={3}
                    placeholder="Objetivos e escopo da entrega..."
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-foreground">Prioridade</label>
                    <select
                      value={newProject.priority}
                      onChange={(e) => setNewProject({ ...newProject, priority: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                    >
                      <option value="low">Baixa</option>
                      <option value="medium">Média</option>
                      <option value="high">Alta</option>
                      <option value="urgent">Urgente</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground">Status Inicial</label>
                    <select
                      value={newProject.status}
                      onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                    >
                      <option value="in_progress">Em Andamento</option>
                      <option value="backlog">Backlog</option>
                      <option value="review">Em Revisão</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="rounded-xl px-3.5 py-2 text-xs font-medium text-muted-foreground hover:bg-accent"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating || !newProject.title.trim()}
                    className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-xs hover:opacity-90 active:scale-95 disabled:opacity-50"
                  >
                    {isCreating ? 'Criando...' : 'Criar Projeto'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </SaasLayout>
  );
}
