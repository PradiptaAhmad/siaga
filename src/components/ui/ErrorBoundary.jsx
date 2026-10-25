import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-3xl border border-sand-300 p-6 text-center shadow-soft">
            <div className="h-12 w-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 font-bold text-xl">
              ⚠️
            </div>
            <h3 className="text-base font-bold text-forest-900">Terjadi Kendala Memuat Halaman</h3>
            <p className="text-xs text-ink-500 mt-2">
              Sistem mendeteksi kesalahan rendering komponen. Silakan coba segarkan halaman.
            </p>
            {this.state.error?.message && (
              <pre className="mt-3 text-left p-3 rounded-xl bg-sand-100 text-[11px] text-red-700 font-mono overflow-x-auto">
                {this.state.error.message}
              </pre>
            )}
            <div className="mt-5 flex gap-2 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="btn-primary text-xs h-9 px-4 rounded-xl"
              >
                Segarkan Halaman
              </button>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null })
                  window.location.href = '/dashboard'
                }}
                className="btn-outline text-xs h-9 px-4 rounded-xl"
              >
                Kembali ke Dashboard
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

