import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ROLES,
  ADMIN_PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  isBackOfficeRole,
  getDefaultAdminPath,
  isAdminPathAllowed,
} from '../src/utils/permissions.js';

test('permissions: ROLES and ADMIN_PERMISSIONS constants are correct', () => {
  assert.equal(ROLES.ADMIN, 'ADMIN');
  assert.equal(ROLES.STAFF, 'STAFF');
  assert.equal(ROLES.CUSTOMER, 'CUSTOMER');

  assert.equal(ADMIN_PERMISSIONS.DASHBOARD, 'dashboard');
  assert.equal(ADMIN_PERMISSIONS.PRODUCTS, 'products');
  assert.equal(ADMIN_PERMISSIONS.ORDERS, 'orders');
  assert.equal(ADMIN_PERMISSIONS.COUPONS, 'coupons');
  assert.equal(ADMIN_PERMISSIONS.REVIEWS, 'reviews');
  assert.equal(ADMIN_PERMISSIONS.STAFF, 'staff');
  assert.equal(ADMIN_PERMISSIONS.SETTINGS, 'settings');
});

test('permissions: ROLE_PERMISSIONS matrix matches §2.6.1 exactly', () => {
  // ADMIN has all 7
  assert.equal(ROLE_PERMISSIONS.ADMIN.length, 7);
  for (const perm of Object.values(ADMIN_PERMISSIONS)) {
    assert.equal(hasPermission(ROLES.ADMIN, perm), true);
  }

  // STAFF has PRODUCTS, ORDERS, REVIEWS, SETTINGS only
  assert.equal(hasPermission(ROLES.STAFF, ADMIN_PERMISSIONS.PRODUCTS), true);
  assert.equal(hasPermission(ROLES.STAFF, ADMIN_PERMISSIONS.ORDERS), true);
  assert.equal(hasPermission(ROLES.STAFF, ADMIN_PERMISSIONS.REVIEWS), true);
  assert.equal(hasPermission(ROLES.STAFF, ADMIN_PERMISSIONS.SETTINGS), true);

  assert.equal(hasPermission(ROLES.STAFF, ADMIN_PERMISSIONS.DASHBOARD), false);
  assert.equal(hasPermission(ROLES.STAFF, ADMIN_PERMISSIONS.COUPONS), false);
  assert.equal(hasPermission(ROLES.STAFF, ADMIN_PERMISSIONS.STAFF), false);

  // CUSTOMER has none
  for (const perm of Object.values(ADMIN_PERMISSIONS)) {
    assert.equal(hasPermission(ROLES.CUSTOMER, perm), false);
  }
});

test('permissions: hasPermission handles invalid and unknown inputs safely without throwing', () => {
  assert.equal(hasPermission(null, 'dashboard'), false);
  assert.equal(hasPermission(undefined, 'dashboard'), false);
  assert.equal(hasPermission('UNKNOWN_ROLE', 'dashboard'), false);
  assert.equal(hasPermission(ROLES.ADMIN, 'UNKNOWN_PERM'), false);
  assert.equal(hasPermission(ROLES.ADMIN, null), false);
});

test('permissions: isBackOfficeRole returns true only for ADMIN and STAFF', () => {
  assert.equal(isBackOfficeRole(ROLES.ADMIN), true);
  assert.equal(isBackOfficeRole(ROLES.STAFF), true);
  assert.equal(isBackOfficeRole(ROLES.CUSTOMER), false);
  assert.equal(isBackOfficeRole(null), false);
  assert.equal(isBackOfficeRole(undefined), false);
  assert.equal(isBackOfficeRole('GUEST'), false);
});

test('permissions: getDefaultAdminPath returns role-specific landing paths', () => {
  assert.equal(getDefaultAdminPath(ROLES.ADMIN), '/admin');
  assert.equal(getDefaultAdminPath(ROLES.STAFF), '/admin/orders');
  assert.equal(getDefaultAdminPath(ROLES.CUSTOMER), '/');
  assert.equal(getDefaultAdminPath(null), '/');
});

test('permissions: isAdminPathAllowed strictly maps paths to role permissions', () => {
  // ADMIN allowed on all admin paths
  assert.equal(isAdminPathAllowed(ROLES.ADMIN, '/admin'), true);
  assert.equal(isAdminPathAllowed(ROLES.ADMIN, '/admin/products'), true);
  assert.equal(isAdminPathAllowed(ROLES.ADMIN, '/admin/orders'), true);
  assert.equal(isAdminPathAllowed(ROLES.ADMIN, '/admin/coupons'), true);
  assert.equal(isAdminPathAllowed(ROLES.ADMIN, '/admin/reviews'), true);
  assert.equal(isAdminPathAllowed(ROLES.ADMIN, '/admin/staff'), true);
  assert.equal(isAdminPathAllowed(ROLES.ADMIN, '/admin/settings'), true);

  // STAFF allowed on products, orders, reviews, settings
  assert.equal(isAdminPathAllowed(ROLES.STAFF, '/admin/products'), true);
  assert.equal(isAdminPathAllowed(ROLES.STAFF, '/admin/orders'), true);
  assert.equal(isAdminPathAllowed(ROLES.STAFF, '/admin/reviews'), true);
  assert.equal(isAdminPathAllowed(ROLES.STAFF, '/admin/settings'), true);

  // STAFF forbidden on dashboard, coupons, staff
  assert.equal(isAdminPathAllowed(ROLES.STAFF, '/admin'), false);
  assert.equal(isAdminPathAllowed(ROLES.STAFF, '/admin/coupons'), false);
  assert.equal(isAdminPathAllowed(ROLES.STAFF, '/admin/staff'), false);

  // CUSTOMER forbidden on all
  assert.equal(isAdminPathAllowed(ROLES.CUSTOMER, '/admin'), false);
  assert.equal(isAdminPathAllowed(ROLES.CUSTOMER, '/admin/orders'), false);

  // Unknown paths
  assert.equal(isAdminPathAllowed(ROLES.ADMIN, '/admin/statistics'), false);
  assert.equal(isAdminPathAllowed(ROLES.ADMIN, '/not-admin'), false);
  assert.equal(isAdminPathAllowed(null, '/admin'), false);
});
