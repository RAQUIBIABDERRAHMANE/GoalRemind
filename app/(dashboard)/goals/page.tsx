'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

import Modal from '@/components/Modal';
import { PlusIcon, TrashIcon, EditIcon, TargetIcon } from '@/components/Icons';
import toast from 'react-hot-toast';

interface Goal {
  id: number;
  title: string;
  description?: string;
  targetDate?: string;
  status: 'active' | 'paused' | 'done';
  progressType: 'percent' | 'count' | 'checklist';
  progressCurrent: number;
  progressTarget: number;
}

function GoalsContent() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'new') {
      setIsModalOpen(true);
    }
    
    loadGoals();
  }, [searchParams]);

  async function loadGoals() {
    try {
      setLoading(true);
      const res = await fetch('/api/goals');
      if (res.ok) {
        const data = await res.json();
        setGoals(data);
      }
    } catch (error) {
      console.error('Error loading goals:', error);
      toast.error('Erreur lors du chargement des objectifs');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      title: formData.get('title'),
      description: formData.get('description'),
      targetDate: formData.get('targetDate') || undefined,
      progressType: formData.get('progressType'),
      progressTarget: parseInt(formData.get('progressTarget') as string),
      progressCurrent: editingGoal?.progressCurrent || 0,
      status: editingGoal?.status || 'active',
    };

    try {
      const url = editingGoal 
        ? `/api/goals/${editingGoal.id}`
        : '/api/goals';
      
      const method = editingGoal ? 'PATCH' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success(editingGoal ? 'Objectif mis à jour' : 'Objectif créé');
        setIsModalOpen(false);
        setEditingGoal(null);
        loadGoals();
        router.push('/goals');
      } else {
        const error = await res.json();
        toast.error(error.error || 'Erreur');
      }
    } catch (error) {
      console.error('Error saving goal:', error);
      toast.error('Erreur lors de l\'enregistrement');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet objectif ?')) return;

    try {
      const res = await fetch(`/api/goals/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Objectif supprimé');
        loadGoals();
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('Erreur lors de la suppression');
    }
  }

  async function handleUpdateStatus(id: number, status: string) {
    try {
      const res = await fetch(`/api/goals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        toast.success('Statut mis à jour');
        loadGoals();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Erreur');
    }
  }

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    paused: 'bg-yellow-100 text-yellow-800',
    done: 'bg-blue-100 text-blue-800',
  };

  const statusLabels = {
    active: 'Actif',
    paused: 'En pause',
    done: 'Terminé',
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Objectifs</h1>
        <button
          onClick={() => {
            setEditingGoal(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Nouvel objectif
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      ) : goals.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <TargetIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">Aucun objectif trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const progress = goal.progressTarget > 0 
              ? Math.round((goal.progressCurrent / goal.progressTarget) * 100)
              : 0;
            
            return (
              <div key={goal.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <Link href={`/goals/${goal.id}`} className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
                        {goal.title}
                      </h3>
                    </Link>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${statusColors[goal.status]}`}>
                      {statusLabels[goal.status]}
                    </span>
                  </div>

                  {goal.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {goal.description}
                    </p>
                  )}

                  {goal.targetDate && (
                    <p className="text-sm text-gray-500 mb-4">
                      Échéance: {new Date(goal.targetDate).toLocaleDateString('fr-FR')}
                    </p>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Progression</span>
                      <span>
                        {goal.progressType === 'percent' && `${progress}%`}
                        {goal.progressType === 'count' && `${goal.progressCurrent}/${goal.progressTarget}`}
                        {goal.progressType === 'checklist' && `${goal.progressCurrent}/${goal.progressTarget}`}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {goal.status === 'active' && (
                      <button
                        onClick={() => handleUpdateStatus(goal.id, 'paused')}
                        className="flex-1 px-3 py-1 text-xs text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                      >
                        Mettre en pause
                      </button>
                    )}
                    {goal.status === 'paused' && (
                      <button
                        onClick={() => handleUpdateStatus(goal.id, 'active')}
                        className="flex-1 px-3 py-1 text-xs text-green-700 bg-green-100 rounded hover:bg-green-200"
                      >
                        Reprendre
                      </button>
                    )}
                    {goal.status !== 'done' && (
                      <button
                        onClick={() => handleUpdateStatus(goal.id, 'done')}
                        className="flex-1 px-3 py-1 text-xs text-blue-700 bg-blue-100 rounded hover:bg-blue-200"
                      >
                        Marquer terminé
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setEditingGoal(goal);
                        setIsModalOpen(true);
                      }}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <EditIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingGoal(null);
          router.push('/goals');
        }}
        title={editingGoal ? 'Modifier l\'objectif' : 'Nouvel objectif'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre *
            </label>
            <input
              type="text"
              name="title"
              defaultValue={editingGoal?.title}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              defaultValue={editingGoal?.description}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date cible
            </label>
            <input
              type="date"
              name="targetDate"
              defaultValue={editingGoal?.targetDate ? new Date(editingGoal.targetDate).toISOString().slice(0, 10) : ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de progression *
            </label>
            <select
              name="progressType"
              defaultValue={editingGoal?.progressType || 'percent'}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="percent">Pourcentage</option>
              <option value="count">Compteur</option>
              <option value="checklist">Liste de tâches</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Objectif cible *
            </label>
            <input
              type="number"
              name="progressTarget"
              defaultValue={editingGoal?.progressTarget || 100}
              required
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingGoal(null);
                router.push('/goals');
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
            >
              {editingGoal ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function GoalsPage() {
  return (
    <Suspense fallback={<div className="text-center py-8">Chargement...</div>}>
      <GoalsContent />
    </Suspense>
  );
}
