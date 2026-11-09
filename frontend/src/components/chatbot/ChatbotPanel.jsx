import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Bot, Sparkles } from 'lucide-react';
import { useChatbot } from '../../context/ChatbotContext';

const QUICK_QUESTIONS = [
  'Tra cứu đơn hàng',
  'Phí vận chuyển ra sao?',
  'Chính sách đổi trả',
];

export default function ChatbotPanel({ renderPanel, launcherPosition }) {
  const { isOpen, close, messages, setMessages } = useChatbot();
  const [input, setInput] = useState('');
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    } else if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
        block: 'end',
      });
    }
  }, []);

  // Tắt đi mở lại: lập tức cuộn đến đoạn chat mới nhất
  useEffect(() => {
    if (isOpen) {
      const raf = requestAnimationFrame(() => {
        scrollToBottom(false);
      });
      const timer = setTimeout(() => {
        scrollToBottom(false);
      }, 60);
      return () => {
        cancelAnimationFrame(raf);
        clearTimeout(timer);
      };
    }
  }, [isOpen, scrollToBottom]);

  // Khi có tin nhắn mới (người dùng gửi hoặc bot render xong): cuộn mượt đến cuối
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        scrollToBottom(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [messages, isOpen, scrollToBottom]);

  if (!isOpen) return null;

  const chatbotUrl = import.meta.env.VITE_CHATBOT_URL;

  const handleSend = (textToSend) => {
    const text = (typeof textToSend === 'string' ? textToSend : input).trim();
    if (!text) return;

    const currentTime = new Date().toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: 'user',
        text,
        time: currentTime,
      },
    ]);
    setInput('');

    // Simulated bot answer
    setTimeout(() => {
      let replyText = 'Cảm ơn bạn đã liên hệ! Hệ thống tư vấn viên sẽ phản hồi bạn trong giây lát.';
      const lower = text.toLowerCase();
      if (lower.includes('đơn') || lower.includes('tra cứu')) {
        replyText = 'Bạn có thể vào mục "Tài khoản > Đơn hàng" hoặc gọi hotline 1900-1234 để kiểm tra hành trình đơn nhé!';
      } else if (lower.includes('phí') || lower.includes('vận chuyển') || lower.includes('ship')) {
        replyText = 'Sport Store miễn phí vận chuyển cho đơn từ 500k toàn quốc (áp dụng qua GHN và GHTK).';
      } else if (lower.includes('đổi') || lower.includes('trả')) {
        replyText = 'Chính sách hỗ trợ đổi trả miễn phí trong vòng 7 ngày kể từ khi nhận hàng cho sản phẩm còn nguyên tem mác.';
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: replyText,
          time: new Date().toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      ]);
    }, 600);
  };

  let panelStyle = {};
  if (launcherPosition) {
    const panelWidth = Math.min(380, typeof window !== 'undefined' ? window.innerWidth - 32 : 360);
    const panelHeight = Math.min(520, typeof window !== 'undefined' ? window.innerHeight - 100 : 500);

    const showAbove = launcherPosition.top > window.innerHeight / 2;
    const top = showAbove
      ? Math.max(16, launcherPosition.top - panelHeight - 12)
      : Math.min(window.innerHeight - panelHeight - 16, launcherPosition.top + 70);

    const showLeftOfLauncher = launcherPosition.left > window.innerWidth / 2;
    const left = showLeftOfLauncher
      ? Math.max(16, launcherPosition.left + 58 - panelWidth)
      : Math.min(window.innerWidth - panelWidth - 16, launcherPosition.left);

    panelStyle = {
      left: `${left}px`,
      top: `${top}px`,
      bottom: 'auto',
      right: 'auto',
    };
  }

  return (
    <section
      id="chatbot-panel"
      aria-label="Cửa sổ trò chuyện trợ lý ảo"
      style={panelStyle}
      className={`fixed z-40 w-[360px] sm:w-[380px] max-w-[calc(100vw-32px)] h-[520px] max-h-[calc(100vh-120px)] rounded-2xl shadow-2xl border border-line bg-surface flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200 ${
        !launcherPosition ? 'bottom-24 right-6' : ''
      }`}
    >
      {/* Header */}
      <header className="px-4 py-3 bg-accent text-accent-contrast flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold leading-tight flex items-center gap-1.5 text-white">
              Trợ lý Sport Store
              <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            </h3>
            <p className="text-[11px] text-white/80 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
              Sẵn sàng hỗ trợ
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={close}
          aria-label="Đóng cửa sổ chat"
          className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      {/* Content */}
      {renderPanel ? (
        <div className="flex-1 overflow-auto">{renderPanel({ close })}</div>
      ) : chatbotUrl ? (
        <iframe
          src={chatbotUrl}
          title="Trợ lý ảo hỗ trợ"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          className="w-full flex-1 border-none bg-surface"
        />
      ) : (
        <div className="flex-1 flex flex-col bg-surface-2 overflow-hidden">
          {/* Messages list */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-accent text-accent-contrast rounded-br-xs'
                      : 'bg-surface text-ink border border-line rounded-bl-xs shadow-xs'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-ink-subtle mt-1 px-1">{msg.time}</span>
              </div>
            ))}
            <div ref={messagesEndRef} className="h-0 w-0 pointer-events-none" />
          </div>

          {/* Quick suggestions */}
          <div className="px-3 py-2 bg-surface border-t border-line/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {QUICK_QUESTIONS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleSend(q)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-surface-2 hover:bg-accent/10 border border-line text-[11px] font-medium text-ink-muted hover:text-accent transition-colors shrink-0"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-surface border-t border-line flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập tin nhắn..."
              aria-label="Nội dung tin nhắn"
              className="flex-1 px-3 py-2 rounded-lg bg-surface-2 border border-line text-xs text-ink placeholder:text-ink-subtle focus:outline-hidden focus:border-accent focus:bg-surface"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label="Gửi tin nhắn"
              className="p-2 rounded-lg bg-accent text-accent-contrast disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition-all shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </section>
  );
}
