export const ThumbnailsSkeleton = () => {
  return (
    <div className="w-full px-2">
      <div className="flex gap-2 md:gap-3">
        {[...Array(10)].map((_, index) => (
          <div
            key={index}
            className="relative aspect-square w-1/3 md:w-24 lg:w-20 rounded-lg overflow-hidden bg-gray-200 animate-pulse"
          />
        ))}
      </div>
    </div>
  );
};
