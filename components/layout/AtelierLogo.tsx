"use client";

import NextImage from "next/image";

interface AtelierLogoProps {
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

export function AtelierLogo({
  width = 180,
  height = 50,
  className = "h-9 md:h-[50px] w-auto object-contain",
  priority = true,
}: AtelierLogoProps) {
  return (
    <div className="relative inline-flex items-center">
      {/* Light Theme Logo (dark text for light background) */}
      <NextImage
        src="/logo/Satriano Light .webp"
        alt="Satriano Atelier"
        width={width}
        height={height}
        priority={priority}
        style={{ width: "auto", height: "auto" }}
        className={`${className} block [html[data-theme='dark']_&]:hidden`}
      />
      {/* Dark Theme Logo (light/white text for dark background) */}
      <NextImage
        src="/logo/Satriano Dark .webp"
        alt="Satriano Atelier"
        width={width}
        height={height}
        priority={priority}
        style={{ width: "auto", height: "auto" }}
        className={`${className} hidden [html[data-theme='dark']_&]:block`}
      />
    </div>
  );
}
