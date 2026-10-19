import Image from "next/image";

export function StudioMark({ className }: { className?: string }) {
  return (
    <span className={className ? `studio-brand-mark ${className}` : "studio-brand-mark"} aria-hidden="true">
      <Image src="/images/edrisa-mark.png" alt="" width={32} height={32} className="studio-brand-mark-image" />
    </span>
  );
}
