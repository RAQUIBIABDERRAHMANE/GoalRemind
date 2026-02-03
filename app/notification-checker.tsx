'use client';

import { useEffect } from 'react';

export default function NotificationChecker() {
  useEffect(() => {
    // Check for due reminders every 1 minute
    const checkInterval = setInterval(async () => {
      try {
        const token = process.env.NEXT_PUBLIC_JOB_API_SECRET || 
                      localStorage.getItem('job_token');
        
        if (!token) {
          console.warn('No job token configured for notification checking');
          return;
        }

        const response = await fetch(`/api/jobs/send-due-reminders?token=${token}`, {
          method: 'POST',
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Notification check:', data);
        }
      } catch (error) {
        console.error('Error checking notifications:', error);
      }
    }, 60000); // Every 1 minute

    return () => clearInterval(checkInterval);
  }, []);

  return null;
}
