import { Order } from '@domain/entities/order/order.entity';
import { Delivery } from '@domain/entities/delivery/delivery.entity';
import {
  NotificationPort,
  NotificationPayload,
  NotificationResult,
  NotificationType,
} from '@application/ports/notification.port';

export class InMemoryNotificationService implements NotificationPort {
  async send(_payload: NotificationPayload): Promise<NotificationResult> {
    return { success: true, sentChannels: [], failedChannels: [] };
  }

  async notifyClientAboutOrder(_order: Order, _type: NotificationType, _clientEmail: string): Promise<NotificationResult> {
    return { success: true, sentChannels: [], failedChannels: [] };
  }

  async notifyRestaurantAboutOrder(_order: Order, _type: NotificationType, _ownerId: string, _email: string): Promise<NotificationResult> {
    return { success: true, sentChannels: [], failedChannels: [] };
  }

  async notifyCourierAboutDelivery(_delivery: Delivery, _type: NotificationType, _courierId: string, _email: string): Promise<NotificationResult> {
    return { success: true, sentChannels: [], failedChannels: [] };
  }

  async sendBatch(payloads: NotificationPayload[]): Promise<NotificationResult[]> {
    return payloads.map(() => ({ success: true, sentChannels: [], failedChannels: [] }));
  }
}
