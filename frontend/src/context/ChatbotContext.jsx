/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { usePersistentState } from '../hooks/usePersistentState.js';

export const DEFAULT_CHATBOT_MESSAGES = () => [
  {
    id: 1,
    sender: 'bot',
    text: 'Xin chào! Tôi là trợ lý ảo của Sport Store. Tôi có thể giúp gì cho bạn hôm nay?',
    time: 'Vừa xong',
  },
];

const ChatbotContext = createContext(null);

export function ChatbotProvider({ children, renderPanel = null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [messages, setMessages] = usePersistentState(
    'sport_chatbot_messages',
    DEFAULT_CHATBOT_MESSAGES
  );

  const open = useCallback(() => {
    setIsOpen(true);
    setUnreadCount(0);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) setUnreadCount(0);
      return next;
    });
  }, []);

  // Lắng nghe các Window Custom Events (cho phép code bên ngoài / script điều khiển chatbot)
  useEffect(() => {
    const handleOpenEvent = () => setIsOpen(true);
    const handleCloseEvent = () => setIsOpen(false);
    const handleToggleEvent = () => setIsOpen((prev) => !prev);

    window.addEventListener('chatbot:open', handleOpenEvent);
    window.addEventListener('chatbot:close', handleCloseEvent);
    window.addEventListener('chatbot:toggle', handleToggleEvent);

    return () => {
      window.removeEventListener('chatbot:open', handleOpenEvent);
      window.removeEventListener('chatbot:close', handleCloseEvent);
      window.removeEventListener('chatbot:toggle', handleToggleEvent);
    };
  }, []);

  // Lắng nghe postMessage an toàn từ iframe chatbot
  useEffect(() => {
    const chatbotUrl = import.meta.env.VITE_CHATBOT_URL;
    if (!chatbotUrl) return;

    let expectedOrigin = '';
    try {
      expectedOrigin = new URL(chatbotUrl).origin;
    } catch {
      return;
    }

    const handleMessage = (event) => {
      if (event.origin !== expectedOrigin) return;
      const data = event.data;
      if (
        data &&
        typeof data === 'object' &&
        data.type === 'chatbot:unread' &&
        typeof data.count === 'number' &&
        data.count >= 0
      ) {
        setUnreadCount(Math.floor(data.count));
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const value = useMemo(
    () => ({
      isOpen,
      open,
      close,
      toggle,
      unreadCount,
      setUnreadCount,
      messages,
      setMessages,
      renderPanel,
    }),
    [isOpen, open, close, toggle, unreadCount, messages, setMessages, renderPanel]
  );

  return <ChatbotContext.Provider value={value}>{children}</ChatbotContext.Provider>;
}

export function useChatbot() {
  const ctx = useContext(ChatbotContext);
  if (!ctx) {
    throw new Error('useChatbot phải được sử dụng bên trong ChatbotProvider');
  }
  return ctx;
}
