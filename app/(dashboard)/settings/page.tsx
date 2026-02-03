'use client';

import { useEffect, useState } from 'react';
import { BellIcon } from '@/components/Icons';

export const dynamic = 'force-dynamic';

import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationsSupported, setNotificationsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    checkNotificationSupport();
    checkIfInstalled();
    
    // Capture the install prompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Check if app is already installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  function checkIfInstalled() {
    // Check if running as PWA
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
    }
  }

  async function handleInstallClick() {
    if (!deferredPrompt) {
      toast.error('L\'installation n\'est pas disponible pour le moment');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      toast.success('Installation en cours...');
      setIsInstalled(true);
    }
    
    setDeferredPrompt(null);
  }

  function checkNotificationSupport() {
    if ('Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window) {
      setNotificationsSupported(true);
      setNotificationsEnabled(Notification.permission === 'granted');
      checkSubscription();
    }
  }

  async function checkSubscription() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  }

  async function handleEnableNotifications() {
    if (!notificationsSupported) {
      toast.error('Les notifications ne sont pas supportées par ce navigateur');
      return;
    }

    try {
      setLoading(true);

      // Request permission
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        toast.error('Permission de notifications refusée');
        return;
      }

      setNotificationsEnabled(true);

      // Register service worker if not already
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // Subscribe to push notifications
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      
      if (!vapidPublicKey) {
        toast.error('Clé VAPID publique non configurée');
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      // Send subscription to server
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription.toJSON()),
      });

      if (res.ok) {
        setIsSubscribed(true);
        toast.success('Notifications activées avec succès!');
      } else {
        throw new Error('Failed to save subscription');
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      toast.error('Erreur lors de l\'activation des notifications');
    } finally {
      setLoading(false);
    }
  }

  async function handleDisableNotifications() {
    try {
      setLoading(true);

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Unsubscribe from server
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });

        // Unsubscribe from push
        await subscription.unsubscribe();
        setIsSubscribed(false);
        toast.success('Notifications désactivées');
      }
    } catch (error) {
      console.error('Error disabling notifications:', error);
      toast.error('Erreur lors de la désactivation');
    } finally {
      setLoading(false);
    }
  }

  async function handleTestNotification() {
    try {
      setLoading(true);
      const res = await fetch('/api/push/test', { method: 'POST' });
      
      if (res.ok) {
        const data = await res.json();
        toast.success(data.message || 'Notification de test envoyée!');
      } else {
        const error = await res.json();
        toast.error(error.error || 'Erreur');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast.error('Erreur lors de l\'envoi');
    } finally {
      setLoading(false);
    }
  }

  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>

      {/* PWA Install */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Application PWA</h2>
        <div className="space-y-4">
          <p className="text-gray-600">
            GoalRemind peut être installé comme une application sur votre appareil pour une expérience optimale.
          </p>
          
          {isInstalled ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium">✓ Application déjà installée</p>
              <p className="text-sm text-green-700 mt-1">
                L'application est disponible sur votre appareil.
              </p>
            </div>
          ) : (
            <>
              {deferredPrompt && (
                <button
                  onClick={handleInstallClick}
                  className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Installer l'application
                </button>
              )}
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Comment installer :</h3>
                <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                  <li><strong>Chrome/Edge (Desktop)</strong> : Cliquez sur l'icône ⊕ dans la barre d'adresse</li>
                  <li><strong>Chrome (Android)</strong> : Menu (⋮) → Installer l'application</li>
                  <li><strong>Safari (iOS)</strong> : Partager <svg className="inline w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.11 0-2-.9-2-2V10c0-1.11.89-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .89 2 2z"/></svg> → Ajouter à l'écran d'accueil</li>
                  <li><strong>Firefox (Android)</strong> : Menu → Installer</li>
                </ul>
                {!deferredPrompt && (
                  <p className="text-xs text-blue-700 mt-3 pt-3 border-t border-blue-200">
                    💡 Le bouton d'installation automatique apparaîtra après quelques visites sur HTTPS
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <BellIcon className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Notifications Push</h2>
          </div>
        </div>

        {!notificationsSupported ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">
              Les notifications push ne sont pas supportées par votre navigateur.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600">
              Activez les notifications pour recevoir des rappels même lorsque l'application n'est pas ouverte.
            </p>

            <div className="flex items-center gap-4">
              {!isSubscribed ? (
                <button
                  onClick={handleEnableNotifications}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Activation...' : 'Activer les notifications'}
                </button>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-green-600">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Notifications activées</span>
                  </div>
                  <button
                    onClick={handleDisableNotifications}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
                  >
                    {loading ? 'Désactivation...' : 'Désactiver'}
                  </button>
                  <button
                    onClick={handleTestNotification}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? 'Envoi...' : 'Tester la notification'}
                  </button>
                </>
              )}
            </div>

            {notificationsEnabled && !isSubscribed && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  Les notifications sont autorisées mais vous n'êtes pas encore abonné. Cliquez sur "Activer les notifications" pour vous abonner.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* About */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">À propos</h2>
        <div className="space-y-2 text-gray-600">
          <p><strong>GoalRemind</strong> v1.0.0</p>
          <p>Gestionnaire de rappels et objectifs avec notifications push</p>
          <p className="text-sm">Propulsé par Next.js, TypeScript, Tailwind CSS et SQLite</p>
        </div>
      </div>
    </div>
  );
}
