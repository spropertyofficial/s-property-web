// src/components/sections/Property/Gallery/Gallery.js
"use client";
import { useState } from "react";
import MainImage from "./components/MainImage";
import Thumbnails from "./components/Thumbnails";

const Gallery = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState(images[0]);

  return (
    <div className="mb-6">
      <MainImage src={selectedImage.src} alt={selectedImage.alt} />
      <Thumbnails
        images={images}
        onSelect={(image) => setSelectedImage(image)}
      />
    </div>
  );
};

export default Gallery;
