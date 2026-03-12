import { useEffect } from 'react';
import { Project } from '../types';

const NOTIF_KEY = 'promanager_last_notif';

export function useNotifications(enabled: boolean, projects: Project[], onError?: (msg: string) => void) {
  useEffect(() => {
    if (!enabled || projects.length === 0) return;

    const checkAndNotify = () => {
      const mainProject = projects.find(p => p.isMain);
      if (!mainProject) return;

      const lastNotif = localStorage.getItem(NOTIF_KEY);
      const now = Date.now();
      const eightHours = 8 * 60 * 60 * 1000;

      if (!lastNotif || now - parseInt(lastNotif) > eightHours) {
        new Notification(`ProManager: ${mainProject.name}`, {
          body: `Loyihangizda yangi vazifalar bo'lishi mumkin. Ishni davom ettiramizmi?`,
          icon: 'https://picsum.photos/seed/promanager/192/192'
        });

        localStorage.setItem(NOTIF_KEY, now.toString());
      }
    };

    const interval = setInterval(checkAndNotify, 60000);
    checkAndNotify();

    return () => clearInterval(interval);
  }, [enabled, projects]);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      if (onError) onError('Brauzeringiz bildirishnomalarni qo\'llab-quvvatlamaydi.');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  };

  return { requestPermission };
}
