// src\components\sections\Property\Gallery\components\MainImage.js
"use client";
import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Watermark from "./Watermark";

const MainImage = ({ src, alt, images }) => {
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);
  const [overviewIndex, setOverviewIndex] = useState(0);

  // Ubah fungsi openOverview untuk menerima indeks gambar saat ini
  const openOverview = (currentIndex = 0) => {
    setOverviewIndex(currentIndex);
    setIsOverviewOpen(true);
  };

  const closeOverview = () => {
    setIsOverviewOpen(false);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setOverviewIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setOverviewIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <>
      {isOverviewOpen && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
          onClick={closeOverview}
        >
          <div className="relative max-w-full max-h-full w-full h-full flex items-center justify-center">
            <button
              onClick={handlePrev}
              className="absolute left-4 z-50 bg-white/20 hover:bg-white/40 rounded-full p-2"
            >
              <ChevronLeft className="text-white" size={32} />
            </button>

            <Image
              src={images[overviewIndex].src}
              alt={images[overviewIndex].alt}
              width={800}
              height={600}
              className="object-contain max-w-full max-h-full"
              priority
            />
            <Watermark />

            <button
              onClick={handleNext}
              className="absolute right-4 z-50 bg-white/20 hover:bg-white/40 rounded-full p-2"
            >
              <ChevronRight className="text-white" size={32} />
            </button>
          </div>
        </div>
      )}

      <div
        onClick={() => openOverview(images.findIndex((img) => img.src === src))}
        className="relative w-full h-64 md:h-[400px] lg:h-[500px] mb-2 md:bg-black rounded-lg overflow-hidden cursor-pointer"
      >
        <Image
          src={src}
          alt={alt}
          fill
          style={{ objectFit: "cover" }}
          quality={100}
          priority
        />
        <Watermark />
      </div>
    </>
  );
};

export default MainImage;
