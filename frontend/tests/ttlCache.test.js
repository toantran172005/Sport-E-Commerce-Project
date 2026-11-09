import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTtlCache } from '../src/utils/ttlCache.js';

test('ttlCache: basic get, set, has, delete and clear', () => {
  let currentTime = 1000;
  const cache = createTtlCache({
    ttlMs: 5000,
    maxEntries: 10,
    now: () => currentTime,
  });

  assert.equal(cache.has('k1'), false);
  assert.equal(cache.get('k1'), undefined);

  cache.set('k1', 'val1');
  assert.equal(cache.has('k1'), true);
  assert.equal(cache.get('k1'), 'val1');

  cache.delete('k1');
  assert.equal(cache.has('k1'), false);
  assert.equal(cache.get('k1'), undefined);

  cache.set('k2', 'val2');
  cache.set('k3', 'val3');
  cache.clear();
  assert.equal(cache.has('k2'), false);
  assert.equal(cache.has('k3'), false);
});

test('ttlCache: TTL expiry with injected now and set override', () => {
  let currentTime = 1000;
  const cache = createTtlCache({
    ttlMs: 2000,
    now: () => currentTime,
  });

  cache.set('standard', 'data1');
  cache.set('custom', 'data2', { ttlMs: 5000 });

  // Time advances by 1000ms -> both still valid
  currentTime += 1000;
  assert.equal(cache.get('standard'), 'data1');
  assert.equal(cache.get('custom'), 'data2');

  // Time advances by another 1500ms (total 2500ms elapsed) -> standard expired, custom still valid
  currentTime += 1500;
  assert.equal(cache.get('standard'), undefined);
  assert.equal(cache.get('custom'), 'data2');

  // Time advances by another 3000ms (total 5500ms elapsed) -> custom also expired
  currentTime += 3000;
  assert.equal(cache.get('custom'), undefined);
});

test('ttlCache: LRU eviction at maxEntries', () => {
  const cache = createTtlCache({
    ttlMs: 100000,
    maxEntries: 3,
  });

  cache.set('a', 1);
  cache.set('b', 2);
  cache.set('c', 3);

  // Access 'a' so 'b' becomes oldest
  cache.get('a');

  // Insert 'd', exceeding maxEntries -> 'b' should be evicted
  cache.set('d', 4);

  assert.equal(cache.get('b'), undefined);
  assert.equal(cache.get('a'), 1);
  assert.equal(cache.get('c'), 3);
  assert.equal(cache.get('d'), 4);
});

test('ttlCache: in-flight deduplication and rejected loader handling', async () => {
  let currentTime = 1000;
  const cache = createTtlCache({
    ttlMs: 5000,
    now: () => currentTime,
  });

  let loaderCallCount = 0;
  const slowLoader = () =>
    new Promise((resolve) => {
      loaderCallCount += 1;
      setTimeout(() => resolve('loaded_value'), 20);
    });

  // Call getOrLoad concurrently 5 times for the same key
  const results = await Promise.all([
    cache.getOrLoad('quoteKey', slowLoader),
    cache.getOrLoad('quoteKey', slowLoader),
    cache.getOrLoad('quoteKey', slowLoader),
    cache.getOrLoad('quoteKey', slowLoader),
    cache.getOrLoad('quoteKey', slowLoader),
  ]);

  // All 5 received the same loaded value, but loader called exactly once
  assert.equal(loaderCallCount, 1);
  assert.deepEqual(results, [
    'loaded_value',
    'loaded_value',
    'loaded_value',
    'loaded_value',
    'loaded_value',
  ]);

  // Rejected loader is NOT cached and clears in-flight
  let rejectCallCount = 0;
  const failingLoader = () => {
    rejectCallCount += 1;
    return Promise.reject(new Error('Network error'));
  };

  await assert.rejects(() => cache.getOrLoad('failKey', failingLoader), /Network error/);
  assert.equal(rejectCallCount, 1);
  assert.equal(cache.get('failKey'), undefined);

  // Calling again triggers a new loader attempt
  await assert.rejects(() => cache.getOrLoad('failKey', failingLoader), /Network error/);
  assert.equal(rejectCallCount, 2);
});

test('ttlCache: storage persistence round-trip and corrupted JSON resilience', () => {
  const store = {};
  const mockStorage = {
    getItem: (key) => store[key] ?? null,
    setItem: (key, val) => {
      store[key] = String(val);
    },
    removeItem: (key) => {
      delete store[key];
    },
  };

  let currentTime = 1000;
  const cache1 = createTtlCache({
    ttlMs: 10000,
    storage: mockStorage,
    storageKey: 'test_shipping_cache',
    now: () => currentTime,
  });

  cache1.set('persistedKey', { fee: 25000 });
  assert.ok(store['test_shipping_cache']);

  // Second cache instance rehydrates from mockStorage
  const cache2 = createTtlCache({
    ttlMs: 10000,
    storage: mockStorage,
    storageKey: 'test_shipping_cache',
    now: () => currentTime,
  });

  assert.deepEqual(cache2.get('persistedKey'), { fee: 25000 });

  // Corrupted JSON is safely ignored without throwing
  store['test_shipping_cache'] = 'INVALID_JSON{{{';
  assert.doesNotThrow(() => {
    const cache3 = createTtlCache({
      ttlMs: 10000,
      storage: mockStorage,
      storageKey: 'test_shipping_cache',
      now: () => currentTime,
    });
    assert.equal(cache3.get('persistedKey'), undefined);
  });
});
