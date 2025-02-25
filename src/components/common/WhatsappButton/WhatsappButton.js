"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";

const WhatsAppButton = ({
  phoneNumber = "6285123123891",
  propertyData,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const pathname = usePathname();

  // Generate pesan berdasarkan tipe properti dan data
  const generateMessage = () => {
    const pathSegments = pathname.split("/");
    const propertyType = pathSegments[2]; // residential, clusters, atau units

    const baseMessage = "Halo, saya tertarik dengan";

    switch (propertyType) {
      case "residentials":
        return `${baseMessage} properti residential ${
          propertyData?.name || ""
        }. Mohon info lebih lanjut.`;

      case "clusters":
        return `${baseMessage} cluster ${propertyData?.name || ""} di ${
          propertyData?.location || ""
        }. Bisa minta informasi lengkapnya?`;

      case "units":
        return `${baseMessage} unit ${propertyData?.type || ""} ${
          propertyData?.name || ""
        } - Tipe ${propertyData?.size || ""}. Apakah masih tersedia?`;

      default:
        return "Halo, saya tertarik dengan properti Anda. Mohon informasi lebih lanjut.";
    }
  };

  const handleClick = () => {
    const message = generateMessage();
    const encodedMessage = encodeURIComponent(message);
    window.open(
      `https://wa.me/${phoneNumber}?text=${encodedMessage}`,
      "_blank"
    );
  };

  // Hanya tampilkan di halaman detail
  if (!pathname.includes("/properties/")) {
    return null;
  }

  return (
    <div
      className={`
        fixed bottom-5 right-5 z-50 cursor-pointer transition-all duration-300 ease-in-out
        ${
          isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-6 pointer-events-none"
        }
        md:bottom-6 md:right-6
      `}
      onClick={handleClick}
    >
      <div
        className="
        flex items-center bg-green-200 p-2 rounded-lg
        shadow-md transition-all duration-300 hover:bg-green-600
        hover:-translate-y-1 hover:shadow-lg
        md:px-8 md:py-4
      "
      >
        <Image
          src="/images/whatsapp-icon.svg"
          alt="WhatsApp"
          width={24}
          height={24}
          className="w-10 h-auto"
        />
      </div>
    </div>
  );
};

export default WhatsAppButton;
