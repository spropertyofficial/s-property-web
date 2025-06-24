// src/components/sections/Property/Gallery/components/Thumbnails.js
"use client";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import Watermark from "./Watermark";
const Thumbnails = ({ images, onSelect, activeImage }) => {
  return (
    <div className="w-full px-2">
      <Swiper
        spaceBetween={8}
        slidesPerView={3.5}
        breakpoints={{
          640: { slidesPerView: 5, spaceBetween: 8 },
          768: { slidesPerView: 6, spaceBetween: 10 },
          1024: { slidesPerView: 8, spaceBetween: 12 },
          1280: { slidesPerView: 10, spaceBetween: 12 },
        }}
        className="thumbnails-slider"
      >
        {images.map((image, index) => (
          <SwiperSlide key={index}>
            <div
              className={`
                relative 
                aspect-square 
                cursor-pointer 
                rounded-lg 
                overflow-hidden 
                transition-all 
                duration-300
                hover:opacity-100
                md:max-h-24 lg:max-h-20
                ${
                  activeImage.src === image.src
                    ? "opacity-100 ring-2 ring-tosca-200"
                    : "opacity-60"
                }
              `}
              onClick={() => onSelect(image)}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                style={{ objectFit: "cover" }}
                className="transition-opacity"
                sizes="(max-width: 640px) 33vw, (max-width: 768px) 20vw, (max-width: 1024px) 12vw, 10vw"
                priority
              />
              <div className="absolute w-full h-full flex items-center justify-center">
                <Image
                  src="/images/Watermark-SPRO.webp"
                  alt="Watermark"
                  width={50}
                  height={30}
                  sizes="100vw"
                  className="object-cover w-auto h-20 md:h-16 lg:h-12"
                />
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Thumbnails;
