import Image from "next/image";
import { site } from "@/data/site";

export function EdrisaLogo({ className }: { className?: string }) {
  return (
    <Image
      src={site.logoSrc}
      alt="Edrisa"
      width={site.logoWidth}
      height={site.logoHeight}
      className={className}
    />
  );
}
