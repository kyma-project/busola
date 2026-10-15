import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { FeatureCardBanner } from './FeatureCard';

const renderBanner = (id = 'test-banner') =>
  render(
    <FeatureCardBanner
      id={id}
      title="Banner title"
      description="Banner description"
      design="information-1"
    />,
  );

describe('FeatureCardBanner', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the banner when it was never dismissed', () => {
    renderBanner();

    expect(screen.getByText('Banner title')).toBeInTheDocument();
  });

  it('stores the dismissal in local storage when closing the banner', () => {
    const { container } = renderBanner();

    const closeButton = container.querySelector('.decline-button');
    expect(closeButton).not.toBeNull();
    fireEvent.click(closeButton!);

    expect(screen.queryByText('Banner title')).not.toBeInTheDocument();
    expect(localStorage.getItem('hideBannertest-banner')).toEqual('true');
  });

  it('stays hidden on the next mount after being dismissed', () => {
    const id = 'test-banner';
    localStorage.setItem(`hideBanner${id}`, 'true');

    renderBanner(id);

    expect(screen.queryByText('Banner title')).not.toBeInTheDocument();
  });

  it('keeps the dismissed state per banner id', () => {
    const id = 'test-banner';
    localStorage.setItem(`hideBannerother-banner`, 'true');

    renderBanner(id);

    expect(screen.getByText('Banner title')).toBeInTheDocument();
  });

  describe('Teched design variant', () => {
    const renderTeched = (overrides = {}) =>
      render(
        <FeatureCardBanner
          id="teched-banner"
          title=""
          description=""
          design="Teched"
          {...overrides}
        />,
      );

    beforeEach(() => {
      localStorage.clear();
    });

    it('renders the Teched design correctly', () => {
      const { container } = renderTeched({ image: 'Teched' });

      expect(
        container.querySelector('.outer-container.teched'),
      ).toBeInTheDocument();

      expect(container.querySelector('.feature-card')).toHaveStyle(
        'background: linear-gradient(to right, #00144A, #002A86)',
      );

      expect(
        container.querySelector('.inner-container'),
      ).not.toBeInTheDocument();

      expect(
        screen.getByRole('img', { name: 'FeaturedCard Illustration' }),
      ).toBeInTheDocument();
    });
  });
});
