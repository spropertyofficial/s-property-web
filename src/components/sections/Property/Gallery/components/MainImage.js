// src\components\sections\Property\Gallery\components\MainImage.js
"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Watermark from "./Watermark";
import { AnimatePresence, motion } from "framer-motion";

const MainImage = ({ src, alt, images, setSelectedImage }) => {
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);
  const [overviewIndex, setOverviewIndex] = useState(0);
  const [isImageLoading, setIsImageLoading] = useState(true);

  useEffect(() => {
    setIsImageLoading(true);
  }, [src]);

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
    const nextIndex =
      overviewIndex === images.length - 1 ? 0 : overviewIndex + 1;
    setOverviewIndex(nextIndex);
    setSelectedImage(images[nextIndex]); // Update gambar di halaman utama juga
  };
  const handlePrev = (e) => {
    e.stopPropagation();
    const prevIndex =
      overviewIndex === 0 ? images.length - 1 : overviewIndex - 1;
    setOverviewIndex(prevIndex);
    setSelectedImage(images[prevIndex]); // Update gambar di halaman utama juga
  };

  return (
    <>
      <AnimatePresence>
        {isOverviewOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
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
          </motion.div>
        )}
      </AnimatePresence>

      <div
        onClick={() => openOverview(images.findIndex((img) => img.src === src))}
        className="relative w-full h-64 md:h-[400px] lg:h-[500px] mb-2 md:bg-black rounded-lg overflow-hidden cursor-pointer"
      >
        <AnimatePresence>
          {isImageLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex items-center justify-center bg-black/20"
            >
              <Loader2 className="w-12 h-12 text-white animate-spin" />
            </motion.div>
          )}
        </AnimatePresence>
        <Image
          key={src}
          src={src}
          alt={alt}
          fill
          style={{ objectFit: "cover" }}
          quality={100}
          priority
          onLoad={() => setIsImageLoading(false)}
        />
        <Watermark />
      </div>
    </>
  );
};

export default MainImage;
