// src/components/sections/Property/Gallery/components/Thumbnails.js
"use client";
import Image from "next/image";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

const Thumbnails = ({ images, onSelect, activeImage }) => {
  return (
    <div className="w-full px-2">
      <Swiper
        spaceBetween={8}
        slidesPerView={3.5}
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
                ${activeImage.src === image.src 
                  ? 'opacity-100 scale-90' 
                  : 'opacity-60'}
              `}
              onClick={() => onSelect(image)}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                style={{ objectFit: "cover" }}
                className="transition-opacity"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Thumbnails;