// src/components/sections/Property/Gallery/components/Thumbnails.js
import Image from "next/image";

const Thumbnails = ({ images, onSelect }) => {
  return (
    <div className="flex space-x-2 overflow-x-auto">
      {images.map((image, index) => (
        <div
          key={index}
          className="relative w-16 h-16 flex-shrink-0 cursor-pointer"
          onClick={() => onSelect(image)}
        >
          <Image
            src={image.src}
            alt={image.alt}
            layout="fill"
            sizes="(max-width: 768px) 100vw, 100vw"
            objectFit="cover"
            className="rounded-lg"
          />
          <div className="absolute w-full h-full flex items-center justify-center">
            <Image
              src="/images/Watermark-SPRO.webp"
              alt="Watermark"
              width={50}
              height={30}
              sizes="100vw"
              className="object-cover w-auto h-14 overflow-hidden opacity-80"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default Thumbnails;
