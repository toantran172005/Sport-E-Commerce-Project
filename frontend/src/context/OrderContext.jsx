/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useCallback } from 'react';
import { usePersistentState } from '../hooks/usePersistentState.js';
import { orders as mockOrders } from '../mocks/orders.js';
import { useAuth } from './AuthContext.jsx';
import { useUI } from './UIContext.jsx';

const OrderContext = createContext(null);

export function OrderProvider({ children }) {
  const { user } = useAuth();
  const { showToast } = useUI();

  const [orders, setOrders] = usePersistentState('sport_orders', () => mockOrders);

  const cancelOrderById = useCallback(
    (orderId, reason) => {
      setOrders((prev) =>
        prev.map((o) => {
          if (String(o.id) !== String(orderId) && o.orderCode !== String(orderId)) return o;

          const isPaid = o.payment?.status === 'PAID';
          const updatedPayment = o.payment
            ? { ...o.payment, status: isPaid ? 'REFUND' : 'CANCELLED' }
            : null;

          return {
            ...o,
            status: 'CANCELED',
            cancelReason: reason,
            canceledAt: new Date().toISOString(),
            payment: updatedPayment,
            orderStatusHistories: [
              ...(o.orderStatusHistories || []),
              {
                id: Date.now(),
                status: 'CANCELED',
                note: `Hủy đơn: ${reason}${isPaid ? ' (Đã kích hoạt hoàn tiền REFUND)' : ''}`,
                createdAt: new Date().toISOString(),
                changedBy: { id: user?.id || 1, fullName: user?.fullName || 'Khách hàng' },
              },
            ],
          };
        })
      );
      showToast(`Đã hủy đơn hàng #${String(orderId).replace('ORD-', '')}`);
    },
    [setOrders, showToast, user]
  );

  const updateOrderStatus = useCallback(
    (orderId, nextStatus, note = '') => {
      setOrders((prev) =>
        prev.map((o) => {
          if (String(o.id) !== String(orderId) && o.orderCode !== String(orderId)) return o;

          let updatedPayment = o.payment ? { ...o.payment } : null;
          if (nextStatus === 'CANCELED') {
            if (updatedPayment) {
              updatedPayment.status = updatedPayment.status === 'PAID' ? 'REFUND' : 'CANCELLED';
            }
          } else if (nextStatus === 'RETURNED') {
            if (updatedPayment && updatedPayment.status === 'PAID') {
              updatedPayment.status = 'REFUND';
            }
          } else if (nextStatus === 'DELIVERED') {
            if (updatedPayment && updatedPayment.method === 'COD') {
              updatedPayment.status = 'PAID';
              updatedPayment.paidAt = new Date().toISOString();
            }
          }

          return {
            ...o,
            status: nextStatus,
            updatedAt: new Date().toISOString(),
            payment: updatedPayment,
            confirmedAt: nextStatus === 'CONFIRMED' ? new Date().toISOString() : o.confirmedAt,
            canceledAt: nextStatus === 'CANCELED' ? new Date().toISOString() : o.canceledAt,
            orderStatusHistories: [
              ...(o.orderStatusHistories || []),
              {
                id: Date.now(),
                status: nextStatus,
                note: note || `Cập nhật trạng thái sang ${nextStatus}`,
                createdAt: new Date().toISOString(),
                changedBy: { id: 99, fullName: 'Admin' },
              },
            ],
          };
        })
      );
      showToast('Cập nhật trạng thái đơn hàng thành công');
    },
    [setOrders, showToast]
  );

  const value = useMemo(
    () => ({
      orders,
      setOrders,
      cancelOrderById,
      updateOrderStatus,
    }),
    [orders, setOrders, cancelOrderById, updateOrderStatus]
  );

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrder() {
  const ctx = useContext(OrderContext);
  if (!ctx) {
    throw new Error('useOrder must be used within OrderProvider');
  }
  return ctx;
}
