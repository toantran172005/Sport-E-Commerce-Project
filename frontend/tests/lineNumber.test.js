import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildLineNumberMap } from '../src/utils/cartNumbering.js';

test('cartNumbering: buildLineNumberMap returns continuous 1..N sequence across multiple brand groups', () => {
  const item1 = { id: 'it-1', productId: 1, variantId: 10, name: 'Áo đấu Nike' };
  const item2 = { id: 'it-2', productId: 1, variantId: 11, name: 'Quần đấu Nike' };
  const item3 = { id: 'it-3', productId: 2, variantId: 20, name: 'Giày Adidas' };
  const item4 = { id: 'it-4', productId: 3, variantId: 30, name: 'Vợt Puma' };

  const groupedEntries = [
    ['Nike', [item1, item2]],
    ['Adidas', [item3]],
    ['Puma', [item4]],
  ];

  const map = buildLineNumberMap(groupedEntries);

  // Line numbers should be 1, 2, 3, 4 consecutively across brand boundaries
  assert.equal(map.get('it-1'), 1);
  assert.equal(map.get('it-2'), 2);
  assert.equal(map.get('it-3'), 3);
  assert.equal(map.get('it-4'), 4);

  // Object reference lookup also works
  assert.equal(map.get(item1), 1);
  assert.equal(map.get(item2), 2);
  assert.equal(map.get(item3), 3);
  assert.equal(map.get(item4), 4);
});

test('cartNumbering: removing an item renumbers remaining items correctly starting from 1', () => {
  const item1 = { id: 'it-1', name: 'Mặt hàng 1' };
  const item2 = { id: 'it-2', name: 'Mặt hàng 2' };
  const item3 = { id: 'it-3', name: 'Mặt hàng 3' };

  // Initial: item1=1, item2=2, item3=3
  const initialGroups = [
    ['Group A', [item1]],
    ['Group B', [item2, item3]],
  ];
  const initialMap = buildLineNumberMap(initialGroups);
  assert.equal(initialMap.get('it-1'), 1);
  assert.equal(initialMap.get('it-2'), 2);
  assert.equal(initialMap.get('it-3'), 3);

  // After removing item1: item2 must become 1, item3 must become 2
  const updatedGroups = [
    ['Group A', []],
    ['Group B', [item2, item3]],
  ];
  const updatedMap = buildLineNumberMap(updatedGroups);
  assert.equal(updatedMap.get('it-1'), undefined);
  assert.equal(updatedMap.get('it-2'), 1);
  assert.equal(updatedMap.get('it-3'), 2);
});

test('cartNumbering: empty, missing, and duplicate inputs handled safely', () => {
  // Empty array returns empty map
  assert.equal(buildLineNumberMap([]).size, 0);
  assert.equal(buildLineNumberMap(null).size, 0);
  assert.equal(buildLineNumberMap(undefined).size, 0);

  // Duplicate keys: first occurrence wins
  const itemA = { id: 'dup-1', name: 'Item A' };
  const itemB = { id: 'dup-1', name: 'Item B' }; // same id
  const itemC = { id: 'unique-2', name: 'Item C' };

  const groups = [
    ['Brand 1', [itemA, itemB, itemC]],
  ];
  const map = buildLineNumberMap(groups);
  assert.equal(map.get('dup-1'), 1);
  assert.equal(map.get('unique-2'), 2);
});
