import Image, { type ImageProps } from "next/image";
import { isOptimizableImage } from "@/lib/images";

/**
 * `next/image` for third-party URLs: optimized when the host is allowlisted
 * (src/lib/images.ts), served straight from the source otherwise.
 */
export function RemoteImage({
  src,
  alt,
  ...props
}: Omit<ImageProps, "src" | "unoptimized"> & { src: string }) {
  return <Image src={src} alt={alt} unoptimized={!isOptimizableImage(src)} {...props} />;
}
