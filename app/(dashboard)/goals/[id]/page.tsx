'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Modal from '@/components/Modal';
import { PlusIcon, TrashIcon, CheckIcon } from '@/components/Icons';
import toast from 'react-hot-toast';

interface Goal {
  id: number;
  title: string;
  description?: string;
  targetDate?: string;
  status: string;
  progressType: string;
  progressCurrent: number;
  progressTarget: number;
}

interface Milestone {
  id: number;
  goalId: number;
  title: string;
  done: boolean;
  createdAt: string;
}

export default function GoalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadGoal();
  }, []);

  async function loadGoal() {
    try {
      setLoading(true);
      const res = await fetch(`/api/goals/${resolvedParams.id}`);
      if (res.ok) {
        const data = await res.json();
        setGoal(data);
        setMilestones(data.milestones || []);
      } else {
        toast.error('Objectif non trouvé');
        router.push('/goals');
      }
    } catch (error) {
      console.error('Error loading goal:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddMilestone(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      title: formData.get('title'),
    };

    try {
      const res = await fetch(`/api/goals/${resolvedParams.id}/milestones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success('Étape ajoutée');
        setIsModalOpen(false);
        loadGoal();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Erreur');
      }
    } catch (error) {
      console.error('Error adding milestone:', error);
      toast.error('Erreur lors de l\'ajout');
    }
  }

  async function handleToggleMilestone(milestoneId: number, done: boolean) {
    try {
      const res = await fetch(`/api/milestones/${milestoneId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ done }),
      });

      if (res.ok) {
        toast.success(done ? 'Étape marquée comme terminée' : 'Étape marquée comme non terminée');
        loadGoal();
        
        // Update goal progress if type is checklist
        if (goal?.progressType === 'checklist') {
          const completedCount = milestones.filter(m => m.id === milestoneId ? done : m.done).length;
          await fetch(`/api/goals/${resolvedParams.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ progressCurrent: completedCount }),
          });
        }
      }
    } catch (error) {
      console.error('Error toggling milestone:', error);
      toast.error('Erreur');
    }
  }

  async function handleDeleteMilestone(milestoneId: number) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette étape ?')) return;

    try {
      const res = await fetch(`/api/milestones/${milestoneId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Étape supprimée');
        loadGoal();
      }
    } catch (error) {
      console.error('Error deleting milestone:', error);
      toast.error('Erreur lors de la suppression');
    }
  }

  async function handleUpdateProgress(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const progressCurrent = parseInt(formData.get('progressCurrent') as string);

    try {
      const res = await fetch(`/api/goals/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progressCurrent }),
      });

      if (res.ok) {
        toast.success('Progression mise à jour');
        loadGoal();
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Erreur');
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!goal) {
    return null;
  }

  const progress = goal.progressTarget > 0 
    ? Math.round((goal.progressCurrent / goal.progressTarget) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/goals" className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block">
          ← Retour aux objectifs
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">{goal.title}</h1>
      </div>

      {/* Goal Details */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-4">
          {goal.description && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
              <p className="text-gray-900">{goal.description}</p>
            </div>
          )}

          {goal.targetDate && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Date cible</h3>
              <p className="text-gray-900">{new Date(goal.targetDate).toLocaleDateString('fr-FR')}</p>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Statut</h3>
            <p className="text-gray-900">
              {goal.status === 'active' ? 'Actif' : goal.status === 'paused' ? 'En pause' : 'Terminé'}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Progression</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>
                  {goal.progressType === 'percent' && `${progress}%`}
                  {goal.progressType === 'count' && `${goal.progressCurrent} / ${goal.progressTarget}`}
                  {goal.progressType === 'checklist' && `${goal.progressCurrent} / ${goal.progressTarget} étapes`}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-green-600 h-4 rounded-full transition-all flex items-center justify-center"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                >
                  {progress > 10 && (
                    <span className="text-xs text-white font-medium">{progress}%</span>
                  )}
                </div>
              </div>
            </div>

            {goal.progressType !== 'checklist' && (
              <form onSubmit={handleUpdateProgress} className="mt-4 flex gap-2">
                <input
                  type="number"
                  name="progressCurrent"
                  defaultValue={goal.progressCurrent}
                  min="0"
                  max={goal.progressTarget}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                >
                  Mettre à jour
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Étapes</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Ajouter une étape
          </button>
        </div>

        {milestones.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Aucune étape définie</p>
        ) : (
          <ul className="space-y-2">
            {milestones.map((milestone) => (
              <li key={milestone.id} className="flex items-center gap-3 p-3 rounded hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={milestone.done}
                  onChange={(e) => handleToggleMilestone(milestone.id, e.target.checked)}
                  className="h-5 w-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                />
                <span className={`flex-1 ${milestone.done ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                  {milestone.title}
                </span>
                <button
                  onClick={() => handleDeleteMilestone(milestone.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Ajouter une étape"
      >
        <form onSubmit={handleAddMilestone} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre de l'étape *
            </label>
            <input
              type="text"
              name="title"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
            >
              Ajouter
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
