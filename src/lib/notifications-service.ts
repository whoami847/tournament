import type { AppNotification } from '@/types';
import { mockNotifications } from './mock-data';

let notifications = [...mockNotifications];

export const getNotificationsStream = (
  userId: string,
  callback: (notifications: AppNotification[]) => void
) => {
  const userNotifications = notifications
    .filter(n => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);
    
  callback(userNotifications);
  return () => {};
};

export const createNotification = async (notification: Omit<AppNotification, 'id' | 'read' | 'createdAt'>) => {
    const newNotification: AppNotification = {
        ...notification,
        id: `notif_${Date.now()}`,
        read: false,
        createdAt: new Date().toISOString(),
    };
    notifications.unshift(newNotification);
    return { success: true };
}

export const markNotificationAsRead = async (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
        notification.read = true;
        return { success: true };
    }
    return { success: false, error: "Notification not found." };
}

export const updateNotificationStatus = async (notificationId: string, status: 'accepted' | 'rejected') => {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
        notification.status = status;
        notification.read = true;
        return { success: true };
    }
    return { success: false, error: "Notification not found." };
}
