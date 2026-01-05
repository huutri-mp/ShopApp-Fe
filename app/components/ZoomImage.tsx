import PhotoSwipeLightbox from "photoswipe/lightbox";
import "photoswipe/style.css";
import { useEffect } from "react";

interface ZoomImageProps {
  galleryId: string;
  images: string[];
  children: React.ReactNode;
}

export default function ZoomImage({
  galleryId,
  images,
  children,
}: ZoomImageProps) {
  useEffect(() => {
    const lightbox = new PhotoSwipeLightbox({
      gallery: `#${galleryId}`,
      children: "a",
      pswpModule: () => import("photoswipe"),
    });

    lightbox.init();
    return () => lightbox.destroy();
  }, [galleryId]);

  return (
    <div id={galleryId}>
      {images.map((src, idx) => (
        <a
          key={idx}
          href={src}
          data-pswp-width="1200"
          data-pswp-height="800"
          className="hidden"
        />
      ))}

      {/* Thumbnail render bên ngoài */}
      {children}
    </div>
  );
}
