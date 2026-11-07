import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-page flex items-center justify-center p-4">
          <div className="bg-surface rounded-lg border border-line max-w-md w-full p-6 text-center shadow-sm">
            <div className="w-12 h-12 rounded-full bg-danger-soft text-danger flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-[18px] font-bold text-ink">
              Đã xảy ra sự cố không mong muốn
            </h2>
            <p className="text-[13px] text-ink-muted mt-2 leading-relaxed">
              Hệ thống đã ghi nhận lỗi giao diện. Vui lòng thử tải lại trang hoặc quay về trang chủ.
            </p>
            {this.state.error?.message && (
              <div className="mt-3 p-3 rounded-md bg-surface-2 text-[11.5px] font-mono text-ink-muted text-left truncate">
                {this.state.error.message}
              </div>
            )}
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="px-4 py-2 rounded-md bg-surface border border-line hover:bg-surface-2 text-[12.5px] font-bold text-ink flex items-center gap-1.5 transition"
              >
                <RefreshCw className="w-4 h-4 text-ink-muted" />
                <span>Tải lại</span>
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="px-4 py-2 rounded-md bg-accent hover:bg-accent-hover text-white text-[12.5px] font-bold flex items-center gap-1.5 transition"
              >
                <Home className="w-4 h-4" />
                <span>Về trang chủ</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
