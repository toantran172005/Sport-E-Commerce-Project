/**
 * Utility functions for pricing and discounts
 * Uses nullish coalescing (??) instead of logical OR (||) to prevent 0 from being falsely overwritten.
 */

/**
 * Calculates discount amount based on coupon rules
 * @param {Object|null} coupon - Applied coupon object
 * @param {number} subtotal - Subtotal of selected items
 * @param {number} shippingFee - Applicable shipping fee
 * @returns {number} discount amount in VND
 */
export function calculateDiscount(coupon, subtotal = 0, shippingFee = 0) {
  if (!coupon || subtotal <= 0) return 0;

  // Minimum order amount check
  const minAmount = coupon.minOrderAmount ?? 0;
  if (subtotal < minAmount) return 0;

  if (coupon.discountType === 'PERCENTAGE') {
    const pct = coupon.discountValue ?? coupon.discount ?? 0;
    const rawDiscount = (subtotal * pct) / 100;
    const maxDiscount = coupon.maxDiscountAmount !== undefined && coupon.maxDiscountAmount !== null
      ? coupon.maxDiscountAmount
      : rawDiscount;
    return Math.min(rawDiscount, maxDiscount);
  }

  if (coupon.discountType === 'FREE_SHIPPING') {
    return shippingFee;
  }

  // FIXED_AMOUNT
  const fixed = coupon.discountValue ?? coupon.discount ?? 0;
  return Math.min(subtotal, fixed);
}

/**
 * Calculates full cart totals
 * @param {Array} items - List of cart items
 * @param {Object|null} coupon - Applied coupon
 * @param {number} defaultShippingFee - Default shipping fee
 * @returns {Object} totals breakdown
 */
export function calculateCartTotals(items = [], coupon = null, defaultShippingFee = 30000) {
  const subtotal = items.reduce((sum, item) => sum + (item.price * (item.quantity ?? 1)), 0);
  const totalUnits = items.reduce((sum, item) => sum + (item.quantity ?? 1), 0);
  const isFreeShip = subtotal >= 500000;
  const shippingFee = isFreeShip ? 0 : defaultShippingFee;
  const discountAmount = calculateDiscount(coupon, subtotal, shippingFee);
  const totalAmount = Math.max(0, subtotal + shippingFee - discountAmount);

  return {
    subtotal,
    totalUnits,
    isFreeShip,
    shippingFee,
    discountAmount,
    totalAmount,
  };
}
