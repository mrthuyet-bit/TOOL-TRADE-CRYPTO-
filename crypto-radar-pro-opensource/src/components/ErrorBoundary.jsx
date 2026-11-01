import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled UI error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const isEn = localStorage.getItem('app_language') === 'en';
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#070b1a] text-slate-200 p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-950/80 border border-rose-500/50 flex items-center justify-center text-rose-400 mb-4 text-2xl font-bold">
            ⚠️
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            {isEn ? 'UI Render Error Occurred' : 'Đã xảy ra sự cố giao diện'}
          </h2>
          <p className="text-sm text-slate-400 max-w-md mb-4">
            {isEn
              ? `The system isolated the error to protect data integrity: ${this.state.error?.message || 'Unknown error'}`
              : `Hệ thống đã tự động cách ly lỗi để bảo toàn dữ liệu: ${this.state.error?.message || 'Lỗi không xác định'}`}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-lg shadow-purple-900/50 transition-all"
          >
            {isEn ? 'Reload Interface' : 'Làm Mới Giao Diện'}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
