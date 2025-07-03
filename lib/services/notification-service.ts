
import { getMessagingInstance } from '../firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { NotificationType } from '../types';

interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  data: { [key: string]: string };
  createdAt: Date;
  updatedAt: Date;
}
import { NOTIFICATION_CONFIG, STORAGE_KEYS } from '../constants';
import { setLocalStorage, getLocalStorage } from '../utils';
import { prisma } from '../db';

export class NotificationService {
  private static callbacks: ((notification: AppNotification) => void)[] = [];

  static async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  static async getFCMToken(): Promise<string | null> {
    try {
      const messaging = await getMessagingInstance();
      if (!messaging) return null;

      const hasPermission = await this.requestPermission();
      if (!hasPermission) return null;

      const token = await getToken(messaging, {
        vapidKey: NOTIFICATION_CONFIG.vapidPublicKey,
      });

      if (token) {
        setLocalStorage(STORAGE_KEYS.fcmToken, token);
        return token;
      }

      return null;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  static async updateFCMToken(userId: string): Promise<void> {
    try {
      const token = await this.getFCMToken();
      if (token) {
        await prisma.user.update({
          where: { id: userId },
          data: { fcmToken: token },
        });
      }
    } catch (error) {
      console.error('Error updating FCM token:', error);
    }
  }

  static async setupMessageListener(): Promise<void> {
    try {
      const messaging = await getMessagingInstance();
      if (!messaging) return;

      onMessage(messaging, (payload) => {
        console.log('Message received:', payload);
        
        const notification: AppNotification = {
          id: Date.now().toString(),
          userId: '', // Will be set by the callback
          title: payload.notification?.title || 'Metro Notification',
          message: payload.notification?.body || '',
          type: NotificationType.INFO,
          isRead: false,
          data: payload.data,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Show browser notification
        this.showBrowserNotification(notification);

        // Notify callbacks
        this.callbacks.forEach(callback => callback(notification));
      });
    } catch (error) {
      console.error('Error setting up message listener:', error);
    }
  }

  static showBrowserNotification(notification: AppNotification): void {
    if (Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: notification.id,
        requireInteraction: notification.type === NotificationType.WARNING || notification.type === NotificationType.ERROR,
      });

      browserNotification.onclick = () => {
        window.focus();
        browserNotification.close();
      };

      // Auto close after 5 seconds
      setTimeout(() => {
        browserNotification.close();
      }, 5000);
    }
  }

  static async createNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType = NotificationType.INFO,
    data?: any
  ): Promise<Notification> {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId,
          title,
          message,
          type,
          data,
          isRead: false,
        },
      });

      return notification as any;
    } catch (error: any) {
      console.error('Create notification error:', error);
      throw new Error('Failed to create notification');
    }
  }

  static async getNotifications(userId: string, limit: number = 50): Promise<Notification[]> {
    try {
      const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      return notifications as any;
    } catch (error: any) {
      console.error('Get notifications error:', error);
      throw new Error('Failed to get notifications');
    }
  }

  static async markAsRead(notificationId: string): Promise<void> {
    try {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      });
    } catch (error: any) {
      console.error('Mark as read error:', error);
      throw new Error('Failed to mark notification as read');
    }
  }

  static async markAllAsRead(userId: string): Promise<void> {
    try {
      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });
    } catch (error: any) {
      console.error('Mark all as read error:', error);
      throw new Error('Failed to mark all notifications as read');
    }
  }

  static addNotificationCallback(callback: (notification: AppNotification) => void): void {
    this.callbacks.push(callback);
  }

  static removeNotificationCallback(callback: (notification: AppNotification) => void): void {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }

  // Journey-specific notifications
  static async notifyJourneyStart(userId: string, fromStation: string): Promise<void> {
    await this.createNotification(
      userId,
      'Journey Started',
      `Your journey from ${fromStation} has begun. Have a safe trip!`,
      NotificationType.JOURNEY_UPDATE
    );
  }

  static async notifyJourneyEnd(userId: string, toStation: string, fare: number): Promise<void> {
    await this.createNotification(
      userId,
      'Journey Completed',
      `Journey to ${toStation} completed. Fare: ₹${fare}`,
      NotificationType.JOURNEY_UPDATE
    );
  }

  static async notifyLowBalance(userId: string, balance: number): Promise<void> {
    await this.createNotification(
      userId,
      'Low Balance Alert',
      `Your metro card balance is low (₹${balance}). Please recharge soon.`,
      NotificationType.WARNING
    );
  }

  static async notifyRechargeSuccess(userId: string, amount: number, newBalance: number): Promise<void> {
    await this.createNotification(
      userId,
      'Recharge Successful',
      `₹${amount} added successfully. New balance: ₹${newBalance}`,
      NotificationType.SUCCESS
    );
  }

  // Geofencing notifications
  static async notifyGeofenceEntry(stationName: string): Promise<void> {
    const notification: AppNotification = {
      id: Date.now().toString(),
      userId: '', // Will be set by the system
      title: 'Station Area Detected',
      message: `You're near ${stationName} station. QR code ready for entry.`,
      type: NotificationType.INFO,
      isRead: false,
      data: { stationName, type: 'geofence_entry' },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.showBrowserNotification(notification);
  }

  static async notifyGeofenceExit(stationName: string): Promise<void> {
    const notification: AppNotification = {
      id: Date.now().toString(),
      userId: '', // Will be set by the system
      title: 'Left Station Area',
      message: `You've left ${stationName} station area.`,
      type: NotificationType.INFO,
      isRead: false,
      data: { stationName, type: 'geofence_exit' },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.showBrowserNotification(notification);
  }

  static async notifyQRGenerated(stationName: string, type: 'entry' | 'exit'): Promise<void> {
    const notification: AppNotification = {
      id: Date.now().toString(),
      userId: '', // Will be set by the system
      title: 'QR Code Ready',
      message: `${type === 'entry' ? 'Entry' : 'Exit'} QR code generated for ${stationName}`,
      type: NotificationType.SUCCESS,
      isRead: false,
      data: { stationName, qrType: type },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.showBrowserNotification(notification);
  }
}
