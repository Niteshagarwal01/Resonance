import { useState } from "react";
import Image, { ImageProps } from "next/image";
import { Music } from "lucide-react";

interface SafeImageProps extends Omit<ImageProps, "src" | "alt"> {
  src?: string | null;
  alt?: string;
  fallbackIconSize?: number;
}

export function SafeImage({ src, alt = "Image", fallbackIconSize = 24, className = "", ...props }: SafeImageProps) {
  const [error, setError] = useState(false);

  if (!src || error) {
    const { fill, unoptimized, priority, ...divProps } = props as any;
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`} {...divProps}>
        <Music size={fallbackIconSize} className="text-gray-300" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      {...props}
    />
  );
}
