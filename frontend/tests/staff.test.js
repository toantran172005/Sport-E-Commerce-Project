import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  canManageStaff,
  canAssignRole,
  validateStaffInput,
} from '../src/utils/staffRules.js';

test('staffRules: canManageStaff allows ADMIN to manage STAFF only', () => {
  const admin = { id: 1, role: 'ADMIN' };
  const anotherAdmin = { id: 2, role: 'ADMIN' };
  const staff = { id: 5, role: 'STAFF' };
  const anotherStaff = { id: 7, role: 'STAFF' };
  const customer = { id: 10, role: 'CUSTOMER' };

  // Valid: ADMIN managing STAFF
  assert.equal(canManageStaff(admin, staff), true);
  assert.equal(canManageStaff(admin, anotherStaff), true);

  // Invalid: ADMIN managing ADMIN
  assert.equal(canManageStaff(admin, anotherAdmin), false);

  // Invalid: self-target
  assert.equal(canManageStaff(admin, admin), false);

  // Invalid: STAFF managing STAFF or ADMIN
  assert.equal(canManageStaff(staff, anotherStaff), false);
  assert.equal(canManageStaff(staff, admin), false);

  // Invalid: CUSTOMER managing anyone
  assert.equal(canManageStaff(customer, staff), false);

  // Invalid: null / undefined
  assert.equal(canManageStaff(null, staff), false);
  assert.equal(canManageStaff(admin, null), false);
});

test('staffRules: canAssignRole allows only ADMIN to assign STAFF role', () => {
  const admin = { id: 1, role: 'ADMIN' };
  const staff = { id: 5, role: 'STAFF' };
  const customer = { id: 10, role: 'CUSTOMER' };

  // ADMIN can assign STAFF
  assert.equal(canAssignRole(admin, 'STAFF'), true);

  // ADMIN cannot assign ADMIN or CUSTOMER through staff rules
  assert.equal(canAssignRole(admin, 'ADMIN'), false);
  assert.equal(canAssignRole(admin, 'CUSTOMER'), false);

  // Others cannot assign STAFF
  assert.equal(canAssignRole(staff, 'STAFF'), false);
  assert.equal(canAssignRole(customer, 'STAFF'), false);
  assert.equal(canAssignRole(null, 'STAFF'), false);
});

test('staffRules: validateStaffInput validates creation data correctly', () => {
  const existingUsers = [
    { id: 1, email: 'admin@sannha.vn', phoneNumber: '0901234567' },
    { id: 5, email: 'staff@sannha.vn', phoneNumber: '0905123456' },
  ];

  // 1. Valid input on creation
  const validData = {
    fullName: 'Lê Văn Cường',
    email: 'cuong.le@sannha.vn',
    phoneNumber: '0912345678',
    role: 'STAFF',
    status: 'ACTIVE',
    password: 'Password123',
  };
  const resValid = validateStaffInput(validData, existingUsers);
  assert.equal(resValid.isValid, true);
  assert.deepEqual(resValid.errors, {});

  // 2. Missing name, invalid email, invalid phone, wrong role, wrong status, weak password
  const invalidData = {
    fullName: ' ',
    email: 'not-an-email',
    phoneNumber: '12345',
    role: 'ADMIN', // wrong role
    status: 'PENDING', // wrong status
    password: '123', // < 8 chars
  };
  const resInvalid = validateStaffInput(invalidData, existingUsers);
  assert.equal(resInvalid.isValid, false);
  assert.ok(resInvalid.errors.fullName);
  assert.ok(resInvalid.errors.email);
  assert.ok(resInvalid.errors.phoneNumber);
  assert.ok(resInvalid.errors.role);
  assert.ok(resInvalid.errors.status);
  assert.ok(resInvalid.errors.password);

  // 3. Duplicate email (case-insensitive)
  const dupEmailData = {
    ...validData,
    email: 'STAFF@sannha.vn',
  };
  const resDup = validateStaffInput(dupEmailData, existingUsers);
  assert.equal(resDup.isValid, false);
  assert.ok(resDup.errors.email);

  // 4. Update mode (!data.password allowed if editing existing user with id)
  const updateData = {
    id: 5,
    fullName: 'Nguyễn Văn Staff',
    email: 'staff@sannha.vn', // own email is allowed
    phoneNumber: '0905123456',
    role: 'STAFF',
    status: 'LOCKED',
  };
  const resUpdate = validateStaffInput(updateData, existingUsers);
  assert.equal(resUpdate.isValid, true);
});
