// src\components\sections\Property\Gallery\Gallery.js
"use client";
import { useState } from "react";
import MainImage from "./components/MainImage";
import Thumbnails from "./components/Thumbnails";
import MainImageSkeleton from "./components/MainImageSkeleton";
import { ThumbnailsSkeleton } from "./components/ThubnailsSkeleton";

const GallerySkeleton = () => {
  <div className="mb-6">
    <MainImageSkeleton />
    <ThumbnailsSkeleton />
  </div>;
};

const Gallery = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState(images[0]);
  if (!images || images.length === 0) {
    return <GallerySkeleton />;
  }

  return (
    <div className="mb-6">
      <MainImage
        src={selectedImage.src}
        alt={selectedImage.alt}
        images={images}
        setSelectedImage={setSelectedImage}
      />

      <Thumbnails
        images={images}
        onSelect={(image) => setSelectedImage(image)}
        activeImage={selectedImage}
      />
    </div>
  );
};

export default Gallery;
