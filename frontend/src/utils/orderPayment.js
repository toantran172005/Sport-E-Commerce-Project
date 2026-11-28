/**
 * Đơn thanh toán online (VNPay) còn PENDING mà chưa trả tiền = đang "Chờ thanh toán".
 * Trong trạng thái này: khách được Tiếp tục thanh toán hoặc Hủy; nhân viên/admin KHÔNG được tiếp nhận hay đi đơn.
 * Quá hạn (24 giờ, backend tính) đơn tự bị hủy.
 */
export function isAwaitingPayment(order) {
  if (!order) return false;
  const status = String(order.status || '').toUpperCase();
  if (status !== 'PENDING') return false;
  const method = order.paymentMethod || order.payment?.method;
  const payStatus = order.paymentStatus || order.payment?.status;
  return Boolean(method) && method !== 'COD' && payStatus !== 'PAID';
}
