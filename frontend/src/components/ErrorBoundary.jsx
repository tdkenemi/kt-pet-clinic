import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full shadow-2xl ring-1 ring-slate-200 dark:ring-white/10 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">Đã xảy ra sự cố không mong muốn</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
              Rất xin lỗi vì sự bất tiện này. Một thành phần trên trang web vừa gặp lỗi và đã được chúng tôi ghi nhận để khắc phục.
            </p>
            
            <button
              onClick={() => window.location.reload()}
              className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-teal-500/20 active:scale-95"
            >
              <RefreshCw className="w-4 h-4" /> Làm mới trang web
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
