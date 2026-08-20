import React, { useEffect, useState } from 'react';
import { Link, createFileRoute } from '@tanstack/react-router';
import {
  FolderKanban,
  Users,
  Zap,
  TrendingUp,
  Plus,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { SaasLayout } from '../components/saas-layout';
import { QuotaProgressBar } from '@/shared/components/quota-progress';
import { useAuth, useTenant, useCollection } from '@/shared/stores';
import { StatusBadge } from '../components/primitives';

export const Route = createFileRoute('/')({ component: DashboardPage });

function DashboardPage() {
  const { user } = useAuth();
  const { currentTenant, planDefinition, planId, reloadTenants } = useTenant();
  const { docs: projects, status: projectsStatus } = useCollection('projects');
  const { docs: tasks } = useCollection('tasks');
  const { docs: members } = useCollection('tenant-members');

  const [stats, setStats] = useState({
    projects: 0,
    tasks: 0,
    members: 0,
    jobCreditsUsed: 12,
  });

  useEffect(() => {
    if (user?.id) {
      void reloadTenants(user.id);
    }
  }, [user?.id]);

  useEffect(() => {
    setStats({
      projects: projects.length,
      tasks: tasks.length,
      members: members.length || 1,
      jobCreditsUsed: 12,
    });
  }, [projects.length, tasks.length, members.length]);

  const activeProjects = projects.filter((p: any) => p.status === 'in_progress');
  const completedProjects = projects.filter((p: any) => p.status === 'completed');

  return (
    <SaasLayout
      title={currentTenant?.name || 'LaunchPulse SaaS'}
      subtitle={`Painel Geral • Plano ${planDefinition.name}`}
    >
      <div className="space-y-6">
        {/* Banner de Boas-Vindas Mobile-First */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 p-5 sm:p-7 text-white shadow-lg">
          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Workspace Ativo: {currentTenant?.name || 'Meu Time'}</span>
            </div>
            <h2 className="mt-3 text-xl font-extrabold tracking-tight sm:text-2xl">
              Olá, {user?.name || user?.email?.split('@')[0] || 'Gestor'} 👋
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-indigo-100/90 leading-relaxed">
              Bem-vindo ao centro de controle do seu SaaS. Gerencie projetos, convide membros para times e acompanhe o consumo das suas quotas em tempo real.
            </p>

            <div className="mt-4 flex flex-wrap gap-2.5">
              <Link
                to="/projects"
                className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-indigo-700 shadow-sm transition-transform hover:bg-indigo-50 active:scale-95"
              >
                <Plus className="h-4 w-4" />
                Criar Projeto
              </Link>
              <Link
                to="/team"
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/20"
              >
                <Users className="h-4 w-4" />
                Convidar Membro
              </Link>
            </div>
          </div>
        </div>

        {/* Grid de Quotas do Plano */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-foreground">Quotas do Plano ({planDefinition.name})</h3>
              <p className="text-xs text-muted-foreground">Monitore a capacidade contratada do workspace</p>
            </div>
            <Link
              to="/billing"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              Fazer Upgrade
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <QuotaProgressBar
              label="Projetos Ativos"
              usage={stats.projects}
              limit={planDefinition.limits.maxProjects}
            />
            <QuotaProgressBar
              label="Membros da Equipe"
              usage={stats.members}
              limit={planDefinition.limits.maxMembers}
            />
            <QuotaProgressBar
              label="Créditos de Automação"
              usage={stats.jobCreditsUsed}
              limit={planDefinition.limits.monthlyJobCredits}
              unit=" créditos"
            />
            <QuotaProgressBar
              label="Chaves de API"
              usage={1}
              limit={planDefinition.limits.maxApiKeys}
            />
          </div>
        </div>

        {/* Métricas Rápidas */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <FolderKanban className="h-4 w-4 text-indigo-500" />
              <span className="text-xs font-medium">Total Projetos</span>
            </div>
            <p className="mt-2 text-2xl font-extrabold text-foreground">{stats.projects}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{activeProjects.length} em andamento</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="text-xs font-medium">Concluídos</span>
            </div>
            <p className="mt-2 text-2xl font-extrabold text-foreground">{completedProjects.length}</p>
            <p className="mt-0.5 text-[11px] text-emerald-600 dark:text-emerald-400">Entregues no prazo</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4 text-sky-500" />
              <span className="text-xs font-medium">Equipe</span>
            </div>
            <p className="mt-2 text-2xl font-extrabold text-foreground">{stats.members}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Membros ativos</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Zap className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-medium">Automações</span>
            </div>
            <p className="mt-2 text-2xl font-extrabold text-foreground">99.8%</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Taxa de sucesso</p>
          </div>
        </div>

        {/* Projetos Recentes */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Projetos do Workspace</h3>
            <Link
              to="/projects"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Ver todos ({projects.length})
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
              <FolderKanban className="mx-auto h-8 w-8 text-muted-foreground" />
              <h4 className="mt-2 text-sm font-semibold text-foreground">Nenhum projeto criado ainda</h4>
              <p className="mt-1 text-xs text-muted-foreground">
                Crie seu primeiro projeto para começar a organizar entregas e tarefas.
              </p>
              <Link
                to="/projects"
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground transition-transform hover:opacity-90 active:scale-95"
              >
                <Plus className="h-3.5 w-3.5" />
                Criar Primeiro Projeto
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              {projects.slice(0, 6).map((project: any) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}` as any}
                  className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-sm active:scale-98"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm">
                        {project.title}
                      </h4>
                      <StatusBadge status={project.status || 'in_progress'} />
                    </div>
                    {project.description && (
                      <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">
                        {project.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Prioridade: <span className="font-semibold text-foreground capitalize">{project.priority || 'média'}</span>
                    </span>
                    <span className="text-primary font-medium group-hover:translate-x-0.5 transition-transform">
                      Ver detalhes →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </SaasLayout>
  );
}
