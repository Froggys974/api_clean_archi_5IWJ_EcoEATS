import { Order } from '@domain/entities/order/order.entity';
import { Delivery } from '@domain/entities/delivery/delivery.entity';

export type NotificationType =
  | 'ORDER_CREATED'
  | 'ORDER_PAID'
  | 'ORDER_ACCEPTED'
  | 'ORDER_REFUSED'
  | 'ORDER_READY'
  | 'ORDER_PICKED_UP'
  | 'ORDER_DELIVERED'
  | 'ORDER_CANCELLED'
  | 'DELIVERY_ASSIGNED'
  | 'DELIVERY_ACCEPTED'
  | 'DELIVERY_PICKED_UP'
  | 'DELIVERY_COMPLETED'
  | 'DELIVERY_CANCELLED'
  | 'PAYMENT_SUCCESSFUL'
  | 'PAYMENT_FAILED';

export type NotificationChannel = 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP';

export type NotificationRecipient = {
  userId: string;
  email?: string;
  phone?: string;
  deviceTokens?: string[];
};

export type NotificationPayload = {
  type: NotificationType;
  recipient: NotificationRecipient;
  channels: NotificationChannel[];
  subject?: string;
  message: string;
  data?: Record<string, unknown>;
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
};

export type NotificationResult = {
  success: boolean;
  sentChannels: NotificationChannel[];
  failedChannels: NotificationChannel[];
  message?: string;
};

export interface NotificationPort {
  /**
   * Send a notification through specified channels
   * @param payload - The notification payload
   * @returns Notification result
   */
  send(payload: NotificationPayload): Promise<NotificationResult>;

  /**
   * Send order notification to client
   * @param order - The order
   * @param type - The notification type
   * @param clientEmail - Client email
   * @param additionalMessage - Additional message
   */
  notifyClientAboutOrder(
    order: Order,
    type: NotificationType,
    clientEmail: string,
    additionalMessage?: string
  ): Promise<NotificationResult>;

  /**
   * Send order notification to restaurant
   * @param order - The order
   * @param type - The notification type
   * @param restaurantOwnerId - Restaurant owner ID
   * @param restaurantEmail - Restaurant email
   */
  notifyRestaurantAboutOrder(
    order: Order,
    type: NotificationType,
    restaurantOwnerId: string,
    restaurantEmail: string
  ): Promise<NotificationResult>;

  /**
   * Send delivery notification to courier
   * @param delivery - The delivery
   * @param type - The notification type
   * @param courierId - Courier ID
   * @param courierEmail - Courier email
   * @param courierPhone - Courier phone
   */
  notifyCourierAboutDelivery(
    delivery: Delivery,
    type: NotificationType,
    courierId: string,
    courierEmail: string,
    courierPhone?: string
  ): Promise<NotificationResult>;

  /**
   * Send batch notifications
   * @param payloads - Array of notification payloads
   * @returns Array of notification results
   */
  sendBatch(payloads: NotificationPayload[]): Promise<NotificationResult[]>;
}
