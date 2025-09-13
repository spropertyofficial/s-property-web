export default function ChatInboxSkeleton() {
  return (
    <div className="p-0 md:p-4 bg-slate-100 h-[100svh] md:h-screen overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 md:gap-4 max-w-[1400px] mx-auto h-full min-h-0 overscroll-none animate-pulse">
        {/* Left: Conversations list skeleton */}
        <div className="lg:col-span-3 bg-white border border-slate-200 flex-col h-full min-h-0 hidden lg:flex">
          <div className="p-4">
            <div className="h-6 bg-gray-200 rounded w-2/3 mb-4" />
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 bg-gray-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Middle: Chat window skeleton */}
        <div className="lg:col-span-6 bg-white border border-slate-200 flex-col h-full min-h-0 hidden lg:flex">
          <div className="p-8">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
            {[...Array(8)].map((_, i) => (
              <div key={i} className={`h-4 bg-gray-200 rounded mb-3 ${i % 2 === 0 ? 'w-2/3 ml-auto' : 'w-1/2'}`} />
            ))}
          </div>
        </div>
        {/* Right: Lead info skeleton */}
        <div className="lg:col-span-3 bg-white border border-slate-200 h-full min-h-0 hidden lg:block">
          <div className="p-4">
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4" />
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded w-full mb-2" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
