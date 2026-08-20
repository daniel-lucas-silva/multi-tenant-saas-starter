import React, { useState } from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Clock,
  Calendar,
  Layers,
  AlertCircle,
} from 'lucide-react';
import { SaasLayout } from '../../components/saas-layout';
import { useCollection, useTenant } from '@/shared/stores';
import { StatusBadge } from '../../components/primitives';

export const Route = createFileRoute('/projects/$id')({ component: ProjectDetailPage });

function ProjectDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { docs: projects, update: updateProject } = useCollection('projects');
  const { docs: tasks, create: createTask, update: updateTask, deleteByID: deleteTask } = useCollection('tasks');
  const { currentTenant } = useTenant();

  const project = projects.find((p: any) => p.id === id);
  const projectTasks = tasks.filter((t: any) => {
    const projId = typeof t.project === 'object' ? t.project?.id : t.project;
    return projId === id;
  });

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

  if (!project) {
    return (
      <SaasLayout title="Projeto Não Encontrado" onBack={() => navigate({ to: '/projects' })}>
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground" />
          <h3 className="mt-3 text-sm font-bold text-foreground">Projeto não localizado</h3>
          <p className="mt-1 text-xs text-muted-foreground">O projeto solicitado pode ter sido excluído ou você não possui permissão de acesso.</p>
          <Link
            to="/projects"
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
          >
            Voltar para Projetos
          </Link>
        </div>
      </SaasLayout>
    );
  }

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !currentTenant?.id) return;

    setIsAddingTask(true);
    try {
      await createTask({
        title: newTaskTitle.trim(),
        project: project.id,
        tenant: currentTenant.id,
        status: 'todo',
      });
      setNewTaskTitle('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsAddingTask(false);
    }
  };

  const toggleTaskStatus = async (task: any) => {
    const nextStatus = task.status === 'done' ? 'todo' : 'done';
    try {
      await updateTask(task.id, { status: nextStatus });
    } catch (err) {
      console.error(err);
    }
  };

  const completedTasksCount = projectTasks.filter((t: any) => t.status === 'done').length;

  return (
    <SaasLayout
      title={project.title}
      subtitle={`Projeto • Status: ${project.status}`}
      onBack={() => navigate({ to: '/projects' })}
    >
      <div className="space-y-6">
        {/* Header do Projeto */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-foreground">{project.title}</h2>
                <StatusBadge status={project.status || 'in_progress'} />
              </div>
              {project.description && (
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed max-w-2xl">
                  {project.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={project.status || 'in_progress'}
                onChange={(e) => updateProject(project.id, { status: e.target.value as any })}
                className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none"
              >
                <option value="in_progress">Em Andamento</option>
                <option value="review">Em Revisão</option>
                <option value="completed">Concluído</option>
                <option value="backlog">Backlog</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-border pt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-indigo-500" />
              Prioridade: <strong className="text-foreground capitalize">{project.priority || 'média'}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              Progresso: <strong className="text-foreground">{completedTasksCount}/{projectTasks.length} tarefas</strong>
            </span>
          </div>
        </div>

        {/* Gerenciador de Tarefas */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-foreground">Tarefas da Entrega</h3>
              <p className="text-xs text-muted-foreground">Acompanhe as atividades e passos do projeto</p>
            </div>
          </div>

          {/* Form rápida de adicionar tarefa */}
          <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Digite o título da nova tarefa e pressione Enter..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
            <button
              type="submit"
              disabled={isAddingTask || !newTaskTitle.trim()}
              className="inline-flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-xs hover:opacity-90 active:scale-95 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Adicionar
            </button>
          </form>

          {/* Lista de Tarefas */}
          {projectTasks.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              Nenhuma tarefa cadastrada. Adicione o primeiro item acima!
            </div>
          ) : (
            <div className="space-y-2">
              {projectTasks.map((task: any) => {
                const isDone = task.status === 'done';
                return (
                  <div
                    key={task.id}
                    className="flex items-center justify-between rounded-xl border border-border bg-background p-3 transition-colors hover:bg-accent/40"
                  >
                    <button
                      type="button"
                      onClick={() => toggleTaskStatus(task)}
                      className="flex items-center gap-3 text-left flex-1"
                    >
                      {isDone ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                      <span className={`text-xs ${isDone ? 'line-through text-muted-foreground' : 'font-medium text-foreground'}`}>
                        {task.title}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteTask(task.id)}
                      title="Excluir tarefa"
                      className="p-1 text-muted-foreground hover:text-rose-500 rounded-lg"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </SaasLayout>
  );
}
