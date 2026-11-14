/**
 * Cart item sequential line numbering across brand groups.
 */

/**
 * Trích xuất khóa duy nhất của một mặt hàng trong giỏ
 * @param {Object|string} item
 * @returns {string}
 */
export function getItemKey(item) {
  if (!item) return '';
  if (typeof item === 'string' || typeof item === 'number') return String(item);
  if (item.key !== undefined && item.key !== null) return String(item.key);
  if (item.id !== undefined && item.id !== null) return String(item.id);
  if (item.cartItemId !== undefined && item.cartItemId !== null) return String(item.cartItemId);
  if (item.productId !== undefined && item.variantId !== undefined) {
    return `${item.productId}_${item.variantId}`;
  }
  return '';
}

/**
 * Tạo Map đánh số thứ tự (STT 1..N) liên tục cho toàn bộ sản phẩm qua tất cả các nhóm thương hiệu.
 * @param {Array<[string, Array<Object>]>} groupedEntries - Mảng các cặp [brandName, items]
 * @returns {Map<string|Object, number>}
 */
export function buildLineNumberMap(groupedEntries = []) {
  const map = new Map();
  if (!Array.isArray(groupedEntries)) return map;

  let lineNumber = 1;

  for (const entry of groupedEntries) {
    if (!Array.isArray(entry)) continue;
    const items = entry[1];
    if (!Array.isArray(items)) continue;

    for (const item of items) {
      if (!item) continue;
      const key = getItemKey(item);
      if (key && !map.has(key)) {
        map.set(key, lineNumber);
        map.set(item, lineNumber);
        lineNumber += 1;
      }
    }
  }

  return map;
}
