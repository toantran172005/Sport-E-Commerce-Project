import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeCity,
  getSubtotalBucket,
  buildShippingCacheKey,
  SHIPPING_CACHE_TTL_MS,
  FALLBACK_SHIPPING_TTL_MS,
  PROVIDERS_CACHE_TTL_MS,
} from '../src/utils/shippingCacheKey.js';
import { normalizeShippingQuote } from '../src/utils/shippingQuote.js';
import { formatEstimatedDelivery } from '../src/utils/formatters.js';

test('shippingCacheKey: TTL constants are correct', () => {
  assert.equal(SHIPPING_CACHE_TTL_MS, 10 * 60 * 1000);
  assert.equal(FALLBACK_SHIPPING_TTL_MS, 30 * 1000);
  assert.equal(PROVIDERS_CACHE_TTL_MS, 60 * 60 * 1000);
});

test('shippingCacheKey: normalizeCity cleans and trims city strings', () => {
  assert.equal(normalizeCity('  Hồ Chí Minh  '), 'hồ chí minh');
  assert.equal(normalizeCity('HÀ NỘI'), 'hà nội');
  assert.equal(normalizeCity(null), '');
  assert.equal(normalizeCity(undefined), '');
});

test('shippingCacheKey: getSubtotalBucket handles boundary conditions', () => {
  assert.equal(getSubtotalBucket(-100), '0');
  assert.equal(getSubtotalBucket(0), '0');
  assert.equal(getSubtotalBucket(1), 'lt_500k');
  assert.equal(getSubtotalBucket(499999), 'lt_500k');
  assert.equal(getSubtotalBucket(500000), 'lt_1m');
  assert.equal(getSubtotalBucket(999999), 'lt_1m');
  assert.equal(getSubtotalBucket(1000000), 'gte_1m');
  assert.equal(getSubtotalBucket(2500000), 'gte_1m');
});

test('shippingCacheKey: buildShippingCacheKey produces stable keys without raw subTotal', () => {
  const key1 = buildShippingCacheKey({
    providerCode: 'GHN',
    addressId: 10,
    city: 'Hồ Chí Minh',
    subTotal: 650000,
  });

  const key2 = buildShippingCacheKey({
    providerCode: 'ghn',
    addressId: 10,
    city: '  HỒ CHÍ MINH ',
    subTotal: 850000, // same lt_1m bucket
  });

  // Same provider, address, city, and bucket -> identical key
  assert.equal(key1, key2);
  assert.equal(key1, 'GHN|10|hồ chí minh|lt_1m');

  // Verify raw numbers like '650000' or '850000' never appear in the key
  assert.equal(key1.includes('650000'), false);
  assert.equal(key1.includes('850000'), false);

  // Different provider produces different key (only GHN and GHTK in system)
  const ghtkKey = buildShippingCacheKey({
    providerCode: 'GHTK',
    addressId: 10,
    city: 'Hồ Chí Minh',
    subTotal: 650000,
  });
  assert.notEqual(key1, ghtkKey);
  assert.equal(ghtkKey, 'GHTK|10|hồ chí minh|lt_1m');

  // Different city produces different key
  const hanoiKey = buildShippingCacheKey({
    providerCode: 'GHN',
    addressId: 10,
    city: 'Hà Nội',
    subTotal: 650000,
  });
  assert.notEqual(key1, hanoiKey);
});

test('shippingQuote: normalizeShippingQuote produces complete and consistent quote objects', () => {
  // 1. API success response normalization
  const apiRaw = {
    shippingFee: 25000,
    estimatedDeliveryDate: '2026-11-12T00:00:00.000Z',
    formattedDeliveryDate: 'Thứ Năm, 12/11/2026',
  };
  const normApi = normalizeShippingQuote(apiRaw, { subTotal: 250000, source: 'api' });
  assert.equal(normApi.shippingFee, 25000);
  assert.equal(normApi.estimatedDeliveryDate, '2026-11-12T00:00:00.000Z');
  assert.equal(normApi.formattedDeliveryDate, 'Thứ Năm, 12/11/2026');
  assert.equal(normApi.source, 'api');

  // 2. Fallback normalization when API fails or raw is null
  const normFallback = normalizeShippingQuote(null, { subTotal: 300000, source: 'fallback' });
  assert.equal(normFallback.shippingFee, 30000);
  assert.equal(normFallback.source, 'fallback');
  assert.ok(typeof normFallback.formattedDeliveryDate === 'string' && normFallback.formattedDeliveryDate.length > 0);

  // 3. Subtotal >= 1M gives 0 fee (Free shipping)
  const normFree = normalizeShippingQuote(null, { subTotal: 1200000, source: 'fallback' });
  assert.equal(normFree.shippingFee, 0);
});

test('formatters: formatEstimatedDelivery formats date strings and Date instances correctly', () => {
  const d = new Date('2026-11-10T10:00:00.000Z');
  const formatted = formatEstimatedDelivery(d);
  assert.ok(formatted.includes('2026'));
  assert.ok(formatted.includes('11'));
  assert.equal(formatEstimatedDelivery(null), '');
});
