import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'jotai';

import { FeatureCardBanner } from './FeatureCard';

const renderBanner = (id = 'test-banner') =>
  render(
    <Provider>
      <FeatureCardBanner
        id={id}
        title="Banner title"
        description="Banner description"
        design="information-1"
      />
    </Provider>,
  );

describe('FeatureCardBanner', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the banner when it was never dismissed', () => {
    renderBanner();

    expect(screen.getByText('Banner title')).toBeInTheDocument();
  });

  it('stores the dismissal in the atom when closing the banner', () => {
    const { container } = renderBanner();

    const closeButton = container.querySelector('.decline-button');
    expect(closeButton).not.toBeNull();
    fireEvent.click(closeButton!);

    expect(screen.queryByText('Banner title')).not.toBeInTheDocument();
    // The atom stores dismissed banners as a JSON array under 'busola.dismissedBanners'
    const stored = localStorage.getItem('busola.dismissedBanners');
    expect(stored).toBeDefined();
    const dismissedBanners = JSON.parse(stored || '[]');
    expect(dismissedBanners).toContain('test-banner');
  });

  it('stays hidden on the next mount after being dismissed', () => {
    const id = 'test-banner';
    // Set the atom storage directly using the new format
    localStorage.setItem('busola.dismissedBanners', JSON.stringify([id]));

    renderBanner(id);

    expect(screen.queryByText('Banner title')).not.toBeInTheDocument();
  });

  it('keeps the dismissed state per banner id', () => {
    const id = 'test-banner';
    localStorage.setItem(`hideBannerother-banner`, 'true');

    renderBanner(id);

    expect(screen.getByText('Banner title')).toBeInTheDocument();
  });

  it('should migrate legacy hideBanner keys to atom on first render', () => {
    const legacyId = 'LegacyBanner';
    const legacyKey = `hideBanner${legacyId}`;

    // Set legacy localStorage key
    localStorage.setItem(legacyKey, 'true');

    renderBanner(legacyId);

    // Banner should be hidden due to migration
    expect(screen.queryByText('Banner title')).not.toBeInTheDocument();

    // Legacy key should be removed
    expect(localStorage.getItem(legacyKey)).toBeNull();

    // New atom storage should contain the ID
    const stored = localStorage.getItem('busola.dismissedBanners');
    expect(stored).toBeDefined();
    const dismissedBanners = JSON.parse(stored || '[]');
    expect(dismissedBanners).toContain(legacyId);
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
