// Dữ liệu Mock tĩnh bám sát Entity Java (Chỉ tích hợp GHN và GHTK theo cấu hình hệ thống)
export const shippingProviders = [
  {
    id: 1,
    name: 'Giao Hàng Nhanh',
    code: 'GHN',
    isActive: true,
  },
  {
    id: 2,
    name: 'Giao Hàng Tiết Kiệm',
    code: 'GHTK',
    isActive: true,
  },
];
export default shippingProviders;
