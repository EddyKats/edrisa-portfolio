type WatermarkProps = {
  tile?: "about" | "services" | "contact" | "portfolio";
  className?: string;
};

export function Watermark({ tile = "about", className = "nav-mark" }: WatermarkProps) {
  return (
    <span aria-hidden="true" className={className} data-tile={tile}>
      <span className="nav-mark-core" />
      <span className="nav-mark-ring" />
    </span>
  );
}
