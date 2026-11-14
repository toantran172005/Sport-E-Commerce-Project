import { useState, useEffect } from 'react';

/**
 * Custom hook to sync state with localStorage safely
 * @param {string} key - localStorage key
 * @param {any} initialValue - Fallback value
 * @returns {[any, Function]} - [state, setState]
 */
export function usePersistentState(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved !== null && saved !== undefined) {
        return JSON.parse(saved);
      }
    } catch (err) {
      console.warn(`[usePersistentState] Error parsing storage key "${key}":`, err);
    }
    return typeof initialValue === 'function' ? initialValue() : initialValue;
  });

  useEffect(() => {
    try {
      if (state === undefined) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(state));
      }
    } catch (err) {
      console.warn(`[usePersistentState] Error writing storage key "${key}":`, err);
    }
  }, [key, state]);

  return [state, setState];
}
