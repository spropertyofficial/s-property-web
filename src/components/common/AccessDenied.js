export default function AccessDenied({ message = "Anda harus login untuk mengakses halaman ini.", redirect = false }) {
  // Optional: handle redirect if needed
  if (redirect && typeof window !== "undefined") {
    setTimeout(() => {
      window.location.href = "/login";
    }, 1200);
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300">
      <div className="w-full max-w-md p-8 rounded-2xl shadow-xl bg-white text-center border border-gray-200">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-gradient-to-r from-teal-500 to-blue-500 rounded-full p-4 mb-4">
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-white">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11V15M12 7H12.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Akses Terbatas</h2>
          <p className="text-gray-500 mb-4">{message}</p>
        </div>
        <button
          className="inline-block px-6 py-2 rounded-lg bg-teal-600 text-white font-semibold shadow hover:bg-teal-700 transition-colors"
          onClick={() => {
            if (typeof window !== "undefined") window.location.href = "/login";
          }}
        >
          Login Sekarang
        </button>
        <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto animate-pulse mt-8" />
      </div>
    </div>
  );
}
