export default function OrderStatusBadge({ status, className = '' }) {
  const normalized = (status || '').toUpperCase();

  const getBadgeConfig = () => {
    switch (normalized) {
      case 'PENDING':
      case 'CHO_XAC_NHAN':
        return {
          label: 'Chờ xác nhận',
          colorClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        };
      case 'CONFIRMED':
      case 'DA_XAC_NHAN':
      case 'PROCESSING':
        return {
          label: 'Đã xác nhận',
          colorClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        };
      case 'SHIPPING':
      case 'DANG_GIAO':
        return {
          label: 'Đang vận chuyển',
          colorClass: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
        };
      case 'DELIVERED':
      case 'DA_GIAO':
      case 'COMPLETED':
        return {
          label: 'Giao thành công',
          colorClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        };
      case 'CANCELED':
      case 'CANCELLED':
      case 'DA_HUY':
        return {
          label: 'Đã hủy',
          colorClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
        };
      default:
        return {
          label: status || 'Chưa rõ',
          colorClass: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
        };
    }
  };

  const { label, colorClass } = getBadgeConfig();

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-bold border ${colorClass} ${className}`}
    >
      {label}
    </span>
  );
}
