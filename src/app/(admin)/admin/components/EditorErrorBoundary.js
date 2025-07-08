"use client";

import { Component } from "react";

class EditorErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state sehingga render selanjutnya akan menunjukkan fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.warn("MDEditor Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-yellow-800 text-sm mb-2">
            ⚠️ Rich text editor mengalami masalah, menggunakan mode sederhana:
          </p>
          <textarea
            value={this.props.value || ""}
            onChange={(e) => this.props.onChange && this.props.onChange(e.target.value)}
            placeholder={this.props.placeholder || "Masukkan deskripsi..."}
            className="w-full p-2 border border-gray-300 rounded resize-none"
            style={{ height: this.props.height || 300 }}
          />
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200"
          >
            🔄 Coba Lagi
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default EditorErrorBoundary;
