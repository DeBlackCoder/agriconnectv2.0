import { OrderStatus } from '@/models/Order';

// Valid state transitions
const STATE_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PLACED: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['IN_TRANSIT'],
  IN_TRANSIT: ['OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
  DELIVERED: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
};

/**
 * Check if status transition is valid
 */
export function isValidStatusTransition(
  currentStatus: OrderStatus,
  newStatus: OrderStatus
): boolean {
  const allowedTransitions = STATE_TRANSITIONS[currentStatus];
  return allowedTransitions.includes(newStatus);
}

/**
 * Get next possible statuses
 */
export function getNextPossibleStatuses(currentStatus: OrderStatus): OrderStatus[] {
  return STATE_TRANSITIONS[currentStatus] || [];
}

/**
 * Calculate order progress percentage
 */
export function calculateOrderProgress(status: OrderStatus): number {
  const progressMap: Record<OrderStatus, number> = {
    PLACED: 10,
    CONFIRMED: 20,
    PROCESSING: 35,
    SHIPPED: 50,
    IN_TRANSIT: 65,
    OUT_FOR_DELIVERY: 80,
    DELIVERED: 90,
    COMPLETED: 100,
    CANCELLED: 0,
  };

  return progressMap[status] || 0;
}

/**
 * Generate unique order number
 */
export function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  return `ORD-${year}${month}${day}-${random}`;
}

/**
 * Estimate delivery date based on status
 */
export function estimateDeliveryDate(status: OrderStatus): Date | null {
  const now = new Date();
  
  switch (status) {
    case 'PLACED':
    case 'CONFIRMED':
      // 7 days from now
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case 'PROCESSING':
      // 5 days from now
      return new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
    case 'SHIPPED':
    case 'IN_TRANSIT':
      // 3 days from now
      return new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    case 'OUT_FOR_DELIVERY':
      // 1 day from now
      return new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
    case 'DELIVERED':
    case 'COMPLETED':
      return now;
    default:
      return null;
  }
}

/**
 * Get status display name
 */
export function getStatusDisplayName(status: OrderStatus): string {
  const displayNames: Record<OrderStatus, string> = {
    PLACED: 'Order Placed',
    CONFIRMED: 'Confirmed',
    PROCESSING: 'Processing',
    SHIPPED: 'Shipped',
    IN_TRANSIT: 'In Transit',
    OUT_FOR_DELIVERY: 'Out for Delivery',
    DELIVERED: 'Delivered',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
  };

  return displayNames[status] || status;
}

/**
 * Get status badge variant
 */
export function getStatusBadgeVariant(
  status: OrderStatus
): 'default' | 'success' | 'warning' | 'error' | 'info' {
  switch (status) {
    case 'COMPLETED':
    case 'DELIVERED':
      return 'success';
    case 'CANCELLED':
      return 'error';
    case 'PLACED':
      return 'info';
    case 'PROCESSING':
    case 'SHIPPED':
    case 'IN_TRANSIT':
    case 'OUT_FOR_DELIVERY':
      return 'warning';
    default:
      return 'default';
  }
}
