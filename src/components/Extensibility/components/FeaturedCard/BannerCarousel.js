import { useEffect, useRef, useState } from 'react';
import { Carousel } from '@ui5/webcomponents-react';

export default function BannerCarousel({ children }) {
  const carouselRef = useRef(null);
  const [carouselStyle, setCarouselStyle] = useState({});

  useEffect(() => {
    const childrenLength = carouselRef?.current?.children?.length;
    setCarouselStyle(childrenLength === 0 ? { display: 'none' } : {});
  }, [carouselRef?.current?.children?.length]);

  return (
    <Carousel
      arrowsPlacement="Content"
      backgroundDesign="Transparent"
      pageIndicatorBackgroundDesign="Transparent"
      pageIndicatorBorderDesign="None"
      children={children}
      ref={carouselRef}
      style={carouselStyle}
    />
  );
}
