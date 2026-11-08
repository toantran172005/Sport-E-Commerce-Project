/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useCallback } from 'react';
import { usePersistentState } from '../hooks/usePersistentState.js';
import { orders as mockOrders } from '../mocks/orders.js';
import { useAuth } from './AuthContext.jsx';
import { useUI } from './UIContext.jsx';
import { orderService } from '../services/orderService.js';

const OrderContext = createContext(null);

export function OrderProvider({ children }) {
  const { user } = useAuth();
  const { showToast } = useUI();

  const [orders, setOrders] = usePersistentState('sport_orders', () => mockOrders);

  const addOrder = useCallback((newOrder) => {
    setOrders((prev) => [newOrder, ...prev.filter((o) => String(o.id) !== String(newOrder.id))]);
  }, [setOrders]);

  const cancelOrderById = useCallback(
    async (orderId, reason) => {
      try {
        await orderService.cancelOrder(orderId, reason);
      } catch (err) {
        console.warn('Lỗi gọi API hủy đơn hàng:', err.response?.data?.message || err.message);
      }

      setOrders((prev) =>
        prev.map((o) => {
          if (String(o.id) !== String(orderId) && o.orderCode !== String(orderId)) return o;

          const isPaid = o.payment?.status === 'PAID' || o.payments?.[0]?.paymentStatus === 'PAID';
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
                note: `Hủy đơn: ${reason}${isPaid ? ' (Kích hoạt hoàn tiền REFUND)' : ''}`,
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
    async (orderId, nextStatus, note = '', cancelledReason = '') => {
      try {
        await orderService.updateOrderStatus({
          orderId,
          newStatus: nextStatus,
          note,
          cancelledReason: cancelledReason || (nextStatus === 'CANCELED' ? note : null),
        });
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message;
        console.error('Lỗi gọi API cập nhật trạng thái đơn:', errorMsg);
        showToast(errorMsg || 'Không thể cập nhật trạng thái đơn hàng');
        throw err;
      }

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
      addOrder,
      cancelOrderById,
      updateOrderStatus,
    }),
    [orders, setOrders, addOrder, cancelOrderById, updateOrderStatus]
  );

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrder() {
  const ctx = useContext(OrderContext);
  if (!ctx) {
    throw new Error('useOrder phải được sử dụng bên trong OrderProvider');
  }
  return ctx;
}
