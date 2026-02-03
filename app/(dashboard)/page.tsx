'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PlusIcon, ClockIcon, TargetIcon } from '@/components/Icons';
import toast from 'react-hot-toast';

interface Reminder {
  id: number;
  title: string;
  dueAt: string;
  priority: 'low' | 'medium' | 'high';
  status: string;
}

interface Goal {
  id: number;
  title: string;
  status: string;
  progressType: string;
  progressCurrent: number;
  progressTarget: number;
}

export default function DashboardPage() {
  const [todayReminders, setTodayReminders] = useState<Reminder[]>([]);
  const [overdueReminders, setOverdueReminders] = useState<Reminder[]>([]);
  const [activeGoals, setActiveGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      
      const [todayRes, overdueRes, goalsRes] = await Promise.all([
        fetch('/api/reminders?filter=today'),
        fetch('/api/reminders?filter=overdue'),
        fetch('/api/goals?status=active'),
      ]);

      if (todayRes.ok) setTodayReminders(await todayRes.json());
      if (overdueRes.ok) setOverdueReminders(await overdueRes.json());
      if (goalsRes.ok) setActiveGoals(await goalsRes.json());
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  }

  const priorityColors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
        <div className="flex gap-2">
          <Link
            href="/reminders?action=new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Rappel
          </Link>
          <Link
            href="/goals?action=new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Objectif
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Reminders */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <ClockIcon className="h-6 w-6 mr-2 text-blue-600" />
              Aujourd'hui
            </h2>
            <Link href="/reminders?filter=today" className="text-blue-600 hover:text-blue-800 text-sm">
              Voir tout
            </Link>
          </div>
          
          {todayReminders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucun rappel pour aujourd'hui</p>
          ) : (
            <ul className="space-y-3">
              {todayReminders.map((reminder) => (
                <li key={reminder.id} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{reminder.title}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(reminder.dueAt).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${priorityColors[reminder.priority]}`}>
                      {reminder.priority === 'high' ? 'Haute' : reminder.priority === 'medium' ? 'Moyenne' : 'Basse'}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Overdue Reminders */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <ClockIcon className="h-6 w-6 mr-2 text-red-600" />
              En retard
            </h2>
            <Link href="/reminders?filter=overdue" className="text-blue-600 hover:text-blue-800 text-sm">
              Voir tout
            </Link>
          </div>
          
          {overdueReminders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucun rappel en retard</p>
          ) : (
            <ul className="space-y-3">
              {overdueReminders.slice(0, 5).map((reminder) => (
                <li key={reminder.id} className="border-l-4 border-red-500 pl-4 py-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{reminder.title}</p>
                      <p className="text-sm text-red-600">
                        {new Date(reminder.dueAt).toLocaleDateString('fr-FR')} {new Date(reminder.dueAt).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${priorityColors[reminder.priority]}`}>
                      {reminder.priority === 'high' ? 'Haute' : reminder.priority === 'medium' ? 'Moyenne' : 'Basse'}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Active Goals */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <TargetIcon className="h-6 w-6 mr-2 text-green-600" />
            Objectifs actifs
          </h2>
          <Link href="/goals" className="text-blue-600 hover:text-blue-800 text-sm">
            Voir tout
          </Link>
        </div>

        {activeGoals.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Aucun objectif actif</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeGoals.slice(0, 6).map((goal) => {
              const progress = goal.progressTarget > 0 
                ? Math.round((goal.progressCurrent / goal.progressTarget) * 100)
                : 0;
              
              return (
                <Link
                  key={goal.id}
                  href={`/goals/${goal.id}`}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors"
                >
                  <h3 className="font-medium text-gray-900 mb-2">{goal.title}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Progression</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
