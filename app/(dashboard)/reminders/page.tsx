'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';
import Modal from '@/components/Modal';
import { PlusIcon, TrashIcon, CheckIcon, EditIcon, ClockIcon } from '@/components/Icons';
import toast from 'react-hot-toast';

interface Reminder {
  id: number;
  title: string;
  notes?: string;
  dueAt: string;
  priority: 'low' | 'medium' | 'high';
  repeat: 'none' | 'daily' | 'weekly' | 'monthly';
  status: 'pending' | 'done' | 'snoozed';
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const action = searchParams.get('action');
    const filterParam = searchParams.get('filter');
    
    if (action === 'new') {
      setIsModalOpen(true);
    }
    
    if (filterParam) {
      setFilter(filterParam);
    }
    
    loadReminders(filterParam || 'all');
  }, [searchParams]);

  async function loadReminders(currentFilter: string) {
    try {
      setLoading(true);
      const url = currentFilter === 'all' 
        ? '/api/reminders'
        : `/api/reminders?filter=${currentFilter}`;
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setReminders(data);
      }
    } catch (error) {
      console.error('Error loading reminders:', error);
      toast.error('Erreur lors du chargement des rappels');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      title: formData.get('title'),
      notes: formData.get('notes'),
      dueAt: formData.get('dueAt'),
      priority: formData.get('priority'),
      repeat: formData.get('repeat'),
    };

    try {
      const url = editingReminder 
        ? `/api/reminders/${editingReminder.id}`
        : '/api/reminders';
      
      const method = editingReminder ? 'PATCH' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success(editingReminder ? 'Rappel mis à jour' : 'Rappel créé');
        setIsModalOpen(false);
        setEditingReminder(null);
        loadReminders(filter);
        router.push('/reminders');
      } else {
        const error = await res.json();
        toast.error(error.error || 'Erreur');
      }
    } catch (error) {
      console.error('Error saving reminder:', error);
      toast.error('Erreur lors de l\'enregistrement');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce rappel ?')) return;

    try {
      const res = await fetch(`/api/reminders/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Rappel supprimé');
        loadReminders(filter);
      }
    } catch (error) {
      console.error('Error deleting reminder:', error);
      toast.error('Erreur lors de la suppression');
    }
  }

  async function handleMarkDone(id: number) {
    try {
      const res = await fetch(`/api/reminders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'done' }),
      });

      if (res.ok) {
        toast.success('Rappel marqué comme terminé');
        loadReminders(filter);
      }
    } catch (error) {
      console.error('Error marking reminder as done:', error);
      toast.error('Erreur');
    }
  }

  async function handleSnooze(id: number, minutes: number) {
    const reminder = reminders.find((r) => r.id === id);
    if (!reminder) return;

    const newDueAt = new Date(new Date(reminder.dueAt).getTime() + minutes * 60 * 1000);

    try {
      const res = await fetch(`/api/reminders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dueAt: newDueAt, status: 'snoozed' }),
      });

      if (res.ok) {
        toast.success(`Rappel reporté de ${minutes} minutes`);
        loadReminders(filter);
      }
    } catch (error) {
      console.error('Error snoozing reminder:', error);
      toast.error('Erreur');
    }
  }

  const priorityColors = {
    low: 'bg-blue-100 text-blue-800 border-blue-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    high: 'bg-red-100 text-red-800 border-red-300',
  };

  const filters = [
    { value: 'all', label: 'Tous' },
    { value: 'today', label: 'Aujourd\'hui' },
    { value: 'upcoming', label: 'À venir' },
    { value: 'overdue', label: 'En retard' },
    { value: 'completed', label: 'Terminés' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Rappels</h1>
        <button
          onClick={() => {
            setEditingReminder(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Nouveau rappel
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => {
                setFilter(f.value);
                loadReminders(f.value);
                router.push(`/reminders?filter=${f.value}`);
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === f.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reminders List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : reminders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <ClockIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">Aucun rappel trouvé</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {reminders.map((reminder) => (
              <li key={reminder.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{reminder.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded border ${priorityColors[reminder.priority]}`}>
                        {reminder.priority === 'high' ? 'Haute' : reminder.priority === 'medium' ? 'Moyenne' : 'Basse'}
                      </span>
                      {reminder.status === 'done' && (
                        <span className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800">
                          Terminé
                        </span>
                      )}
                    </div>
                    {reminder.notes && (
                      <p className="text-sm text-gray-600 mb-2">{reminder.notes}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>
                        {new Date(reminder.dueAt).toLocaleDateString('fr-FR')} à{' '}
                        {new Date(reminder.dueAt).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {reminder.repeat !== 'none' && (
                        <span className="text-blue-600">
                          Répète: {reminder.repeat === 'daily' ? 'quotidien' : reminder.repeat === 'weekly' ? 'hebdomadaire' : 'mensuel'}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {reminder.status !== 'done' && (
                      <>
                        <button
                          onClick={() => handleMarkDone(reminder.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded"
                          title="Marquer comme terminé"
                        >
                          <CheckIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleSnooze(reminder.id, 10)}
                          className="px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 rounded"
                          title="Reporter de 10 minutes"
                        >
                          +10m
                        </button>
                        <button
                          onClick={() => handleSnooze(reminder.id, 60)}
                          className="px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 rounded"
                          title="Reporter de 1 heure"
                        >
                          +1h
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => {
                        setEditingReminder(reminder);
                        setIsModalOpen(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="Modifier"
                    >
                      <EditIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(reminder.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Supprimer"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingReminder(null);
          router.push('/reminders');
        }}
        title={editingReminder ? 'Modifier le rappel' : 'Nouveau rappel'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre *
            </label>
            <input
              type="text"
              name="title"
              defaultValue={editingReminder?.title}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              defaultValue={editingReminder?.notes}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date et heure *
            </label>
            <input
              type="datetime-local"
              name="dueAt"
              defaultValue={editingReminder ? new Date(editingReminder.dueAt).toISOString().slice(0, 16) : ''}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priorité *
            </label>
            <select
              name="priority"
              defaultValue={editingReminder?.priority || 'medium'}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Répétition *
            </label>
            <select
              name="repeat"
              defaultValue={editingReminder?.repeat || 'none'}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="none">Aucune</option>
              <option value="daily">Quotidienne</option>
              <option value="weekly">Hebdomadaire</option>
              <option value="monthly">Mensuelle</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingReminder(null);
                router.push('/reminders');
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              {editingReminder ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
