/**
 * PERMISSION SYSTEM CONTRACT (UX-only client guards):
 * The Spring Boot backend UserRole enum already contains exactly:
 * CUSTOMER, STAFF, ADMIN.
 * Therefore, NO backend change is needed.
 * Note that client permissions are for UX/routing only;
 * the backend API must enforce real authorization checks.
 */

export const ROLES = Object.freeze({
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
  CUSTOMER: 'CUSTOMER',
});

export const ADMIN_PERMISSIONS = Object.freeze({
  DASHBOARD: 'dashboard',
  PRODUCTS: 'products',
  ORDERS: 'orders',
  COUPONS: 'coupons',
  REVIEWS: 'reviews',
  STAFF: 'staff',
  SETTINGS: 'settings',
});

export const ROLE_PERMISSIONS = Object.freeze({
  [ROLES.ADMIN]: Object.freeze([
    ADMIN_PERMISSIONS.DASHBOARD,
    ADMIN_PERMISSIONS.PRODUCTS,
    ADMIN_PERMISSIONS.ORDERS,
    ADMIN_PERMISSIONS.COUPONS,
    ADMIN_PERMISSIONS.REVIEWS,
    ADMIN_PERMISSIONS.STAFF,
    ADMIN_PERMISSIONS.SETTINGS,
  ]),
  [ROLES.STAFF]: Object.freeze([
    ADMIN_PERMISSIONS.PRODUCTS,
    ADMIN_PERMISSIONS.ORDERS,
    ADMIN_PERMISSIONS.REVIEWS,
    ADMIN_PERMISSIONS.SETTINGS,
  ]),
  [ROLES.CUSTOMER]: Object.freeze([]),
});

export function hasPermission(role, permission) {
  if (!role || !permission) return false;
  const list = ROLE_PERMISSIONS[role];
  if (!list) return false;
  return list.includes(permission);
}

export function isBackOfficeRole(role) {
  return role === ROLES.ADMIN || role === ROLES.STAFF;
}

export function getDefaultAdminPath(role) {
  if (role === ROLES.ADMIN) return '/admin';
  if (role === ROLES.STAFF) return '/admin/orders';
  return '/';
}

export const ADMIN_PATH_PERMISSION = Object.freeze({
  '/admin': ADMIN_PERMISSIONS.DASHBOARD,
  '/admin/products': ADMIN_PERMISSIONS.PRODUCTS,
  '/admin/orders': ADMIN_PERMISSIONS.ORDERS,
  '/admin/coupons': ADMIN_PERMISSIONS.COUPONS,
  '/admin/reviews': ADMIN_PERMISSIONS.REVIEWS,
  '/admin/staff': ADMIN_PERMISSIONS.STAFF,
  '/admin/settings': ADMIN_PERMISSIONS.SETTINGS,
});

export function isAdminPathAllowed(role, pathname) {
  if (!role || !pathname) return false;
  const permission = ADMIN_PATH_PERMISSION[pathname];
  if (!permission) return false;
  return hasPermission(role, permission);
}

export const ROLE_LABELS_VI = Object.freeze({
  [ROLES.ADMIN]: 'Quản trị viên',
  [ROLES.STAFF]: 'Nhân viên',
  [ROLES.CUSTOMER]: 'Khách hàng',
});
