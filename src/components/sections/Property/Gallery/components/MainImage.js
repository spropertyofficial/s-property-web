// src/components/sections/Property/Gallery/components/MainImage.js
import Image from "next/image";
import Watermark from "./Watermark";

const MainImage = ({ src, alt }) => {
  return (
    <div className="relative w-full h-64 mb-2 rounded-lg overflow-hidden">
      <Image
        src={src}
        alt={alt}
        layout="fill"
        objectFit="cover"
        quality={100}
      />
      <Watermark />
    </div>
  );
};

export default MainImage;
