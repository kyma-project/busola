import { useEffect, useRef, useState } from 'react';
import { Carousel } from '@ui5/webcomponents-react';

export default function BannerCarousel({ children }) {
  const carouselRef = useRef(null);
  const [childrenLength, setChildrenLength] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const SCROLL_INTERVALL_MS = 6000;

  useEffect(() => {
    setChildrenLength(carouselRef?.current?.children?.length ?? 0);
  }, [carouselRef?.current?.children?.length]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!isHovered) {
        const newIndex = (activeIndex + 1) % childrenLength;
        carouselRef?.current?.navigateTo(newIndex);
        setActiveIndex(newIndex);
      }
    }, SCROLL_INTERVALL_MS);

    return () => clearTimeout(timeoutId);
  }, [activeIndex, isHovered, childrenLength]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <Carousel
      className="banner-carousel"
      arrowsPlacement="Content"
      backgroundDesign="Transparent"
      pageIndicatorBackgroundDesign="Transparent"
      pageIndicatorBorderDesign="None"
      children={children}
      ref={carouselRef}
      style={childrenLength === 0 ? { display: 'none' } : {}}
      onNavigate={event => setActiveIndex(event.detail.selectedIndex)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    />
  );
}
