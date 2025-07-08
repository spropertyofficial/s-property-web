export default function AdminFooter() {
  return (
    <footer className="mt-8 bg-white border-t border-gray-200 py-6">
      <div className="text-center">
        <p className="text-sm text-gray-600">
          &copy; {new Date().getFullYear()} S-Property Admin Dashboard. All rights reserved.
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Version 1.0.0 | Powered by Next.js
        </p>
      </div>
    </footer>
  )
}