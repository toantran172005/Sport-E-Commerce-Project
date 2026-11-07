/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useMemo, useCallback } from 'react';

const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [activeModal, setActiveModal] = useState(null);
  const [modalPayload, setModalPayload] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  }, []);

  const openModal = useCallback((modalName, payload = null) => {
    setModalPayload(payload);
    setActiveModal(modalName);
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal(null);
    setModalPayload(null);
  }, []);

  const closeAllDropdowns = useCallback(() => {
    setIsCategoriesOpen(false);
    setIsNotificationsOpen(false);
    setIsUserMenuOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      activeModal,
      modalPayload,
      openModal,
      closeModal,
      toastMessage,
      showToast,
      isCategoriesOpen,
      setIsCategoriesOpen,
      isNotificationsOpen,
      setIsNotificationsOpen,
      isUserMenuOpen,
      setIsUserMenuOpen,
      closeAllDropdowns,
    }),
    [
      activeModal,
      modalPayload,
      openModal,
      closeModal,
      toastMessage,
      showToast,
      isCategoriesOpen,
      isNotificationsOpen,
      isUserMenuOpen,
      closeAllDropdowns,
    ]
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) {
    throw new Error('useUI must be used within UIProvider');
  }
  return ctx;
}
