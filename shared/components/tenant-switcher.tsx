import React, { useState } from 'react';
import { useTenant } from '../stores';

export function TenantSwitcher() {
  const { currentTenant, userTenants, switchTenant, createTenant } = useTenant();
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTenantName, setNewTenantName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantName.trim()) return;
    setIsCreating(true);
    try {
      await createTenant({ name: newTenantName.trim() });
      setNewTenantName('');
      setShowCreateModal(false);
      setIsOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-left text-xs font-semibold text-neutral-800 shadow-2xs transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800/80"
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-600 text-[11px] font-bold text-white uppercase">
          {currentTenant?.name?.charAt(0) || 'W'}
        </div>
        <span className="max-w-[120px] truncate font-medium sm:max-w-[160px]">
          {currentTenant?.name || 'Selecione o Workspace'}
        </span>
        <svg
          className={`h-4 w-4 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 z-50 mt-2 w-64 rounded-2xl border border-neutral-200 bg-white p-2 shadow-xl backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900">
            <div className="px-2 py-1.5 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              Seus Workspaces
            </div>

            <div className="mt-1 max-h-56 space-y-1 overflow-y-auto">
              {userTenants.map((t) => {
                const isActive = t.id === currentTenant?.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      switchTenant(t);
                      setIsOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs transition-colors ${
                      isActive
                        ? 'bg-indigo-50 font-semibold text-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-200'
                        : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-neutral-200 text-[10px] font-bold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 uppercase">
                        {t.name.charAt(0)}
                      </div>
                      <span className="truncate">{t.name}</span>
                    </div>
                    {isActive && (
                      <svg className="h-4 w-4 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="my-1.5 h-px bg-neutral-100 dark:bg-neutral-800" />

            <button
              type="button"
              onClick={() => {
                setShowCreateModal(true);
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/30"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-full border border-dashed border-indigo-400">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span>Criar Novo Workspace</span>
            </button>
          </div>
        </>
      )}

      {/* Modal Criar Workspace */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">Criar Novo Workspace</h3>
            <p className="mt-1 text-xs text-neutral-500">Dê um nome para o seu novo espaço de trabalho ou time.</p>

            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  Nome do Workspace
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Minha Startup, Agência Alfa..."
                  value={newTenantName}
                  onChange={(e) => setNewTenantName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs text-neutral-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !newTenantName.trim()}
                  className="rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white transition-all hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isCreating ? 'Criando...' : 'Criar Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
