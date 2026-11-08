/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from "react";

const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [activeModal, setActiveModal] = useState(null);
  const [modalPayload, setModalPayload] = useState(null);
  const [toasts, setToasts] = useState([]);

  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((msg, type = "info") => {
    if (!msg) return;
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message: msg, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  }, []);

  const toastMessage = toasts[toasts.length - 1]?.message || null;

  const openModal = useCallback((modalName, payload = null) => {
    setModalPayload(payload);
    setActiveModal(modalName);
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal(null);
    setModalPayload(null);
  }, []);

  const showErrorModal = useCallback(
    (err, customOptions = {}) => {
      let title = customOptions.title || "Đã Xảy Ra Lỗi";
      let message =
        "Có lỗi xảy ra trong quá trình xử lý, vui lòng thử lại sau.";
      let status = null;
      let errors = null;
      const onRetry = customOptions.onRetry || null;

      if (typeof err === "string") {
        message = err;
      } else if (err && typeof err === "object") {
        message =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          message;
        status = err.response?.status || customOptions.status || null;
        errors = err.response?.data?.errors || err.errors || null;
      }

      openModal("error_modal", {
        title,
        message,
        status,
        errors,
        onRetry,
      });
    },
    [openModal],
  );

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
      showErrorModal,
      toastMessage,
      toasts,
      showToast,
      removeToast,
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
      showErrorModal,
      toastMessage,
      toasts,
      showToast,
      removeToast,
      isCategoriesOpen,
      isNotificationsOpen,
      isUserMenuOpen,
      closeAllDropdowns,
    ],
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) {
    throw new Error("useUI phải được sử dụng bên trong UIProvider");
  }
  return ctx;
}
