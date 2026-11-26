/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext.jsx';
import { useUI } from './UIContext.jsx';
import { orderService } from '../services/orderService.js';

const OrderContext = createContext(null);

export function OrderProvider({ children }) {
  const { user } = useAuth();
  const { showToast } = useUI();

  const [orders, setOrders] = useState([]);
  const [adminOrders, setAdminOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const isFetchingOrdersRef = useRef(false);
  const isFetchingAdminRef = useRef(false);
  const lastFetchedOrdersRef = useRef(0);
  const lastFetchedAdminRef = useRef(0);

  // Tự động xóa sạch key sport_orders thừa trong localStorage nếu từng tồn tại
  useEffect(() => {
    try {
      localStorage.removeItem('sport_orders');
    } catch {
      // ignore
    }
  }, []);

  const isAdmin = useMemo(() => {
    const role = (user?.role || user?.roles?.[0] || '').toUpperCase();
    return role.includes('ADMIN') || role.includes('STAFF');
  }, [user]);

  // Fetch đơn hàng của người dùng hiện tại (My Orders)
  const fetchOrders = useCallback(async (force = false) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setOrders([]);
      return;
    }
    const now = Date.now();
    if (!force && isFetchingOrdersRef.current) return;
    if (!force && now - lastFetchedOrdersRef.current < 4000) return;

    isFetchingOrdersRef.current = true;
    setLoading(true);
    try {
      const data = await orderService.getMyOrders();
      setOrders(Array.isArray(data) ? data : []);
      lastFetchedOrdersRef.current = Date.now();
    } catch (err) {
      console.warn('Lỗi tải danh sách đơn hàng của tôi từ database:', err?.response?.data?.message || err.message);
    } finally {
      isFetchingOrdersRef.current = false;
      setLoading(false);
    }
  }, []);

  // Fetch toàn bộ đơn hàng cho Quản trị viên & Nhân viên (Admin Orders)
  const fetchAdminOrders = useCallback(async (force = false) => {
    const token = localStorage.getItem('token');
    if (!token || !isAdmin) {
      setAdminOrders([]);
      return;
    }
    const now = Date.now();
    if (!force && isFetchingAdminRef.current) return;
    if (!force && now - lastFetchedAdminRef.current < 4000) return;

    isFetchingAdminRef.current = true;
    try {
      const data = await orderService.getAllOrders();
      setAdminOrders(Array.isArray(data) ? data : []);
      lastFetchedAdminRef.current = Date.now();
    } catch (err) {
      console.warn('Lỗi tải toàn bộ đơn hàng quản trị từ database:', err?.response?.data?.message || err.message);
    } finally {
      isFetchingAdminRef.current = false;
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchOrders();
    if (isAdmin) {
      fetchAdminOrders();
    }
  }, [fetchOrders, fetchAdminOrders, isAdmin]);

  const addOrder = useCallback((newOrder) => {
    setOrders((prev) => [newOrder, ...prev.filter((o) => String(o.id) !== String(newOrder.id))]);
    setAdminOrders((prev) => [newOrder, ...prev.filter((o) => String(o.id) !== String(newOrder.id))]);
  }, []);

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
      showToast(`Đã hủy đơn hàng #${String(orderId).replace('ORD-', '')}`, 'success');
    },
    [setOrders, showToast, user]
  );

  const updateOrderStatus = useCallback(
    async (orderId, nextStatus, note = '', cancelledReason = '') => {
      let updatedResponse;
      try {
        const res = await orderService.updateOrderStatus({
          orderId,
          newStatus: nextStatus,
          note,
          cancelledReason: cancelledReason || (nextStatus === 'CANCELED' ? note : null),
        });
        updatedResponse = res?.data || res;
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message;
        console.error('Lỗi gọi API cập nhật trạng thái đơn:', errorMsg);
        showToast(errorMsg || 'Không thể cập nhật trạng thái đơn hàng', 'error');
        throw err;
      }

      const mapOrderUpdater = (prev) =>
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

          const freshShipment = updatedResponse?.shipment || o.shipment;
          const freshTracking = updatedResponse?.trackingNumber || updatedResponse?.shipment?.trackingNumber || o.shipment?.trackingNumber || o.trackingCode;

          return {
            ...o,
            status: nextStatus,
            updatedAt: new Date().toISOString(),
            payment: updatedPayment,
            shipment: freshShipment ? { ...freshShipment, trackingNumber: freshTracking } : o.shipment,
            trackingCode: freshTracking,
            trackingNumber: freshTracking,
            confirmedAt: nextStatus === 'CONFIRMED' ? new Date().toISOString() : o.confirmedAt,
            canceledAt: nextStatus === 'CANCELED' ? new Date().toISOString() : o.canceledAt,
            orderStatusHistories: [
              ...(o.orderStatusHistories || []),
              {
                id: Date.now(),
                status: nextStatus,
                note: note || `Cập nhật trạng thái sang ${nextStatus}`,
                createdAt: new Date().toISOString(),
                changedBy: { id: user?.id || 99, fullName: user?.fullName || 'Admin' },
              },
            ],
          };
        });

      setOrders(mapOrderUpdater);
      setAdminOrders(mapOrderUpdater);
      // Đã loại bỏ toast generic tại đây để không bị nhảy 2 toast! AdminOrderModal sẽ hiển thị 1 toast chi tiết.
      return updatedResponse;
    },
    [setOrders, setAdminOrders, showToast, user]
  );

  const value = useMemo(
    () => ({
      orders,
      setOrders,
      adminOrders,
      setAdminOrders,
      loading,
      fetchOrders,
      fetchAdminOrders,
      addOrder,
      cancelOrderById,
      updateOrderStatus,
    }),
    [orders, setOrders, adminOrders, setAdminOrders, loading, fetchOrders, fetchAdminOrders, addOrder, cancelOrderById, updateOrderStatus]
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
