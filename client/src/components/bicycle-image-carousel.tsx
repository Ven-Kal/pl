import { useState, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';

interface BicycleImageCarouselProps {
  images: string[];
  thumbnailSize?: boolean;
}

export default function BicycleImageCarousel({ 
  images, 
  thumbnailSize = true 
}: BicycleImageCarouselProps) {
  const [emblaRef] = useEmblaCarousel({ 
    loop: true,
    align: 'start',
    skipSnaps: false
  });

  return (
    <div 
      className="overflow-hidden relative" 
      ref={emblaRef}
      role="region"
      aria-label="Bicycle images carousel"
    >
      <div className="flex">
        {images.map((image, index) => (
          <div
            key={index}
            className={`flex-[0_0_100%] min-w-0 relative ${
              thumbnailSize ? 'h-48' : 'h-96'
            }`}
          >
            <img
              src={image}
              alt={`Bicycle image ${index + 1}`}
              loading={index === 0 ? "eager" : "lazy"}
              width={thumbnailSize ? "192" : "384"}
              height={thumbnailSize ? "192" : "384"}
              className="absolute w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = 'assets/images/image1.jpg';
                e.currentTarget.alt = 'Image failed to load';
              }}
            />
            <noscript>
              <img
                src={image}
                alt={`Bicycle image ${index + 1}`}
                width={thumbnailSize ? "192" : "384"}
                height={thumbnailSize ? "192" : "384"}
                className="absolute w-full h-full object-cover"
              />
            </noscript>
          </div>
        ))}
      </div>
    </div>
  );
}