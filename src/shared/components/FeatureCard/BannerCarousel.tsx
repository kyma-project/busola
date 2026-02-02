import { Children, ReactNode, useEffect, useRef, useState } from 'react';
import { Carousel } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';

export default function BannerCarousel({
  children,
}: {
  children: ReactNode | ReactNode[];
}) {
  const { t } = useTranslation();
  const carouselRef = useRef<React.ElementRef<typeof Carousel>>(null);
  const childrenLength = Children.count(children);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isUserChoice, setIsUserChoice] = useState(false);
  const SCROLL_INTERVALL_MS = 25000;

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!isHovered && !isUserChoice) {
        const newIndex = (activeIndex + 1) % childrenLength;
        carouselRef?.current?.navigateTo(newIndex);
        setActiveIndex(newIndex);
      }
    }, SCROLL_INTERVALL_MS);

    return () => clearTimeout(timeoutId);
  }, [activeIndex, isHovered, childrenLength, isUserChoice]);

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
      ref={carouselRef}
      style={childrenLength === 0 ? { display: 'none' } : {}}
      onNavigate={(event) => {
        setIsUserChoice(true);
        setActiveIndex(event.detail.selectedIndex);
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      accessibleName={t('components.banner-carousel')}
    >
      {children}
    </Carousel>
  );
}
