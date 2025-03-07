import Image from "next/image";

export default function Watermark() {
  return (
    <div className="absolute w-full h-full flex items-center justify-center">
      <Image
        src="/images/Watermark-SPRO.webp"
        alt="Watermark"
        width={50}
        height={30}
        sizes="100vw"
        className="object-cover w-auto h-36 opacity-80"
      />
    </div>
  );
}
