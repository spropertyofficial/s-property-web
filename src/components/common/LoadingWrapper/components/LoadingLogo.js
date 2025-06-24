import Image from "next/image";

export default function LoadingLogo() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Image
        src="/images/logo.png"
        alt="Loading"
        width={50}
        height={40}
        className="animate-pulse h-32 w-32 opacity-5"
      />
    </div>
  );
}
