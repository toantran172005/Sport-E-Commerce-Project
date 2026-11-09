/**
 * Staff management rules and validation utilities.
 */

const VN_PHONE_REGEX = /^(0|\+84)\d{9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

/**
 * Kiếm tra quyền quản lý nhân viên (chỉ ADMIN được quản lý nhân viên STAFF)
 */
export function canManageStaff(actor, target) {
  if (!actor || !target) return false;
  if (actor.role !== 'ADMIN') return false;
  if (target.role !== 'STAFF') return false;
  if (actor.id && target.id && actor.id === target.id) return false;
  return true;
}

/**
 * Kiểm tra quyền gán role (chỉ ADMIN được gán role STAFF)
 */
export function canAssignRole(actor, role) {
  if (!actor || actor.role !== 'ADMIN') return false;
  return role === 'STAFF';
}

/**
 * Kiểm tra dữ liệu đầu vào khi tạo/sửa tài khoản nhân viên
 * @param {Object} data - Dữ liệu nhân viên
 * @param {Array} existingUsers - Danh sách user hiện có để check trùng lặp email/SĐT
 * @returns {{ isValid: boolean, errors: Object }}
 */
export function validateStaffInput(data = {}, existingUsers = []) {
  const errors = {};

  // 1. Họ và tên
  const fullName = typeof data.fullName === 'string' ? data.fullName.trim() : '';
  if (!fullName) {
    errors.fullName = 'Họ và tên không được để trống';
  } else if (fullName.length < 2) {
    errors.fullName = 'Họ và tên phải có ít nhất 2 ký tự';
  }

  // 2. Email
  const email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : '';
  if (!email) {
    errors.email = 'Email không được để trống';
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = 'Email không đúng định dạng';
  } else {
    const isDuplicate = existingUsers.some(
      (u) =>
        u &&
        u.email &&
        u.email.trim().toLowerCase() === email &&
        String(u.id) !== String(data.id)
    );
    if (isDuplicate) {
      errors.email = 'Email này đã tồn tại trong hệ thống';
    }
  }

  // 3. Số điện thoại
  const phone = typeof data.phoneNumber === 'string' ? data.phoneNumber.trim() : '';
  if (!phone) {
    errors.phoneNumber = 'Số điện thoại không được để trống';
  } else if (!VN_PHONE_REGEX.test(phone)) {
    errors.phoneNumber = 'Số điện thoại không hợp lệ (cần 10 số, bắt đầu bằng 0 hoặc +84)';
  }

  // 4. Vai trò (Role) - bắt buộc phải là STAFF
  if (data.role !== 'STAFF') {
    errors.role = 'Vai trò nhân viên chỉ được phép là STAFF';
  }

  // 5. Trạng thái (Status) - ACTIVE hoặc LOCKED
  if (data.status !== 'ACTIVE' && data.status !== 'LOCKED') {
    errors.status = 'Trạng thái tài khoản phải là ACTIVE hoặc LOCKED';
  }

  // 6. Mật khẩu (Chỉ validate nếu có truyền vào, ví dụ khi tạo mới)
  if (data.password !== undefined && data.password !== null && data.password !== '') {
    if (!PASSWORD_REGEX.test(data.password)) {
      errors.password = 'Mật khẩu phải từ 8 ký tự trở lên, gồm ít nhất 1 chữ cái và 1 chữ số';
    }
  } else if (!data.id) {
    // Tạo mới bắt buộc phải có mật khẩu ban đầu
    errors.password = 'Vui lòng nhập mật khẩu khởi tạo cho nhân viên';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
